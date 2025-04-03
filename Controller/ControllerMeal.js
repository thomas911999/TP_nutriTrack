const asyncHandler = require('express-async-handler');
const Meal = require('../models/mealModel');
const Goal = require('../models/goalModel');

// Functional helpers
const calculateDailyTotals = meals => meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || meal.calorie || 0),
    protein: acc.protein + (meal.protein || meal.proteine || 0),
    carbs: acc.carbs + (meal.carbs || meal.glucide || 0),
    fat: acc.fat + (meal.fat || meal.lipide || 0)
}), { calories: 0, protein: 0, carbs: 0, fat: 0 });

const generateRecommendations = (dailyTotals, goals) => {
    if (!goals) return [];
    
    const recommendations = [];
    const checkNutrient = (current, target, nutrient) => {
        const difference = target - current;
        if (difference > 0) {
            recommendations.push(`You need ${difference}g more ${nutrient}`);
        }
    };

    checkNutrient(dailyTotals.protein, goals.protein, 'protein');
    checkNutrient(dailyTotals.carbs, goals.carbs, 'carbs');
    checkNutrient(dailyTotals.fat, goals.fat, 'fat');

    return recommendations;
};

// @desc    Get user's meals for today
// @route   GET /api/meals
// @access  Private
const getMeals = asyncHandler(async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Utiliser l'ID utilisateur du middleware d'authentification
        const mealsFromDb = await Meal.find({
            user: req.user.id,
            createdAt: { $gte: today }
        });
        
        // Convertir les noms des champs du franu00e7ais vers l'anglais pour le frontend
        const meals = mealsFromDb.map(meal => ({
            _id: meal._id,
            name: meal.name,
            calories: meal.calorie,    // Garder calories pour compatibilitu00e9 frontend
            protein: meal.proteine,    // Garder protein pour compatibilitu00e9 frontend
            carbs: meal.glucide,       // Garder carbs pour compatibilitu00e9 frontend
            fat: meal.lipide,          // Garder fat pour compatibilitu00e9 frontend
            proteine: meal.proteine,   // Ajouter les noms en franu00e7ais
            glucide: meal.glucide,     // Ajouter les noms en franu00e7ais
            lipide: meal.lipide,       // Ajouter les noms en franu00e7ais
            createdAt: meal.createdAt,
            updatedAt: meal.updatedAt
        }));

        // Calculer les totaux journaliers avec les noms en franu00e7ais
        const dailyTotals = {
            calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
            protein: meals.reduce((sum, meal) => sum + meal.protein, 0),  // Garder pour compatibilitu00e9
            carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),      // Garder pour compatibilitu00e9
            fat: meals.reduce((sum, meal) => sum + meal.fat, 0),          // Garder pour compatibilitu00e9
            proteine: meals.reduce((sum, meal) => sum + meal.proteine, 0),
            glucide: meals.reduce((sum, meal) => sum + meal.glucide, 0),
            lipide: meals.reduce((sum, meal) => sum + meal.lipide, 0)
        };
        
        const goals = await Goal.findOne({ user: req.user.id }) || { calories: 2000, protein: 70, carbs: 250, fat: 70 };
        const recommendations = generateRecommendations(dailyTotals, goals);

        res.status(200).json({
            meals,
            dailyTotals,
            goals,
            recommendations
        });
    } catch (error) {
        console.error('Error in getMeals:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Add a new meal
// @route   POST /api/meals
// @access  Private
const addMeal = asyncHandler(async (req, res) => {
    try {
        // Accepter les deux formats de noms (français ou anglais)
        const { name, calories, calorie, protein, proteine, carbs, glucide, fat, lipide } = req.body;

        // Vérifier que les champs obligatoires sont présents (avec support des deux nomenclatures)
        if (!name || 
           (!calories && !calorie) || 
           (!protein && !proteine) || 
           (!carbs && !glucide) || 
           (!fat && !lipide)) {
            return res.status(400).json({ message: 'Veuillez fournir tous les détails du repas' });
        }

        // Créer le repas avec les noms de champs en français
        const meal = await Meal.create({
            user: req.user.id,
            name,
            calorie: calorie || calories,     // Utiliser le format français s'il existe, sinon l'anglais
            proteine: proteine || protein,    // Utiliser le format français s'il existe, sinon l'anglais
            glucide: glucide || carbs,        // Utiliser le format français s'il existe, sinon l'anglais
            lipide: lipide || fat             // Utiliser le format français s'il existe, sinon l'anglais
        });

        // Retourner une réponse avec les deux formats pour compatibilité
        const response = {
            _id: meal._id,
            name: meal.name,
            calories: meal.calorie,  // Format anglais pour la compatibilité frontend
            protein: meal.proteine,  // Format anglais pour la compatibilité frontend
            carbs: meal.glucide,     // Format anglais pour la compatibilité frontend
            fat: meal.lipide,        // Format anglais pour la compatibilité frontend
            calorie: meal.calorie,   // Format français
            proteine: meal.proteine, // Format français
            glucide: meal.glucide,   // Format français
            lipide: meal.lipide,     // Format français
            createdAt: meal.createdAt,
            updatedAt: meal.updatedAt
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error in addMeal:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du repas' });
    }
});

// @desc    Get meal by ID
// @route   GET /api/meals/:id
// @access  Private
const getMeal = asyncHandler(async (req, res) => {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        res.status(404);
        throw new Error('Meal not found');
    }

    res.status(200).json(meal);
});

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = asyncHandler(async (req, res) => {
    const meal = await Meal.findByIdAndDelete(req.params.id);

    if (!meal) {
        res.status(404);
        throw new Error('Meal not found');
    }

    res.status(200).json(meal);
});

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = asyncHandler(async (req, res) => {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        res.status(404);
        throw new Error('Meal not found');
    }

    const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json(updatedMeal);
});

module.exports = {
    getMeals,
    addMeal,
    getMeal,
    deleteMeal,
    updateMeal
};
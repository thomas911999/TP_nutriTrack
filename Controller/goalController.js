const asyncHandler = require('express-async-handler');
const Goal = require('../models/goalModel');

// @desc    Get user's nutritional goals
// @route   GET /api/goals
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
    try {
        let goals = await Goal.findOne({ user: req.user.id });
        
        // Si aucun objectif n'est trouvé, créer des objectifs par défaut
        if (!goals) {
            goals = {
                calories: 2000,
                proteine: 70,
                glucide: 250,
                lipide: 70
            };
        }
        
        res.status(200).json(goals);
    } catch (error) {
        console.error('Error in getGoals:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Set user's nutritional goals
// @route   POST /api/goals
// @access  Private
const setGoals = asyncHandler(async (req, res) => {
    try {
        const { calories, proteine, glucide, lipide } = req.body;

        if (!calories || !proteine || !glucide || !lipide) {
            return res.status(400).json({ message: 'Veuillez fournir tous les objectifs nutritionnels' });
        }

        // Update goals if they exist, create if they don't
        const goals = await Goal.findOneAndUpdate(
            { user: req.user.id },
            { calories, proteine, glucide, lipide },
            { new: true, upsert: true }
        );

        res.status(200).json(goals);
    } catch (error) {
        console.error('Error in setGoals:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = {
    getGoals,
    setGoals,
};

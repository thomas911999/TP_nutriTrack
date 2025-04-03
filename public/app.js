// Variables globales pour l'authentification
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const username = localStorage.getItem('username');

// Éléments du DOM
const logoutBtn = document.getElementById('logout-btn');
const mealForm = document.getElementById('meal-form');
const mealsList = document.getElementById('meals-list');
const recommendationsDiv = document.getElementById('recommendations');
const topMealsDiv = document.getElementById('top-meals');

// Configuration API
const API_BASE = '/api';

// Fonctions d'authentification

// Initialisation de l'application
async function init() {
    // Vérifier l'authentification simplifiée
    if (!localStorage.getItem('token') || !localStorage.getItem('userId')) {
        console.log('Session non valide, redirection vers login');
        window.location.href = '/login.html';
        return;
    }
    
    // Variables locales à jour (au cas où les constantes globales sont obsolètes)
    const currentToken = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');
    const currentUsername = localStorage.getItem('username') || 'Utilisateur';

    // Afficher le nom d'utilisateur dans l'interface avec la variable locale
    document.getElementById('user-name').textContent = currentUsername;

    try {
        // Simplification : ignorer getUserInfo pour éviter les redirections
        // Juste charger les repas et objectifs directement
        
        try {
            // Charger les repas du jour
            await loadMeals();
        } catch (e) {
            console.warn('Impossible de charger les repas:', e);
            // Continuer malgré l'erreur
        }
        
        try {
            // Charger les objectifs
            await loadGoals();
        } catch (e) {
            console.warn('Impossible de charger les objectifs:', e);
            // Continuer malgré l'erreur
        }

        // Configurer les écouteurs d'événements
        setupEventListeners();
        
    } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        // Afficher un message d'erreur à l'utilisateur plutôt que de le déconnecter
        alert('Une erreur est survenue lors de l\'initialisation. Veuillez réessayer.');
    }
}

// Event Listeners
function setupEventListeners() {
    mealForm.addEventListener('submit', handleAddMeal);
    logoutBtn.addEventListener('click', logout);
}

// API Functions
/**
 * Récupère les informations de l'utilisateur connecté
 * @returns {Promise<Object>} - Informations utilisateur
 */
async function getUserInfo() {
    try {
        // Appel API avec le token d'authentification
        const response = await fetch(`${API_BASE}/users/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Vérifier si la réponse est OK (statut 2xx)
        if (!response.ok) {
            throw new Error(`Erreur de récupération des données utilisateur: ${response.status}`);
        }
        
        // Récupérer et retourner les données JSON
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        throw error; // Propager l'erreur pour la gérer dans init()
    }
}

async function loadMeals() {
    try {
        console.log('Chargement des repas...');
        const response = await fetch(`${API_BASE}/meals`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Échec de chargement des repas: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Données de repas reçues:', data);
        
        // Vérifier que toutes les propriétés attendues sont présentes
        if (!data.meals) {
            console.warn('Aucun repas trouvé dans la réponse');
            data.meals = [];
        }
        
        if (!data.dailyTotals) {
            console.warn('Aucun total journalier trouvé dans la réponse');
            data.dailyTotals = {
                calories: 0,
                proteine: 0,
                glucide: 0,
                lipide: 0
            };
        }
        
        if (!data.goals) {
            console.warn('Aucun objectif trouvé dans la réponse');
            data.goals = {
                calories: 2000,
                proteine: 70,
                glucide: 250,
                lipide: 70
            };
        }
        
        // Mettre à jour l'affichage
        updateMealsDisplay(data.meals);
        updateProgressBars(data.dailyTotals, data.goals);
        
        // Afficher les recommandations si elles existent
        if (data.recommendations && data.recommendations.length > 0) {
            const recommendationsDiv = document.getElementById('recommendations');
            if (recommendationsDiv) {
                recommendationsDiv.innerHTML = data.recommendations
                    .map(rec => `<p>${rec}</p>`)
                    .join('');
            }
        }
        
        return data;
    } catch (error) {
        console.error('Erreur lors du chargement des repas:', error);
        alert(`Problème lors du chargement des repas: ${error.message}`);
        throw error;
    }
}

async function loadGoals() {
    try {
        const response = await fetch(`${API_BASE}/goals`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch goals');
        }
        const goals = await response.json();
        updateGoalsDisplay(goals);
    } catch (error) {
        console.error('Error loading goals:', error);
        throw error;
    }
}

async function handleAddMeal(e) {
    e.preventDefault();
    console.log('Ajout d\'un repas...');
    
    // Récupérer les valeurs des champs
    const name = document.getElementById('meal-name').value;
    const calories = parseInt(document.getElementById('meal-calories').value);
    const protein = parseInt(document.getElementById('meal-protein').value);
    const carbs = parseInt(document.getElementById('meal-carbs').value);
    const fat = parseInt(document.getElementById('meal-fat').value);
    
    // Vérifier que les valeurs sont valides
    if (!name || isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
        alert('Veuillez remplir tous les champs avec des valeurs numériques valides.');
        return;
    }
    
    // Utiliser les deux nomenclatures pour maximiser la compatibilité
    const mealData = {
        name: name,
        // Terminologie anglaise pour compatibilité
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        // Terminologie française
        calorie: calories,
        proteine: protein,
        glucide: carbs,
        lipide: fat
    };
    
    console.log('Données du repas à envoyer:', mealData);

    try {
        const response = await fetch(`${API_BASE}/meals`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Utiliser localStorage pour être sûr d'avoir le token à jour
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mealData)
        });

        const data = await response.json();
        console.log('Réponse du serveur:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Échec de l\'ajout du repas');
        }

        // Nettoyer le formulaire
        mealForm.reset();
        // Recharger les repas
        await loadMeals();
        alert('Repas ajouté avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'ajout du repas:', error);
        alert(`Échec de l'ajout du repas: ${error.message}`);
    }
}

// UI Update Functions
function updateMealsDisplay(meals) {
    console.log('Mise à jour de l\'affichage des repas:', meals);
    
    if (!meals || meals.length === 0) {
        mealsList.innerHTML = '<p>Aucun repas pour aujourd\'hui</p>';
        return;
    }
    
    mealsList.innerHTML = meals.map(meal => {
        // Utiliser les valeurs en français si disponibles, sinon utiliser les valeurs en anglais
        const calories = meal.calorie || meal.calories || 0;
        const proteine = meal.proteine || meal.protein || 0;
        const glucide = meal.glucide || meal.carbs || 0;
        const lipide = meal.lipide || meal.fat || 0;
        
        return `
        <div class="meal-item">
            <h4>${meal.name}</h4>
            <div class="nutrients">
                <span>${calories} kcal</span>
                <span>${proteine}g P</span>
                <span>${glucide}g G</span>
                <span>${lipide}g L</span>
            </div>
            <button class="delete-meal-btn" data-id="${meal._id}">Supprimer</button>
        </div>
        `;
    }).join('');
    
    // Ajouter des écouteurs d'événements pour les boutons de suppression
    document.querySelectorAll('.delete-meal-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const mealId = e.target.dataset.id;
            if (confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
                try {
                    await deleteMeal(mealId);
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    alert('Erreur lors de la suppression du repas');
                }
            }
        });
    });
}

/**
 * Supprime un repas de la base de données
 * @param {string} mealId - L'identifiant du repas à supprimer
 * @returns {Promise<void>}
 */
async function deleteMeal(mealId) {
    try {
        console.log(`Suppression du repas avec l'ID: ${mealId}`);
        const response = await fetch(`${API_BASE}/meals/${mealId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Échec de la suppression du repas');
        }

        // Recharger les repas après la suppression
        await loadMeals();
        alert('Repas supprimé avec succès');
    } catch (error) {
        console.error('Erreur lors de la suppression du repas:', error);
        throw error;
    }
}

function updateProgressBars(totals, goals) {
    console.log('Mise à jour des barres de progression avec:', { totals, goals });

    // Utiliser les noms de propriétés en français si disponibles, sinon les noms en anglais
    const progressBars = {
        'calories': { 
            value: totals.calories || totals.calorie || 0, 
            goal: goals.calories || goals.calorie || 2000 
        },
        'protein': { 
            value: totals.proteine || totals.protein || 0, 
            goal: goals.proteine || goals.protein || 70 
        },
        'carbs': { 
            value: totals.glucide || totals.carbs || 0, 
            goal: goals.glucide || goals.carbs || 250 
        },
        'fat': { 
            value: totals.lipide || totals.fat || 0, 
            goal: goals.lipide || goals.fat || 70 
        }
    };

    // Mapper les noms anglais aux éléments HTML pour les barres de progression
    const elementMapping = {
        'calories': 'calories',
        'protein': 'protein',
        'carbs': 'carbs',
        'fat': 'fat'
    };

    Object.entries(progressBars).forEach(([type, { value, goal }]) => {
        const elementId = elementMapping[type];
        const progressBar = document.getElementById(`${elementId}-progress`);
        if (!progressBar) {
            console.error(`Élément de barre de progression introuvable: ${elementId}-progress`);
            return;
        }

        const progressElement = progressBar.querySelector('.progress');
        if (!progressElement) {
            console.error(`Élément de progression introuvable dans: ${elementId}-progress`);
            return;
        }

        const progressValue = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
        progressElement.style.width = `${progressValue}%`;
        
        const valueElement = document.getElementById(`${elementId}-value`);
        const goalElement = document.getElementById(`${elementId}-goal`);
        
        if (valueElement) valueElement.textContent = value;
        if (goalElement) goalElement.textContent = goal;
    });
}

function updateGoalsDisplay(goals) {
    // Update goal values in progress bars
    const goalElements = {
        'calories': document.getElementById('calories-goal'),
        'proteine': document.getElementById('protein-goal'),
        'glucide': document.getElementById('carbs-goal'),
        'lipide': document.getElementById('fat-goal')
    };

    Object.entries(goals).forEach(([type, value]) => {
        goalElements[type].textContent = value;
    });
}

function updateRecommendations(totals, goals) {
    const recommendations = [];

    // Vérifier chaque nutriment
    const nutrients = {
        'calories': { current: totals.calories, goal: goals.calories, unit: 'kcal', foods: [] },
        'proteine': { current: totals.protein, goal: goals.proteine, unit: 'g', foods: ['poulet', 'oeufs', 'thon', 'fromage blanc', 'légumineuses'] },
        'glucide': { current: totals.carbs, goal: goals.glucide, unit: 'g', foods: ['riz', 'pâtes', 'pain', 'pommes de terre', 'fruits'] },
        'lipide': { current: totals.fat, goal: goals.lipide, unit: 'g', foods: ['huile d\'olive', 'avocat', 'noix', 'poisson gras', 'fromage'] }
    };

    // Générer des recommandations spécifiques
    Object.entries(nutrients).forEach(([type, { current, goal, unit, foods }]) => {
        const difference = goal - current;
        const percentage = Math.round((current / goal) * 100);
        
        if (difference > 0) {
            // Manque de nutriments
            if (type === 'calories') {
                recommendations.push(`<div class="recommendation warning"><i class="fas fa-exclamation-triangle"></i> Il vous manque ${difference} ${unit} pour atteindre votre objectif quotidien</div>`);
            } else if (foods && foods.length > 0) {
                // Suggérer des aliments spécifiques
                const randomFoods = foods.sort(() => 0.5 - Math.random()).slice(0, 2);
                recommendations.push(`<div class="recommendation tip"><i class="fas fa-lightbulb"></i> Vous avez atteint ${percentage}% de votre objectif de ${type}. Essayez de manger: ${randomFoods.join(', ')}</div>`);
            }
        } else if (percentage > 110) {
            // Excès de nutriments
            recommendations.push(`<div class="recommendation warning"><i class="fas fa-exclamation-circle"></i> Vous avez dépassé votre objectif de ${type} de ${Math.abs(difference)} ${unit}</div>`);
        } else if (percentage >= 90 && percentage <= 110) {
            // Bon équilibre
            recommendations.push(`<div class="recommendation success"><i class="fas fa-check-circle"></i> Excellent! Votre apport en ${type} est bien équilibré</div>`);
        }
    });

    // Ajouter des conseils généraux si peu de recommandations
    if (recommendations.length < 2) {
        recommendations.push(`<div class="recommendation tip"><i class="fas fa-info-circle"></i> Conseil: Buvez au moins 2L d'eau par jour pour une meilleure hydratation</div>`);
    }

    recommendationsDiv.innerHTML = recommendations.join('');
}

function updateTopMeals(meals) {
    // Trier les repas par calories (ordre décroissant)
    const sortedMeals = [...meals].sort((a, b) => b.calories - a.calories);
    
    // Récupérer les 3 premiers repas
    const top3 = sortedMeals.slice(0, 3);
    
    topMealsDiv.innerHTML = top3.map(meal => `
        <div class="top-meal">
            <h4>${meal.name}</h4>
            <p>${meal.calories} kcal</p>
        </div>
    `).join('');
}

// Authentication Functions
/**
 * Déconnecte l'utilisateur en supprimant ses informations d'authentification
 * et le redirige vers la page de connexion
 */
function logout() {
    // Nettoyer les données d'authentification du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    // Rediriger vers la page de connexion
    window.location.href = '/login.html';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

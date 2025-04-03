const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Create a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        username,
        email,
        password
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            goals: user.goals
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('Veuillez remplir tous les champs');
    }

    // Chercher l'utilisateur par son nom d'utilisateur
    const user = await User.findOne({ username });
    if (!user) {
        res.status(401);
        throw new Error('Identifiants invalides');
    }

    // Vérifier le mot de passe (méthode simplifiée pour ce TP)
    const isMatch = user.matchPassword(password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Identifiants invalides');
    }

    // Générer un token simple: 'user_[id]'
    const token = `user_${user._id}`;
    
    // Envoyer les données utilisateur et le token
    res.status(200).json({
        _id: user._id,
        username: user.username,
        token: token,
        goals: user.goals
    });
});

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json({
                _id: user.id,
                username: user.username,
                goals: user.goals
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error in getUserProfile:', error.message);
        if (error.kind === 'ObjectId') {
            res.status(404);
            return res.json({ message: 'User not found' });
        }
        res.status(500);
        throw new Error('Server error');
    }
});

// @desc    Get current user profile using token
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // L'utilisateur est déjà disponible grâce au middleware auth
    // qui a ajouté req.user = { id, username }
    
    try {
        // Chercher l'utilisateur avec toutes ses données
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(404);
            throw new Error('Utilisateur non trouvé');
        }

        // Retourner les informations de l'utilisateur
        res.status(200).json({
            _id: user.id,
            username: user.username,
            goals: user.goals || []
        });
        
    } catch (error) {
        res.status(500);
        throw new Error('Erreur serveur: ' + error.message);
    }
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getMe
};

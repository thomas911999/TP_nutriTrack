const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getMe } = require('../Controller/userController');
const auth = require('../middleware/authMiddleware');

// Inscription
router.post('/register', registerUser);

// Connexion
router.post('/login', loginUser);

// Profil utilisateur authentifié (protégé)
router.get('/me', auth, getMe);

// Profil utilisateur public
router.get('/:id', getUserProfile);

module.exports = router;

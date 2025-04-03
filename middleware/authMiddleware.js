const User = require('../models/userModel');

/**
 * Middleware d'authentification simple
 * Format du token: 'user_[id]'
 */
const auth = async (req, res, next) => {
    try {
        // Vérifier si le token est présent
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Token manquant, authentification requise' });
        }
        
        // Vérifier format token (user_id)
        const parts = token.split('_');
        if (parts.length !== 2 || parts[0] !== 'user') {
            return res.status(401).json({ message: 'Format de token invalide' });
        }
        
        // Extraire l'ID utilisateur
        const userId = parts[1];
        
        // Trouver l'utilisateur dans la base de données
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Ajouter les informations utilisateur à la requête
        req.user = { id: userId, username: user.username };
        next();
        
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur d\'authentification' });
    }
};

module.exports = auth;

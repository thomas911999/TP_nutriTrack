const express = require("express");
const errorHandler = require("./handleError/errorRequest");
const connectDb = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const auth = require("./middleware/authMiddleware");

connectDb();
const app = express();

const port = 8080;

// Middleware pour les logs - Activé pour débogage
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Middleware pour parser le JSON
app.use(express.json());

// Routes publiques
app.use("/api/users", require("./routes/userRoutes"));

// Routes protégées
app.use("/api/meals", auth, require("./routes/MealRoutes"));
app.use("/api/goals", auth, require("./routes/goalRoutes"));

// Error handling and static files
app.use(errorHandler);
app.use(express.static('public'));

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    res.status(500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

app.listen(port, () => {
    console.log('Server running on port ' + port);
});

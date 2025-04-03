const asynHandler = require("express-async-handler");

const register = asynHandler( async (req,res) => {
    res.status(200).json({message: "register the user"})
});

const login = asynHandler( async (req,res) => {
    res.status(200).json({message: "user login"})
});

const current = asynHandler( async (req,res) => {
    res.status(200).json({message: "current information from user"})
});

module.exports = {register, login, current}
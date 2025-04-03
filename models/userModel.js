const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    goals: {
        calories: {
            type: Number,
            default: 2000
        },
        proteine: {
            type: Number,
            default: 70
        },
        glucide: {
            type: Number,
            default: 250
        },
        lipide: {
            type: Number,
            default: 70
        }
    }
}, {
    timestamps: true
});

// Match password
userSchema.methods.matchPassword = function(enteredPassword) {
    return this.password === enteredPassword;
};

// Generate simple token
userSchema.methods.generateAuthToken = function() {
    return `user_${this._id}`;
};

module.exports = mongoose.model('User', userSchema);

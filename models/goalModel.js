const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    calories: {
        type: Number,
        required: true
    },
    proteine: {
        type: Number,
        required: true
    },
    glucide: {
        type: Number,
        required: true
    },
    lipide: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);

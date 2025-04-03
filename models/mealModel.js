const mongoose = require("mongoose");

const mealSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, "Veuillez ajouter le nom du repas"]
    },
    calorie: {
        type: Number,
        required: [true, "Veuillez ajouter les calories du repas"]
    },
    proteine: {
        type: Number,
        required: [true, "Veuillez ajouter les protéines du repas"]
    },
    glucide: {
        type: Number,
        required: [true, "Veuillez ajouter les glucides du repas"]
    },
    lipide: {
        type: Number,
        required: [true, "Veuillez ajouter les lipides du repas"]
    }
},
{
    timestamps: true,
});

module.exports = mongoose.model("Meal", mealSchema);



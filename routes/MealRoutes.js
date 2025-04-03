const express = require("express");
const router = express.Router();
const { getMeals, addMeal, getMeal, deleteMeal, updateMeal } = require("../Controller/ControllerMeal")


router.route("/")
    .get(getMeals)
    .post(addMeal);

router.route("/:id")
    .get(getMeal)
    .delete(deleteMeal)
    .put(updateMeal);

module.exports = router;
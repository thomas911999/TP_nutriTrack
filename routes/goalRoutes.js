const express = require('express');
const router = express.Router();
const { getGoals, setGoals } = require('../Controller/goalController');

router.route('/')
    .get(getGoals)
    .post(setGoals);

module.exports = router;
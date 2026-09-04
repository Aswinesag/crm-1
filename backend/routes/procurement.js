const express = require('express');
const {autoGeneratePR,getAllPR,approvePR} = require('../controllers/procurementController.js');
const { protect } = require('../middleware/auth');


const router = express.Router();


// AUTO GENERATE PR

router.get(
    "/auto-pr",
    protect,
    autoGeneratePR
);


// GET ALL PR

router.get(
    "/all-pr",
    protect,
    getAllPR
);


// APPROVE PR

router.put(
    "/approve-pr/:id",
    protect,
    approvePR
);

module.exports = router;
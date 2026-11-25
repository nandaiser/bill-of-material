'use strict';

const express = require('express');
const controller = require('../controllers/bill_of_material');
const router = express.Router();

router.post('/create-formula', controller.createFormula);
router.post('/get-formula-list', controller.getFormulaList);
router.post('/get-formula-detail', controller.getFormulaDetail);
router.post('/update-formula', controller.updateFormula);

module.exports = router;

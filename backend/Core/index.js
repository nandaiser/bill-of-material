'use strict';
const express = require('express');
const router = express.Router();

router.use('/bill-of-material', require('./routes/bill_of_material'));

module.exports = router;

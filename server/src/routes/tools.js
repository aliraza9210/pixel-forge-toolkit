'use strict';

const express = require('express');
const router = express.Router();
const { getAllTools, getToolById, getCategories } = require('../controllers/toolsController');

router.get('/', getAllTools);
router.get('/categories', getCategories);
router.get('/:id', getToolById);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Check import statement

// Route for user registration
router.post('/register', userController.register);

module.exports = router;
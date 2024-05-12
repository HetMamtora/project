const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Check import statement

// Route for user registration
router.post('/register', userController.register);
router.post('/login',userController.login);
router.get('/refresh_token', userController.refreshtoken);

module.exports = router;
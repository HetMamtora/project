const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Check import statement
const auth = require('../middleware/auth');
const authAdmin = require ('../middleware/authAdmin')

// Route for user registration
router.post('/register', userController.register);
router.post('/login',userController.login);
router.get('/refresh_token', userController.refreshtoken);
router.put('/:id', auth, authAdmin, userController.updateUser);
router.get('/information',auth,userController.getUser)
router.get('/getallusers',auth,authAdmin,userController.getAllUsers)
router.delete('/:id', auth, authAdmin, userController.deleteUser);


module.exports = router;
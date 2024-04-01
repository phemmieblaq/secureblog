const express = require('express');
const userController = require('../controller/userController')

const router = express.Router();

router.post ('/signup', userController.addUser)
router.get('/:id', userController.getUserById)
router.post('/login', userController.loginUser)
router.post('/logout', userController.logoutUser)
router.post('/token', userController.token)

module.exports = router;

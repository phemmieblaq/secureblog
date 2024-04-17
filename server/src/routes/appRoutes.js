const express = require('express');
const userController = require('../controller/userController')
const blogController = require('../controller/blogController')
const authenticateToken = require('../middleware/authMiddleware')
 

const router = express.Router();

// Apply setSearchPath middleware to all routes that interact with the database


router.post ('/auth/signup', userController.addUser)
router.get('/user:id', userController.getUserById)
router.post('/auth/login', userController.loginUser)
router.post('/auth/verify-otp', userController.verifyOTP)

router.post('/auth/logout', userController.logoutUser)
router.post('/auth/token', userController.token)
router.post('/reset-password', userController.resetPassword)
router.post('/forgot-password', userController.forgotPassword)



router.post('/blog', authenticateToken, blogController.postBlog);
router.get('/user/blogs',authenticateToken, blogController.getUserBlogs);
router.put('/blog/:id', authenticateToken, blogController.updateBlog);
router.delete('/blog/:id', authenticateToken, blogController.deleteBlog);
router.get('/blogs', authenticateToken, blogController.getAllBlogs);





module.exports = router;

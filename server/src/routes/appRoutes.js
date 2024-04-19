const express = require('express');
const userController = require('../controller/userController')
const blogController = require('../controller/blogController')
const authenticateToken = require('../middleware/authMiddleware')
 

const router = express.Router();




router.post ('/auth/signup', userController.addUser)
router.get('/user:id', userController.getUserById)
router.post('/auth/login', userController.loginUser)
router.post('/auth/verify-otp', userController.verifyOTP)

router.post('/auth/logout', userController.logoutUser)
router.post('/auth/token', userController.token)
router.post('/password/verify-otp', userController.verifyPasswordOtp)
router.post('/forgot-password', userController.forgotPassword)
router.post('/reset-password', userController.passwordReset)



router.post('/blog', authenticateToken, blogController.postBlog);
router.get('/user/blogs',authenticateToken, blogController.getUserBlogs);
router.put('/blog/:id', authenticateToken, blogController.updateBlog);
router.delete('/blog/:id', authenticateToken, blogController.deleteBlog);
router.get('/blog/:userId/:id', authenticateToken, blogController.getSingleUserBlog);
router.get('/blogs', blogController.getAllBlogs);





module.exports = router;

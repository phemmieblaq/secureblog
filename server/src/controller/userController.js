const {pool}= require('../database');
const queries= require('../queries/userQueries');
const{hasher,matchChecker}= require('../../src/common/hash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const{transporter}= require('../common/nodeMailer');
const generateOTP = require('../common/generateOTP');

require('dotenv').config()







const addUser = async (req, res) => {
    const { username, email, phone, password_hash } = req.body;


  
    try {
        await pool.query('SET search_path TO blog, public');
        // Check if user email is already in the database
        const emailExistsResult = await pool.query(queries.checkEmailExists, [email]);
        console.log(emailExistsResult.rows);


        const checkUsernameExists = await pool.query(queries.checkUsernameExists, [username]);
        //console.log(checkUsernameExists.rows);

        
        if (emailExistsResult.rows.length) {
            return res.status(400).json({ error: 'Email already in use' });
            
            
        }
        if (checkUsernameExists.rows.length) {
            return res.status(400).json({ error: 'username already in use' });
            
            
        }

        if (!password_hash) {
            return res.status(400).json({ error: 'Password is required' });
        }
        // Hash the password
        const cryptedPassword = await hasher(password_hash, 12);
   
        // Insert the new user into the database
       const saveUser= await pool.query(queries.addUser, [username, email, phone, cryptedPassword]);
       console.log(saveUser);
        res.status(201).json(
            { message: 'User added successfully',
              data: saveUser.rows[0]
        });
    } catch (error) {
        if (error.code === '42P01') {
            console.log("The table does not exist or cannot be accessed. Please check the table name and schema.");
        } else {
            console.log("An unexpected database error occurred:", error);
        }
        
    }
    
};


const getUserById = async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        await pool.query('SET search_path TO blog, public');
        const getUser = await pool.query(queries.getUserById, [id]);
      

        // Check if any user was found
        if (getUser.rows.length === 0) {
            return res.status(200).json({
                message: "No user found for the provided ID",
                data: null // No user data to return
            });
        }

        // User was found, return success response with user data
        return res.status(200).json({
            message: "User loaded successfully",
            data: getUser.rows[0] // Returning the found user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message: "An error occurred during the process",
            error: error.message
        });
    }
};





let refreshTokens = [];


const generateAccessToken=(user)=> {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); // Adjusted expiresIn to 1h for demonstration
  }

const token =async(req,res)=>{
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({ name: user.name });
      res.json({ accessToken: accessToken });
    });
}






const logoutUser = async (req, res) => {
    await pool.query('SET search_path TO blog, public');
    
    // Access the token from the cookies
    const token = req.cookies['accessToken'];

    // Filter out the token
    refreshTokens = refreshTokens.filter(t => t !== token);

    // Clear the cookie
    res.clearCookie('accessToken');

    // Send a response message along with the status code
    res.status(200).json({message: 'Logout successful'});
};




  

  const loginUser = async (req, res) => {
    const { email, password_hash } = req.body;
    let userFound = false;

    try {
        await pool.query('SET search_path TO blog, public');
        const userResult = await pool.query(queries.getUserByEmail, [email]);
        
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            const passwordMatch = await matchChecker(password_hash, user.password_hash);

            if (passwordMatch) {
                // User found and password is correct
                userFound = true;
                const otp = generateOTP();

                
                 // Your function to generate a numeric OTP

                try {
                    await transporter.sendMail({
                        from: process.env.MAIL_USERNAME,
                        to: user.email,
                        subject: 'OTP',
                        text: `use this one time password to login : ${otp}`
                    });
                    console.log('Email sent successfully');
                } catch (error) {
                    console.error('Failed to send email:', error);
                }
                // Your function to send OTP via email or SMS

                // Store OTP and user details in session or temporary storage
                req.session.otp = otp;
                console.log(otp)
                req.session.user = {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    username: user.username
                };
            }
        }

        // Delay response to mitigate timing attacks
        setTimeout(() => {
            if (!userFound) {
                // Simulate a delay and then send a generic error message
                res.status(401).json({ error: "Invalid credentials or OTP required" });
            } else {
                // Inform the user that the OTP has been sent
                res.status(200).json({ message: "OTP sent, please verify to complete login." });
            }
        }, 1000 + Math.random() * 100);  // Random delay between 1 and 1.1 seconds
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred during the login process' });
    }
};


const verifyOTP = async (req, res) => {
    const { otp } = req.body;
    console.log('Received OTP:', req.body.otp);
    console.log('Expected OTP:', req.session.otp);

    if (req.session.otp === otp)
    {
       
        // Generate tokens after successful OTP verification
        const accessToken = jwt.sign(
            { userId: req.session.user.id, email: req.session.user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: req.session.user.id, email: req.session.user.email },
            process.env.REFRESH_TOKEN_SECRET
        );

        // Set the tokens in HttpOnly cookies
        // Removed 'secure: true' for local development on HTTP
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, // Set to true if served over HTTPS
            maxAge: 3600000 // 1 hour
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Set to true if served over HTTPS
            maxAge: 86400000 // 24 hours
        });

        const userId = req.session.user.id;
        const username = req.session.user.username;



        // Clear the session data
        req.session.otp = null;
        req.session.user = null;

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            userId, 
            username
        });
    
    } else {
        res.status(401).json({ error: "Invalid OTP" });
    }
};





// Generate and send password reset token
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    req.session.user = { email };
    try {
        await pool.query('SET search_path TO blog, public');
        const userResult = await pool.query(queries.getUserByEmail, [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = userResult.rows[0];

        // Generate a One-Time Password (OTP)
        const otp = generateOTP();
        req.session.otp = otp;
        // Send email with OTP
        try {
            await transporter.sendMail({
                from: process.env.MAIL_USERNAME,
                to: user.email,
                subject: 'Password Reset',
                text: `Your One-Time Password (OTP) is: ${otp}`
            });
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Failed to send email:', error);
        }

        res.json({ message: "If an account with that email exists, a password reset OTP has been sent."});
    } catch (error) {
        console.log('error:', error);
        res.status(500).json({ error: error});
    }
};


const verifyPasswordOtp = async (req, res) => {
   
    const email = req.session.user.email;
    const { otp } = req.body;
    try {
        await pool.query('SET search_path TO blog, public');
        const userResult = await pool.query(queries.getUserByEmail, [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = userResult.rows[0];

        // Get the OTP from the session
        const otpRecord = req.session.otp;

        if (!otpRecord) {
            return res.status(404).json({ error: "OTP not found" });
            }

       

        

        // If the OTP is correct and has not expired, allow the user to reset their password
        res.json({ message: "OTP verified. You may now reset your password." });
    } catch (error) {
        console.log('error:', error);
        res.status(500).json({ error: error });
    }
};
module.exports = {
    addUser,
    getUserById,
    verifyOTP,
    token,
    logoutUser,
    loginUser,
    forgotPassword,
    verifyPasswordOtp
};


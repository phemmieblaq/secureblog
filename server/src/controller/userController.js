const {pool}= require('../database');
const queries= require('../queries/userQueries');
const{hasher,matchChecker}= require('../../src/common/hash');
const jwt = require('jsonwebtoken');





const addUser = async (req, res) => {
    const { username, email, phone, password_hash } = req.body;
    
    try {
        // Check if user email is already in the database
        const emailExistsResult = await pool.query(queries.checkEmailExists, [email]);
        console.log(emailExistsResult.rows);
        
        if (emailExistsResult.rows.length) {
            return res.status(400).json({ error: 'Email already in use' });
            
            
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
function generateAccessToken(user) {
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
const logoutUser=async (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204); // No content to send back
  };
  

  const loginUser = async (req, res) => {
    const { email, password_hash } = req.body;

    try {
        const userResult = await pool.query(queries.getUserByEmail, [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userResult.rows[0];
        const passwordMatch = await matchChecker(password_hash, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate Access Token
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET
        );

        // Store the refresh token
        refreshTokens.push(refreshToken);

        res.status(200).json({
            message: "Login successful",
            data:{
              
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    accessToken: accessToken,
                    refreshToken: refreshToken
            }
            
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    }
};


module.exports = {
    addUser,
    getUserById,
    token,
    logoutUser,
    loginUser,
};


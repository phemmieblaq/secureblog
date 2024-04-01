const addUser='Insert into users (username  , email, phone ,password_hash) values ($1, $2, $3, $4) RETURNING * ';
const getUserByEmail='Select * from users where email=$1';
const checkEmailExists = 'SELECT 1 FROM users WHERE email = $1';

const getUserById='Select * from users where id=$1';


module.exports={
  addUser
  ,getUserByEmail,
  checkEmailExists,
  getUserById};
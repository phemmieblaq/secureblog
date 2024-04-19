const addUser='Insert into users (username  , email, password_hash) values ($1, $2, $3) RETURNING * ';
const getUserByEmail='Select * from users where email=$1';
const checkEmailExists = 'SELECT 1 FROM users WHERE email = $1';
const checkUsernameExists = 'SELECT 1 FROM users WHERE username = $1';

const getUserById='Select * from users where id=$1';


const createPasswordResetToken = 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *';
const getPasswordResetToken = 'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()';
const deleteUserPasswordResetTokens = 'DELETE FROM password_reset_tokens WHERE user_id = $1';
const updateUserPassword = 'UPDATE users SET password_hash = $1 WHERE id = $2';


const addNewBlog='INSERT INTO blog_posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *';
const updateBlog = 'UPDATE blog_posts SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *';
const deleteBlog = 'DELETE FROM blog_posts WHERE id = $1 AND user_id = $2 RETURNING *;';
const getAllBlogs = 'SELECT * FROM blog.blog_posts';

module.exports={
  addUser
  ,getUserByEmail,
  checkEmailExists,
  checkUsernameExists,
  getUserById,
  createPasswordResetToken,
  getPasswordResetToken,
  deleteUserPasswordResetTokens,
  updateUserPassword,
  addNewBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs
};
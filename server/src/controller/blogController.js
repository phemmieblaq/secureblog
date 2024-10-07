const queries= require('../queries/userQueries');
const {pool}= require('../database');

const postBlog = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.userId; 
    console.log(userId)// Assuming the JWT includes userId after authentication

    try {
        await pool.query('SET search_path TO blog, public');
        const newBlog = await pool.query(
        queries.addNewBlog,
            [userId, title, content]
        );
        res.status(201).json(newBlog.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
const updateBlog = async (req, res) => {
    const { id } = req.params; // Blog ID
    const { title, content } = req.body;
    const userId = req.user.userId;

    try {
        await pool.query('SET search_path TO blog, public');
        const updatedBlog = await pool.query(
            queries.updateBlog,
            [title, content, id, userId]
        );
        if (updatedBlog.rows.length === 0) {
            return res.status(404).json({ error: 'Blog not found or user unauthorized to update this blog' });
        }
        res.json(updatedBlog.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
const deleteBlog = async (req, res) => {
    const { id } = req.params; // Blog ID
    const userId = req.user.userId;

    try {
        await pool.query('SET search_path TO blog, public');
        const deletedBlog = await pool.query(
            queries.deleteBlog,
            [id, userId]
        );
        if (deletedBlog.rows.length === 0) {
            return res.status(404).json({ error: 'Blog not found or user unauthorized to delete this blog' });
        }
        // Return a success message
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
const getAllBlogs = async (req, res) => {
    try {
        await pool.query('SET search_path TO blog, public');
        // Adjusted query to use the correct table name 'blog_posts'
        const allBlogs = await pool.query(`
            SELECT blog_posts.*, users.username
            FROM blog_posts
            JOIN users ON blog_posts.user_id = users.id
        `);
        res.json(allBlogs.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
const getUserBlogs = async (req, res) => {
    const userId = req.user.userId;
    console.log(userId);
  // Assuming the JWT includes userId after authentication
    console.log(userId);

    try {
        await pool.query('SET search_path TO blog, public');
        const alluserBlogs = await pool.query(`
        SELECT blog_posts.*, users.username
        FROM blog_posts
        JOIN users ON blog_posts.user_id = users.id
        WHERE blog_posts.user_id = $1;
      
        `,  [userId]);
        
        res.json(alluserBlogs.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
const getSingleUserBlog = async (req, res) => {
    const { userId, id } = req.params;// Assuming the blog ID is passed as a URL parameter
    console.log(`userId: ${userId}, id: ${id}`);
    try {
        await pool.query('SET search_path TO blog, public');
        const userBlog = await pool.query(`
        SELECT blog_posts.*, users.username
        FROM blog_posts
        JOIN users ON blog_posts.user_id = users.id
        WHERE blog_posts.user_id = $1 AND blog_posts.id = $2;
        `,  [userId, id]);
        
        res.json(userBlog.rows[0]); // Return the first (and only) blog post
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};



const storeSingleBlog= async (req, res) => {
    try {
        await pool.query('SET search_path TO blog, public');
        req.session.blogData = req.body;
        res.json({ message: "blog stored successfully" }); // Send a JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
const getStoreBlog = async (req, res) => {
    try {
        await pool.query('SET search_path TO blog, public');
        res.send(req.session.blogData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};

const clearBlog = async (req, res) => {
    try {
        req.session.blogData = null;
        res.send("Blog data cleared from session");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = {
    postBlog,
    updateBlog,
    deleteBlog,
    getAllBlogs,
    getSingleUserBlog,
    getUserBlogs,
    storeSingleBlog,
    clearBlog,
    getStoreBlog
}
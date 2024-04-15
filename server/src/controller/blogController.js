const queries= require('../queries/userQueries');
const {pool}= require('../database');

const postBlog = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.userId; // Assuming the JWT includes userId after authentication

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
const deleteBlog = async (req, res) => {P
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
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
const getAllBlogs = async (req, res) => {
    try {
        await pool.query('SET search_path TO blog, public');
        const allBlogs = await pool.query(queries.getAllBlogs);
        res.json(allBlogs.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
const getUserBlogs = async (req, res) => {
    const userId = req.user.userId;

    try {
        await pool.query('SET search_path TO blog, public');
        const userBlogs = await pool.query(
            'SELECT * FROM blog_posts WHERE user_id = $1;',
            [userId]
        );
        res.json(userBlogs.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};
module.exports = {
    postBlog,
    updateBlog,
    deleteBlog,
    getAllBlogs,
    getUserBlogs
}
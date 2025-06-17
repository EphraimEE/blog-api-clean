const express = require('express');
const { deleteBlog } = require('../controllers/blogController');
const { getAllBlogs, publishBlog } = require('../controllers/blogController');
const router = express.Router();
const { createBlog } = require('../controllers/blogController');
const { protect } = require('../middlewares/authMiddleware');
const { getPublishedBlog } = require('../controllers/blogController');
const { getAllPublishedBlogs } = require('../controllers/blogController');
const { updateBlog} = require('../controllers/blogController');
const { getMyBlogs } = require('../controllers/blogController');
const { searchAndListBlogs} = require('../controllers/blogController');


router.post('/', protect, createBlog);
router.get('/', getAllBlogs);
router.patch('/publish/:id', protect, publishBlog);
router.get('/:id', getPublishedBlog);
router.get('/', getAllPublishedBlogs);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.get('/my-blogs', protect, getMyBlogs);
router.get('/', searchAndListBlogs);


module.exports = router;
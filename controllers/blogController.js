const Blog = require('../models/blog.model');
const User = require('../models/user.model'); 

exports.createBlog = async (req, res) => {
  try {
    const { title, description, tags, body } = req.body;

    if (!title || !description || !body) {
        return res.status(400).json({ message: 'Title, description, and body are required.' });
      }

      const readingTime = Math.ceil(body.split(' ').length / 200);

    const blog = await Blog.create({
      title,
      description,
      tags,
      body,
      author: req.user.id,
      state: 'draft',
      read_count: 0,
      reading_time: readingTime,
    });

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllBlogs = async (req, res) => {
    try {
      const { title, author, tags } = req.query;
  
      const filter = { state: 'published' };
  
      if (title) filter.title = new RegExp(title, 'i');
      if (author) {
        const user = await User.findOne({ username: author });
        if (user) filter.author = user._id;
      }
      if (tags) filter.tags = { $in: tags.split(',') };
  
      const blogs = await Blog.find(filter)
        .populate('author', 'username first_name last_name')
        .sort({ createdAt: -1 });
  
      res.status(200).json({ blogs });
    } catch (err) {
      res.status(500).json({ error: 'Server error', message: err.message });
    }
  };
  
  exports.publishBlog = async (req, res) => {
    try {
      const blogId = req.params.id;
  
      const blog = await Blog.findById(blogId);
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      if (blog.state === 'published') {
        return res.status(400).json({ message: 'Blog already published' });
      }
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to publish this blog.' });
      }
  
      blog.state = 'published';
      await blog.save();
  
      res.status(200).json({ message: 'Blog published successfully', blog });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
  exports.getPublishedBlog = async (req, res) => {
    try {
      const blog = await Blog.findOne({ _id: req.params.id, state: 'published' })
        .populate('author', 'first_name last_name email username')
        .exec();
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found or not published' });
      }
  
      blog.read_count += 1;
      await blog.save();
  
      res.status(200).json({ blog });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.getAllPublishedBlogs = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        author,
        title,
        tags,
        order_by = 'timestamp', 
        order = 'desc' 
      } = req.query;
  
      const query = { state: 'published' };
  
      if (author) query.author = new RegExp(author, 'i');
      if (title) query.title = new RegExp(title, 'i');
      if (tags) query.tags = { $in: tags.split(',') };
  
      const sortOptions = {};
      const validSortFields = ['read_count', 'reading_time', 'timestamp'];
      if (validSortFields.includes(order_by)) {
        sortOptions[order_by] = order === 'asc' ? 1 : -1;
      }
  
      const blogs = await Blog.find(query)
        .populate('author', 'first_name last_name email username')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      res.status(200).json({ count: blogs.length, blogs });
    } catch (error) {
      console.error('getAllPublishedBlogs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const updateData = req.body;
    console.log("Updating blog ID:", blogId);
    console.log("Update data:", updateData);

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this blog.' });
    }

    Object.assign(blog, updateData);
    await blog.save();

    res.status(200).json({ message: 'Blog updated successfully.', blog });

  } catch (error) {
    console.error("Update error:", error.message); // 🔥 This helps pinpoint the error
    res.status(500).json({ message: "Server error updating blog." });
  }
};

exports.deleteBlog = async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
  
      if (!blog) {
        return res.status(404).json({ message: "Blog not found." });
      }
  
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to delete this blog." });
      }
  
      await blog.deleteOne();
      res.status(200).json({ message: "Blog deleted successfully." });
    } catch (error) {
      console.error("Delete error:", error.message);
      res.status(500).json({ message: "Server error deleting blog." });
    }
  };
  exports.getMyBlogs = async (req, res) => {
    try {
      const { page = 1, limit = 10, state } = req.query;
      const query = { author: req.user._id };
      const pageNum = parseInt(page);
const limitNum = parseInt(limit);
  
      if (state) {
        query.state = state;
      }
  
      const blogs = await Blog.find(query)
        .skip((pageNum - 1) * limit)
        .limit(parseInt(limitNum))
        .sort({ createdAt: -1 });
  
      const total = await Blog.countDocuments(query);
  
      res.status(200).json({
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        blogs,
      });
    } catch (error) {
      console.error("Fetch user blogs error:", error.message);
      res.status(500).json({ message: "Server error fetching your blogs." });
    }
  };

  exports.searchAndListBlogs = async (req, res) => {
    try {
      const { page = 1, limit = 20, search, sortBy = 'timestamp', order = 'desc' } = req.query;
  
      const query = { state: 'published' };
      const sortOptions = {};
  
      const sortFields = {
        timestamp: 'createdAt',
        reading_time: 'reading_time',
        read_count: 'read_count',
      };
      const sortField = sortFields[sortBy] || 'createdAt';
      sortOptions[sortField] = order === 'asc' ? 1 : -1;
  
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') },
          { author: new RegExp(search, 'i') },
        ];
      }
  
      const blogs = await Blog.find(query)
        .populate('author', 'first_name last_name username')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      const total = await Blog.countDocuments(query);
  
      res.status(200).json({
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        blogs,
      });
  
    } catch (error) {
      console.error("Public blog list error:", error.message);
      res.status(500).json({ message: "Server error fetching blogs." });
    }
  };
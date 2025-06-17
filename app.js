const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const protectedTestRoutes = require('./routes/protectedTest');
const blogRoutes = require('./routes/blogRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/test', protectedTestRoutes);
app.use('/api/blogs', blogRoutes);



// Routes Placeholder
app.get('/', (req, res) => {
  res.send('Blog API is running!');
});

module.exports = app;

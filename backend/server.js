require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const projectRoutes = require('./routes/projectRoutes');

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/projects', projectRoutes);

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error encountered:', err.message || err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(err.status || statusCode || 500).json({
    message: err.message || 'An unexpected error occurred on the server',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
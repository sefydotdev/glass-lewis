const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config(); // Ensure environment variables are loaded

const authRoutes = require('./routes/auth/authRoutes');
const companyRecords = require('./routes/company-records/companyRecordsRoutes');
const { handleError, notFoundHandler } = require('./middlewares/errorHandlers');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(helmet());
app.use(express.json({ limit: '50kb' }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    credentials: true
}));
app.use(morgan('combined'));


// Route Handlers for Auth
app.use('/authenticate', authRoutes);

// Route Handlers for Company Records
app.use('/companyRecords', companyRecords);


// Error handling
app.use(notFoundHandler);
app.use(handleError);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

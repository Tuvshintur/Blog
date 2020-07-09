const createError = require('http-errors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');

const accessLogStream = rfs.createStream('access.log', {
    size: '10M',
    compress: 'gzip',
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log'),
});

const app = express();

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(morgan('combined', { stream: accessLogStream }));
app.use('/images', express.static(path.join('./images')));

app.use((req, res, next) => {
    // Set CORS headers so that the React SPA is able to communicate with this server
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/', authRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
    res.status(err.status).json({
        message: err.message,
    });
});

module.exports = app;

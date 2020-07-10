const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');
// const morgan = require('morgan');
// const rfs = require('rotating-file-stream');
const bodyParser = require('body-parser');

if (!process.env.NODE_ENV) {
    const dotenv = require('dotenv').config();
}

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');

// const accessLogStream = rfs.createStream(process.env.LOG_FILE, {
//     size: '10M',
//     compress: 'gzip',
//     interval: '1d', // rotate daily
//     path: path.join(__dirname, process.env.LOG_FILE_DIR),
// });

const app = express();

app.disable('x-powered-by');
app.use(bodyParser.json());
// app.use(morgan('combined', { stream: accessLogStream }));
app.use('/images', express.static(path.join('./images')));

app.use(cors());

app.use('/', authRoutes);
app.use('/posts', postRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

module.exports = app;

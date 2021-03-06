const Router = require('express').Router;
const jwt = require('jsonwebtoken');
const mongodb = require('mongodb');
const db = require('../db');
const cors = require('cors');

const router = Router();
const ObjectId = mongodb.ObjectId;

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
            if (err) {
                res.status(403).json({
                    message: 'invalid token...',
                });
                res.end();
            }

            req.payload = payload;
            next();
        });
    } else {
        res.status(401).json({
            message: 'invalid token...',
        });
        res.end();
    }
};

router.get('/', function (req, res, next) {
    const { category, page } = req.query;
    const posts = [];
    db.getDb()
        .db()
        .collection('posts')
        .find({ category: category })
        .sort({ createdDate: -1 })
        // .skip((queryPage - 1) * pageSize)
        // .limit(pageSize)
        .forEach((postDoc) => {
            posts.push(postDoc);
        })
        .then((result) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'An error occurred.' });
        });
});

router.get('/:id', (req, res, next) => {
    const { id } = req.params;
    db.getDb()
        .db()
        .collection('posts')
        .findOne({ _id: new ObjectId(id) })
        .then((postDoc) => {
            res.status(200).json(postDoc);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'An error occurred.' });
        });
});

router.post('', authenticateJWT, cors(), (req, res, next) => {
    const { title, body, category, tags } = req.body;
    const newPost = {
        title: title,
        body: body,
        category: category,
        tags: tags,
        createdDate: new Date(),
    };

    db.getDb()
        .db()
        .collection('posts')
        .insertOne(newPost)
        .then((result) => {
            res.status(201).json({ message: 'Post added', postId: result.insertedId });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'An error occurred.' });
        });
});

module.exports = router;

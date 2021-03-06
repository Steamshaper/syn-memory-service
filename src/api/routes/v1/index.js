const express = require('express');
// const userRoutes = require('./user.route');
// const authRoutes = require('./auth.route');
const multer = require('multer');
const multipartMiddleware = multer({ dest: 'uploads/' });
const memorizeRoute = require('./memorize.route');
const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
// router.use('/docs', express.static('docs'));

router.use('/memorize', multipartMiddleware.single('filepond'), memorizeRoute);
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

module.exports = router;

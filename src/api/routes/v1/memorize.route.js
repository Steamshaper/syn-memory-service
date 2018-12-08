'use strict';
const express = require('express');
const memorize = require('../../../components/memorize');

const { ADMIN, LOGGED_USER, authorize } = require('../../middlewares/auth');
/* const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const {
  listUsers,
  createUser,
  replaceUser,
  updateUser,
} = require('../../validations/user.validation');
*/
const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router
  .get('/:filename', (req, res) => {
    if (req.params) {
      memorize
        .load({ filename: req.params.filename })
        .then(({ file, metaData }) => {
          res.set('content-type', metaData['content-type']);
          res.send(file);
        })
        .catch(err => {
          res.send({ state: { err: 500, body: err } });
        });
    }
  })
  .route('/')
  /**
   * @api {post} v1/users Create User
   * @apiDescription Create a new user
   * @apiVersion 1.0.0
   * @apiName CreateUser
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             email     User's email
   * @apiParam  {String{6..128}}     password  User's password
   * @apiParam  {String{..128}}      [name]    User's name
   * @apiParam  {String=user,admin}  [role]    User's role
   *
   * @apiSuccess (Created 201) {String}  id         User's id
   * @apiSuccess (Created 201) {String}  name       User's name
   * @apiSuccess (Created 201) {String}  email      User's email
   * @apiSuccess (Created 201) {String}  role       User's role
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(LOGGED_USER), (req, res, next) => {
    memorize
      .record(req.file)
      .then(({ filename }) => res.send({ state: { filename, err: 200 } }))
      .catch(err => res.send({ state: { val: err, err: 500 } }));
  })
  .delete((req, res, next) => {
    const {
      state: { filename },
    } = req.body;
    memorize
      .del(filename)
      .then(() => {
        res.send({ state: { val: req.headers, err: 200 } });
      })
      .catch(error => {
        res.send(error);
      });
  });

router
  .route('/_search')
  /**
   * @api {get} v1/users/profile User Profile
   * @apiDescription Get logged in user profile information
   * @apiVersion 1.0.0
   * @apiName UserProfile
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Users can access the data
   */
  .get(memorize.search);

module.exports = router;

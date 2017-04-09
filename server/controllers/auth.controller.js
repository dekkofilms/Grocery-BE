import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import User from '../models/user.model';

const user = {
  email: 'taylor@sandbox.com',
  password: '123456'
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  // Ideally you'll fetch this from the db
  // Idea here was to show how jwt works with simplicity
  if (req.body.email === user.email && req.body.password === user.password) {
    const token = jwt.sign({
      email: user.email
    }, config.jwtSecret);
    return res.json({
      token,
      email: user.email
    });
  }

  const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
  return next(err);
}

/**
 * Returns jwt token upon registering a user
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function register(req, res, next) {
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      throw err;
    }

    if (existingUser) {
      res.json({
        message: 'user exists already'
      });
    } else {
      // creating the new user
      const newUser = new User({
        email: req.body.email,
        password: req.body.password
      });

      // saving that to the database
      // newUser.save((error) => {
      //   if (error) {
      //     throw error;
      //   }
      //
      //   const token = jwt.sign({
      //     email: newUser.email
      //   }, config.jwtSecret);
      //   return res.json({
      //     token,
      //     email: newUser.email
      //   });
      // });
      newUser.save()
        .then((savedUser) => {
          const token = jwt.sign({
            email: savedUser.email
          }, config.jwtSecret);
          return res.json({
            token,
            email: savedUser.email
          });
        })
        .catch(e => next(e));
    }
  });
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

export default { login, register, getRandomNumber };

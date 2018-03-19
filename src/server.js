const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const User = require('./user.js');

const STATUS_USER_ERROR = 422;
const BCRYPT_COST = 11;

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());
server.use(session({
  secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re'
}));

/* Sends the given err, a string or an object, to the client. Sets the status
 * code appropriately. */
const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

// TODO: implement routes

// TODO: add local middleware to this route to ensure the user is logged in
server.get('/me', (req, res) => {
  // Do NOT modify this route handler in any way.
  res.json(req.user);
});

server.post('/users', (req, res) => {
  const userInfo = req.body; // body parser?
  bcrypt.hash(userInfo.passwordHash, 11, (err, hashedPw) => {
    if (err) throw new Error(err);

    userInfo.passwordHash = hashedPw;
    const user = new User(userInfo);

    user
      .save()
      .then(savedUser => {
        res
          .status(200)
          .json(savedUser)
      })
      .catch(err => {
        res
          .status(500)
          .json({ MESSAGE: 'There was an error saving the user' })
      })
  });

})

server.post('/log-in', (req, res) => {
  const userInfo = req.body;
  User
    .find({ // gives you an array
      username: userInfo.username,
    })
    .then(savedUser => {
      console.log(savedUser); // array with the one item
      bcrypt.compare(userInfo.passwordHash, savedUser[0].passwordHash, (err, response) => {
        if (response) {
          res
            .status(200)
            .json({ success: true });
        } else {
          res
            .status(500)
            .json({ success: false });
        }
      })
    })
    .catch(err => {
      res
        .status(500)
        .json({ MESSAGE: 'There was an error logging in' });
    })
})

module.exports = { server };

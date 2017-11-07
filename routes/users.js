var express = require('express');
var bcrypt = require('bcrypt');
var jsonwebtoken = require('jsonwebtoken');
var CONFIG = require('../config.json');
var TOKEN_SECRET = CONFIG.token.secret;
var TOKEN_EXPIRES = parseInt(CONFIG.token.expiresInSeconds, 10);
var requestpromise = require('request-promise');

var User = require('../models/user');

var router = express.Router();

/*router.get('/setup/:hub/:node/:command', function(req, res){
  var socket = req.app.get('io');
  socket.emit(req.params.hub, {'command':req.params.command,'payload':req.params.node });
  res.json({});
});*/

router.post('/register', function createUser(request, response) {
  //console.log("Registing");
  User.findOne({ username: request.body.username }, function handleQuery(error, user) {
    if (error) {
      response.status(500).json({ success: false, message: 'Internal server error' });
      return;
    }
    if (user) {
      response.status(409).json({ success: false, message: 'Username \'' + request.body.username + '\' already exists.' });
      return;
    }
    //console.log("bcrypt 1");
    bcrypt.genSalt(10, function (error, salt) {
      if (error) {
        response.status(500).json({ success: false, message: 'Internal server error' });
        throw error;
      }
      //console.log("bcrypt 2");
      bcrypt.hash(request.body.password, salt, function (error, hash) {
        if (error) { response.status(500).json({ success: false, message: 'Internal server error' });
          throw error;
        }
        var user = new User({
          username: request.body.username,
          password: hash,
          firstName: request.body.firstName,
          lastName: request.body.lastName,
          email: request.body.email
        });
        user.save(function (error) {
          if (error) {
            response.status(500).json({ success: false, message: 'Internal server error' });
            throw error;
          }
          var options = {
            method: 'POST',
            uri: 'https://api.thespot.exchange:3000/api/io.ethventures.thespot.SpotUser',
            body: {
              "$class": "io.ethventures.thespot.SpotUser",
              "userId": user['id'],
              "firstName": user['firstName'],
              "lastName": user['lastName'],
              "contactDetails": {
                "$class": "io.ethventures.thespot.ContactDetails",
                "email": "string",
                "mobilePhone": "string",
                "address": {
                  "$class": "io.ethventures.thespot.Address",
                  "street": "string",
                  "city": "string",
                  "state": "string",
                  "country": "string",
                  "zip": "string",
                  "id": "string"
                },
                "id": "string"
                }
              },
              json: true
            };
            console.log(options);
            requestpromise(options).then(function (parsedBody) {
              response.json({ success: true, user: { username:user.username, firstName:user.firstName, lastName:user.lastName, id:user.id, email:user.email } });
            }).catch(function (err) {
              response.json({ success: false });
            });

        });
      });
    });
  });
});

router.post('/authenticate', function authenticateUser(request, response) {
  User.findOne({ username: request.body.username }, function handleQuery(error, user) {
    if (error) {
      response.status(500).json({ success: false, message: 'Internal server error' });
      throw error;
    }
    if (!user) {
      response.status(401).json({ success: false, message: 'Authentication Failed.' });
      return;
    }
    bcrypt.compare(request.body.password, user.password, function (error, result) {
      if (error) {
        response.status(500).json({ success: false, message: 'Internal server error' });
        throw error;
      }
      if (!result) {
        response.status(401).json({ success: false, message: 'Authentication failed.'
        });
        return;
      }
      var token = jsonwebtoken.sign({ username: user.username }, TOKEN_SECRET, {
        expiresIn: TOKEN_EXPIRES
      });
      response.json({ success: true, token: token, user: { username:user.username, firstName:user.firstName, lastName:user.lastName, id:user.id, email:user.email } });
    });
  });
});

module.exports = router;

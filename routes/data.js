var express = require('express');
var bcrypt = require('bcrypt');
var jsonwebtoken = require('jsonwebtoken');
var CONFIG = require('../config.json');
var TOKEN_SECRET = CONFIG.token.secret;
var TOKEN_EXPIRES = parseInt(CONFIG.token.expiresInSeconds, 10);
var Payload = require('../models/payload');
var User = require('../models/user');
var tokenMiddleware = require('../middleware/token');
var router = express.Router();
var requestpromise = require('request-promise');


router.get('/test', function(req, res){


  var usertest = {
  "$class": "io.ethventures.thespot.SpotUser",
  "userId": "tests",
  "firstName": "string",
  "lastName": "string",
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
  };

  /*requestpromise.get({ uri: 'https://api.thespot.exchange:3000/api/io.ethventures.thespot.SpotUser', transform: function(body, res) {

        return body;
      }
    }).then(function(data){
      console.log(data);
      res.json(JSON.parse(data));
      //Responds to the request with flight data
    }, function(err){
      //Responds to the request with error data
      console.log("Error");
    }).catch(function(err){
      //console.error(err); //Will print any error that was thrown in the previous error handler.
    });*/

    requestpromise.get({ uri: 'https://api.thespot.exchange:3000/api/io.ethventures.thespot.SpotUser', transform: function(body, res) {

          return body;
        }
      }).then(function(data){
        console.log(data);
        res.json(JSON.parse(data));
        //Responds to the request with flight data
      }, function(err){
        //Responds to the request with error data
        console.log("Error");
      }).catch(function(err){
        //console.error(err); //Will print any error that was thrown in the previous error handler.
      });

});

router.post('/find', tokenMiddleware.verifyToken, function(req, res){
  if (req.body.start === undefined || req.body.end === undefined) {
    res.json({success: false, message:'Time Frame Required'});
  }
  if (req.body.types === undefined) {
    Payload.find({ "datetime" : { $lt: new Date(req.body.end), $gte: new Date(req.body.start) } }, function (err, data) {
      if (data !== undefined) {
        res.json({success: true, size:data.length, data :data});
      } else {
        res.json({success: true, size :0, data:[]});
      }
    });
  } else {
    var types = req.body.types.split(',');
    var selectquery = '';
    for (i = 0; i < types.length; i++) {
      if (i === types.length - 1) {
        selectquery += types[i];
        selectquery += " ";
        selectquery += "datetime";
      } else {
        selectquery += types[i];
        selectquery += " ";
      }
    }
    Payload.find({ "datetime" : { $lt: new Date(req.body.end), $gte: new Date(req.body.start) }}).select(selectquery).exec(function (err, data) {
      if (data !== undefined) {
        res.json({success: true, size:data.length, data:data});
      } else {
        res.json({success: true, size:0, data:[]});
      }
    });
  }
});

router.post('/connection_test', function(req, res){ res.json({'status':true}); });
router.get('/ping', function(req, res){ res.json({'response':'pong'}); });

router.post('/', function(req, res){
  var temp_load = new Payload(req.body);
  temp_load['datetime'] = new Date();
  temp_load.save(function(err) {
    if (err) throw err;
    res.json(temp_load);
  });
});

module.exports = router;

require('dotenv').config();

const express = require('express'),
  app = express(),
  port = process.env.PORT,
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const userRoute = require('./api/routes/userRoutes'),
  User = require('./api/models/userModel');

userRoute(app);  

app.listen(port);
console.log(`Message started on: ${port}`);

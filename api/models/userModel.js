'use strict'

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  uniqueValidator = require('mongoose-unique-validator'),
  jwt = require('jsonwebtoken');

let UserSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    text: true,
    trim: true,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },

  friend: {
    type: [new Schema(
      {
        _id: false,
        id: String,
        accept: { type: Boolean, default: false }
      }
    )],
    default: []
  },
  password: {
    type: String,
    required: true
  },
  hashPassword: String,
  created: {
    type: Date,
    default: Date.now
  }
});

UserSchema.plugin(uniqueValidator);

UserSchema.methods.comparePassword = password => {
  // return bcrypt.compareSync(password, this.hash_password);
  return bcrypt.compare(password, this.hashPassword, (err, rusult) => {
    if (err) return res.status(404).send({ message: err });
    else {
      let token = jwt.sign({
        id: user._id,
        username: user.username,
        name: user.name
      },
        'HoangHung',
        {
          expiresIn: "1h"
        }
      );
    }
  });
};

module.exports = mongoose.model('Users', UserSchema);
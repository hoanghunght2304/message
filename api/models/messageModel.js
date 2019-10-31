'use strict'

const mongoose = require('mongoose'),
  Schema = mongoose.Schema


let MessageSchema = new Schema({
  _id: String,
  _idRoom: {
    type: String,
    required: true
  },
  join: [String],
  message: [
    {
      _id: false,
      idMessage: {
        type: String,
        required: true
      },
      message: String,
      senderId: String,
      receiverId: String,
      avatar: String,
      time: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model('Messages', MessageSchema);
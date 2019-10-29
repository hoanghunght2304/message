'use strict'

const mongoose = require('mongoose'),
  Message = require('../models/messageModel');



exports.sendMessage = async (req, res) => {
  const idTmp = [req.headers['id'], req.params.id].sort()
  const idRoom = idTmp[0] + idTmp[1];
  let b = await Message.findOne({ _idRoom: idRoom });
  if (!b) {
    let message = [{
      idMessage: mongoose.Types.ObjectId(),
      message: req.body.message,
      senderId: req.headers['id'],
      receiverId: req.params.id,
      avatar: "http://avatar.png"
    }];
    var newMessage = new Message({
      _id: mongoose.Types.ObjectId(),
      _idRoom: idRoom,
      message
    });
    await newMessage.save((err, message) => {
      if (err)
        res.send(err);
      res.json(message);
    });
  } else {
    b.message.push({
      
      idMessage: mongoose.Types.ObjectId(),
      message: req.body.message,
      senderId: req.headers['id'],
      receiverId: req.params.id,
      avatar: "http://avatar.png"
    })
    await b.save((err, message) => {
      if (err)
        res.send(err);
      res.json(message)
    })
  }
};


exports.detailMessage = async (req, res) => {

};

// exports.listMessage = async (req, res) => {

// };
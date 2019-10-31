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
    let newMessage = new Message({
      _id: mongoose.Types.ObjectId(),
      join: [idTmp[0], idTmp[1]],
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
      join: [idTmp[0], idTmp[1]],
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
  const idTmp = [req.headers['id'], req.params.id].sort();
  const idRoom = idTmp[0] + idTmp[1];
  await Message.findOne({ _idRoom: idRoom }, (err, message) => {
    if (err)
      res.send(err);
    res.json(message);
  });

};

// exports.listMessage = async (req, res) => {

//   let infoUser = await Message.aggregate([
//     {
//       $match: { join: req.headers['id'] }
//     },
//     {
//       $lookup: {
//         from: "users",
//         let: { userId: req.headers['id'] },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: { $eq: ["$$userId", "$_id"] }
//               }
//             }
//           },
//           { $project: { _id: 1, username: 1, name: 1 } }
//         ],
//         as: "user"
//       }
//     }
//   ])

//   let listMessage = await Message.aggregate([
//     { $match: { join: req.headers['id'] } },
//     { $project: { _id: 0, message: { $slice: ["$message.message", -1] } } }
//   ])
//   const a = {
//     infoUser: infoUser[0].user,
//     //message: listMessage
//     listMessage
//   };
//   res.json(a);
// };


exports.listMessage = async (req, res) => {
  let listMessage = await Message.aggregate([
    { $match: { join: "5db17ca882aa6e28d0e6c9ac" } },
    { $unwind: "$join" },
    { $match: { join: { $ne: "5db17ca882aa6e28d0e6c9ac" } } },
    {
      $lookup: {
        from: "users",
        let: { userId: "$join" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: { $eq: ["$$userId", "$_id"] }
              }
            }
          },
          { $project: { _id: 1, username: 1, name: 1 } }
        ],
        as: "infoFriend"
      }
    },
    {
      $addFields: { lastMessage: { $arrayElemAt: ["$message.message", -1] } }
    },
    {
      $project: { _idRoom: 1, infoFriend: 1, lastMessage: 1, _id: 0 }
    }
  ])
  res.json(listMessage);
};


exports.readUser = (req, res) => {
  User.findById(req.params.userId, (err, user) => {
    if (err)
      res.send(err);
    res.json(user);
  });
};
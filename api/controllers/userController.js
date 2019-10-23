'use strict'

const mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  User = require('../models/userModel');


exports.register = (req, res) => {
  req.body.friend = JSON.parse(req.headers['id']);
  let { username, password, name, friend } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err)
      res.status(400).send(err);
    else {
      let newUser = new User({
        _id: mongoose.Types.ObjectId(),
        username,
        password,
        name,
        friend,
        hashPassword: hash
      });
      newUser.save((err, user) => {
        if (err)
          res.status(400).send(err);
        else {
          user.hashPassword = undefined;
          return res.json(user);
        }
      });
    }
  });
};


exports.login = (req, res) => {
  User.findOne({
    username: req.body.username
  }, (err, user) => {
    if (err) throw err;
    if (!user) {
      res.status(401).json({ message: 'Tài khoản không tồn tại' });
    }
    if (user.password !== req.body.password) res.status(401).json({ message: 'Mật khẩu không đúng' });
    else {
      res.json({ token: jwt.sign({ id: user._id, username: user.username, name: user.name }, 'HoangHung', { expiresIn: '1h' }) });
    }
  }
  );
};


exports.addFriend = (req, res) => {
  req.body._id = JSON.parse(req.headers['id']);
  User.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, user) => {
    if (err)
      res.send(err);
    user.password = undefined;
    user.hashPassword = undefined;
    res.json(user);

  });
};


exports.listFriends = async (req, res) => {
  let myFriend = await User.aggregate([
    {
      $match: { _id: req.params.friendId }
    },
    {
      $unwind: "$friend"
    },
    {
      $lookup: {
        from: "users",
        let: { friend: "$friend" },
        pipeline: [
          {
            $match:
            {
              $expr:
                { $eq: ["$_id", "$$friend"] }
            }
          },
          { $project: { _id: 1, username: 1, name: 1 } }
        ],
        as: "myFriend"
      }
    },
    { "$unwind": "$myFriend" },
    {
      "$group": {
        "_id": "$_id",
        "myFriend": { "$push": "$friend" },
        "friendsDetail": { "$push": "$myFriend" }
      }
    }
  ])

  res.json(myFriend[0].friendsDetail);
};
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




exports.addFriend = async (req, res) => {
  try {
    req.body._id = req.headers['id'];
    let check = await User.findOne({ _id: req.params.id });
    if (check) {
      let user = await User.findOne({ _id: req.body._id })
      let isExists = false;
      let isAccept = false;
      user.friend.map((e, index) => {
        if (e.id === req.params.id) {
          isExists = true
          isAccept = user.friend[index].accept
        }
      });
      if (!isExists) {
        user.friend.push({
          id: req.params.id,
          accept: false
        });
      } else {
        if (isAccept) {
          return res.json("Đã là bạn bè");
        } else {
          return res.json("Đã gửi lời mời kết bạn");
        }
      }
      await user.save();
      res.json(`Đã gửi lời mời kết bạn đến: ${req.params.id}`);
    } else {
      return res.json("Người dùng không tồn tại");
    }
  } catch (error) {
    console.log(error.message)
  }
};

exports.confirm = async (req, res) => {
  let userId = req.headers['id'];
  let friend = await User.findOne({ _id: req.params.id });
  if (friend) {
    let isExists = false;
    let isAccept = false;
    friend.friend.map((e, index) => {
      if (e.id === userId) {
        isExists = true
        isAccept = isAccept = friend.friend[index].accept
        friend.friend[index].accept = true
      }
    });
    if (!isExists) {
      return res.json("Chưa gửi lời mời kết bạn");
    } else {
      let user = await User.findOne({ _id: userId })
      user.friend.push({
        accept: true,
        id: req.params.id
      })
      if (isAccept) {
        return res.json("Đã là bạn bè");
      } else {
        await friend.save();
        await user.save();
        return res.json("Kết bạn thành công");
      }
    }
  } else {
    return res.json({ message: 'Người dùng không tồn tại!' });
  }
};


exports.unfriend = async (req, res) => {
  let userId = req.headers['id'];
  let friend = await User.findOne({ _id: req.params.id });
  if (friend) {
    let user = await User.findOne({ _id: userId });
    if (user.friend.id !== req.params.id) {
      res.json("Chưa kết bạn với người này!");
    } else {
      let a = user.friend.map((e) => {
        if (e.id === req.params.id) {
          return
        }
      });
      user.friend.splice(0, a)
    }
  } else {
    return res.json({ message: 'Người dùng không tồn tại!' });
  }
};



exports.listFriends = async (req, res) => {
  req.body._id = req.headers['id'];
  let myFriend = await User.aggregate([
    {
      $match: { _id: req.body._id }
    },
    {
      $unwind: "$friend"
    },
    {
      $lookup: {
        from: "users",
        let: { friend: "$friend.id", a: "$friend.accept" },
        pipeline: [
          {
            $match:
            {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$friend"] },
                  { $eq: ["$$a", true] }
                ]
              }
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


exports.search = async (req, res) => {
  User.find(
    { name: new RegExp('^' + req.query.q, 'i') },
    { _id: 1, "name": 1, "friend": 1 },
    async (err, user) => {
      if (err)
        res.send(err);
      res.json(user);
      // let a = await User.findOne({_id: req.headers['id']});
      // //let b = a.friend[0].id;
      // if (a.friend[0].id !== user.friend[0].id)
      //   res.json(`Chưa gửi lời mời kết bạn ${user}`);
      // if (a.friend[0].accept === false)
      //   res.json(`Đã gửi lời mời kết bạn ${user}`);
      // else res.json(`Đã là bạn bè ${user}`);    
    }).collation({ locale: 'en', strength: 1 });

};

exports.readUser = (req, res) => {
  User.findById(req.params.userId, (err, user) => {
    if (err)
      res.send(err);
    res.json(user);
  });
};



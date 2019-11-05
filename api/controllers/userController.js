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
    console.log(error.message);
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
  let friendId = req.params.id;
  let friend = await User.findOne({ _id: friendId });
  let a = await User.findOne({ _id: userId });
  if (friend) {
    let b = a.friend.findIndex(e => e.id === friendId);
    if (b < 0)
      res.json({ message: "Chưa kết bạn với người này!" });
    else {
      await User.update(
        { _id: userId },
        { $pull: { friend: { id: friendId } } },
        { multi: true }
      );
      await User.update(
        { _id: friendId },
        { $pull: { friend: { id: userId } } },
        { multi: true }
      );
      res.json({ message: `Đã xóa ${req.params.id} khỏi danh sách bạn bè!` });
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

  await User.find(
    { name: { '$regex': req.query.q, '$options': 'i' } },
    { _id: 1, name: 1, friend: 1 },
    async (err, friend) => {
      if (err)
        res.send(err);
      //res.json(friend);

      let a = await User.findOne({ _id: req.headers['id'] });
      for (let fr of friend) {
        if (a._id === fr._id)
          res.json(`Chính là bạn: ${friend}`);
        for (let b of a.friend) {
          if (b.id !== fr._id)
            res.json(`Chưa gửi lời mời kết bạn: ${friend}`);
          if (b.accept === false)
            res.json(`Đã gửi lời mời kết bạn: ${friend}`);
          else res.json(`Đã là bạn bè: ${friend}`);
        }
      }
    });
};

exports.readUser = (req, res) => {
  User.findById(req.params.userId, (err, user) => {
    if (err)
      res.send(err);
    res.json(user);
  });
};



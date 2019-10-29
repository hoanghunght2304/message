'use strict'

module.exports = app => {
  const controller = require('../controllers/userController');

  app.route('/register')
    .post(controller.register);

  app.route('/login')
    .post(controller.login);

  app.route('/users/:userId')
    .get(controller.readUser);

  app.route('/users/:id/addFriend')
    .post(controller.addFriend);

  app.route('/users/:id/confirmFriend')
    .post(controller.confirm);

  app.route('/users/:id/unfriend')  
    .post(controller.unfriend);

  app.route('/friends')
    .get(controller.listFriends);

  app.route('/search')
    .get(controller.search);
};  
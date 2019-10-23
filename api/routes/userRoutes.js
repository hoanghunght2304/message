'use strict'

module.exports = app => {
  const controller = require('../controllers/userController');

  app.route('/register')
    .post(controller.register);  
  
  app.route('/login')
    .post(controller.login);

  // app.route('/search')
  //   .get(controller.search);  

  app.route('/users')
    .post(controller.addFriend);

  // app.route('/users/userId')  
  //   .get(controller.read_user);

  app.route('/friend/:friendId')
    .get(controller.listFriends); 
};  
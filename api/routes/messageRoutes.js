'use strict'

module.exports = app => {
  const controller = require('../controllers/messageController');

  // app.route('/messages')
  //   .get(controller.listMessage);



  app.route('/messages/:id')
    .get(controller.detailMessage)
    .post(controller.sendMessage);  
};
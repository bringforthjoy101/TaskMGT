var models = require('../models');
var moment = require('moment');

// Display task create form on GET.
exports.user_list = function(req, res, next) {
        models.user.findAll({
            order: [
            ['id', 'DESC'],
        ],
            // where: {department_name: req.user.department_name},
        }).then(function(users){
            console.log("Employees Listed successfully");
          res.render('pages/index', {
              title: 'Users',
              page: 'userPage',
              display: 'userDisplay',
              user: req.user,
              moment: moment,
              users: users,
              parent: 'All Users',
              parentUrl: '/todo/users',
              layout: 'layouts/main'
          });
        });
};
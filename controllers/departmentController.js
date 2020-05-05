var models = require('../models');
var moment = require('moment');

// Display task create form on GET.
exports.department_users = function(req, res, next) {
        models.user.findAll({
            where: {department_name: req.user.department_name},
        }).then(function(users){
            console.log("Board Listed successfully");
          res.render('pages/index', {
              title: 'Department Users',
              page: 'departmentPage',
              display: 'departmentDisplay',
              user: req.user,
              moment: moment,
              users: users,
              layout: 'layouts/main'
          });
        });
};
var models = require('../models');
var moment = require('moment');

// Display task create form on GET.
exports.employees = function(req, res, next) {
        models.user.findAll({
            // where: {department_name: req.user.department_name},
        }).then(function(users){
            console.log("Employees Listed successfully");
          res.render('pages/index', {
              title: 'Employees',
              page: 'employeesPage',
              display: 'employeesDisplay',
              user: req.user,
              moment: moment,
              users: users,
              layout: 'layouts/main'
          });
        });
};
var models = require('../models');
var moment = require('moment');
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// Display author create form on GET.
exports.index = function(req, res, next) {
    res.json({
        success: 'Website is working fine'
    });
};

// Handle team create on POST.
exports.team_create_post = [
    
    // fields Validtion
    check('team_name')
    .not().isEmpty().withMessage('Team Name is required')
    .isLength({ min: 2 }).withMessage('must be at least 2 chars long')
    .custom(value => { return models.Team.findOne({ where: { team_name: value } })
    .then(team => { if (team) { return Promise.reject('Team Name Already Exists'); } }); }),
    check('employees').not().isEmpty().withMessage('Please, select at least one employee!'),
    
    // Fields Sanitization
    sanitizeBody('team_name').escape(),
    sanitizeBody('employees').escape(),
    
    async function(req, res, next) {
        const result = validationResult(req);
            var errors = result.errors;
              for (var key in errors) {
                    console.log(errors[key].value);
              }
        if (!result.isEmpty()) {
            console.log("This is the error message " + Object.values(errors));
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/todo/teams');
          } else { 
          req.session.success = false;
            const team = await models.Team.create({
                team_name: req.body.team_name,
                Employee_id: req.body.employee_id
            });
    
                console.log("The team is " + team);
        
            let employeeList = req.body.employees;
        
            // check the size of the employee list
            console.log(employeeList.length);


            // I am checking if only 1 employee has been selected
            // if only one employee then use the simple case scenario
            if (employeeList.length == 1) {
                // check if we have that employee in our database
                const employee = await models.user.findById(req.body.employees);
                if (!employee) {
                return res.status(400);
                }
                //otherwise add new entry inside TeamUsers table
                await team.addUser(employee);
            }
            // Ok now lets do for more than 1 employee, the hard bit.
            // if more than one employee has been selected
            else {
            // Loop through all the ids in req.body.employees i.e. the selected employees
            await req.body.employees.forEach(async (id) => {
                // check if all employee selected are in the database
                const employee = await models.user.findById(id);
                if (!employee) {
                return res.status(400);
                }
                // add to TeamUsers after
                await team.addUser(employee);
                
                 req.session.sessionFlash = {
                    type: 'success',
                    comment: 'Great!',
                    message: 'Team Created Successfully.'
                  };
                console.log('Team created successfully');
                // req.session.success = true;
                res.redirect('/todo/teams');
                });
            }
}
}
];

// Handle team delete on POST.
exports.team_delete_post = function(req, res, next) {
    models.Team.destroy({
        where: {
            id: req.params.team_id
        }
    }).then(function() { 
        res.redirect('/todo/teams');
        console.log('Team Deleted Successfully');
    });
};

// Handle team delete on GET.
exports.team_delete_get = function(req, res, next) {
    models.Team.destroy({
        where: {
            id: req.params.team_id
        }
    }).then(function(teams) { 
        req.session.sessionFlash = {
              type: 'success',
              comment: 'Great!',
              message: 'Team Deleted Successfully.'
            };
        console.log('Team Deleted Successfully');
        res.redirect('/todo/teams');
    });
};

// Hnadles team update on post
exports.team_update_post = function(req, res, next) {
    console.log("ID is " + req.params.team_id);
    models.Team.update(
        // Values to update
        {
            team_name: req.body.team_name,
        }, { // Clause
            where: {
                id: req.params.team_id
            }
        }).then(function() {
        // res.json({
        //     success: 'Team Updated Successfully',
        //     team: team
        // });
        console.log('Team Updated Successfully');
        res.redirect('/todo/teams');
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    })
};

// Display list of all teams.
exports.team_list = async function(req, res, next) {
    console.log('I am in Team List Page');
    //console.log('The user ' + req.user);
    const employees = await models.user.findAll({
        order: [
            ['id', 'ASC'],
        ]
    });
    
    const myTeams = await models.user.findById(
                req.user.id,
                {
                    include: [
                     {
                          model: models.Team,
                          as: 'teams',
                          required: false,
                          // Pass in the Team attributes that you want to retrieve
                          attributes: ['id', 'team_name', 'createdAt'],
                          through: {
                            // This block of code allows you to retrieve the properties of the join table TeamUsers
                            model: models.TeamUsers,
                            as: 'teamUsers',
                            attributes: ['team_id', 'user_id'],
                        }
                    }
                ]
              }
        );
    
    models.user.findAll({
        order: [
            ['id', 'DESC'],
        ]
    }).then(function(teams){

    res.render('pages/index', {
          title: 'Teams',
          page: 'teamPage',
          display: 'teamDisplay',
          parent: 'Teams',
          parentUrl: '/todo/teams',
          employees: employees,
          user: req.user,
          errors: req.session.errors,
          success:req.session.success,
          moment: moment,
          teams: teams,
          myTeams: myTeams,
          sessionFlash: res.locals.sessionFlash,
          layout: 'layouts/main'
      
    });
    console.log('Team Listed Successfully');
    req.session.errors = null;
    });
};

// Display detail page for a specific team.
exports.team_detail = async function(req, res, next) {
    try {
    const tasks = await models.Task.findAll({
        where: { TeamId: req.params.team_id },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'profile', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            }
        ]
    });
    
    const teamBoards = await models.Team.findById(
            req.params.team_id,
            {
                include: [
                 {
                      model: models.Board,
                      as: 'boards',
                      required: false,
                      // Pass in the Team attributes that you want to retrieve
                      attributes: ['id', 'board_name', 'userId', 'createdAt'],
                      through: {
                        // This block of code allows you to retrieve the properties of the join table TeamUsers
                        model: models.TeamBoards,
                        as: 'teamBoards',
                        attributes: ['team_id', 'board_id'],
                    }
                }
            ]
          }
    );
    
    
    
    const teamName = await models.Team.findById(req.params.team_id);
    
    const boards = await models.Board.findAll({
            // Add order conditions here....where clause, order, sort e.t.c
            
            order: [
                ['id', 'DESC'],
            ],
            include: [
                {
                  model: models.user,
                  attributes: ['id', 'firstname', 'lastname', 'username', 'name']
                },
            ]
        });

    models.Team.findById(
        req.params.team_id,{
        include: [
            {
              model: models.user,
              as: 'users',
              attributes: ['id', 'firstname', 'lastname', 'username', 'profile', 'name']
            },
        ]}
        ).then(team => {
        res.render('pages/index',  {
            title: 'Team Details',
            page: 'teamPage',
            display: 'teamDetail',
            parent: 'Teams',
            parentUrl: '/todo/teams',
            team: team,
            tasks: tasks,
            boards: boards,
            teamName: teamName,
            teamBoards: teamBoards,
            user: req.user, // req.session.ret_data.data,
            moment: moment,
            layout: 'layouts/detail'
        });
        // console.log('this is ' + team.user.username);
        console.log('Team Users Listed Successfully');
        req.session.errors = null;
    })}
    catch(error) {
        console.log("There was an error: " + error);
        return res.status(404).send(error);
    }
};
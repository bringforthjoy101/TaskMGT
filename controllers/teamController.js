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
    check('employees').not().isEmpty().withMessage('Please, check at least one employee!'),
    
    // Fields Sanitization
    sanitizeBody('team_name').escape(),
    sanitizeBody('employee').escape(),
    
    async function(req, res, next) {
        const errors = validationResult(req);
        if (errors) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/todo/teams');
          }
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
        });
    }
    req.session.sessionFlash = {
        type: 'success',
        comment: 'Great!',
        message: 'Role Created Successfully.'
      }
    console.log('Team created successfully');
    // req.session.success = true;
    res.redirect('/todo/teams');
}
];

// Handle team delete on POST.
exports.team_delete_post = function(req, res, next) {
    models.Team.destroy({
        where: {
            id: req.params.team_id
        }
    }).then(() => res.json({
        success: 'Team Deleted Successfully'
    })).catch(error => {
        res.status(404).send(error);
    })
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
        }).then(team => {
        res.json({
            success: 'Team Updated Successfully',
            team: team
        });
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
    
    try {
    //const userTeams = await models.user.getTeams();
    
    models.Team.findAll({
        order: [
            ['id', 'ASC'],
        ]
    }).then(function(teams){

        console.log("Teams Listed successfully");
        //console.log('this id the user teams ' + userTeams);

    res.render('pages/index', {
          title: 'Dashboard',
          page: 'teamPage',
          display: 'teamDisplay',
          employees: employees,
          user: req.user,
          errors: req.session.errors,
          success:req.session.success,
          moment: moment,
          teams: teams,
          sessionFlash: res.locals.sessionFlash,
          layout: 'layouts/main'
      
    });
    // req.session.errors = null;
    }); } catch(error) {
        console.log(error)
        console.log('The error log ' + error);
            // res.send(err); API
            res.render('pages/error', {
                title: 'Team List Error',
                error: error,
                user: req.user,
                 page: 'errorPage',
                display: 'dashboardDisplay',
                message: error.message,
                layout: 'layouts/detail'
    })
        
    }
};

// Display detail page for a specific team.
exports.team_detail = async function(req, res, next) {
    
    const tasks = await models.Task.findAll({
        where: {
          TeamId: req.params.team_id,
        },
        order: [
            ['id', 'ASC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'profile']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            }
        ]
    });
    
    
    
    const teamName = await models.Team.findById(req.params.team_id);

    models.Team.findById(
        req.params.team_id,{
        include: [
            {
              model: models.user,
              as: 'users',
              attributes: ['id', 'firstname', 'lastname', 'username', 'profile']
            },
        ]}
        ).then(team => {
        res.render('pages/index',  {
            title: 'Team Details',
            page: 'teamPage',
            display: 'teamDetail',
            team: team,
            tasks: tasks,
            teamName: teamName,
            user: req.user, // req.session.ret_data.data,
            moment: moment,
            layout: 'layouts/detail'
        });
        console.log('this is ' + team.user.username);
        console.log('Team Users Listed Successfully');
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    })
};
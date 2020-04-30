var models = require('../../models');
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
    .isLength({ min: 2 }).withMessage('Team name must be at least 2 chars long')
    .custom(value => { return models.Team.findOne({ where: { team_name: value } })
    .then(team => { if (team) { return Promise.reject('Team Name Already Exists'); } }); }),
    // check('employee').isIn(['employee']).withMessage('Please, check at least one employee!'),
    
    // Fields Sanitization
    sanitizeBody('team_name').escape(),
    sanitizeBody('employee').escape(),
    
    async function(req, res, next) {
        const result = validationResult(req);
            var errors = result.errors;
              for (var key in errors) {
                    console.log(errors[key].value);
              }
        if (!result.isEmpty()) {
            var errorResponse = {
                message: 'Validation error from form inputs',
                title: 'Create Team',
                errors: errors, 
                };
            return res.status(500).json({error: errorResponse });
          } else {
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
                console.log('Team created successfully');
                var displayData = {
                    message: 'Team created successfully',
                    team: team,
                };
                return res.status(200).json({success: displayData });
          }
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
        }).then(team => {
        res.json({
            success: 'Team Updated Successfully',
            team: team
        });
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    });
};

// Display list of all teams.
exports.team_list = async function(req, res, next) {
    console.log('I am in Team List Page');
    const employees = await models.user.findAll({
        order: [
            ['id', 'ASC'],
        ]
    });
    
    try {
        models.Team.findAll({
            order: [
                ['id', 'ASC'],
            ]
        }).then(function(teams){
            console.log("Teams Listed successfully");
            var displayData =  {
                  title: 'Dashboard',
                  page: 'teamPage',
                  display: 'teamDisplay',
                  employees: employees,
                  teams: teams,
              };
              return res.status(200).json({success: displayData });
        }); 
    } 
    catch(err) {
             console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error in Team Listing',
                title: 'Team List Function',
                fileLocation: 'controllers/api/teamController.js',
                error: err,
                message: err.message,
            };
            return res.status(500).json({ 
                error: catchResponse
            });
             
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
            var displayData = {
            title: 'Board Details',
            page: 'boardPage',
            display: 'boardDetail',
            team: team,
            tasks: tasks,
            teamName: teamName,
        };
        console.log('this is ' + team.user.username);
        console.log('Team Users Listed Successfully');
        // Successful, so render.
        return res.status(200).json({success: displayData });
        
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    });
};
var models = require('../../models');
var moment = require('moment');
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// Display task create form on GET.
exports.index = function(req, res, next) {
    res.json({
        success: 'Website is working fine'
    });
};

// Handle task by users create on POST.
exports.task_create_by_user_post = [
    
    // fields Validtion
    check('title')
    .not().isEmpty().withMessage('Title is required')
    .isLength({ min: 2 }).withMessage('Title must be at least 2 chars long')
    .custom(value => { return models.Task.findOne({ where: { title: value } })
    .then(task => { if (task) { return Promise.reject('Task Already Exists'); } }); }),
    check('desc').not().isEmpty().withMessage('Description is required'),
    check('duration').not().isEmpty().withMessage('Duration is required').isInt().withMessage('Duration must be an integer'),
    check('employee').not().isEmpty().withMessage('Employee is required').isAlpha().withMessage('must be letters'),
    check('user_id').not().isEmpty().withMessage('User ID is required').isInt().withMessage('User ID must be an integer'),
    check('board_id').not().isEmpty().withMessage('Board ID is required').isInt().withMessage('Board ID must be an integer'),
    
    // Fields Sanitization
    sanitizeBody('title').escape(),
    sanitizeBody('desc').escape(),
    sanitizeBody('duration').escape(),
    sanitizeBody('employee').escape(),
    sanitizeBody('user_id').escape(),
    sanitizeBody('board_id').escape(),
    
    async function(req, res, next) {
    let user_id = req.body.user_id;
    
    const errors = validationResult(req);
        if (errors) {
            var errorResponse = {
                message: 'Validation error from form inputs',
                title: 'Create Task',
                errors: errors.array(), 
                };
            return res.status(500).json({error: errorResponse });
        }
     
     // If the employee selected in the front end does not exist in DB return 400 error	
     if (!user_id) {
          return res.status(400);
     }
     
    models.Task.create({
        title: req.body.title,
        desc: req.body.desc,
        duration: req.body.duration,
        Employee: req.body.employee,
        userId: req.body.user_id,
        BoardId: req.body.board_id,
    }).then(task => {
        var displayData = {
        message: 'Task created successfully',
        task: task,
    };
    return res.status(200).json({success: displayData });
    });
}
];

// Handle task create on POST.
exports.task_create_by_team_post = [
    
    // fields Validtion
    check('title')
    .not().isEmpty().withMessage('Title is required')
    .isLength({ min: 2 }).withMessage('Title must be at least 2 chars long')
    .custom(value => { return models.Task.findOne({ where: { title: value } })
    .then(task => { if (task) { return Promise.reject('Task Already Exists'); } }); }),
    check('desc').not().isEmpty().withMessage('Description is required'),
    check('duration').not().isEmpty().withMessage('Duration is required').isInt().withMessage('Duration must be an integer'),
    check('team').not().isEmpty().withMessage('Team is required').isInt().withMessage('Team ID must be an integer'),
    check('user_id').not().isEmpty().withMessage('User ID is required').isInt().withMessage('User ID must be an integer'),
    check('board_id').not().isEmpty().withMessage('Board ID is required').isInt().withMessage('Board ID must be an integer'),
    
    // Fields Sanitization
    sanitizeBody('title').escape(),
    sanitizeBody('desc').escape(),
    sanitizeBody('duration').escape(),
    sanitizeBody('team').escape(),
    sanitizeBody('user_id').escape(),
    sanitizeBody('board_id').escape(),
    
    async function(req, res, next) {
        let user_id = req.body.user_id;
    
        const errors = validationResult(req);
        if (errors) {
            var errorResponse = {
                message: 'Validation error from form inputs',
                title: 'Create Task',
                errors: errors.array(), 
                };
            return res.status(500).json({error: errorResponse });
        } 
        
     // If the employee selected in the front end does not exist in DB return 400 error	
     if (!user_id) {
          return res.status(400);
     }
     
    models.Task.create({
        title: req.body.title,
        desc: req.body.desc,
        duration: req.body.duration,
        TeamId: req.body.team,
        userId: req.body.user_id,
        BoardId: req.body.board_id,
    }).then(task => {
        console.log("Board created successfully");
        var displayData = {
        message: 'Task created successfully',
        task: task,
    };
    return res.status(200).json({success: displayData });
    });
}
];

// Handle task delete on POST.
exports.task_delete_post = function(req, res, next) {
    models.Task.destroy({
        where: {
            id: req.params.task_id
        }
    }).then(() => res.json({
        success: 'Task Deleted Successfully'
    })).catch(error => {
        res.status(404).send(error);
    });
};

// Handles task update on POST
exports.task_update_post = function(req, res, next) {
    console.log("ID is " + req.params.task_id);
    models.Task.update(
        // Values to update
        {
            title: req.body.task_name,
            duration: req.body.duration,
            desc: req.body.desc,
        }, { // Clause
            where: {
                id: req.params.task_id
            }
        }).then(task => {
        res.json({
            success: 'Task Updated Successfully',
            task: task
        });
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    });
};

// Display list of all talkss.
exports.task_list = function(req, res, next) {
    try {
        models.Task.findAll({
            include: [
                {
                  model: models.user,
                  attributes: ['id', 'firstname', 'lastname', 'username']
                },
                {
                    model: models.Board,
                    attributes: ['id', 'board_name']
                },
            ]
        }).then(function(tasks){
    
            console.log("Task Listed successfully");
            var displayData =  {
                title: 'Dashboard',
                page: 'taskPage',
                display: 'taskDisplay',
                tasks: tasks,
            };
            return res.status(200).json({success: displayData }); 
        });
    }
    catch(err) {
             console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error in Task Listing',
                title: 'Task List Function',
                fileLocation: 'controllers/api/taskController.js',
                error: err,
                message: err.message,
            };
            return res.status(500).json({ 
                error: catchResponse
            });
             
    }
};

// Display list of all tasks belonging to an employee.
exports.task_list_employee = function(req, res, next) {
    try {
    models.Task.findAll({
        where: {Employee: req.user.username},
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    }).then(function(tasks){

        console.log("Tasks for employee Listed successfully");
        var displayData =  {
            title: 'Dashboard',
            page: 'taskPage',
            display: 'taskDisplay',
            tasks: tasks,
        };
        return res.status(200).json({success: displayData });
    });
    }
    catch(err) {
             console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error in Task Listing',
                title: 'Task List Function',
                fileLocation: 'controllers/api/taskController.js',
                error: err,
                message: err.message,
            };
            return res.status(500).json({ 
                error: catchResponse
            });
             
    }
};

// Display list of all active task.
exports.task_list_active = function(req, res, next) {
    try {
        models.Task.findAll({
            where: {Employee: req.user.username, status: 'InProgress' || 'Todo'},
            include: [
                {
                  model: models.user,
                  attributes: ['id', 'firstname', 'lastname', 'username']
                },
                {
                    model: models.Board,
                    attributes: ['id', 'board_name']
                },
            ]
        }).then(function(tasks){
    
            console.log("Active Tasks Listed successfully");
            var displayData =  {
                title: 'Dashboard',
                page: 'taskPage',
                display: 'taskDisplay',
                tasks: tasks,
            };
            return res.status(200).json({success: displayData });
        });
    }
    catch(err) {
             console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error in Task Listing',
                title: 'Task List Function',
                fileLocation: 'controllers/api/taskController.js',
                error: err,
                message: err.message,
            };
            return res.status(500).json({ 
                error: catchResponse
            });
             
    }
};

// Display list of all pending tasks.
exports.task_list_pending = function(req, res, next) {
    try {
        models.Task.findAll({
            where: {Employee: req.user.username, status: 'Todo'},
            include: [
                {
                  model: models.user,
                  attributes: ['id', 'firstname', 'lastname', 'username']
                },
                {
                    model: models.Board,
                    attributes: ['id', 'board_name']
                },
            ]
        }).then(function(tasks){
    
            console.log("Board Listed successfully");
            var displayData =  {
                title: 'Dashboard',
                page: 'taskPage',
                display: 'taskDisplay',
                tasks: tasks,
            };
            return res.status(200).json({success: displayData });
        });
    }
    catch(err) {
             console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error in Task Listing',
                title: 'Task List Function',
                fileLocation: 'controllers/api/taskController.js',
                error: err,
                message: err.message,
            };
            return res.status(500).json({ 
                error: catchResponse
            });
             
    }
};

// Display list of all completed tasks.
exports.task_list_completed = function(req, res, next) {
    try {
        models.Task.findAll({
            where: {Employee: req.user.username, status: 'Done'},
            include: [
                {
                  model: models.user,
                  attributes: ['id', 'firstname', 'lastname']
                },
                {
                    model: models.Board,
                    attributes: ['id', 'board_name']
                },
            ]
        }).then(function(tasks){
    
            console.log("Board Listed successfully");
            var displayData =  {
                title: 'Dashboard',
                page: 'taskPage',
                display: 'taskDisplay',
                tasks: tasks,
            };
            return res.status(200).json({success: displayData });
        });
    }
    catch(err) {
             console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error in Task Listing',
                title: 'Task List Function',
                fileLocation: 'controllers/api/taskController.js',
                error: err,
                message: err.message,
            };
            return res.status(500).json({ 
                error: catchResponse
            });
             
    }
};

// Display detail page for a specific task.
exports.task_detail = async function(req, res, next) {

    models.Task.findById(
        req.params.task_id 
        ).then(task => {
        res.json({
            success: 'Task Details Listed Successfully',
            task: task
        });
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    });
};

// Update task status to todo
exports.task_todo = function (req, res) {
  console.log("I want to update status to todo");
 
  let task_id = req.params.task_id;
  let employee = req.params.employee;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
        { status: 'Todo' },
        { where: {id: req.params.task_id} }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           models.Task.update(
            { startedAt: Date.now() },
            { where: {id: req.params.task_id} }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           const date = models.Task.findById(req.params.task_id);
            var sprint_date = moment(date.startedAt).add(14, 'days').format();
           models.Task.update(
                { sprintPeriod: sprint_date },
                { where: {id: req.params.task_id} }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(){
            const date = models.Task.findById(req.params.task_id);
            var status = moment(date.startedAt).add(16, 'hours').format();
            
            models.Task.update(
              { dueAt: status},
            { where: {id: req.params.task_id} }
          //   returning: true, where: {id: req.params.expense_id} 
           ).then(function(task){
        //check if employee is present in the route
        if(employee){
            console.log('Task Updated to todo');
            return res.status(200).json({
                success: 'Task Updated to Todo Successfully',
                task: task
            });
            
        } else {
            console.log('Task Not Updated ');
            return res.status(500).json({ 
                message: 'Operation failed',
                error: 'Employe does not exist',
            });
            
        }
    });
       });
       });
       });
};

// Update task status to InProgess
exports.task_inprogress = function (req, res) {
  console.log("I want to update status to inprogress");
 
  let task_id = req.params.task_id;
  let employee = req.params.employee;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
      
            {status: 'InProgress'},
            { where: {id: req.params.task_id} }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(task){
           
        //check if employee id is present in the route
        if(employee){
            console.log('Task Updated to InProgress');
            return res.status(200).json({
                success: 'Task Updated to InProgress Successfully',
                task: task
            });
        } else {
            console.log('Task Not Updated ');
            return res.status(500).json({ 
                message: 'Operation failed',
                error: 'Employe does not exist',
            });
        }
    });
};

// Update task status to Review
exports.task_review = function (req, res) {
  console.log("I want to update status to review");
 
  let task_id = req.params.task_id;
  let employee = req.params.employee;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
          { status: 'Review' },
        { where: {id: req.params.task_id} }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(task){
           
        //check if employee id is present in the route
        if(employee){
            console.log('Task Updated to Review');
            return res.status(200).json({
                success: 'Task Updated to Review Successfully',
                task: task
            });
        } else {
            console.log('Task Not Updated ');
            return res.status(500).json({ 
                message: 'Operation failed',
                error: 'Employe does not exist',
            });
        }
    });
};

// Update task status to Done
exports.task_done = async function (req, res) {
  console.log("I want to update status to done");
 
  let task_id = req.params.task_id;
  let employee = req.params.employee;
//   const thisTask = await models.Task.findById(task_id);
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
          { status: 'Done' },
        { where: {id: req.params.task_id} }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           models.Task.update(
                  { completedAt: Date.now() },
                { where: { id: req.params.task_id } }
              //   returning: true, where: {id: req.params.expense_id} 
               ).then(function(){
                   const thisTask = models.Task.findById(task_id);
                   var date1 = new Date(moment(thisTask.sprint).format('L'));
                   var date2 = new Date(moment(thisTask.completedAt).format('L'));
                   var diff = parseInt((date1 - date2) / (1000 * 3600 * 24));
                   console.log('this is the date difference ' + diff);
                   
            models.Task.update(
                  { sprint: diff },
                { where: { id: req.params.task_id } }
              //   returning: true, where: {id: req.params.expense_id} 
               ).then(function(task){           
        //check if employee id is present in the route
        if(employee){
            console.log('Task Updated to Done');
            return res.status(200).json({
                success: 'Task Updated to Done Successfully',
                task: task
            });
        } else {
            console.log('Task Not Updated ');
            return res.status(500).json({ 
                message: 'Operation failed',
                error: 'Employe does not exist',
            });
        }
    });
       });
       });
};

// Pick up a task
exports.task_pick = function (req, res) {
  console.log("I want to update status to todo");
 
  let task_id = req.params.task_id;
  let team_id = req.params.team_id;
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
        {
            status: 'Todo',
            Employee: req.body.username
        },
        { where: { id: req.params.task_id } }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           models.Task.update(
          { startedAt: Date.now() },
        { where: { id: req.params.task_id } }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(){
           const date = models.Task.findById(req.params.task_id);
            var sprint_date = moment(date.startedAt).add(14, 'days').format();
           models.Task.update(
          { sprintPeriod: sprint_date },
        { where: { id: req.params.task_id } }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(){
            const date = models.Task.findById(req.params.task_id);
            var status = moment(date.startedAt).add(16, 'hours').format();
            
            models.Task.update(
              { dueAt: status },
            { where: { id: req.params.task_id } }
          //   returning: true, where: {id: req.params.expense_id} 
           ).then(function(task){
        //check if employee id is present in the route
        if(team_id){
            console.log('Task Picked Up Successfully');
            return res.status(200).json({
                success: 'Task Picked Up Successfully and set to Todo',
                task: task
            });
        } else {
            console.log('Task Not Updated ');
            return res.status(500).json({ 
                message: 'Operation failed',
                error: 'Team ID does not exist',
            });
        }
    });
       });
       });
       });
};
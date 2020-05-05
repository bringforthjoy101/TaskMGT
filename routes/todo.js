var express = require('express');
var router = express.Router();


// Require our controllers.
var board_controller = require('../controllers/boardController');
var task_controller = require('../controllers/taskController');
var team_controller = require('../controllers/teamController');


/// BOARD ROUTES ///

// GET request for creating boards. NOTE This must come before route for id (i.e. display board).
// router.get('/board/create', board_controller.board_create_get);

// POST request for creating board.
router.post('/board/create', board_controller.board_create_post);

// GET request to delete board.
router.get('/team/:team_id/board/:board_id/delete', board_controller.board_delete_get);

// POST request to delete board.
router.post('/team/:team_id/board/:board_id/delete', board_controller.board_delete_post);

// GET request to update board.
// router.get('/board/:board_id/update', board_controller.board_update_get);

// POST request to update board.
router.post('/board/:board_id/update', board_controller.board_update_post);

// GET request for one board.
router.get('/team/:team_id/board/:board_id', board_controller.board_detail);

// GET request for list of all board.
router.get('/boards', board_controller.board_list);



/// TASK ROUTES ///

// GET request for creating tasks. NOTE This must come before route for id (i.e. display task).
// router.get('/tasks/create', task_controller.board_create_get);


// POST request for creating task.
router.post('/task/create/', task_controller.task_create_post);

// GET request to delete task.
router.get('/task/:task_id/delete', task_controller.task_delete_get);

// POST request to delete task.
router.post('/task/:task_id/delete', task_controller.task_delete_post);

// GET request to update task.
// router.get('/task/:task_id/update', task_controller.task_update_get);

// POST request to update task.
router.post('/task/:task_id/update', task_controller.task_update_post);

// GET request for one task.
router.get('/task/:team_id/:board_id/:task_id', task_controller.task_detail);

// GET request for list of all task.
router.get('/tasks', task_controller.task_list);

// GET request for list of all task.
router.get('/myTasks', task_controller.task_list_employee);

// GET request for list of all task.
router.get('/tasks/active', task_controller.task_list_active);

// GET request for list of all task.
router.get('/tasks/pending', task_controller.task_list_pending);

// GET request for list of all task.
router.get('/tasks/completed', task_controller.task_list_completed);

// Update task status 
router.post('/task/assign', task_controller.task_todo);
router.get('/task/:team_id/:board_id/:task_id/inprogress', task_controller.task_inprogress);
router.get('/task/:team_id/:board_id/:task_id/review', task_controller.task_review);
router.get('/task/:team_id/:board_id/:task_id/done', task_controller.task_done);

router.get('/task/:team_id/:board_id/:task_id/pick', task_controller.task_pick);


/// TEAM ROUTES ///

// GET request for creating teams. NOTE This must come before route for id (i.e. display team).
// router.get('/teams/create', team_controller.board_create_get);

// POST request for creating team.
router.post('/team/create', team_controller.team_create_post);

// GET request to delete team.
router.get('/team/:team_id/delete', team_controller.team_delete_get);

// POST request to delete team.
router.post('/team/:team_id/delete', team_controller.team_delete_post);

// GET request to update team.
// router.get('/team/:team_id/update', team_controller.team_update_get);

// POST request to update team.
router.post('/team/:team_id/update', team_controller.team_update_post);

// GET request for one team.
router.get('/team/:team_id', team_controller.team_detail);

// GET request for list of all team.
router.get('/teams', team_controller.team_list);



// GET blog home page.
router.get('/', board_controller.index); 

// export all the router created
module.exports = router;

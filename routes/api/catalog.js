var express = require('express');
var router = express.Router();


// Require our controllers.
var book_api_controller = require('../../controllers/api/bookController'); 
var author_api_controller = require('../../controllers/api/authorController');


/// BOOK ROUTES ///

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/book/create', book_api_controller.book_create_get);

// POST request for creating Book.
router.post('/book/create', book_api_controller.book_create_post);

// GET request to delete Book.
router.get('/book/:id/delete', book_api_controller.book_delete_get);

// POST request to delete Book.
router.post('/book/:id/delete', book_api_controller.book_delete_post);

// GET request to update Book.
router.get('/book/:id/update', book_api_controller.book_update_get);

// POST request to update Book.
router.post('/book/:id/update', book_api_controller.book_update_post);

// GET request for one Book.
router.get('/book/:id', book_api_controller.book_detail);

// GET request for list of all Book.
router.get('/books', book_api_controller.book_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get('/author/create', author_api_controller.author_create_get);

// POST request for creating Author.
router.post('/author/create', author_api_controller.author_create_post);

// GET request to delete Author.
router.get('/author/:id/delete', author_api_controller.author_delete_get);

// POST request to delete Author
router.post('/author/:id/delete', author_api_controller.author_delete_post);

// GET request to update Author.
router.get('/author/:id/update', author_api_controller.author_update_get);

// POST request to update Author.
router.post('/author/:id/update', author_api_controller.author_update_post);

// GET request for one Author.
router.get('/author/:id', author_api_controller.author_detail);

// GET request for list of all Authors.
router.get('/authors', author_api_controller.author_list);
 
// GET catalog home page.
router.get('/', function(req, res, next) {
    res.render('pages/index', {
        title: 'Express',
        layout: 'layouts/main'
    });
});

module.exports = router;

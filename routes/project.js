// Import the Express framework, which is necessary for creating router modules.
const express = require("express");

// Create a new router object using express.Router().
// This router will handle routes specifically related to projects.
const router = express.Router();

// Import the project controller module.
// This module contains the functions (controller actions) that handle the logic
// for creating projects, displaying project details, and creating issues within projects.
const projectController = require("../controllers/project_controller");

// Define a route for handling POST requests to '/create'.
// Assuming this router is mounted under '/project' in the main app, this corresponds to '/project/create'.
// When a POST request hits this path (typically from a form submission to create a new project),
// the 'create' function from the 'projectController' will be executed.
router.post("/create", projectController.create);

// Define a route for handling GET requests to '/:id'.
// The ':id' is a URL parameter, meaning it can match any string in that position (e.g., '/project/123', '/project/abc').
// Express makes the value of ':id' available in `req.params.id`.
// When a GET request hits a path like '/project/<some-project-id>',
// the 'project' function from the 'projectController' will be executed, likely to display the details of that specific project.
router.get("/:id", projectController.project);

// Define a route for handling POST requests to '/:id'.
// Similar to the GET route above, this captures the project ID from the URL.
// When a POST request hits a path like '/project/<some-project-id>' (typically from a form to create an issue for that project),
// the 'createIssue' function from the 'projectController' will be executed.
router.post("/:id", projectController.createIssue);

// Export the configured router object.
// This allows the main application file (e.g., index.js or app.js) to import and mount these project-specific routes,
// usually under a base path like '/project'.
module.exports = router;

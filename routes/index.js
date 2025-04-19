// Import the Express framework, which is necessary for creating router modules.
const express = require("express");

// Create a new router object using express.Router().
// This object allows defining modular, mountable route handlers.
const router = express.Router();

// Import the home controller module, which contains the logic for handling requests related to the home page.
// It's expected to have an exported function named 'home'.
const homeController = require("../controllers/home_controller");

// Log a message to the console indicating that this router module has been loaded.
// Useful for debugging to confirm the execution flow.
console.log("router loaded");

// Define a GET route handler for the root path ('/') of this router.
// When a GET request is made to '/', it will be handled by the 'home' function
// imported from the 'home_controller'.
router.get("/", homeController.home);

// Mount another router module for any routes starting with '/project'.
// It delegates the handling of requests like '/project/create', '/project/:id', etc.,
// to the router defined in the './project.js' file within the same directory.
router.use("/project", require("./project"));

// Export the configured router object so it can be mounted by the main application file (e.g., index.js or app.js).
module.exports = router;

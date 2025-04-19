// Load environment variables from a .env file into process.env
require("dotenv").config();

// Import the Express framework
const express = require("express");
// Import the Mongoose configuration (database connection setup)
const db = require("./config/mongoose");
// Define the port number for the server, using the environment variable PORT or defaulting to 3000
const port = process.env.PORT || 3000;
// Create an instance of the Express application
const app = express();
// Import the built-in 'path' module for working with file and directory paths
const path = require("path");
// Import the express-ejs-layouts middleware for creating layout templates
const expressLayouts = require("express-ejs-layouts");

// Middleware to parse incoming requests with URL-encoded payloads (like form submissions)
// This makes req.body available with the form data
app.use(express.urlencoded());

// Middleware to serve static files (like CSS, JavaScript, images)
// Files requested from the root path will be looked for in the 'assets' directory
app.use(express.static("assets"));

// Enable the express-ejs-layouts middleware
// This should typically be placed after static middleware and before routes
app.use(expressLayouts);

// Configuration for express-ejs-layouts:
// Automatically move <link rel="stylesheet"> tags from view files into the <head> of the layout file
app.set("layout extractStyles", true);
// Automatically move <script> tags from view files to the end of the <body> in the layout file
app.set("layout extractScripts", true);

// Set EJS (Embedded JavaScript) as the template engine for rendering views
app.set("view engine", "ejs");
// Set the directory where the application's view templates are located (redundant due to the next line)
app.set("views", "./views");
// Set the directory for view templates using an absolute path
// path.join ensures cross-platform compatibility (__dirname is the current directory)
app.set("views", path.join(__dirname, "views"));

// Mount the router defined in './routes/index.js' (or './routes')
// All requests starting with '/' will be handled by this router
app.use("/", require("./routes"));

// Start the Express server and listen for incoming connections on the specified port
app.listen(port, function (err) {
  // Check if there was an error starting the server
  if (err) {
    // Log an error message if the server failed to start
    console.log(`Error in running the server: ${err}`);
    // Exit the process if there's an error, or handle it appropriately
    return;
  }
  // Log a success message indicating the server is running and on which port
  console.log(`Server is running on port: ${port}`);
});

// Define a GET route handler for the root path ('/')
// Note: This might conflict with or be overridden by routes defined in './routes'
//       depending on the specific routes configured there.
// Also Note: The 'projects' variable used here is not defined in this scope.
//            It would need to be defined or imported for this route to work correctly.
// app.get("/", (req, res) => {
//   // Render the 'home.ejs' view template
//   // Passes an object with a 'projects' variable to the template (assuming 'projects' is defined elsewhere)
//   res.render("home", { projects });
// });
module.exports = app;

// Import the Project model from the '../models/project' file.
// This model is used to interact with the 'projects' collection in the database.
const Project = require("../models/project");
// Import the Issue model from the '../models/issue' file.
// This model is used to interact with the 'issues' collection in the database.
const Issue = require("../models/issue");
// Destructure the findById method from the Project model - Note: This import seems unused in the provided code.
// const { findById } = require('../models/project'); // This line seems redundant as Project.findById is used directly later.

/**
 * Controller action to handle the creation of a new project.
 * Extracts project details from the request body and saves a new project to the database.
 *
 * @param {object} req - The Express request object, containing form data in req.body.
 * @param {object} res - The Express response object, used to redirect the client.
 * @returns {Promise<void>} - Returns a promise that resolves after attempting redirection.
 */
module.exports.create = async function (req, res) {
  try {
    // Create a new project document in the database using the Project model.
    // Data for the new project (name, description, author) is taken from the request body (req.body),
    // which typically comes from an HTML form submission.
    // Project.create() is an asynchronous operation, but here it's not awaited.
    // While this might work for fire-and-forget, it's generally better to await Promises.
    // However, per the request, the code is not modified.
    Project.create({
      name: req.body.name, // Project name from the form
      description: req.body.description, // Project description from the form
      author: req.body.author, // Project author from the form
    });
    // Redirect the user back to the previous page they were on.
    // Useful after form submissions to prevent duplicate submissions on refresh.
    return res.redirect("back");
  } catch (err) {
    // If an error occurs during the project creation process (e.g., database error, validation error),
    // log the error to the console for debugging.
    console.log("Error creating project:", err); // Log the specific error
    // Redirect the user back to the previous page even if an error occurred.
    // Consider showing an error message to the user instead of just redirecting.
    return res.redirect("back");
  }
};

/**
 * Controller action to display a specific project's details page.
 * Fetches the project by its ID (from the URL parameters) and its associated issues.
 * Renders the project page view with the fetched data.
 *
 * @param {object} req - The Express request object, containing the project ID in req.params.id.
 * @param {object} res - The Express response object, used to render the view or redirect.
 * @returns {Promise<void>} - Returns a promise that resolves when the response is sent.
 */
module.exports.project = async function (req, res) {
  try {
    // Find a project document in the database by its unique ID.
    // The ID is extracted from the URL parameters (e.g., /projects/:id).
    let project = await Project.findById(req.params.id)
      // Populate the 'issues' field of the project document.
      // This replaces the ObjectIds stored in the 'issues' array with the actual issue documents
      // from the 'issues' collection, assuming 'issues' is defined as a ref in the Project schema.
      .populate({
        path: "issues", // Specify the field to populate
      });

    // Check if a project with the given ID was successfully found.
    if (project) {
      // If the project exists, render the 'project_page.ejs' view.
      // Pass the page title and the fetched project object (including populated issues) to the view.
      return res.render("project_page", {
        title: "Project Page", // Set the page title variable for the EJS template
        project, // Pass the project data (with issues) to the EJS template
      });
    }
    // If no project is found with the provided ID, redirect the user back to the previous page.
    return res.redirect("back");
  } catch (err) {
    // If an error occurs during the database query or rendering process,
    // log the error to the console.
    console.log("Error fetching project:", err); // Log the specific error
    // Redirect the user back to the previous page in case of an error.
    // Consider showing a more specific error page or message.
    return res.redirect("back");
  }
};

/**
 * Controller action to create a new issue for a specific project.
 * Finds the project by ID, creates a new issue with data from the request body,
 * associates the issue with the project, updates the project's unique labels,
 * and saves the project.
 *
 * @param {object} req - The Express request object, containing the project ID in req.params.id and issue data in req.body.
 * @param {object} res - The Express response object, used to redirect the client.
 * @returns {Promise<void>} - Returns a promise that resolves after attempting redirection.
 */
module.exports.createIssue = async function (req, res) {
  try {
    // Find the project document by its ID, obtained from the URL parameters (req.params.id).
    let project = await Project.findById(req.params.id);

    // Check if the project was found.
    if (project) {
      // Create a new issue document using the Issue model.
      // Data for the issue (title, description, labels, author) comes from the request body (req.body).
      let issue = await Issue.create({
        title: req.body.title, // Issue title from the form
        description: req.body.description, // Issue description from the form
        labels: req.body.labels, // Issue labels from the form (can be single string or array)
        author: req.body.author, // Issue author from the form
      });

      // Add the newly created issue's ObjectId to the 'issues' array within the found project document.
      project.issues.push(issue);

      // Logic to add unique labels from the new issue to the project's list of all unique labels.
      // Check if req.body.labels is an array (multiple labels selected/entered) or a single string.
      if (!(typeof req.body.labels === "string")) {
        // If it's an array, iterate through each label submitted for the issue.
        for (let label of req.body.labels) {
          // Check if the current label already exists in the project's 'labels' array.
          // `find` returns the first element that matches, or undefined if none match.
          let isPresent = project.labels.find((obj) => obj == label);
          // If the label is not already present in the project's labels array, add it.
          if (!isPresent) {
            project.labels.push(label);
          }
        }
      } else {
        // If req.body.labels is a single string (only one label submitted).
        // Check if this single label already exists in the project's 'labels' array.
        let isPresent = project.labels.find((obj) => obj == req.body.labels);
        // If the label is not already present, add it to the project's labels array.
        if (!isPresent) {
          project.labels.push(req.body.labels);
        }
      }

      // Save the changes made to the project document (adding the new issue ref and potentially new labels) back to the database.
      // `await` ensures this asynchronous operation completes before proceeding.
      await project.save();

      // Redirect the user back to the previous page (likely the project page where the issue was created).
      return res.redirect(`back`);
    } else {
      // If the project with the specified ID was not found, redirect back.
      console.log("Project not found for issue creation");
      return res.redirect("back");
    }
  } catch (err) {
    // If any error occurs during the process (finding project, creating issue, saving project),
    // log the error to the console.
    console.log("Error creating issue:", err); // Log the specific error
    // Redirect the user back to the previous page in case of an error.
    // Consider displaying an error message.
    return res.redirect("back");
  }
};

// Import the Mongoose library, which provides tools for modeling application data for MongoDB.
const mongoose = require("mongoose");

// Define the schema for the 'Project' collection in MongoDB.
// A schema maps to a MongoDB collection and defines the shape of the documents within that collection.
const projectSchema = new mongoose.Schema(
  // First argument: an object defining the fields of the schema.
  {
    // Define the 'name' field for a project.
    name: {
      type: String, // Specifies the data type as String.
      trim: true, // Automatically removes leading/trailing whitespace from the name string.
      required: true, // Makes this field mandatory; a project document cannot be saved without a name.
    },
    // Define the 'description' field for a project.
    description: {
      type: String, // Specifies the data type as String.
      required: true, // Makes this field mandatory.
    },
    // Define the 'author' field for a project.
    author: {
      type: String, // Specifies the data type as String.
      required: true, // Makes this field mandatory.
    },
    // Define the 'issues' field for a project.
    // This field will store an array of references to documents in the 'Issue' collection.
    issues: [
      // Specifies that 'issues' is an array.
      {
        type: mongoose.Schema.Types.ObjectId, // Each element in the array must be a MongoDB ObjectId.
        ref: "Issue", // Specifies that these ObjectIds refer to documents in the 'Issue' model/collection.
        // This enables population (replacing ObjectIds with actual issue documents) later.
      },
    ],
    // Define the 'labels' field for a project.
    // This field stores an array of unique labels associated with the issues within this project.
    labels: [
      // Specifies that 'labels' is an array.
      {
        type: String, // Each element in the array must be a String.
        // No `trim` or `required` here, suggesting labels might be simpler strings added programmatically.
        // Uniqueness might be enforced at the application level (as seen in the controller).
      },
    ],
  },
  // Second argument: an options object for the schema.
  {
    // Automatically add `createdAt` and `updatedAt` timestamp fields to the documents.
    // `createdAt`: Stores the timestamp when the document was first created.
    // `updatedAt`: Stores the timestamp of the last update to the document.
    timestamps: true,
  }
);

// Create a Mongoose model named 'Project' based on the 'projectSchema'.
// A model is a constructor compiled from a schema definition. Instances of models represent MongoDB documents.
// Mongoose will automatically look for the plural, lowercased version of the model name for the collection,
// so this model will interact with the 'projects' collection in the MongoDB database.
const Project = mongoose.model("Project", projectSchema);

// Export the 'Project' model so it can be imported and used in other parts of the application (e.g., controllers).
module.exports = Project;

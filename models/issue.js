// Import the Mongoose library, which provides tools for modeling application data for MongoDB.
const mongoose = require("mongoose");

// Define the schema for the 'Issue' collection in MongoDB.
// A schema maps to a MongoDB collection and defines the shape of the documents within that collection.
const issueSchema = new mongoose.Schema(
  // First argument: an object defining the fields of the schema.
  {
    // Define the 'title' field for an issue.
    title: {
      type: String, // Specifies the data type as String.
      trim: true, // Automatically removes leading/trailing whitespace from the title string.
      required: true, // Makes this field mandatory; an issue document cannot be saved without a title.
    },
    // Define the 'description' field for an issue.
    description: {
      type: String, // Specifies the data type as String.
      trim: true, // Automatically removes leading/trailing whitespace from the description string.
      required: true, // Makes this field mandatory.
    },
    // Define the 'author' field for an issue.
    author: {
      type: String, // Specifies the data type as String.
      trim: true, // Automatically removes leading/trailing whitespace from the author string.
      required: true, // Makes this field mandatory.
    },
    // Define the 'labels' field for an issue.
    // This field will store an array of strings, representing the labels associated with the issue.
    labels: [
      // Specifies that 'labels' is an array.
      {
        // Defines the type and constraints for elements within the array.
        type: String, // Each element in the array must be a String.
        trim: true, // Automatically removes whitespace from each label string in the array.
        required: true, // Makes it mandatory for each element in the array to exist (i.e., prevents null/undefined elements, though an empty array is still possible unless further validation is added). It doesn't strictly enforce the array itself cannot be empty upon creation unless coupled with other model-level validation.
      },
    ],
    // Note: While `required: true` is set on the array element type,
    // it doesn't prevent the `labels` array itself from being empty.
    // If the `labels` array *must* contain at least one label, additional validation might be needed.
  },
  // Second argument: an options object for the schema.
  {
    // Automatically add `createdAt` and `updatedAt` timestamp fields to the documents.
    // `createdAt`: Stores the timestamp when the document was first created.
    // `updatedAt`: Stores the timestamp of the last update to the document.
    timestamps: true,
  }
);

// Create a Mongoose model named 'Issue' based on the 'issueSchema'.
// A model is a constructor compiled from a schema definition. Instances of models represent MongoDB documents.
// Mongoose will automatically look for the plural, lowercased version of the model name for the collection,
// so this model will interact with the 'issues' collection in the MongoDB database.
const Issue = mongoose.model("Issue", issueSchema);

// Export the 'Issue' model so it can be imported and used in other parts of the application (e.g., controllers).
module.exports = Issue;

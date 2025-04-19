// Import the Mongoose library, which provides a straightforward, schema-based solution
// to model application data and interact with MongoDB.
const mongoose = require("mongoose");

// Establish a connection to the MongoDB database.
// The connection string "mongodb://127.0.0.1:27017/auth" specifies:
// - mongodb:// : The protocol for MongoDB connection.
// - 127.0.0.1 : The hostname or IP address of the MongoDB server (localhost in this case).
// - 27017     : The default port number for MongoDB.
// - /auth     : The name of the database to connect to. If it doesn't exist, MongoDB will create it upon first data insertion.
// Mongoose handles the connection logic asynchronously.
mongoose.connect("mongodb+srv://ronaldo:ronaldo28@cluster0.abcb9in.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// Get a reference to the default Mongoose connection object.
// This object represents the connection to the MongoDB database established above.
const db = mongoose.connection;

// Set up an event listener for the 'error' event on the database connection.
// If an error occurs during the connection process or after the initial connection is established,
// this listener will trigger the provided callback function.
// console.error.bind(console, "Error in connecting to MongoDB") ensures that:
// 1. 'console.error' is used to log the error message.
// 2. The context ('this') for 'console.error' is correctly set to 'console'.
// 3. The custom message "Error in connecting to MongoDB" is prepended to the actual error details when logged.
db.on("error", console.error.bind(console, "Error in connecting to MongoDB"));

// Set up a one-time event listener for the 'open' event on the database connection.
// This event is emitted when Mongoose successfully connects to the MongoDB server for the first time.
// The callback function `() => { ... }` is executed only once when the connection is successfully opened.
db.once("open", () => {
  // Log a success message to the console indicating that the database connection is established.
  console.log("-->Connected to Database :: MongoDB<--");
});

// Export the database connection object (`db`).
// This allows other modules (files) in the application to import and use this connection object,
// for example, to define Mongoose models or perform database operations without needing to reconnect.
// Note: There is a typo here. It should be `module.exports`, not `module.export`.
module.exports = db; // Corrected export statement

// --- DOM Element Selection ---

// Get the search form element by its ID. This form contains inputs for title and description.
let searchIssueForm = document.getElementById("search-issue-form");

// Get the hidden div element that stores the project's issue data as a JSON string in its 'data' attribute.
// This reuses the same data source as the filter script.
let searchJson = document.getElementById("issue-data").getAttribute("data");

// Parse the JSON string retrieved from the 'data' attribute into a JavaScript array of issue objects.
let searchIssues = JSON.parse(searchJson); // Contains all issues for the project

// Get the container element (likely the same div as used by the filter script) where the searched issue cards will be displayed.
let searchList = document.getElementById("issues-list");

// --- Event Listener for Form Submission ---

// Add an event listener to the search form that triggers when the form is submitted.
searchIssueForm.addEventListener("submit", function (e) {
  // Prevent the default form submission behavior (page reload/navigation).
  // This ensures the search is handled client-side via JavaScript.
  e.preventDefault();

  // --- Search Logic ---

  // Create an empty array to store the issues that match the search criteria.
  let searchedIssues = [];

  // Get the value entered by the user in the input field named "tie" (presumably for Title).
  let titleValue = searchIssueForm.querySelector('input[name="tie"]').value;
  // Get the value entered by the user in the input field named "des" (presumably for Description).
  let descriptionValue =
    searchIssueForm.querySelector('input[name="des"]').value;

  // Iterate over each issue in the original 'searchIssues' array (which holds all project issues).
  searchIssues.map((el) => {
    // Using `map` is not ideal here; `forEach` is more semantically correct as we're not creating a new array based on the return values.
    // Check if the issue's title exactly matches the entered titleValue
    // OR if the issue's description exactly matches the entered descriptionValue.
    // Note: This performs a case-sensitive, exact match. For more flexible searching,
    // consider converting both strings to lowercase and using `includes()` for partial matches.
    if (el.title == titleValue || el.description == descriptionValue) {
      // If a match is found (either title or description) AND the issue is not already in the `searchedIssues` array, add it.
      if (!searchedIssues.includes(el)) {
        searchedIssues.push(el);
      }
    }
  });

  // --- Displaying Search Results ---

  // Clear the existing content of the 'searchList' container element to display fresh results.
  searchList.innerHTML = "";

  // Iterate over the array of issues that matched the search criteria.
  for (let issue of searchedIssues) {
    // Create a new 'div' element to hold the card for the current issue.
    let Div = document.createElement("div");
    // Setting style to 'none' is invalid CSS and likely has no effect. Remove or replace with appropriate styling if needed.
    Div.style = "none"; // This line is ineffective and should likely be removed.

    // Set the inner HTML of the new div to a Bootstrap card structure, populating it with the current issue's details.
    // Template literals (` `` `) allow embedding variables like ${issue.title} directly into the string.
    Div.innerHTML = `
      <div class="card w-100 mb-2" > <!-- Added mb-2 for spacing -->
        <div class="card-body" >
          <h4 class="card-title">Title : ${issue.title} </h4>
          <h5 class="card-title">Author : ${issue.author}</h5>
          <h6 class="card-subtitle mb-2 text-muted">
            Description : ${issue.description}
          </h6>
           <!-- Optionally display labels -->
          <!-- <p>Labels: ${issue.labels.join(", ")}</p> -->
        </div>
      </div>
    `;
    // Append the newly created div (containing the issue card) to the 'searchList' container on the webpage.
    searchList.appendChild(Div);
  }
});

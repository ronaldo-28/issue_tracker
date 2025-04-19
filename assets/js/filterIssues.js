/**
 * Issue Tracker Filter and Search Script
 *
 * Handles client-side filtering of issues by labels/author
 * and searching by title/description.
 * Assumes HTML structure with specific IDs:
 * - #issue-data: A hidden element with a 'data' attribute containing JSON array of issues.
 * - #filter-issue-form: The form containing label checkboxes and author radio buttons.
 * - #search-issue-form: The form containing title ('tie') and description ('des') inputs.
 * - #issues-list: The container element where issue cards will be rendered.
 */
document.addEventListener("DOMContentLoaded", function () {
  // Wait for the DOM to be fully loaded before running any script logic

  // --- Common Elements & Data Initialization ---
  console.log("DOM Loaded. Initializing issue tracker script...");

  const issueDataElement = document.getElementById("issue-data");
  const issueList = document.getElementById("issues-list"); // Container for displaying issues
  let issues = []; // Initialize empty array to hold all issues

  // Safely get and parse issue data from the DOM
  if (issueDataElement) {
    const issuesJson = issueDataElement.getAttribute("data");
    if (issuesJson) {
      try {
        issues = JSON.parse(issuesJson); // Parse JSON string into an array
        // Validate that the parsed data is actually an array
        if (!Array.isArray(issues)) {
          console.error("Parsed issue data is not an array:", issues);
          issues = []; // Reset to empty array if parsing resulted in non-array data
        } else {
          console.log(`Successfully parsed ${issues.length} issues.`);
          // Optionally render all issues initially:
          // renderIssues(issues, issueList);
        }
      } catch (error) {
        console.error(
          "Error parsing JSON data from #issue-data attribute:",
          error
        );
        issues = []; // Reset to empty array on parsing error
        if (issueList)
          issueList.innerHTML =
            "<p class='text-danger'>Error loading issue data.</p>";
      }
    } else {
      console.warn(
        "Element #issue-data found, but 'data' attribute is empty or missing."
      );
      if (issueList) issueList.innerHTML = "<p>No issue data found.</p>";
    }
  } else {
    // Critical error if data source is missing
    console.error(
      "Required element with ID 'issue-data' not found. Cannot load issues."
    );
    if (issueList)
      issueList.innerHTML =
        "<p class='text-danger'>Configuration error: Issue data source missing.</p>";
    // No point continuing if data source is missing, maybe return or disable forms.
  }

  // Check if the display list exists
  if (!issueList) {
    console.error(
      "Required element with ID 'issues-list' not found. Cannot display issues."
    );
    // Forms won't work without a place to display results.
  }

  // --- Filter Form Logic ---
  const filterIssueForm = document.getElementById("filter-issue-form");

  if (filterIssueForm && issueList) {
    // Only add listener if form and list container exist
    filterIssueForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default form submission (page reload/redirect)
      console.log("Filter form submitted, default action prevented.");

      try {
        // Get selected labels (array of values)
        const labelsElements = [
          ...filterIssueForm.querySelectorAll("input[type=checkbox]:checked"),
        ];
        const selectedLabels = labelsElements.map((el) => el.value);
        console.log("Selected Labels:", selectedLabels);

        // Get selected author (string value, or "" if none selected)
        const checkedAuthorRadio = filterIssueForm.querySelector(
          "input[type=radio][name=author]:checked"
        );
        const selectedAuthor = checkedAuthorRadio
          ? checkedAuthorRadio.value
          : "";
        console.log("Selected Author:", selectedAuthor || "None");

        let filteredIssues = []; // Array to hold issues matching filters

        // --- Filtering Core Logic ---
        if (selectedLabels.length === 0 && !selectedAuthor) {
          // Case 1: No filters applied - show all issues
          console.log("No filters applied, showing all issues.");
          filteredIssues = [...issues]; // Create a copy of all issues
        } else {
          // Case 2: Filters are applied - iterate and check each issue
          console.log("Applying filters...");
          issues.forEach((issue) => {
            let matchesAuthor = false;
            let matchesLabel = false;

            // Check author match (only if an author filter is active)
            if (selectedAuthor && issue.author === selectedAuthor) {
              matchesAuthor = true;
            }

            // Check label match (only if label filters are active and issue has labels)
            // An issue matches if *at least one* of its labels is in the selectedLabels array
            if (selectedLabels.length > 0 && Array.isArray(issue.labels)) {
              if (
                selectedLabels.some((selectedLabel) =>
                  issue.labels.includes(selectedLabel)
                )
              ) {
                matchesLabel = true;
              }
            }

            // Determine if the issue should be included based on filter logic (OR condition)
            let includeIssue = false;
            if (selectedAuthor && selectedLabels.length > 0) {
              // Both filters active: Match EITHER Author OR Label
              includeIssue = matchesAuthor || matchesLabel;
            } else if (selectedAuthor) {
              // Only Author filter active: Match Author
              includeIssue = matchesAuthor;
            } else if (selectedLabels.length > 0) {
              // Only Label filter active: Match Label
              includeIssue = matchesLabel;
            }

            // Add to results if it matches and isn't already included (handles OR logic cases)
            if (includeIssue) {
              // Basic check to avoid duplicates if an issue somehow matches multiple times in logic
              // Using includes is less robust than ID check but works if objects are the same reference
              if (!filteredIssues.includes(issue)) {
                filteredIssues.push(issue);
              }
              // If your issues have a unique ID (e.g., issue.id or issue._id):
              /*
                 if (!filteredIssues.some(fi => fi.id === issue.id)) {
                     filteredIssues.push(issue);
                 }
                 */
            }
          });
          console.log(
            `Filtering complete. Found ${filteredIssues.length} matching issues.`
          );
        }

        // --- Displaying Filtered Results ---
        renderIssues(filteredIssues, issueList);
      } catch (error) {
        // Log error and show message to user if filtering fails
        console.error("Error during filtering process:", error);
        if (issueList)
          issueList.innerHTML =
            "<p class='text-danger'>An error occurred while filtering issues. Check console for details.</p>";
      }
    });
    console.log("Filter form event listener attached.");
  } else {
    if (!filterIssueForm)
      console.warn(
        "Element with ID 'filter-issue-form' not found. Filtering disabled."
      );
    if (!issueList && filterIssueForm)
      console.warn(
        "Filter form found, but no #issues-list to display results."
      );
  }

  // --- Search Form Logic ---
  const searchIssueForm = document.getElementById("search-issue-form");

  if (searchIssueForm && issueList) {
    // Only add listener if form and list container exist
    searchIssueForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default form submission (page reload/redirect)
      console.log("Search form submitted, default action prevented.");

      try {
        // Get search terms, convert to lower case, and trim whitespace
        const titleValue = (
          searchIssueForm.querySelector('input[name="tie"]')?.value || ""
        )
          .toLowerCase()
          .trim();
        const descriptionValue = (
          searchIssueForm.querySelector('input[name="des"]')?.value || ""
        )
          .toLowerCase()
          .trim();
        console.log(
          `Searching for Title: "${titleValue}", Description: "${descriptionValue}"`
        );

        let searchedIssuesResult = []; // Array to hold issues matching search

        // --- Searching Core Logic ---
        if (!titleValue && !descriptionValue) {
          // Case 1: Both search fields are empty - show all issues
          // (Alternative: Clear results by setting searchedIssuesResult = [])
          console.log("Search fields empty, showing all issues.");
          searchedIssuesResult = [...issues]; // Create a copy of all issues
        } else {
          // Case 2: At least one search field has text - iterate and check
          console.log("Applying search criteria...");
          issues.forEach((issue) => {
            // Ensure issue properties exist and convert to lowercase for comparison
            const issueTitle = (issue.title || "").toLowerCase();
            const issueDescription = (issue.description || "").toLowerCase();

            let titleMatch = false;
            // Check title if title search term exists and issue title includes it
            if (titleValue && issueTitle.includes(titleValue)) {
              titleMatch = true;
            }

            let descriptionMatch = false;
            // Check description if description search term exists and issue description includes it
            if (
              descriptionValue &&
              issueDescription.includes(descriptionValue)
            ) {
              descriptionMatch = true;
            }

            // Include the issue if EITHER the title matches OR the description matches
            // Only consider a match if the corresponding search term was actually provided
            if (
              (titleValue && titleMatch) ||
              (descriptionValue && descriptionMatch)
            ) {
              // Avoid duplicates
              if (!searchedIssuesResult.includes(issue)) {
                searchedIssuesResult.push(issue);
              }
              // If your issues have a unique ID (e.g., issue.id or issue._id):
              /*
                 if (!searchedIssuesResult.some(si => si.id === issue.id)) {
                    searchedIssuesResult.push(issue);
                 }
                 */
            }
          });
          console.log(
            `Search complete. Found ${searchedIssuesResult.length} matching issues.`
          );
        }

        // --- Displaying Search Results ---
        renderIssues(searchedIssuesResult, issueList);
      } catch (error) {
        // Log error and show message to user if searching fails
        console.error("Error during searching process:", error);
        if (issueList)
          issueList.innerHTML =
            "<p class='text-danger'>An error occurred while searching issues. Check console for details.</p>";
      }
    });
    console.log("Search form event listener attached.");
  } else {
    if (!searchIssueForm)
      console.warn(
        "Element with ID 'search-issue-form' not found. Searching disabled."
      );
    if (!issueList && searchIssueForm)
      console.warn(
        "Search form found, but no #issues-list to display results."
      );
  }

  // --- Helper Function to Render Issues ---
  // Takes an array of issue objects and the target DOM element to render them into
  function renderIssues(issuesToRender, targetElement) {
    if (!targetElement) {
      console.error("Render target element not provided or found.");
      return; // Don't proceed if target element doesn't exist
    }

    console.log(`Rendering ${issuesToRender.length} issues...`);
    targetElement.innerHTML = ""; // Clear previous results efficiently

    // Handle case where no issues match the criteria
    if (issuesToRender.length === 0) {
      targetElement.innerHTML =
        "<div class='alert alert-info w-100'>No issues found matching your criteria.</div>";
      return;
    }

    // Iterate over the issues and create HTML for each
    issuesToRender.forEach((issue) => {
      const issueCardContainer = document.createElement("div");
      issueCardContainer.classList.add("issue-card-container"); // Optional class for the container div

      // Basic check for essential properties before rendering, providing defaults
      const title = issue.title || "No Title Provided";
      const author = issue.author || "Unknown Author";
      const description = issue.description || "No Description Provided";
      const labelsString =
        Array.isArray(issue.labels) && issue.labels.length > 0
          ? `<p class="card-text mb-1"><small><strong>Labels:</strong> ${escapeHTML(
              issue.labels.join(", ")
            )}</small></p>`
          : ""; // Generate labels string only if labels exist

      // Use innerHTML to create the card structure for each issue
      // Use escapeHTML to prevent XSS vulnerabilities from issue data
      issueCardContainer.innerHTML = `
        <div class="card w-100 mb-3 shadow-sm"> <!-- Added shadow-sm and more margin -->
          <div class="card-body">
            <h4 class="card-title mb-1"> ${escapeHTML(
              title
            )} </h4> <!-- Reduced margin -->
            <h6 class="card-subtitle mb-2 text-muted">Author: ${escapeHTML(
              author
            )}</h6>
            <p class="card-text mb-2"> <!-- Added margin bottom -->
              ${escapeHTML(description)}
            </p>
            ${labelsString} <!-- Insert the labels paragraph if it exists -->
          </div>
        </div>
      `;
      targetElement.appendChild(issueCardContainer); // Append the new card to the list
    });
    console.log("Rendering complete.");
  }

  // --- Helper function to escape HTML special characters ---
  // Prevents Cross-Site Scripting (XSS) when inserting data into HTML
  function escapeHTML(str) {
    // Use the browser's built-in capabilities for robust escaping
    const VIRTUAL_DIV = document.createElement("div");
    VIRTUAL_DIV.textContent = str; // Setting textContent automatically escapes HTML
    return VIRTUAL_DIV.innerHTML;
  }
}); // --- End of DOMContentLoaded ---

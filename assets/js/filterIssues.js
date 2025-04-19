document.addEventListener("DOMContentLoaded", function () {
  // Wait for the DOM to be fully loaded

  // --- Common Elements ---
  const issueDataElement = document.getElementById("issue-data");
  const issueList = document.getElementById("issues-list");
  let issues = []; // Initialize empty, will be populated if data exists

  if (issueDataElement) {
    const issuesJson = issueDataElement.getAttribute("data");
    try {
      issues = JSON.parse(issuesJson || "[]"); // Parse JSON, default to empty array if attribute is missing or empty
      if (!Array.isArray(issues)) {
        console.error("Parsed issue data is not an array:", issues);
        issues = []; // Reset to empty array if parsing resulted in non-array
      }
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      issues = []; // Reset to empty array on parsing error
    }
  } else {
    console.error("Element with ID 'issue-data' not found.");
  }

  if (!issueList) {
    console.error("Element with ID 'issues-list' not found.");
    // Optionally disable forms if the list doesn't exist
  }

  // --- Filter Form Logic ---
  const filterIssueForm = document.getElementById("filter-issue-form");

  if (filterIssueForm && issueList) {
    // Only add listener if form and list exist
    filterIssueForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default submission FIRST
      console.log("Filter form submitted, preventing default."); // Debug log

      try {
        // Wrap filtering logic in try...catch
        let filteredIssues = [];

        // Get selected labels
        const labelsElements = [
          ...filterIssueForm.querySelectorAll("input[type=checkbox]:checked"),
        ];
        const selectedLabels = labelsElements.map((el) => el.value);

        // Get selected author (handle if none is checked)
        const checkedAuthorRadio = filterIssueForm.querySelector(
          "input[type=radio][name=author]:checked"
        );
        const selectedAuthor = checkedAuthorRadio
          ? checkedAuthorRadio.value
          : ""; // Default to empty string if none checked

        // --- Filtering Core Logic ---
        if (selectedLabels.length === 0 && !selectedAuthor) {
          // If no filters, show all issues
          filteredIssues = [...issues]; // Copy all issues
        } else {
          issues.forEach((issue) => {
            // Default assumption: issue does not match
            let matchesAuthor = false;
            let matchesLabel = false;

            // Check author match (only if an author is selected)
            if (selectedAuthor && issue.author === selectedAuthor) {
              matchesAuthor = true;
            }

            // Check label match (only if labels are selected)
            // Issue matches if *any* of its labels are in the selectedLabels list
            if (selectedLabels.length > 0 && Array.isArray(issue.labels)) {
              // Check if ANY selected label is present in the issue's labels
              if (
                selectedLabels.some((label) => issue.labels.includes(label))
              ) {
                matchesLabel = true;
              }
            }

            // Include the issue if it matches author OR label (if filters are applied)
            // OR if it matches the author AND no labels were selected
            // OR if it matches a label AND no author was selected
            if (
              (selectedAuthor &&
                selectedLabels.length > 0 &&
                (matchesAuthor || matchesLabel)) || // Both filters active: OR logic
              (selectedAuthor &&
                selectedLabels.length === 0 &&
                matchesAuthor) || // Only author filter active
              (!selectedAuthor && selectedLabels.length > 0 && matchesLabel) // Only label filter active
            ) {
              // Avoid duplicates (though the logic above might prevent them, this is safer)
              if (
                !filteredIssues.some(
                  (filteredIssue) => filteredIssue.id === issue.id
                )
              ) {
                // Assuming issues have a unique 'id'
                filteredIssues.push(issue);
              } else if (!filteredIssues.includes(issue)) {
                // Fallback if no ID
                filteredIssues.push(issue);
              }
            }
          });
        }

        // --- Displaying Filtered Results ---
        renderIssues(filteredIssues, issueList);
      } catch (error) {
        console.error("Error during filtering:", error);
        // Optionally display an error message to the user on the page
        if (issueList)
          issueList.innerHTML =
            "<p class='text-danger'>An error occurred while filtering issues.</p>";
      }
    });
  } else {
    if (!filterIssueForm)
      console.error("Element with ID 'filter-issue-form' not found.");
  }

  // --- Search Form Logic ---
  const searchIssueForm = document.getElementById("search-issue-form");

  if (searchIssueForm && issueList) {
    // Only add listener if form and list exist
    searchIssueForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default submission FIRST
      console.log("Search form submitted, preventing default."); // Debug log

      try {
        // Wrap searching logic in try...catch
        let searchedIssuesResult = [];

        // Get search terms (convert to lower case for case-insensitive search)
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

        // --- Searching Core Logic ---
        if (!titleValue && !descriptionValue) {
          // If search fields are empty, show all issues (or maybe clear results?)
          // Decide desired behavior - here showing all:
          searchedIssuesResult = [...issues];
          // Or to clear results: searchedIssuesResult = [];
        } else {
          issues.forEach((issue) => {
            const issueTitle = (issue.title || "").toLowerCase();
            const issueDescription = (issue.description || "").toLowerCase();

            let titleMatch = false;
            if (titleValue && issueTitle.includes(titleValue)) {
              titleMatch = true;
            }

            let descriptionMatch = false;
            if (
              descriptionValue &&
              issueDescription.includes(descriptionValue)
            ) {
              descriptionMatch = true;
            }

            // Include if title matches (and title search term exists)
            // OR if description matches (and description search term exists)
            if (
              (titleValue && titleMatch) ||
              (descriptionValue && descriptionMatch)
            ) {
              // Avoid duplicates (using ID if available)
              if (
                !searchedIssuesResult.some(
                  (searchedIssue) => searchedIssue.id === issue.id
                )
              ) {
                searchedIssuesResult.push(issue);
              } else if (!searchedIssuesResult.includes(issue)) {
                // Fallback if no ID
                searchedIssuesResult.push(issue);
              }
            }
          });
        }

        // --- Displaying Search Results ---
        renderIssues(searchedIssuesResult, issueList);
      } catch (error) {
        console.error("Error during searching:", error);
        if (issueList)
          issueList.innerHTML =
            "<p class='text-danger'>An error occurred while searching issues.</p>";
      }
    });
  } else {
    if (!searchIssueForm)
      console.error("Element with ID 'search-issue-form' not found.");
  }

  // --- Helper Function to Render Issues ---
  function renderIssues(issuesToRender, targetElement) {
    if (!targetElement) return; // Don't proceed if target element doesn't exist

    targetElement.innerHTML = ""; // Clear previous results

    if (issuesToRender.length === 0) {
      targetElement.innerHTML =
        "<p>No issues found matching your criteria.</p>";
      return;
    }

    issuesToRender.forEach((issue) => {
      const Div = document.createElement("div");
      // Div.style = "none"; // REMOVED - Invalid CSS
      Div.classList.add("issue-card-container"); // Add a class for potential styling instead

      // Basic check for essential properties before rendering
      const title = issue.title || "No Title";
      const author = issue.author || "Unknown Author";
      const description = issue.description || "No Description";
      // const labelsString = Array.isArray(issue.labels) ? issue.labels.join(", ") : "No Labels";

      Div.innerHTML = `
        <div class="card w-100 mb-2">
          <div class="card-body">
            <h4 class="card-title">Title : ${escapeHTML(title)} </h4>
            <h5 class="card-title">Author : ${escapeHTML(author)}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              Description : ${escapeHTML(description)}
            </h6>
            <!-- Uncomment to display labels safely -->
            <!-- ${
              Array.isArray(issue.labels) && issue.labels.length > 0
                ? `<p class="card-text"><small>Labels: ${escapeHTML(
                    issue.labels.join(", ")
                  )}</small></p>`
                : ""
            } -->
          </div>
        </div>
      `;
      targetElement.appendChild(Div);
    });
  }

  // --- Helper function to escape HTML to prevent XSS ---
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Initial rendering of all issues on page load (optional)
  // renderIssues(issues, issueList);
}); // End of DOMContentLoaded

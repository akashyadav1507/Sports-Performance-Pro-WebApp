let allTeams = {};

fetch("/getAllTeams")
  .then((resp) => {
    allTeams = resp.json();
    console.log(allTeams);
    return allTeams;
  })
  .then((data) => {
    // Render the teams
    console.log(data);
  })
  .catch((error) => {
    console.log(`Error seen : ${error}`);
  });

$(document).ready(function () {
  $("#team-table").dataTable({
    pagingType: "full_numbers",
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "All"],
    ],
    scrollY: "400px", // Add scrollY for fixed size table
    searching: true, // Enable searching
    ordering: true, // Enable sorting
    paging: true, // Enable paging
    info: true, // Enable info
  });

  $("#athlete-table").dataTable({
    pagingType: "full_numbers",
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "All"],
    ],
    scrollY: "400px", // Add scrollY for fixed size table
    searching: true, // Enable searching
    ordering: true, // Enable sorting
    paging: true, // Enable paging
    info: true, // Enable info
  });

  // Add click event listener for team rows
  $("#team-table tbody").on("click", "tr", function () {
    // Extract data from the clicked row
    var teamName = $(this).find("td:first").text(); // Assuming team name is in the first column

    // Redirect to a new page with the extracted data (e.g., team name)
    // window.location.href = 'team-details.php?team=' + encodeURIComponent(teamName);
    // Redirect to the 'coach landing page'
    window.location.href = "team-workout.html";
  });

  // Add click event listener for athlete rows
  $("#athlete-table tbody").on("click", "tr", function () {
    // Extract data from the clicked row
    var athleteName = $(this).find("td:first").text(); // Assuming athlete name is in the first column

    // Redirect to a new page with the extracted data (e.g., athlete name)
    // window.location.href = 'athlete-details.php?athlete=' + encodeURIComponent(athleteName);

    // Redirect to the 'coach landing page'
    window.location.href = "athlete-workout.html";
  });

  // JavaScript for displaying today's date
  var today = new Date();
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  var dateElement = document.getElementById("date");
  dateElement.innerHTML = today.toLocaleDateString("en-US", options);
});

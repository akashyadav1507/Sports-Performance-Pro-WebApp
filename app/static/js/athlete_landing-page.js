"use strict";
let myAthleteId = 2; // Should be ideally fetched from the sessionStorage
let currentTeamId;

var athleteUsernameElement = document.getElementById("athlete-username");
var athleteUsername = athleteUsernameElement.getAttribute("data-username");

console.log(athleteUsername);

// Fetch the user_id from the route using an API
let athleteId;
let coachId;
let teams;

// Getting athlete ID
$.ajax({
  type: "GET",
  url: `/getAthleteId?athleteUsername=${athleteUsername}`,
  dataType: "json",
  success: function (data) {
    console.log(data);
    const athleteId = data.athlete_id;
    console.log(athleteId);
  },
  error: function (error) {
    console.log("Error getting athlete ID", error);
  },
});

// Getting coach ID
$.ajax({
  type: "GET",
  url: `/getMyCoach?athleteId=${athleteId}`,
  dataType: "json",
  success: function (data) {
    const coachId = data.coach_id;
    console.log(coachId);
  },
  error: function (error) {
    console.log("Did not receive a response", error);
  },
});

let clickedTeam;
let teamIds = [];
let myCoachId;
const blockTabs = document.getElementById("block-tabs");
const exerciseTabs = document.getElementById("exercise-tabs");
const exerciseDetails = document.getElementById("exercise-details");

const athleteList = document.getElementById("athlete-list");
let tbodyExercise = document.querySelector(".create-exercise-rows");
let tbodyCount = tbodyExercise.childElementCount;
const exerciseDropDown = document.getElementById("dropdown-container");

let selectedAthlete = null;
let selectedBlock = null;

const exerciseTableContainer = document.getElementById("table-container");
const formExercise = document.getElementById("create-exercise-form");

let dataTableExercise;

let delRowButton;
let modRowButton;

const athleteData = [
  {
    name: "John Doe",
    blocks: [
      {
        id: 1,
        exercises: ["Exercise 1", "Exercise 2"],
      },
      {
        id: 2,
        exercises: ["Exercise 3"],
      },
    ],
  },
  {
    name: "Darryl",
    blocks: [
      {
        id: 1,
        exercises: ["Exercise 1", "Push Ups", "Squats"],
      },
      {
        id: 2,
        exercises: ["Jogging", "Yoga"],
      },
      {
        id: 3,
        exercises: ["Running"],
      },
    ],
  },

  // Add more athlete data as needed
];

const load_reps_sets = {
  loads_reps: [
    { loads: 90, reps: 3 },
    { loads: 50, reps: 2 },
    { loads: 60, reps: 1 },
    { loads: 100, reps: 3 },
    { loads: 110, reps: 4 },
    { loads: 130, reps: 7 },
    { loads: 147, reps: 5 },
    { loads: 456, reps: 4 },
    { loads: 234, reps: 1 },
    { loads: 123, reps: 2 },
    { loads: 234, reps: 4 },
    { loads: 113, reps: 3 },
  ],
  sets: 2,
};

let athlete = athleteData[1];
const definedExercise = [
  {
    Exercise: "Running",
    Category: "Cardio",
    Type: "Endurance",
    Note: "Slow pace for beginners",
  },
  {
    Exercise: "Bench Press",
    Category: "Strength Training",
    Type: "Weightlifting",
    Note: "3 sets of 10 reps",
  },
  {
    Exercise: "Swimming",
    Category: "Cardio",
    Type: "Endurance",
    Note: "Freestyle and butterfly",
  },
];

// DATA TABLE INITIALIZATION
$(document).ready(function () {
  dataTableExercise = $("#create-exercise").DataTable({
    pageLength: 5,
    lengthMenu: [0, 5, 10, 20, 50, 100, 200, 500],
  });

  dataTableExercise.on("mouseenter", "td", function () {
    let colIdx = dataTableExercise.cell(this).index().column;

    dataTableExercise
      .cells()
      .nodes()
      .each((el) => el.classList.remove("highlight"));

    dataTableExercise
      .column(colIdx)
      .nodes()
      .each((el) => el.classList.add("highlight"));
  });
});

// DATA TABLE INITIALIZATION FOR THE TEAM display initially
$(document).ready(function () {
  const trainingTable = $("#trainingTable").DataTable({
    columns: [{ data: "name" }],
    dom: "Blfrtip",
    searching: true, // Enable the search bar
    paging: true, //
  });
});

// Get the TEAM NAMES FROM database based on ATHLETE ID
$.ajax({
  url: `getTeamsForAthlete?athleteId=${myAthleteId}`,
  type: "GET",
  dataType: "json",
  success: function (data) {
    teamIds = data.teams.map((team) => team.team_id);
    console.log(teamIds);
    console.log(data); // {teams: Array(teams)}
    const trainingTable = $("#trainingTable").DataTable();
    console.log("Data.teams", data.teams[0]);
    trainingTable.clear().rows.add(data.teams).draw(); // Passing an array to rows.add()
    trainingTable.row
      .add(
        {
          coach_id: 1,
          name: "My individual training",
          sport: "sport",
          team_id: null,
          noSort: true,
        },
        "last"
      )
      .draw(false);
  },
  error: function (error) {
    console.log("Error Fetching the data: " + error);
  },
});

const my_workouts = {};

$.ajax({
  url: "/getCoachId",
  type: "GET",
  data: {
    athleteId: myAthleteId,
  },
  success: function (response) {
    console.log(response);
  },
  error: function (xhr, status, error) {
    console.log("Error " + error);
  },
});

// $.get(`/getWorkoutsByTeam?coach_id=`)

// ANY TEAM CLICKED SHOULD SHOW THE TEAM SESSION DETAILS
$("#trainingTable tbody").on("click", "tr", function () {
  // Get the team ID from the clicked row
  var trainingTable = $("#trainingTable").DataTable();
  // Gives the object details for the row
  var data = trainingTable.row(this).data();
  // Displays the object for the row
  console.log(data);
  // Set the teamID if there is one:
  currentTeamId = data["team_id"];
  console.log("The current team_id is ", currentTeamId);
  // Append the my-training to the first td cell of the row that is clicked
  $(this).find("td").eq(0).append($("#my-training"));
  // Get the details of the workouts for this clicked team for this user

  // Appends the my-training details for the row - Blocks , Exercises, Exercise details

  displayBlocks({
    name: "Darryl",
    blocks: [
      {
        id: 1,
        exercises: ["Exercise 1", "Push Ups", "Squats"],
      },
      {
        id: 2,
        exercises: ["Jogging", "Yoga"],
      },
      {
        id: 3,
        exercises: ["Running"],
      },
    ],
  });
});

// For Database retrival

//   $.ajax({
//     url: `getAthleteWorkout/`,
//     type: "GET",
//     data: { athlete_id: `${myAthleteId}`, team_id: `${currentTeamId}` },
//     success: function (data) {},
//     error: function (error) {},
//   });

// display the blocks for the team_id selected:

// Assignment of exercises made in Workout Table

// Add the training_container inside the clicked row

// API to get the blocks from the database

// Use AJAX to fetch training sessions and blocks for the team
//     $.ajax({
//       url: "/api/teams/" + teamID + "/training", // Replace with your API endpoint
//       type: "GET",
//       dataType: "json",
//       success: function (data) {
//         // Populate the trainingInfo section with training sessions and blocks
//         // You can use JavaScript to construct the content and add it to the HTML
//         // For example: $('#trainingInfo').html('<div>Training session data here</div>');

//         // Initialize the DataTable for exercise details
//         var exerciseTable = $("#exerciseTable").DataTable({
//           data: data.exercises, // Populate with exercise data
//           columns: [
//             { data: "exercise_name" },
//             { data: "reps" },
//             { data: "sets" },
//             // Add more columns as needed
//           ],
//         });
//       },
//       error: function (error) {
//         console.log("Error fetching training data: " + error);
//       },
//     });
//   });
// });

// Add a click event handler for the DataTable rows
// $("#teamTable tbody").on("click", "tr", function () {
//   var data = table.row(this).data();
//   // Handle the click event, e.g., navigate to a team's page or perform an action.
//   alert("You clicked on " + data.name);
// });

// DISPLAY BLOCKS:
function displayBlocks(athlete) {
  selectedBlock = blockTabs.innerHTML = "";
  exerciseTabs.innerHTML = "";
  exerciseDetails.innerHTML = "Select a Block to view details.";
  exerciseDropDown.innerHTML = "";
  console.log(exerciseTabs);
  // Efficiency :

  athlete.blocks.forEach((block, index) => {
    exerciseTabs.innerHTML = "";
    console.log(`Running this display block`);
    const blockButton = document.createElement("button");
    blockButton.innerText = `Block ${block.id}`; // FIXME: Change to block name
    // Event listener added here:
    blockButton.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (currentTeamId !== null) {
        // Get the team id of the team clicked
        $.get(
          `/getWorkoutsByTeam?team_id=${currentTeamId}&coach_id=1`,
          function (data) {
            // Remove the blocks
            exerciseTabs.innerHTML = "";
            console.log(exerciseTabs);
            exerciseDetails.innerHTML = "Select a Block to view details.";
            e.stopPropagation();
            // display of the exerciseView should go back to 0
            //exerciseVisited = 0;
            displayExercises(e, block);
          }
        );
      } else {
        $.get(
          `/getWorkoutsByAthlete?athlete_id=${myAthleteId}&coach_id=1`,
          function (data) {
            exerciseTabs.innerHTML = "";
            console.log(exerciseTabs);
            exerciseDetails.innerHTML = "Select a Block to view details.";
            e.stopPropagation();
            // display of the exerciseView should go back to 0
            //exerciseVisited = 0;
            displayExercises(e, block);
          }
        );
      }
      // Adding BlockButtons to be displayed
    });
    blockTabs.appendChild(blockButton);
  });
}
// Show "Add a Block" button
// NOT Required for display
//   addBlockButton.classList.remove(["add-block-btn-hide"]);
//   // console.log(addBlockButton);
//   blockTabs.appendChild(addBlockButton);

// BLOCK TAB CLICKED: Display exercises for the CLICKED block
function displayExercises(e, block) {
  console.log("Block Tab clicked ; displaying exercises", block);
  selectedBlock = e.target;
  console.log(selectedBlock); // Block button
  exerciseTabs.innerHTML = "";
  exerciseDropDown.innerHTML = "";
  exerciseDetails.innerHTML = "Select an exercise to view details.";
  block.exercises.forEach((exercise, index) => {
    exerciseDetails.innerHTML = "Select a Block to view details.";
    console.log("Creating the exercise buttons");
    console.log(exerciseTabs);
    const exerciseButton = document.createElement("button");
    exerciseButton.innerText = exercise;
    console.log(`Exercise button`);
    console.log(exerciseButton);
    exerciseTabs.appendChild(exerciseButton);
    // exerciseButton.addEventListener("click", (e) => {
    //   e.stopPropagation();
    //   console.log(e.target);
    //   displayExerciseDetails(e.target);
    // });
  });
}

exerciseTabs.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  exerciseDetails.innerHTML = "Select an exercise to view details.";
  console.log(`Clicked button`, e.target);
  if (e.target && e.target.tagName === "BUTTON") {
    // if (e.target.contains.contains("visited")) {
    //   e.target.classList.add("visited");
    //   // viewed = !viewed;
    //   // Toggle the state
    //   // hideAssignedExercise(selectedAthlete, selectedBlock, e);
    //   console.log(`Hiding the exercise`);
    // } else {
    //   e.target.classList.remove("visited");
    // console.log(`Viewed : ${viewed}`);
    // if (!viewed) {
    //   viewed = !viewed;
    viewAssignedExercise(selectedAthlete, selectedBlock, e);
    console.log(`Viewing the exercise`);
  }
});

// View assigned exercise
function viewAssignedExercise(athlete, block, e) {
  const clickedExerciseButton = e.target;
  console.log(`Exercise Button `, e.target);
  const exerciseDetails = document.getElementById("exercise-details");

  viewExercise(athlete, block);
}

function viewExercise(athlete, block) {
  // exerciseTabs.innerHTML = "";
  const exerciseDetails = document.getElementById("exercise-details");

  exerciseDetails.innerHTML = "Select an exercise to view details.";
  console.log(`Inside Viewing exercise`);
  console.log(exerciseDetails);
  // console.log(athlete); // Pass in the athlete object
  console.log(block);

  const block_index = getBlockNumber(block);
  console.log(`block_index : ${block_index}`);
  // console.log(athlete);

  // console.log(athlete.blocks[block_index - 1]);

  loadTable();
  // athlete.blocks[block_index - 1].exercises.push("New Exercise");
}

// Function to display exercise details
function displayExerciseDetails(exercise) {
  const clickedExerciseButton = exercise;
  console.log(`Exercise Button `, clickedExerciseButton);
  const exerciseDetails = document.getElementById("exercise-details");
}

// let exTypeArray;
// let exNameArray;
// let exCatArray;
function loadTable() {
  //   exerciseTabs.innerHTML = "";
  exerciseDropDown.innerHTML = "";
  exerciseDetails.innerHTML = "Select an exercise to view details.";
  exerciseDetails.appendChild(exerciseTableContainer);
  exerciseTableContainer.classList.remove("create-exercise-table-hide"); // Making visible the table

  // Inside the load Table I have to add the pre-defined sets, loads and reps for that athlete

  const dataTable = $("#create-exercise").DataTable();
  dataTable.clear();
  const sets = load_reps_sets.sets;
  const loadsReps = load_reps_sets.loads_reps;

  for (let i = 0; i < loadsReps.length; i++) {
    const rowData = [];

    // Set column (1-based index for human-readable numbering)
    rowData.push(i + 1);

    // LOADS and REPS columns
    rowData.push(loadsReps[i].loads);
    rowData.push(loadsReps[i].reps);

    // Input_load column
    const inputCell = '<input type="text" name="load_entry">';
    rowData.push(inputCell);

    // Add the row data to the DataTable
    dataTable.row.add(rowData);
  }
  $("#create-exercise tbody td:first-child input").addClass("my-input");
  // Draw the table to display the added rows
  dataTable.draw();
}

function getBlockNumber(block) {
  const number = block.textContent.match(/\d+/g);
  // Check if numbers were found and join them into a string
  const numbersString = number ? number.join("") : "";
  return Number(numbersString);
}

$(document).ready(function () {
  // Function to collect and submit form data
  $("#create-exercise-form").on("submit", function (event) {
    console.log("INside the exercise form input");
    event.preventDefault(); // Prevent the default form submission
    event.stopPropagation();
    // Collect the values from the dynamically generated rows
    var exerciseData = [];

    $(".create-exercise-rows .exercise-row").each(function () {
      var set = $(this).find(".set-input").val();
      var load = $(this).find(".load-input").val();
      var reps = $(this).find(".reps-input").val();
      var inputLoad = $(this).find(".input-load-input").val();

      // Create an object with the collected data and push it to the array
      exerciseData.push({
        set: set,
        load: load,
        reps: reps,
        inputLoad: inputLoad,
      });
    });

    // You can now do something with the exerciseData array, like sending it to the server
    console.log(exerciseData);

    // Clear the form or perform any other actions as needed
    // For example, you can reset the form:
    // $("#create-exercise-form")[0].reset();
  });

  // Add a new row to the table when the "Modify" button is clicked
  $("#modifyButton").on("click", function () {
    // Create a new row with input elements and add it to the table
    var newRow = $("<tr class='exercise-row'>").append(
      $("<td><input class='set-input' type='text'></td>"),
      $("<td><input class='load-input' type='text'></td>"),
      $("<td><input class='reps-input' type='text'></td>"),
      $("<td><input class='input-load-input' type='text'></td>")
    );

    $(".create-exercise-rows").append(newRow);
  });

  // You can add more functionality, like removing rows or validating inputs, as needed.
});

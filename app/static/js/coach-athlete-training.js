"use strict";

// Get athleteId, coachId, and selectedDate from the URL
const urlParams = new URLSearchParams(window.location.search);
const athleteId = urlParams.get("athleteId");
const coachId = urlParams.get("coachId");

const assignExerciseBtn = document.getElementById("assign-session");
let athleteName;
fetch(`/getAthleteName?athlete_id=${athleteId}`)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    athleteName = data.athlete_name;
    document.querySelector(
      "#trainingTable th"
    ).textContent = `Athlete : ${athleteName}`;
  })
  .catch((error) => {
    console.error("There was an error fetching", error);
  });

console.log("This is athlete Name", { athleteName });

var athleteUsernameElement = document.getElementById("athlete-username");
var athleteUsername = athleteUsernameElement.getAttribute("data-username");

// Redirect to new page on clicking Assign exercise
assignExerciseBtn.addEventListener("click", function (e) {
  e.preventDefault();
  window.location.href = `/assignExercise?coachId=${coachId}&athleteId=${athleteId}&date=${currentDate}&athleteName=${athleteName}`;
});

// console.log(" Athlete Username ", athleteUsername);

// const testingElement = document.getElementById("testValue");
// const testVal = testingElement.getAttribute("data-testing");
// console.log("The test val :", testVal);

let newWorkoutData = [];
let myAthleteId = athleteId;
let currentCoachId = coachId;
let currentWorkout;
let currentBlocks;
let currentExercises;
let currentDate = selectedDate;
let myAthleteIds;
let exerciseAvailable = 0;
// console.log("This is my date: ", selectedDate);

let currentExerciseId;
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");

// FIXME: Uncomment this : For test purpose set date to 2022-10-30
// currentDate = getDate();
currentDate = selectedDate;
console.log(currentDate);
// Get the athlete Username
// var athleteUsernameElement = document.getElementById("athlete-username"); // Replace with coach
// var athleteUsername = athleteUsernameElement.getAttribute("data-username");

currentCoachId = 15; // # FIXME: CHANGE TO DYNAMIC FROM PREVIOUS PAGE
// console.log(" Athlete Username ", athleteUsername);

let teams;
let myTrainingData;
let myTeamsTrainingData;
let athleteTeams;
let clickedTeam;
// let myteamIds;
let coachIds = [];
let myWorkouts;
const blockTabs = document.getElementById("block-tabs");
const exerciseTabs = document.getElementById("exercise-tabs");
const exerciseDetails = document.getElementById("exercise-details");

// const athleteList = document.getElementById("athlete-list");
let tbodyExercise = document.querySelector(".create-exercise-rows");
let tbodyCount = tbodyExercise.childElementCount;
const exerciseDropDown = document.getElementById("dropdown-container");

let selectedAthlete = null;
let selectedBlock = null;

const exerciseTableContainer = document.getElementById("table-container");
const formExercise = document.getElementById("create-exercise-form");

let dataTableExercise;
// let delRowButton;
// let modRowButton;

$(document).ready(function () {
  const trainingTable = $("#trainingTable").DataTable({
    //columns: [{ data: "athlere_name" }], // Display only team name
    dom: "Blfrtip",
    searching: true, // Enable the search bar
    paging: true,
    //
  });
});

async function fetchCoaches(athleteId) {
  const response = await fetch(`/getMyCoaches?athleteId=${athleteId}`);
  const data = await response.json();
  //console.log("These are my personal and team Coaches IDs : ", data);
  return data;
}

async function fetchPersonalCoaches(athleteId) {
  const response = await fetch(`/getMyPersonalCoaches?athleteId=${athleteId}`);
  const data = await response.json();
  console.log("These are my Personal Coaches IDs : ", data);
  return data;
}

async function fetchWorkoutsByTeam(teamId, selectedDate, coachId) {
  const response = await fetch(
    `/getWorkoutsByTeam?teamId=${teamId}&date=${selectedDate}&coachId=${coachId}`
  );
  const data = await response.json();
  //console.log("These are the workouts : ", data);
  return data;
}

async function fetchWorkoutsByAthleteDirect(athlete_id, coachId, selectedDate) {
  const response = await fetch(
    `/getWorkoutsByAthleteDirect?athleteId=${athlete_id}}&date=${selectedDate}&coachId=${coachId}`
  );
  const data = await response.json();
  //console.log("These are the workouts assigned for athlete by his teamId: ",data);
  return data;
}

async function fetcWorkoutforAthletebyTeamsByCoach(
  athleteId,
  coachId,
  selectedDate
) {
  const response = await fetch(
    `/getWorkoutforAthletebyTeamsByCoach?athleteId=${athleteId}&coachId=${coachId}&date=${selectedDate}`
  );
  const data = await response.json();
  //console.log("These are the workouts : ", data);
  return data;
}

async function fetchTeamsForAthleteByCoach(athlete_id, coach_id) {
  const response = fetch(
    `/getTeamsForAthleteByCoach?athleteId=${athlete_id}&coachId=${coachId}`
  );
  const data = (await response).json();
  return data;
}

async function fetchWorkouts(
  athlete_id = null,
  team_id = null,
  coach_id = null,
  date = ""
) {
  const response = await fetch(
    `getWorkout2?athleteId=${athlete_id}&teamId=${team_id}&date=${date}&coachId=${coach_id}`
  );
  const data = await response.json();
  // console.log("These are the workouts assigned for athlete by his athleteId and for his team by teamId: ",data);
  return data;
}

// #TODO:
async function fetchWorkoutsForAthleteAndTeams(athleteId, teamIds) {
  try {
    // Once you have athleteIds and teamIds, fetch workouts
    const workoutsForAthlete = await fetchWorkouts(athleteId);
    console.log("Workouts By Athlete:", workoutsForAthlete);

    const workoutsForTeams = [];
    for (const teamId of teamIds) {
      //console.log("Team ID ", teamId);
      const teamWorkouts = await fetchWorkouts(null, teamId);
      workoutsForTeams.push(teamWorkouts);
    }
    console.log("Workouts By Teams:", workoutsForTeams);
    const workout = workoutsForTeams.concat(workoutsForAthlete);
    //console.log("Together : ", workout);
    return workout;
    // Now you have the workouts based on athleteIds and teamIds
  } catch (error) {
    console.log("Error fetching data: " + error);
  }
}

// Get All Blocks
// function getAllBlockNames(workoutData) {
//   // workoutData is workout_name arrays
//   // Each workout_name array has blocks which are again arrays
//   const blockNames = [];
//   workoutData.forEach((workout) => {
//     if (Array.isArray(workout)) {
//       workout.forEach((w) => {
//         w.blocks.forEach((block) => {
//           blockNames.push(block.block_name);
//         });
//       });
//     }
//     if (Array.isArray(workout.blocks)) {
//       workout.blocks.forEach((block) => {
//         blockNames.push(block.block_name);
//       });
//     }
//   });
//   return blockNames;
// }

function getMyBlockNames(workoutData) {
  const blockNames = [];
  workoutData.forEach((workout) => {
    if (Array.isArray(workout.blocks)) {
      workout.blocks.forEach((block) => {
        blockNames.push({ block_id: block.block_id, block_name: block.name });
      });
    }
  });
  return blockNames;
}

// Display the blocks once it is clicked : Blocks is an array
function displayBlocks2(blocks) {
  selectedBlock = blockTabs.innerHTML = "";
  exerciseTabs.innerHTML = "";
  exerciseDetails.innerHTML = "Select a Block to view details.";
  exerciseDropDown.innerHTML = "";
  console.log(exerciseTabs);
  blocks.forEach((block, index) => {
    exerciseTabs.innerHTML = "";
    console.log(`Adding Button ${block.block_name}`);
    const blockButton = document.createElement("button");
    blockButton.innerText = `${block.block_name}`;
    blockButton.id = `${block.block_id}`; // Add the id to keep track of block_id
    blockTabs.appendChild(blockButton);
  });
}

blockTabs.addEventListener("click", (e) => {
  if (e.target.tagName == "BUTTON") {
    $(e.target).siblings("button").css("background-color", "");

    // Add the "highlight" class to the clicked element
    $(e.target).css("background-color", "green");
    e.preventDefault();
    e.stopPropagation();
    exerciseTabs.innerHTML = "";
    exerciseDetails.innerHTML = "Select an Exercise to view details.";
    successMessage.innerText = "";
    errorMessage.innerText = "";
    console.log(`Clicked Block button`, e.target);
    if (e.target && e.target.tagName == "BUTTON") {
      console.log("I Clicked", e.target);
      displayExercises2(e, e.target);
    }
  }
});

function displayExercises2(blockEvent, block) {
  // Everytime I click a block, a fetch request is sent to back-end to get the exercise of that block

  fetch(`getExercisesByBlock?blockId=${block.id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const exercises = data.exercises;
      console.log(
        `Block Tab ${block.id} clicked : displaying Exercises`,
        block
      );
      exerciseTabs.innerHTML = "";
      // exerciseDropDown.innerHTML = "";
      // exerciseDetails.innerHTML = "Select an exercise to view details.";
      exercises.forEach((exercise, index) => {
        exerciseDetails.innerHTML = "Select a Exercise to view details.";
        console.log("Creating the exercise buttons");
        // console.log(exerciseTabs);
        const exerciseButton = document.createElement("button");

        exerciseButton.innerText = `${exercise.name}`;
        exerciseButton.id = `${exercise.exercise_id}`; // Add the id to keep track of block_id
        console.log(`Exercise button`);
        console.log(exerciseButton);
        exerciseTabs.appendChild(exerciseButton);
      });
    });
}

exerciseTabs.addEventListener("click", (e) => {
  if (e.target.tagName == "BUTTON") {
    $(e.target).siblings("button").css("background-color", "");

    // Add the "highlight" class to the clicked element
    $(e.target).css("background-color", "green");
    e.preventDefault();
    e.stopPropagation();
    currentExerciseId = Number(e.target.id); // Setting id for retrival
    exerciseDetails.innerHTML = "Select an Exercise to view details.";
    successMessage.innerText = "";
    errorMessage.innerText = "";
    console.log(`Clicked Exercise button`, e.target);
    if (e.target && e.target.tagName == "BUTTON") {
      console.log("I Clicked", e.target);
      viewAssignedExercise(e);
      console.log(`Viewing the exercise`);
    }
  }
});

function viewAssignedExercise(e) {
  // Everytime I click an exercise block, a fetch request is sent to back-end to get the latest exercise details of that exercise
  const clickedExerciseButton = e.target;
  console.log(`Exercise Button `, e.target);
  fetch(`getExerciseDetails?exerciseId=${e.target.id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(" I am here : the exercise details ", data);
      const exercises = data;
      // exerciseTabs.innerHTML = "Select an exercise to view details.";
      // exerciseDropDown.innerHTML = "";
      // exerciseDetails.innerHTML = "Select an exercise to view details.";

      const exerciseDetails = document.getElementById("exercise-details");
      exerciseDetails.innerHTML = "Select an exercise to view details.";
      console.log(`Inside Viewing exercise`);

      exercises.forEach((exercise, index) => {
        console.log("Exercise is : ", exercise);
        exerciseDetails.innerHTML = "Select a Exercise to view details.";
        exerciseDropDown.innerHTML = "";
        exerciseDetails.appendChild(exerciseTableContainer);
        exerciseTableContainer.classList.remove("create-exercise-table-hide"); // Making visible the table

        // Inside the load Table I have to add the pre-defined sets, loads and reps for that athlete

        const dataTable = $("#create-exercise").DataTable();
        dataTable.clear();
        const sets = exercise.sets;
        const loadsReps = exercise.loads_reps;
        console.log(loadsReps["coach"]);

        // If the AthleteInputExercise already exists display that Table

        // get the clicked Athletes-input;
        console.log(`Clicked athlete Id: ${athleteId}`); // FIXME: This should be the clicked ahleteId // GET FROM the initially clicked athleteId
        fetch(
          `/showAthleteExerciseInputLoads?exerciseId=${exercise.exercise_id}&athleteId=${athleteId}`
        )
          .then((response) => {
            // Return the response.json() promise here
            return response.json();
          })

          .then((data) => {
            console.log("Data:", data);
            if (data.info) {
              exerciseAvailable = 0;
              console.log(data["info"]); // Data does not exist : input_load
            } else {
              exerciseAvailable = 1;
              console.log("Data alreay exists"); // Fetch the input_load
            }
            for (let i = 0; i < loadsReps["coach"].length; i++) {
              const rowData = [];

              // Set column (1-based index for human-readable numbering)
              rowData.push(i + 1);

              // LOADS and REPS columns
              rowData.push(loadsReps["coach"][i].load);
              rowData.push(loadsReps["coach"][i].reps);

              // Athlete loads not available
              if (exerciseAvailable === 0) {
                var inputCell = `<p type="number" data-input=${
                  i + 1
                } name="load_input-${i + 1}">`;
              } else {
                // Fetc the load input from database
                // var inputCell = document.createElement("td");
                // inputCell.textContent = data["input_load"][i]["load"];
                // inputCell.dataset.loadId = data["load_id"];
                var inputCell = data["input_load"][i]["load"];
                console.log(inputCell);
              }
              rowData.push(inputCell);

              // Add the row data to the DataTable
              dataTable.row.add(rowData);
            }
            $("#create-exercise tbody td:first-child input").addClass(
              "my-input"
            );
            // Draw the table to display the added rows
            dataTable.draw();
          });
      });
    });
}

// TODO: Realization that querying by ids is the best since it is indexing , DO NOT QUERY BY NAMES IF POSSIBLE

// On LOADING : INITIAL DATA PRESENTED OR STORED:

async function initialData() {
  try {
    // var athleteId = 12; // #TODO: SET THE ATHLETE ID FROM PREVIOUS PAGE
    //

    console.log("This is the athleteId", athleteId);
    console.log("Im inside Initial Data");
    // athleteId = await fetchAthleteID(userEmail); // Fetch athlete UserEmail
    // athleteTeams = await fetchAthleteTeams(athleteId); // Fetch Athlete Teams
    const athletesTeams = await fetchTeamsForAthleteByCoach(athleteId, coachId); // Fetch Teams for the coach
    let myTeams = athletesTeams;
    // Remove the team by teamId

    console.log("Getting MY TEAMS : ", athletesTeams);
    var myTeamIds = athletesTeams.teams.map((team) => team.team_id);

    console.log("My Team athletes Id's : ", myTeamIds);

    // myAthletes = teamsAthletes.athletes.map((team) => team.name);
    console.log("My Teams are : ", myTeams);

    console.log("I am the coach and my ID is ", coachId);

    // Get workouts by athelete & coach
    // Get workouts byt athlete & teams.
    // Merge
    const myIndividualWorkout = await fetchWorkouts(
      athleteId,
      currentDate,
      coachId
    ); //[{}]
    let myTeamWorkout = await fetcWorkoutforAthletebyTeamsByCoach(
      athleteId,
      coachId,
      currentDate
    ); // [ {} , {}]

    console.log("My individual Workout", myIndividualWorkout);
    console.log("Teams workouts ", myTeamWorkout);

    // let allmyAthletesWorkouts;
    myTeamWorkout.push(...myIndividualWorkout); // Including the Personal Workout in the TeamWorkout itself

    console.log("Adding team + individual workout", myTeamWorkout);

    // Table creation filter date here : TODO: Ideally filter by date when pulling data itself ( optimization required )
    const dataCreation = (function () {
      // You can now work with athleteID and athleteTeams here
      //   console.log("Team ID:", teamId);
      console.log("My Teams :", myTeams); // [ {} {}]
      console.log("Teams Workouts:", myTeamWorkout);
      // teams = athleteTeams.map((team) => team.name);
      // const myAthletes = myAthletes.map((athlete) => [athlete]);
      // INITIALIZING THE ATHLETES OF THE TRAINING TABLE
      const trainingTable = $("#trainingTable").DataTable();

      trainingTable.clear().rows;
      myTeams.teams.forEach((team) => {
        // trainingTable.row.add([athlete.name]).draw()
        trainingTable.row
          .add([team.name])
          .node().id = `team-id-${team.team_id}`;
        trainingTable.draw();
      });

      //   console.log(`${myTeamWorkout[myTeamWorkout.length - 1].coach_name}`);
      trainingTable.row
        .add([
          `${myTeamWorkout[myTeamWorkout.length - 1].coach_name}
             's assigned trainings`,
        ])
        .node().id = `coach-id-${coachId}`;
      trainingTable.draw(false);
    })();
    return myTeams, myTeamIds;
  } catch (error) {
    console.log("Could not fetch the details " + error);
  }
}

// Main Function which has all details:
async function main() {
  try {
    highlightWorkoutDatesForCoaches(coachId);
    const data = await initialData(); // Gets all the initial Data
  } catch (error) {
    console.error("An error occured", error);
  }
}

main();

// DATA TABLE INITIALIZATION
$(document).ready(function () {
  // Viewing the details:

  dataTableExercise = $("#create-exercise").DataTable({
    pageLength: 5,
    lengthMenu: [0, 5, 10, 20, 50, 100, 200, 500],
  });
});

// RESPONSIVE ANY TEAM CLICKED SHOULD SHOW THE TEAM SESSION DETAILS
$("#trainingTable tbody").on("click", "tr", function (event) {
  // Get the team ID from the clicked row
  const clickedRow = event.currentTarget;
  // Get the team ID from the clicked row
  let clickedId = $(clickedRow).attr("id");

  // Assuming you've set the ID of the row
  console.log(" ID clicked:", clickedId);

  var trainingTable = $("#trainingTable").DataTable();
  // Gives the object details for the row
  // var data = trainingTable.row(this).data(); // Object { coach_id, , ....}
  // Displays the object for the row
  var data = trainingTable.row(this).data();
  // console.log(data);
  $("#trainingTable tbody tr")
    .removeClass("highlighted-row")
    .find("td")
    .css("background-color", "");

  var row = $(this).closest("tr");
  // Add the highlight class to the clicked row
  row.addClass("highlighted-row");

  // Apply the highlight using inline CSS
  row.find("td").css("background-color", "green"); // Customize the color as needed
  // Set the teamID if there is one:

  console.log("View the data of clicked Item : ", data);

  // Everytime I clikc on a Team, a fetch request is sent to get workout and display the blocks of the team
  // FIXME: Change the date to currentDate later
  currentWorkout = clickedId.includes("team-id")
    ? (function () {
        //console.log(clickedId);
        let clickedTeamId = clickedId.split("-");
        clickedTeamId = clickedTeamId[clickedTeamId.length - 1];
        //console.log(clickedTeamId);
        fetch(
          `/getWorkoutsByTeam?teamId=${clickedTeamId}&date=${currentDate}&coachId=${coachId}`
        )
          .then((response) => response.json())
          .then((data) => {
            console.log(
              "This is my data fetched inside clicking an athlete:",
              data
            );
            return data;
          })
          .then((workout_data) => {
            console.log(workout_data);
            currentBlocks = getMyBlockNames(workout_data);
            console.log("Current Blocks:", currentBlocks);
            displayBlocks2(currentBlocks);
          })
          .catch((error) => {
            console.error("There was an error fetching", error);
          });
      })()
    : (function () {
        // console.log(clickedId);
        let clickedCoachId = clickedId.split("-");
        clickedCoachId = clickedCoachId[clickedCoachId.length - 1];
        console.log(clickedCoachId);
        fetch(
          `getWorkoutsByAthleteDirect?coachId=${coachId}&athleteId=${athleteId}&date=${currentDate}`
        )
          .then((response) => response.json())
          .then((data) => {
            console.log("This is my data:", data);
            return data;
          })
          .then((workout_data) => {
            console.log(workout_data);
            currentBlocks = getMyBlockNames(workout_data);
            console.log("Current Blocks:", currentBlocks);
            displayBlocks2(currentBlocks);
          })
          .catch((error) => {
            console.error("There was an error fetching", error);
          });
      })();
});

// $(document).ready(function () {
//   // Function to collect and submit form data
//   var table = $("#create-exercise").DataTable();
//   $("#create-exerci se-form").on("submit", function (event) {
//     event.preventDefault();
//     event.stopPropagation();
//     successMessage.innerText = "";
//     errorMessage.innerText = "";
//     console.log("INside the exercise form input");
//     // event.preventDefault(); // Prevent the default form submission
//     // Collect the values from the dynamically generated rows

//     // $(".create-exercise-rows tr").each(function () {
//     //   var set = $(this).find(".set-input").val();
//     //   var load = $(this).find(".load-input").val();
//     //   var reps = $(this).find(".reps-input").val();
//     //   var inputLoad = $(this).find(".input-load-input").val();

//     const athleteInputLoads = [];
//     const sets = table.columns(0).data()[0].length;
//     const loads = [...table.columns(1).data()[0]];
//     const reps = [...table.columns(2).data()[0]];
//     const inputLoads = table.$("input");
//     let check = false;
//     for (let i = 0; i < loads.length; i++) {
//       check = validateInputField(inputLoads[i], loads[i]);
//       if (check) {
//         athleteInputLoads.push(Number(inputLoads[i].value));
//       } else {
//         console.log("Give the right input");
//         console.log("Display a modal here ");
//         break; // the loop, invalid entry
//       }
//     }

//     if (loads.length === athleteInputLoads.length) {
//       // Format input for database : {athlete: ["loads" : ...]}
//       const athleteExerciseInput = formatAthleteEntries(athleteInputLoads);

//       // Send the entries to database
//       fetch("/postAthleteInputs", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: athleteExerciseInput,
//       })
//         .then((response) => {
//           return response.json();
//         })
//         .then((data) => {
//           console.log(data);
//           if (data.success) {
//             const successMessage = document.getElementById("success-message");
//             successMessage.innerText = `${data.success}`;
//           } else {
//             const errorMessage = document.getElementById("error-message");
//             errorMessage.innerText = `${data.error}`;
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//           console.log({ error: "Failed to store data on server" });
//         });
//     }
//   });
// });

// For formatting to send to db AthleteExerciseInputLoads
function formatAthleteEntries(inputLoads) {
  let transformedLoads = inputLoads.map((load) => ({ load: load }));
  transformedLoads = JSON.stringify({
    athlete_id: athleteId,
    input_load: transformedLoads,
    exercise_id: currentExerciseId,
    date: currentDate,
  });
  console.log(transformedLoads);
  return transformedLoads;
}

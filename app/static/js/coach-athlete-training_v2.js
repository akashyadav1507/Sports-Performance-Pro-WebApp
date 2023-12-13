"use strict";

// Get athleteId, coachId, and selectedDate from the URL
const urlParams = new URLSearchParams(window.location.search);
// const athleteId = urlParams.get("athleteId");
// let athleteId = 4;
let coachId = urlParams.get("coachId");
const date = urlParams.get("date");

// Initialize variables for athleteId and teamId
let athleteId = null;
let teamId = null;

// Check if athleteId is present in the URL
if (urlParams.has("athleteId")) {
  athleteId = urlParams.get("athleteId");
}

// Check if teamId is present in the URL
if (urlParams.has("teamId")) {
  teamId = urlParams.get("teamId");
}

const assignExerciseBtn = document.getElementById("assign-session");
let athleteName;
let teamName;
fetch(`/getAthleteName?athlete_id=${athleteId}`)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    athleteName = data.athlete_name;
    document.querySelector("#trainingTable th");
  })
  .catch((error) => {
    console.error("There was an error fetching", error);
  });

var athleteUsernameElement = document.getElementById("athlete-username");
var athleteUsername = athleteUsernameElement.getAttribute("data-username");

// Redirect to new page on clicking Assign exercise
assignExerciseBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (teamId)
    window.location.href = `/coachAthleteWorkout?teamId=${teamId}&coachId=${coachId}&date=${date}#return-button`;
  else if (athleteId)
    window.location.href = `/coachAthleteWorkout?athleteId=${athleteId}&coachId=${coachId}&date=${date}#return-button`;
});

console.log("This is athlete Name", { athleteName });
// console.log(" Athlete Username ", athleteUsername);

// const testingElement = document.getElementById("testValue");
// const testVal = testingElement.getAttribute("data-testing");
// console.log("The test val :", testVal);

let newWorkoutData = [];
let myAthleteId = athleteId;
let currentCoachId = coachId;
let currentWorkouts;
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

// Darryl's code
let myTeams;
let myAthletes;

const workoutTabs = document.getElementById("workout-tabs");
const blockTabs = document.getElementById("block-tabs");
const exerciseTabs = document.getElementById("exercise-tabs");
// const exerciseDetails = document.getElementById("exercise-details");

// const athleteList = document.getElementById("athlete-list");
// let tbodyExercise = document.querySelector(".create-exercise-rows");
// let tbodyCount = tbodyExercise.childElementCount;
// const exerciseDropDown = document.getElementById("dropdown-container");

let selectedAthlete = null;
let selectedBlock = null;
let selectedWorkout = null;
// const exerciseTableContainer = document.getElementById("table-container");
// const formExercise = document.getElementById("create-exercise-form");

let dataTableExercise;
// let delRowButton;
// let modRowButton;

// $(document).ready(function () {
//   const trainingTable = $("#trainingTable").DataTable({
//     //columns: [{ data: "athlere_name" }], // Display only team name
//     searching: false, // Enable the search bar
//     paging: false,
//     info: false
//     //
//   });
// });

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

// Get My Workouts
function getWorkoutNames(workoutData) {
  const workoutNames = [];
  workoutData.forEach((workout) => {
    workoutNames.push({
      workout_id: workout.workout_id,
      name: workout.name,
      //   date_added: workout.date_added,
    });
  });
  return workoutNames;
}

// Get My Blocks
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
function displayWorkouts(workouts, container, athleteId) {
  container.innerHTML = "";

  const workoutCompletionPromises = workouts.map((workout) =>
    fetch(`getBlocksByWorkout?workoutId=${workout.workout_id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.blocks) {
          const blockCompletionPromises = data.blocks.map((block) =>
            fetchBlockCompletion(athleteId, block.block_id)
          );
          return Promise.all(blockCompletionPromises).then(
            (blockCompletions) => {
              const averageCompletion =
                blockCompletions.reduce((sum, current) => sum + current, 0) /
                blockCompletions.length;
              return averageCompletion;
            }
          );
        } else {
          return 0; // No blocks in workout, return 0% completion
        }
      })
      .catch((error) => {
        console.error("Error fetching blocks for workout:", error);
        return 0; // Error occurred, return 0% completion
      })
  );

  Promise.all(workoutCompletionPromises).then((averageCompletions) => {
    workouts.forEach((workout, index) => {
      const averageCompletion = averageCompletions[index];
      const workoutItem = document.createElement("li");
      const workoutCaret = document.createElement("span");
      workoutCaret.textContent = `${
        workout.name
      } - Average Completion: ${averageCompletion.toFixed(2)}%`;
      workoutCaret.className = "caret";
      const combinedWorkoutId = `${athleteId}-${workout.workout_id}`;
      workoutCaret.setAttribute("data-combined-workout-id", combinedWorkoutId);
      workoutItem.appendChild(workoutCaret);

      const blockList = document.createElement("ul");
      blockList.className = "nested";
      workoutItem.appendChild(blockList);

      container.appendChild(workoutItem);

      workoutCaret.addEventListener("click", function () {
        this.classList.toggle("caret-down");
        blockList.classList.toggle("active");
        if (!blockList.hasChildNodes()) {
          displayBlocks(combinedWorkoutId);
        }
      });
    });
  });
}

// Helper function to fetch average block completion
async function fetchBlockCompletion(athleteId, blockId) {
  try {
    const response = await fetch(`/getExercisesByBlock?blockId=${blockId}`);
    const data = await response.json();
    if (data && data.exercises) {
      const completionPercentages = await Promise.all(
        data.exercises.map(async (exercise) => {
          const loadResponse = await fetch(
            `/showAthleteExerciseInputLoads?exerciseId=${exercise.exercise_id}&athleteId=${athleteId}`
          );
          const loadData = await loadResponse.json();
          return loadData &&
            loadData.input_load &&
            loadData.input_load.length > 0
            ? 100
            : 0;
        })
      );
      return (
        completionPercentages.reduce((sum, current) => sum + current, 0) /
        completionPercentages.length
      );
    } else {
      return 0; // No exercises in block, return 0% completion
    }
  } catch (error) {
    console.error("Error fetching exercises for block:", error);
    return 0; // Error occurred, return 0% completion
  }
}

function displayBlocks(combinedWorkoutId) {
  // Extract athleteId and workoutId from the combined ID
  const [athleteId, workoutId] = combinedWorkoutId.split("-");

  fetch(`getBlocksByWorkout?workoutId=${workoutId}`)
    .then((response) => response.json())
    .then((data) => {
      const blocks = data.blocks;

      // Find the workout list item by its data-combined-workout-id attribute
      const workoutListItem = document.querySelector(
        `li > span[data-combined-workout-id="${combinedWorkoutId}"]`
      ).parentNode;
      let blockList = workoutListItem.querySelector("ul.nested");
      if (!blockList) {
        blockList = document.createElement("ul");
        blockList.className = "nested";
        workoutListItem.appendChild(blockList);
      }

      blockList.innerHTML = "";

      // Append blocks to the nested ul
      blocks.forEach((block) => {
        const blockItem = document.createElement("li");
        const blockCaret = document.createElement("span");
        blockCaret.textContent = block.name;
        blockCaret.className = "caret";
        // Store block ID along with athlete ID
        const combinedBlockId = `${athleteId}-${block.block_id}`;
        blockCaret.setAttribute("data-combined-block-id", combinedBlockId);
        blockItem.appendChild(blockCaret);

        const exerciseList = document.createElement("ul");
        exerciseList.className = "nested";
        blockItem.appendChild(exerciseList);

        blockList.appendChild(blockItem);

        blockCaret.addEventListener("click", function () {
          this.classList.toggle("caret-down");
          exerciseList.classList.toggle("active");
          console.log(
            `Clicked block "${this.textContent}" with ID ${this.getAttribute(
              "data-combined-block-id"
            )}`
          );
          // Pass the combined ID to displayExercises2
          displayExercises2(combinedBlockId);
        });
        // Fetch completion data for each exercise within the block
        fetch(`/getExercisesByBlock?blockId=${block.block_id}`)
          .then((response) => response.json())
          .then((data) => {
            const exercises = data.exercises;
            const completionPromises = exercises.map((exercise) =>
              fetch(
                `/showAthleteExerciseInputLoads?exerciseId=${exercise.exercise_id}&athleteId=${athleteId}`
              )
                .then((response) => response.json())
                .then((loadData) =>
                  loadData &&
                  loadData.input_load &&
                  loadData.input_load.length > 0
                    ? 100
                    : 0
                )
                .catch((error) => {
                  console.error(
                    "Error fetching completion for exercise:",
                    error
                  );
                  return 0;
                })
            );

            // Calculate the average completion from the promises
            Promise.all(completionPromises).then((completionPercentages) => {
              const averageCompletion =
                completionPercentages.reduce(
                  (sum, current) => sum + current,
                  0
                ) / completionPercentages.length;
              blockCaret.textContent += ` - Average Completion: ${averageCompletion}%`;
            });
          })
          .catch((error) => {
            console.error("Error fetching exercises for block:", error);
          });
      });

      blockList.style.display = "block";
    })
    .catch((error) => {
      console.error("Error fetching blocks:", error);
    });
}

//       });

//       blockList.style.display = 'block';
//   })
//   .catch(error => {
//       console.error('Error fetching blocks:', error);
//   });
// }

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
    // exerciseDetails.innerHTML = "Select an Exercise to view details.";
    successMessage.innerText = "";
    errorMessage.innerText = "";
    console.log(`Clicked Block button`, e.target);
    if (e.target && e.target.tagName == "BUTTON") {
      console.log("I Clicked", e.target);
      displayExercises2(e, e.target);
    }
  }
});

function displayExercises2(combinedBlockId) {
  // Extract athleteId and blockId from the combined ID
  const [athleteId, blockId] = combinedBlockId.split("-");

  fetch(`getExercisesByBlock?blockId=${blockId}`)
    .then((response) => response.json())
    .then((data) => {
      const exercises = data.exercises;

      // Find the block list item by its data-combined-block-id attribute
      const blockListItem = document.querySelector(
        `[data-combined-block-id="${combinedBlockId}"]`
      ).parentNode;
      let exerciseList = blockListItem.querySelector(".nested");
      if (!exerciseList) {
        exerciseList = document.createElement("ul");
        exerciseList.className = "nested";
        blockListItem.appendChild(exerciseList);
      }
      exerciseList.innerHTML = "";

      exercises.forEach((exercise) => {
        const exerciseItem = document.createElement("li");

        const exerciseCaret = document.createElement("span");
        exerciseCaret.className = "caret";
        exerciseCaret.textContent = exercise.name;
        // Store exercise ID along with athlete ID
        const combinedExerciseId = `${athleteId}-${exercise.exercise_id}`;
        exerciseCaret.setAttribute(
          "data-combined-exercise-id",
          combinedExerciseId
        );
        exerciseItem.appendChild(exerciseCaret);

        const detailsList = document.createElement("ul");
        detailsList.className = "nested";
        exerciseItem.appendChild(detailsList);

        exerciseList.appendChild(exerciseItem);

        // Inner function to update the completion percentage
        function updateCompletionPercentage() {
          fetch(
            `/showAthleteExerciseInputLoads?exerciseId=${exercise.exercise_id}&athleteId=${athleteId}`
          )
            .then((response) => response.json())
            .then((loadData) => {
              const completionPercentage =
                loadData &&
                loadData.input_load &&
                loadData.input_load.length > 0
                  ? "100"
                  : "0";
              exerciseCaret.textContent += ` - ${completionPercentage}% Complete`;
            })
            .catch((error) => {
              console.error("Error fetching completion:", error);
            });
        }

        // Call the inner function to update the completion percentage
        updateCompletionPercentage();

        exerciseCaret.addEventListener("click", function () {
          this.classList.toggle("caret-down");
          detailsList.classList.toggle("active");
          console.log(
            `Clicked exercise "${this.textContent}" with ID ${this.getAttribute(
              "data-combined-exercise-id"
            )}`
          );
          // Pass the combined ID to viewAssignedExercise
          viewAssignedExercise(exerciseItem, combinedExerciseId);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching exercises:", error);
    });
}

async function viewAssignedExercise(exerciseElement, combinedExerciseId) {
  const [athleteId, exerciseId] = combinedExerciseId.split("-");

  try {
    const response = await fetch(`getExerciseDetails?exerciseId=${exerciseId}`);
    const data = await response.json();
    console.log("Exercise details:", data);
    const exercises = data;

    const exerciseDetailsList = exerciseElement.querySelector("ul.nested");
    let tableContainer = exerciseDetailsList.querySelector(".table-container");

    if (!tableContainer) {
      tableContainer = document.createElement("div");
      tableContainer.className = "table-container";
      exerciseDetailsList.appendChild(tableContainer);
    }
    tableContainer.innerHTML = "";

    let tableId = `exercise-table-${combinedExerciseId}`;
    let dataTable;

    exercises.forEach(async (exercise, index) => {
      console.log("Exercise:", exercise);

      if (!document.getElementById(tableId)) {
        const table = document.createElement("table");
        table.id = tableId;
        table.className = "your-table-class";

        let thead = table.createTHead();
        let row = thead.insertRow();
        let headers = ["SET", "LOAD", "REPS", "athletes_load"];
        headers.forEach((headerText) => {
          let th = document.createElement("th");
          th.innerText = headerText;
          row.appendChild(th);
        });

        tableContainer.appendChild(table);
        dataTable = $(`#${tableId}`).DataTable({
          paging: false,
          searching: false,
          info: false,
          bLengthChange: false,
          dom: "lrtip",
        });
      } else {
        dataTable = $(`#${tableId}`).DataTable();
        dataTable.clear();
      }

      const loadsReps = exercise.loads_reps;
      console.log("Coach loads and reps:", loadsReps["coach"]);

      for (let i = 0; i < loadsReps["coach"].length; i++) {
        let athleteLoad = "";
        try {
          const loadResponse = await fetch(
            `/showAthleteExerciseInputLoads?exerciseId=${exerciseId}&athleteId=${athleteId}`
          );
          const loadData = await loadResponse.json();
          console.log(
            `Athlete load data for exerciseId=${exerciseId} and athleteId=${athleteId}:`,
            loadData
          );
          if (loadData.info) {
            athleteLoad = `<p type="number" data-input=${
              i + 1
            } name="load_input-${i + 1}">`;
          } else {
            athleteLoad = loadData["input_load"][i]["load"];
          }
        } catch (error) {
          console.error("Error fetching athlete load data:", error);
        }

        const newRow = [
          i + 1,
          loadsReps["coach"][i].load,
          loadsReps["coach"][i].reps,
          athleteLoad,
        ];
        dataTable.row.add(newRow);
      }

      dataTable.draw();
    });
  } catch (error) {
    console.error("Error fetching exercise details:", error);
  }
}
// // Call showLoadingOverlay at the beginning of data fetching
// showLoadingOverlay();

async function fetchAthletesForTeam(coachId, teamId) {
  const response = await fetch(
    `/getAthletesForTeam?coachId=${coachId}&teamId=${teamId}`
  );
  const data = await response.json();
  console.log("These are the Athletes  assigned for coach: ", data);
  return data;
}

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

// async function main() {
//   clearData();
//   await displayTeamsAsTree();
//   await displayAllAthletesAsTree();

//    // Now it's safe to call the expand function
//    const specificAthleteId = athleteId; // Replace with the actual athlete ID
//    const spec = date; // Replace with the actual date

//    expandAthleteWorkouts(specificAthleteId, spec).catch(console.error);
// }

async function main() {
  highlightWorkoutDatesForCoaches(coachId);
  clearData();
  await displayTeamsAsTree();
  await displayAllAthletesAsTree();
  datePicker.value = formatDateToYYYYMMDD(currentDate);
  // Now it's safe to call the expand function
  const specificAthleteId = athleteId; // Replace with the actual athlete ID
  const spec = date; // Replace with the actual date

  // Function to format a date string to 'YYYY-MM-DD'
  function formatDateString(dateString) {
    const parts = dateString.split("-");
    const year = parts[0];
    const month = parts[1].length === 1 ? "0" + parts[1] : parts[1];
    const day = parts[2].length === 1 ? "0" + parts[2] : parts[2];
    return `${year}-${month}-${day}`;
  }

  // Only expand if the selected date matches
  if (formatDateString(currentDate) === formatDateString(spec)) {
    expandAthleteWorkouts(specificAthleteId, spec).catch(console.error);
  }
}

async function displayTeamsAsTree() {
  const response = await fetch(`/getAllTeams?coach_id=${coachId}`);
  const data = await response.json();

  if (data.teams) {
    myTeams = data.teams.map((team) => ({
      teamName: team.name,
      teamId: team.team_id,
    }));
    console.log("My Teams", myTeams);
  }

  if (data.error) {
    console.error("Error fetching teams:", data.error);
    return;
  }

  const container = document.getElementById("team-tree-container");
  if (!container) {
    console.error("Container element not found");
    return;
  }

  // Create and add the heading
  const heading = document.createElement("h2");
  heading.textContent = "Teams";
  container.appendChild(heading);
  heading.style.color = "#333";

  const tree = document.createElement("ul");
  tree.id = "team-tree";
  container.appendChild(tree);

  data.teams.forEach((team) => {
    const teamItem = document.createElement("li");
    const teamCaret = document.createElement("span");
    teamCaret.textContent = team.name;
    teamCaret.className = "caret";
    teamCaret.setAttribute("data-team-id", team.team_id);

    teamItem.appendChild(teamCaret);

    const athleteList = document.createElement("ul");
    athleteList.className = "nested";
    teamItem.appendChild(athleteList);

    tree.appendChild(teamItem);

    fetch(
      `/getWorkoutsByTeam?teamId=${team.team_id}&date=${currentDate}&coachId=${coachId}`
    )
      .then((response) => response.json())
      .then(async (workoutsData) => {
        if (workoutsData.error || workoutsData.length === 0) {
          console.error(
            "Error fetching workouts or no workouts found:",
            workoutsData.error
          );
          teamCaret.textContent += " - No workout assigned";
          return;
        }

        // If we reach here, it means there are workouts assigned for the team
        // Now fetch athletes and calculate average completion
        fetch(`/getAthletesForTeam?teamId=${team.team_id}`)
          .then((response) => response.json())
          .then(async (athletesData) => {
            if (athletesData.error) {
              console.error("Error fetching athletes:", athletesData.error);
              teamCaret.textContent += " - No Data";
              return;
            }

            // let totalCompletion = 0;
            // let athletesCount = athletesData.athletes.length; // Total number of athletes

            // for (const athlete of athletesData.athletes) {
            //     try {
            //         const completion = await calculateAthleteAverageCompletion(athlete.athlete_id, team.team_id);
            //         totalCompletion += parseFloat(completion); // Add all completions, including "0%"
            //     } catch (error) {
            //         console.error('Error calculating completion for athlete:', athlete.athlete_id, error);
            //     }
            // }

            // // Calculate average completion for the team
            // const teamAverageCompletion = (totalCompletion / athletesCount).toFixed(2) + "%";
            // teamCaret.textContent += " - Team Avg: " + teamAverageCompletion;
          });
      });

    teamCaret.addEventListener("click", async function () {
      this.classList.toggle("caret-down");
      athleteList.classList.toggle("active");
      if (!athleteList.hasChildNodes()) {
        const athletesResponse = await fetch(
          `/getAthletesForTeam?teamId=${team.team_id}`
        );
        const athletesData = await athletesResponse.json();
        if (athletesData.error) {
          console.error("Error fetching athletes:", athletesData.error);
          return;
        }

        athletesData.athletes.forEach((athlete) => {
          const athleteItem = document.createElement("li");
          const athleteCaret = document.createElement("span");
          athleteCaret.textContent = athlete.name;
          athleteCaret.className = "caret athlete-caret";
          athleteCaret.setAttribute("data-athlete-id", athlete.athlete_id);
          athleteItem.appendChild(athleteCaret);

          // Container for athlete's workouts
          const athleteWorkoutsContainer = document.createElement("ul");
          athleteWorkoutsContainer.className =
            "nested athlete-workouts-container";
          athleteItem.appendChild(athleteWorkoutsContainer);

          athleteList.appendChild(athleteItem);
          // calculateAthleteAverageCompletion(athlete.athlete_id, team.team_id)
          // .then(averageCompletion => {
          //     athleteCaret.textContent += ` - Avg Completion: ${averageCompletion}`;
          // })
          // .catch(error => {
          //     console.error('Error calculating average completion:', error);
          //     athleteCaret.textContent += ` - Error in completion calculation`;
          // });

          athleteCaret.addEventListener("click", async function () {
            athleteId = this.getAttribute("data-athlete-id");
            console.log(
              `Athlete caret clicked: Athlete ID = ${this.getAttribute(
                "data-athlete-id"
              )}`
            );

            if (!athleteWorkoutsContainer.hasChildNodes()) {
              const workoutsResponse = await fetch(
                `/getWorkoutsByTeam?teamId=${team.team_id}&date=${currentDate}&coachId=${coachId}`
              );
              const workoutsData = await workoutsResponse.json();
              if (workoutsData.error) {
                console.error(
                  "Error fetching team-specific workouts:",
                  workoutsData.error
                );
                return;
              }
              displayWorkouts(
                workoutsData,
                athleteWorkoutsContainer,
                athleteId
              );
            }

            athleteWorkoutsContainer.classList.toggle("active");
            this.classList.toggle("caret-down");
          });
        });
      }
    });
  });
}
// Call the main function to initialize the page
main()
  .then(() => {
    console.log("Page initialized successfully.");
  })
  .catch((error) => {
    console.error("Error initializing page:", error);
  });

// Call the function to display the teams
// displayTeamsAsTree();
console.log("please", athleteId);

async function displayAllAthletesAsTree() {
  const response = await fetch(`/getAllAthletes?coach_id=${coachId}`);
  const data = await response.json();

  if (data.athletes) {
    myAthletes = data.athletes.map((athlete) => ({
      athleteName: athlete.name,
      athleteId: athlete.athlete_id,
    }));
    console.log("My Athlete", myAthletes);
  }

  if (data.error) {
    console.error("Error fetching athletes:", data.error);
    return;
  }

  const container = document.getElementById("athlete-tree-container");
  if (!container) {
    console.error("Container element not found");
    return;
  }

  // Create and add the heading
  const heading = document.createElement("h2");
  heading.textContent = "Athletes";
  container.appendChild(heading);
  heading.style.color = "#333";

  const tree = document.createElement("ul");
  tree.id = "athlete-tree";
  container.appendChild(tree);

  data.athletes.forEach((athlete) => {
    const athleteItem = document.createElement("li");
    const athleteCaret = document.createElement("span");
    athleteCaret.textContent = `${athlete.name} (${athlete.sports}) - ${athlete.institute}`;
    athleteCaret.className = "caret athlete-caret";
    athleteCaret.setAttribute("data-athlete-id", athlete.athlete_id);
    athleteItem.appendChild(athleteCaret);

    // Container for athlete workouts
    const athleteWorkoutsContainer = document.createElement("ul");
    athleteWorkoutsContainer.className = "nested athlete-workouts-container";
    athleteItem.appendChild(athleteWorkoutsContainer);

    tree.appendChild(athleteItem);

    athleteCaret.addEventListener("click", async function () {
      athleteId = this.getAttribute("data-athlete-id");

      if (!athleteWorkoutsContainer.hasChildNodes()) {
        try {
          const workoutsResponse = await fetch(
            `/getWorkoutsByAthleteDirect?athleteId=${athleteId}&date=${currentDate}&coachId=${coachId}`
          );
          if (!workoutsResponse.ok) {
            throw new Error("Network response was not ok");
          }
          const workoutsData = await workoutsResponse.json();
          displayWorkouts(workoutsData, athleteWorkoutsContainer, athleteId);
        } catch (error) {
          console.error("Error fetching workouts:", error);
        }
      }

      athleteWorkoutsContainer.classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  });
}

function clearData() {
  // Clear teams container
  const teamContainer = document.getElementById("team-tree-container");
  if (teamContainer) {
    teamContainer.innerHTML = "";
  }

  // Clear athletes container
  const athleteContainer = document.getElementById("athlete-tree-container");
  if (athleteContainer) {
    athleteContainer.innerHTML = "";
  }
}

async function expandTeamDetails(teamId, date) {
  // Fetch the athletes for the specified team
  const athletesResponse = await fetch(`/getAthletesForTeam?teamId=${teamId}`);
  const athletesData = await athletesResponse.json();

  if (athletesData.error) {
    console.error("Error fetching athletes:", athletesData.error);
    return;
  }

  // Find the team list item in the DOM
  const teamCaret = document.querySelector(`span[data-team-id="${teamId}"]`);
  if (!teamCaret) {
    console.error("Team caret not found");
    return;
  }

  let athleteList = teamCaret.nextElementSibling;
  if (!athleteList || !athleteList.classList.contains("nested")) {
    athleteList = document.createElement("ul");
    athleteList.className = "nested active";
    teamCaret.parentNode.appendChild(athleteList);
  } else {
    athleteList.classList.add("active");
  }

  athleteList.innerHTML = "";

  for (const athlete of athletesData.athletes) {
    const athleteItem = document.createElement("li");
    const athleteCaret = document.createElement("span");
    athleteCaret.textContent = athlete.name;
    athleteCaret.className = "caret athlete-caret";
    athleteCaret.setAttribute("data-athlete-id", athlete.athlete_id);
    athleteItem.appendChild(athleteCaret);

    athleteCaret.classList.add("caret-down");

    const athleteWorkoutsContainer = document.createElement("ul");
    athleteWorkoutsContainer.className = "nested active";
    athleteItem.appendChild(athleteWorkoutsContainer);

    athleteList.appendChild(athleteItem);

    // Fetch and display workouts for each athlete
    const workoutsResponse = await fetch(
      `/getWorkoutsByTeam?teamId=${teamId}&date=${date}&coachId=${coachId}`
    );
    const workoutsData = await workoutsResponse.json();
    if (!workoutsData.error && workoutsData.length > 0) {
      displayWorkouts(
        workoutsData,
        athleteWorkoutsContainer,
        athlete.athlete_id
      );
    }
  }
}

// Example usage
const specificTeamId = teamId; // Replace with your specific team ID
const specificDate = date; // Replace with your specific date
expandTeamDetails(specificTeamId, specificDate);

async function expandAthleteWorkouts(athleteId, date) {
  // Check if the tree has been built
  if (!document.getElementById("athlete-tree")) {
    console.error("The athlete tree has not been built yet.");
    return;
  }

  // Locate the specific athlete's caret in the DOM
  const athleteCaret = document.querySelector(
    `span[data-athlete-id="${athleteId}"]`
  );
  if (!athleteCaret) {
    console.error("Athlete caret not found for athlete ID:", athleteId);
    return;
  }

  // Get or create the container for the athlete's workouts
  let athleteWorkoutsContainer =
    athleteCaret.parentNode.querySelector(".nested");
  if (!athleteWorkoutsContainer) {
    athleteWorkoutsContainer = document.createElement("ul");
    athleteWorkoutsContainer.className = "nested athlete-workouts-container";
    athleteCaret.parentNode.appendChild(athleteWorkoutsContainer);
  }

  // Toggle the display of workouts if already present
  if (athleteWorkoutsContainer.hasChildNodes()) {
    athleteWorkoutsContainer.classList.toggle("active");
    athleteCaret.classList.toggle("caret-down");
    return;
  }

  // Fetch and display workouts for the athlete
  try {
    const workoutsResponse = await fetch(
      `/getWorkoutsByAthleteDirect?athleteId=${athleteId}&date=${date}&coachId=${coachId}`
    );
    if (workoutsResponse.ok) {
      const workoutsData = await workoutsResponse.json();
      if (workoutsData.length > 0) {
        // Call a function to display the workouts data
        displayWorkouts(workoutsData, athleteWorkoutsContainer, athleteId);
        athleteWorkoutsContainer.classList.add("active");
        athleteCaret.classList.add("caret-down");
      } else {
        console.log(
          "No workouts found for this athlete on the specified date."
        );
      }
    } else {
      throw new Error(`Failed to fetch workouts: ${workoutsResponse.status}`);
    }
  } catch (error) {
    console.error("Error fetching workouts for athlete:", athleteId, error);
  }
}

async function safelyExpandAthleteWorkouts(athleteId, date) {
  // Directly expand the workouts for the given athlete ID and date
  expandAthleteWorkouts(athleteId, date).catch(console.error);
}

// // Since the tree is always loaded, you can call safelyExpandAthleteWorkouts
// // directly without worrying about building the tree again.
//   const specificAthleteId = '38'; // Replace with the actual athlete ID
//   const spec = '2023-12-07'; // Replace with the actual date
//   safelyExpandAthleteWorkouts(specificAthleteId, spec);

// // Example usage
// const specificAthleteId = '38'; // Replace with actual athlete ID
// const spec = '2023-12-07'; // Replace with actual date
// expandAthleteWorkouts(specificAthleteId, spec);

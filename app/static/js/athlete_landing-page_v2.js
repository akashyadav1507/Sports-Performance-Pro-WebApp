"use strict";
// let myAthleteId = 2; // Should be ideally fetched from the sessionStorage
let currentTeamId;
let currentCoachId;
let currentWorkouts;
let currentBlocks;
let currentExercises;
let currentDate = selectedDate;
let createUpdate = 1;
let blockIds = []; // Global array to store block IDs


// console.log("This is my date: ", selectedDate);
let personalCoaches;
let peronalCoachIds;
let currentExerciseId;
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");

const getDate = function () {
  const today = new Date();
  const day = today.getDate(); // 1-31
  const month = today.getMonth() + 1; // 0-11 (January is 0)
  const year = today.getFullYear();

  // Display the current date in a specific format (e.g., YYYY-MM-DD)
  const formattedDate =
    year +
    "-" +
    (month < 10 ? "0" : "") +
    month +
    "-" +
    (day < 10 ? "0" : "") +
    day;
  console.log("Current Date:", formattedDate);
  return formattedDate;
};

// FIXME: Uncomment this : For test purpose set date to 2022-10-30
// currentDate = getDate();
currentDate = selectedDate;
console.log(currentDate);
// Get the athlete Username
var athleteUsernameElement = document.getElementById("athlete-username");
var athleteUsername = athleteUsernameElement.getAttribute("data-username");

// console.log(" Athlete Username ", athleteUsername);

// const testingElement = document.getElementById("testValue");
// const testVal = testingElement.getAttribute("data-testing");
// console.log("The test val :", testVal);

const athleteUserElement = document.getElementById("user_id");
const userEmail = athleteUserElement.dataset.userEmail;

// Remove the trailing.com
athleteUserElement.textContent = `Welcome :  ${userEmail.replace(
  /@[^ ]+/g,
  ""
)}, We're rooting for you !`;
console.log(`UserEmail : ${userEmail}`);

// fetch("/getMyCoach?athleteId=").then((response) =>
// response = response.json()).then((data) =>
// {

// })
// }
// Fetch the user_id from the route using an API
let athleteId;
let coachId;
let teams;
let myTrainingData;
let myTeamsTrainingData;
let athleteTeams;
let clickedTeam;
let teamIds = [];
let coachIds = [];
let myWorkouts;
const workoutTabs = document.getElementById("workout-tabs");
const blockTabs = document.getElementById("block-tabs");
const exerciseTabs = document.getElementById("exercise-tabs");
const exerciseDetails = document.getElementById("exercise-details");

// const athleteList = document.getElementById("athlete-list");
let tbodyExercise = document.querySelector(".create-exercise-rows");
let tbodyCount = tbodyExercise.childElementCount;
const exerciseDropDown = document.getElementById("dropdown-container");

let selectedAthlete = null;
let selectedBlock = null;
let selectedWorkout = null;
const exerciseTableContainer = document.getElementById("table-container");
const formExercise = document.getElementById("create-exercise-form");

let dataTableExercise;
// let delRowButton;
// let modRowButton;

$(document).ready(function () {
  const trainingTable = $("#trainingTable").DataTable({
    columns: [{ data: "name" }], // Display only team name
    dom: "Blfrtip",
    searching: true, // Enable the search bar
    paging: true,
    //
  });
});

// Get the athleteID
async function fetchAthleteID(userEmail) {
  // Make an asynchronous call to fetch the athlete's ID
  const response = await fetch(`/getAthleteId?athleteUsername=${userEmail}`);
  const data = await response.json();
  return data.athlete_id;
}

// Get the Teams for the athlete
async function fetchAthleteTeams(athleteId) {
  // Make an asynchronous call to fetch the athlete's teams using the athleteID
  const response = await fetch(`/getTeamsForAthlete?athleteId=${athleteId}`);
  const data = await response.json();
  //console.log("This is teams data : ", data);
  return data.teams;
}

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
    `getWorkoutsByTeam?teamId=${teamId}}&date=${selectedDate}&coachId=${coachId}`
  );
  const data = await response.json();
  //console.log("These are the workouts : ", data);
  return data;
}

async function fetchWorkoutsByAthleteDirect(athlete_id, coachId, selectedDate) {
  const response = await fetch(
    `getWorkoutsByAthleteDirect?athleteId=${athlete_id}}&date=${selectedDate}&coachId=${coachId}`
  );
  const data = await response.json();
  //console.log("These are the workouts assigned for athlete by his teamId: ",data);
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

// Get All Blocks : UNUSED
function getAllBlockNames(workoutData) {
  // workoutData is workout_name arrays
  // Each workout_name array has blocks which are again arrays
  const blockNames = [];
  workoutData.forEach((workout) => {
    if (Array.isArray(workout)) {
      workout.forEach((w) => {
        w.blocks.forEach((block) => {
          blockNames.push(block.block_name);
        });
      });
    }
    if (Array.isArray(workout.blocks)) {
      workout.blocks.forEach((block) => {
        blockNames.push(block.block_name);
      });
    }
  });
  return blockNames;
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

// Display the workouts once it is clicked : Workouts is an array
function displayWorkouts(workouts) {
  // Clear existing content
  selectedWorkout = '';
  workoutTabs.innerHTML = '';
  blockTabs.innerHTML = '';
  exerciseTabs.innerHTML = '';
  exerciseDetails.innerHTML = 'Select a Workout to view details.';
  exerciseDropDown.innerHTML = '';

  // Create a dropdown (select element)
  const workoutDropdown = document.createElement('select');
  workoutDropdown.id = 'workoutDropdown';
  
  // Create a default option
  const defaultOption = document.createElement('option');
  defaultOption.text = 'Choose a Workout';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  workoutDropdown.appendChild(defaultOption);

  // Iterate over workouts and add them as options to the dropdown
  workouts.forEach((workout) => {
    const option = document.createElement('option');
    option.text = workout.name;
    option.value = workout.workout_id;
    workoutDropdown.appendChild(option);
  });

  // Append the dropdown to the workoutTabs or another desired element
  workoutTabs.appendChild(workoutDropdown);

  // Event listener for when a workout is selected
  workoutDropdown.addEventListener('change', function() {
    // Retrieve the selected option
    const selectedOption = this.options[this.selectedIndex];
    selectedWorkout = selectedOption.value; 
    // Log the selected workout's ID and name
    console.log(`Selected Workout: ${selectedOption.text}, ID: ${selectedOption.value}`);
    // Handle the workout selection
    // Example: selectedWorkout = selectedOption.value; // or any other logic
    fetchBlocksForWorkout(selectedWorkout);
    

  });
}

// Function to fetch and display blocks for a selected workout
function fetchBlocksForWorkout(workoutId) {
  fetch(`getBlocksByWorkout?workoutId=${workoutId}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.blocks && data.blocks.length > 0) {
        blockIds = data.blocks.map(block => block.block_id);
        displayBlocks(data.blocks);
        // Automatically select the first block to display its exercises
        fetchExercisesForBlock(data.blocks[0].block_id);
      } else {
        exerciseDetails.innerHTML = 'No blocks found for this workout.';
      }
    })
    .catch(error => console.error('Error fetching blocks:', error));
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

workoutTabs.addEventListener("click", (e) => {
  if (e.target.tagName == "BUTTON") {
    e.preventDefault();
    e.stopPropagation();
    $(e.target).siblings("button").css("background-color", "");

    // Add the "highlight" class to the clicked element
    $(e.target).css("background-color", "green");
    blockTabs.innerHTML = "";
    exerciseTabs.innerHTML = "";
    exerciseDetails.innerHTML = "Select an Exercise to view details.";
    successMessage.innerText = "";
    errorMessage.innerText = "";
    console.log(`Clicked  Workout button`, e.target);
    if (e.target && e.target.tagName == "BUTTON") {
      console.log("I Clicked", e.target);
      displayBlocks(e, e.target);
    }
  }
});

blockTabs.addEventListener("click", (e) => {
  if (e.target.tagName == "BUTTON") {
    e.preventDefault();
    e.stopPropagation();
    $(e.target).siblings("button").css("background-color", "");

    // Add the "highlight" class to the clicked element
    $(e.target).css("background-color", "green");
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

// Function to display blocks in a dropdown
function displayBlocks(blocks) {
  blockTabs.innerHTML = '';
  exerciseTabs.innerHTML = '';
  exerciseDetails.innerHTML = 'Select a Block to view details.';
  exerciseDropDown.innerHTML = '';

  // Create a dropdown for blocks
  const blockDropdown = document.createElement('select');
  blockDropdown.id = 'blockDropdown';

  // Create a default option
  const defaultOption = document.createElement('option');
  defaultOption.text = 'Choose a Block';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  blockDropdown.appendChild(defaultOption);

  // Add block options to the dropdown
  blocks.forEach(block => {
    const option = document.createElement('option');
    option.text = block.name;
    option.value = block.block_id;
    blockDropdown.appendChild(option);
    
  });

  // Append the dropdown to the blockTabs or another desired element
  blockTabs.appendChild(blockDropdown);

  // Optional: Add event listener for block selection
  blockDropdown.addEventListener('change', function() {
    // Retrieve the selected option
    const selectedOption = this.options[this.selectedIndex];
    console.log(`Selected Block: ${selectedOption.text}, ID: ${selectedOption.value}`);
  
    // Call a function to handle the block selection
    // This function should fetch and display exercises for the selected block
    fetchExercisesForBlock(selectedOption.value);
  });
}



async function fetchExercisesForBlock(blockId) {
  try {
    const response = await fetch(`getExercisesByBlock?blockId=${blockId}`);
    const data = await response.json();
    if (data.exercises) {
      currentExercises = data.exercises; // Update the global exercises array
      displayExercises2(blockId); // Update UI with new exercises
    } else {
      console.log(`No exercises found for block ID: ${blockId}`);
      currentExercises = []; // Reset the exercises array
    }
  } catch (error) {
    console.error('Error fetching exercises for block ID:', blockId, error);
    currentExercises = []; // Reset on error as well
  }
}




function displayExercises2(blockId) {
  exerciseDetails.innerHTML = '';
  let currentBlockIndex = blockIds.indexOf(blockId);

  let navigationContainer = document.getElementById('navigation-container');
  if (!navigationContainer) {
    navigationContainer = document.createElement('div');
    navigationContainer.id = 'navigation-container';
    exerciseDetails.appendChild(navigationContainer);
  } else {
    // Clear existing buttons if the container is already present
    navigationContainer.innerHTML = '';
  }
  fetch(`getExercisesByBlock?blockId=${blockId}`)
    .then(response => response.json())
    .then(data => {
      console.log('Exercises data:', data);
      const exercises = data.exercises;
      exerciseTabs.innerHTML = '';
      let currentExerciseIndex = 0;
      const prevDiv = document.createElement('div');
      const nextDiv = document.createElement('div');
      prevDiv.id = 'prevDiv';
      nextDiv.id = 'nextDiv';
      prevDiv.style.padding = '10px';
      nextDiv.style.padding = '10px';
      const prevButton = document.createElement('button');
      const nextButton = document.createElement('button');
      prevDiv.appendChild(prevButton);
      nextDiv.appendChild(nextButton);
      prevDiv.style.display = 'inline-block';
      nextDiv.style.display = 'inline-block';
      // If the block name is part of the data, you can use it as follows:
      const blockName = data.blockName;
     // Replace 'blockName' with the actual property name that holds the block name
     console.log("this is me block",blockName)

      // Add block name to the top left corner of the exercise details container
      const blockNameDisplay = document.createElement('div');
      // blockNameDisplay.innerText = blockName;
      blockNameDisplay.style.position = 'absolute';
      blockNameDisplay.style.left = '20px'; // Adjust as needed
      blockNameDisplay.style.top = '20px'; // Adjust as needed
      blockNameDisplay.style.color = 'white'; // Set text color
      blockNameDisplay.style.zIndex = '10'; // Ensure it's above other elements

      exerciseDetails.appendChild(blockNameDisplay);

     
      

      function showExercise(index) {
        console.log(`Showing exercise at index: ${index}`);
        // Clear previous content
        exerciseTabs.innerHTML = '';
        successMessage.innerText = ''; // Clear success message
        errorMessage.innerText = ''; // Clear error message
        // Create a container for the exercise
        const exerciseContainer = document.createElement('div');
        exerciseContainer.style.backgroundColor = '#2b4f60'; // Set to your specific blue color code
        exerciseContainer.style.color = 'white';
        exerciseContainer.style.padding = '20px';
        exerciseContainer.style.margin = '0 auto'; // Center the container
        exerciseContainer.style.width = '100%'; // Set width to match 'My Training Sessions' bar
        exerciseContainer.style.boxSizing = 'border-box'; // Include padding in width calculations
        exerciseContainer.style.borderRadius = '4px'; // Optional: if you want rounded corners
        
        
        // Create and append the exercise name
        const exerciseName = document.createElement('h3');
        exerciseName.innerText = exercises[index].name;
        exerciseContainer.appendChild(exerciseName);


        if (currentBlockIndex === blockIds.length - 1 && currentExerciseIndex === exercises.length - 1) {
          displayCompletionMessage();
      }




        // Append the container to the DOM
        exerciseTabs.appendChild(exerciseContainer);
        viewAssignedExercise(exercises[index].exercise_id, exerciseContainer);

        // Log the exercise ID and name
        console.log(`Exercise displayed: ID ${exercises[index].exercise_id}, Name: ${exercises[index].name}`);
      }

      // Initial display
      showExercise(currentExerciseIndex);

   
      prevButton.innerText = '\u2190';
      prevButton.disabled = currentExerciseIndex === 0;
      // Modify the prevButton event listener to use async-await
      prevButton.addEventListener('click', async function() {
        console.log('Previous button clicked');
        if (currentExerciseIndex > 0) {
          currentExerciseIndex--;
          showExercise(currentExerciseIndex);
        } else if (currentBlockIndex > 0) {
          currentBlockIndex--;
          await fetchExercisesForBlock(blockIds[currentBlockIndex]);
          currentExerciseIndex = currentExercises.length - 1;
          showExercise(currentExerciseIndex);
        }
        console.log(`Current Block Index: ${currentBlockIndex}, Current Exercise Index: ${currentExerciseIndex}`);
      });
      
      

      

      nextButton.innerText = '\u2192';
      nextButton.disabled = (currentExerciseIndex === exercises.length - 1) && (currentBlockIndex === blockIds.length - 1);
      nextButton.addEventListener('click', function() {
        console.log('Next button clicked');
        console.log(`Indexes: Exercise - ${currentExerciseIndex}, Block - ${currentBlockIndex}`);
        
        if (currentBlockIndex < blockIds.length - 1 || currentExerciseIndex < exercises.length - 1) {
          // More exercises in the current block or more blocks to go
          if (currentExerciseIndex < exercises.length - 1) {
            currentExerciseIndex++;
            showExercise(currentExerciseIndex);
            prevButton.disabled = false;
          } else {
            currentBlockIndex++;
            currentExerciseIndex = 0;
            fetchExercisesForBlock(blockIds[currentBlockIndex]);
          }
        } else {
          // Last exercise of the last block
          console.log('Completed all exercises in the last block');
          displayCompletionMessage();
        }
      });
      
      function displayCompletionMessage() {
        // Extract workout ID from the selectedWorkout string
        const workoutIdRegex = /ID: (\d+)/;
        console.log("pleaseeeeee", selectedWorkout)
      
        exerciseDetails.innerHTML = "You have completed all exercises in this workout.";
        const lineBreak = document.createElement('br');
        exerciseDetails.appendChild(lineBreak);
        const completeButton = document.createElement('button');
        completeButton.innerText = 'Mark as Completed';
        completeButton.id = 'completeButton';
        completeButton.style.marginTop = '10px';
        completeButton.onclick = async function() {
          console.log('Workout marked as completed');
        
          if (selectedWorkout) {
            // Data to be sent in the POST request
            const postData = {
              coach_id: currentCoachId,
              athlete_id: athleteId,
              workout_id: selectedWorkout,
              date: currentDate,
              status: 'unopened'
            };
      
            try {
              const response = await fetch('/addNotificationCoach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
              });
      
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
      
              const responseJson = await response.json();
              console.log('Notification added:', responseJson);
              // Handle the response here, for example, showing a success message

              completeButton.remove();
              exerciseDetails.innerHTML = "Congratulations! Your workout has been submitted.";
            } catch (error) {
              console.error('Error during adding notification:', error);
              // Handle the error, for example, showing an error message
            }
          } else {
            console.error('Workout ID could not be determined.');
            // Handle the situation where the workout ID could not be determined
          }
        };
      
        exerciseDetails.appendChild(completeButton);
        nextButton.disabled = true;
      }
      
      
      
      
      
    
    // Append buttons to the DOM
    navigationContainer.appendChild(prevDiv); 
    navigationContainer.appendChild(nextDiv);
    })
    .catch(error => console.error('Error fetching exercises:', error));
}




// exerciseTabs.addEventListener("click", (e) => {
//   if (e.target.tagName == "BUTTON") {
//     $(e.target).siblings("button").css("background-color", "");

//     // Add the "highlight" class to the clicked element
//     $(e.target).css("background-color", "green");

//     e.preventDefault();
//     e.stopPropagation();
//     currentExerciseId = Number(e.target.id); // Setting id for retrival
//     exerciseDetails.innerHTML = "Select an Exercise to view details.";
//     successMessage.innerText = "";
//     errorMessage.innerText = "";
//     console.log(`Clicked Exercise button`, e.target);
//     if (e.target && e.target.tagName == "BUTTON") {
//       console.log("I Clicked", e.target);
//       viewAssignedExercise(e);
//       console.log(`Viewing the exercise`);
//     }
//   }
// });

function viewAssignedExercise(exerciseId, containerElement) {
  // Update currentExerciseId
  currentExerciseId = exerciseId;
  // Everytime I click an exercise block, a fetch request is sent to back-end to get the latest exercise details of that exercise
    fetch(`getExerciseDetails?exerciseId=${exerciseId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(" I am here : the exercise details ", data);
      const exercises = data;
      const exerciseDetails = document.getElementById("exercise-details");
      console.log(`Inside Viewing exercise`);

      exercises.forEach((exercise, index) => {
        console.log("Exercise is : ", exercise);

        exerciseDropDown.innerHTML = "";
        containerElement.appendChild(exerciseTableContainer);
        exerciseTableContainer.classList.remove("create-exercise-table-hide"); // Making visible the table

        // Inside the load Table I have to add the pre-defined sets, loads and reps for that athlete

        const dataTable = $("#create-exercise").DataTable();
        dataTable.clear();
        const sets = exercise.sets;
        const loadsReps = exercise.loads_reps;
        console.log(loadsReps["coach"]);

        // If the AthleteInputExercise already exists display that Table
        fetch(
          `/showAthleteExerciseInputLoads?exerciseId=${currentExerciseId}&athleteId=${athleteId}`
        )
          .then((response) => {
            response = response.json();
            return response; // Always return this
          })
          .then((data) => {
            console.log("Data:", data);
            if (data.info) {
              createUpdate = 0;
              console.log(data["info"]); // Data Already exists
            } else {
              createUpdate = 1;
              console.log("Data alreay exists"); // Create the Data
            }
            for (let i = 0; i < loadsReps["coach"].length; i++) {
              const rowData = [];

              // Set column (1-based index for human-readable numbering)
              rowData.push(i + 1);

              // LOADS and REPS columns
              rowData.push(loadsReps["coach"][i].load);
              rowData.push(loadsReps["coach"][i].reps);

              // Input_load column
              if (createUpdate === 0) {
                var inputCell = `<input type="number" data-input=${
                  i + 1
                } name="load_entry-${i + 1}">`;
              } else {
                var inputCell = `<input type="number" data-input=${
                  i + 1
                } name="load_entry-${i + 1}" value=${
                  data["input_load"][i]["load"]
                }>`;

                console.log(inputCell);
              }
              rowData.push(inputCell);
             
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
    athleteId = await fetchAthleteID(userEmail); // Fetch athlete UserEmail
    athleteTeams = await fetchAthleteTeams(athleteId); // Fetch Athlete Teams

    console.log("This is the athletes Team names :", athleteTeams);
    coachIds = await fetchCoaches(athleteId);

    teamIds = athleteTeams.map((team) => team.team_id);
    console.log("My coach Ids :", coachIds); // is an array of coach_ids json
    highlightWorkoutDatesForAthletes(athleteId, teamIds);
    personalCoaches = await fetchPersonalCoaches(athleteId);
    if (personalCoaches.error === "No coaches found for the athlete") {
      personalCoaches = [];
    } else {
      peronalCoachIds = personalCoaches.map(
        (personcalCoach) => personcalCoach.coach_id
      );
    }
    console.log("My personal coach Ids :", peronalCoachIds);

    myWorkouts = await fetchWorkoutsForAthleteAndTeams(athleteId, teamIds);
    console.log("These are my Workouts: initial Data ", myWorkouts);

    // Table creation filter date here : TODO: Ideally filter by date when pulling data itself ( optimization required )
    const dataCreation = (function () {
      // You can now work with athleteID and athleteTeams here
      console.log("Athlete ID:", athleteId);
      console.log("Athlete Teams:", athleteTeams); // [ {} {}]

      // console.log(teamIds);
      // console.log(athleteTeams);
      teams = athleteTeams.map((team) => team.name);

      // INITIALIZING THE TEAMS OF THE TRAINING TABLE
      const trainingTable = $("#trainingTable").DataTable();
      // console.log("Data.teams 0", teams[0]);
      trainingTable.clear().rows.add(athleteTeams).draw(); // Passing an array to rows.add()
      personalCoaches.forEach((coach) => {
        trainingTable.row
          .add({
            coach_id: coach.coach_id,
            name: `My individual trainings-${coach.name}`,
            sport: "sport",
            team_id: null,
          })
          .draw(false);
      });

      // .orderFixed({ pre: [0, "asc"] })
      // .columnDefs([
      //   { orderData: [0, "data-sort"] },
      //   { targets: "noSort", orderable: false },
      // ])
    })();
    return athleteId, athleteTeams, coachIds, teams;
  } catch (error) {
    console.log("Could not fetch the details " + error);
  }
}

// Main Function which has all details:
async function main() {
  try {
    const data = await initialData(); // Gets all the initial Data

    console.log("Athlete ID is :", athleteId);
    console.log("Athlete Teams :", teams);
    console.log("My Personal CoachIDs", peronalCoachIds);
  } catch (error) {
    console.error("An error occured", error);
  }
}

main();

// DATA TABLE INITIALIZATION
$(document).ready(function () {
  // Viewing the details:

  dataTableExercise = $("#create-exercise").DataTable({
    "paging": false,  // Disable pagination
    "searching": false,  // Hide the search box
    "info": false,  // Will not show 'Showing 1 to X of X entries'
    "bLengthChange": false,  // Hide 'Show [number] entries' dropdown
    "dom": "lrtip" 
    
  });

  // dataTableExercise.on("mouseenter", "td", function () {
  //   let colIdx = dataTableExercise.cell(this).index().column;

  //   dataTableExercise
  //     .cells()
  //     .nodes()
  //     .each((el) => el.classList.remove("highlight"));

  //   dataTableExercise
  //     .column(colIdx)
  //     .nodes()
  //     .each((el) => el.classList.add("highlight"));
  // });
});

// RESPONSIVE ANY TEAM CLICKED SHOULD SHOW THE TEAM SESSION DETAILS
$("#trainingTable tbody").on("click", "tr", function () {
  // Get the team ID from the clicked row
  var trainingTable = $("#trainingTable").DataTable();
  // Gives the object details for the row
  var data = trainingTable.row(this).data(); // Object { coach_id, , ....}
  // Displays the object for the row

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

  if (data["team_id"] !== null) {
    currentTeamId = data["team_id"];
    console.log("The current team_id is ", currentTeamId);
    currentCoachId = data["coach_id"];
    console.log("The current coach_id is ", currentCoachId);
  } else if (data["team_id"] === null) {
    currentTeamId = null;
    currentCoachId = data["coach_id"];
  }

  // Get current Workout
  // Everytime I clikc on a Team, a fetch request is sent to get workout and display the blocks of the team
  currentWorkouts =
    currentTeamId === null
      ? fetch(
          `getWorkoutsByAthleteDirect?athleteId=${athleteId}&coachId=${currentCoachId}&date=${currentDate}`
        )
          .then((response) => {
            response = response.json();
            return response;
          })
          .then((data) => {
            console.log("This is my data:", data);
            return data;
          })
          .then((workout_data) => {
            console.log(workout_data);
            currentWorkouts = getWorkoutNames(workout_data);
            console.log("Current Workouts:", currentWorkouts);
            displayWorkouts(currentWorkouts);
          })
          .catch((error) => {
            console.error("There was an error fetching", error);
          })
      : fetch(
          `getWorkoutsByTeam?teamId=${currentTeamId}&coachId=${currentCoachId}&date=${currentDate}`
        )
          .then((response) => response.json())
          .then((data) => {
            console.log("This is my data:", data);
            return data;
          })
          .then((workout_data) => {
            console.log(workout_data);
            currentWorkouts = getWorkoutNames(workout_data);
            console.log("Current Workouts:", currentWorkouts);
            displayWorkouts(currentWorkouts);
          })
          .catch((error) => {
            console.error("There was an error fetching", error);
          });
});

//  Make the submit button to hit the database with values✅

$(document).ready(function () {
  // Function to collect and submit form data
  var table = $("#create-exercise").DataTable();
  $("#create-exercise-form #submitExercise").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    successMessage.innerText = "";
    errorMessage.innerText = "";
    console.log("INside the exercise form input");
    // event.preventDefault(); // Prevent the default form submission
    // Collect the values from the dynamically generated rows

    // $(".create-exercise-rows tr").each(function () {
    //   var set = $(this).find(".set-input").val();
    //   var load = $(this).find(".load-input").val();
    //   var reps = $(this).find(".reps-input").val();
    //   var inputLoad = $(this).find(".input-load-input").val();

    const athleteInputLoads = [];
    const sets = table.columns(0).data()[0].length;
    const loads = [...table.columns(1).data()[0]];
    const reps = [...table.columns(2).data()[0]];
    const inputLoads = table.$("input");
    let check = false;
    for (let i = 0; i < loads.length; i++) {
      check = validateInputField(inputLoads[i], loads[i]);
      if (check) {
        athleteInputLoads.push(Number(inputLoads[i].value));
      } else {
        console.log("Give the right input");
        console.log("Display a modal here ");
        break; // the loop, invalid entry
      }
    }

    if (loads.length === athleteInputLoads.length) {
      // Format input for database : {athlete: ["loads" : ...]}
      const athleteExerciseInput = formatAthleteEntries(athleteInputLoads);

      // Send the entries to database
      fetch("/postAthleteInputs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: athleteExerciseInput,
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          if (data.success) {
            const successMessage = document.getElementById("success-message");
            successMessage.innerText = `${data.success}`;
          } else {
            const errorMessage = document.getElementById("error-message");
            errorMessage.innerText = `${data.error}`;
          }
        })
        .catch((error) => {
          console.log(error);
          console.log({ error: "Failed to store data on server" });
        });
    }

    // dataTable.on("draw", function () {
    //   $("#submitExercise").prop("disabled", !areAllFieldsFilled());
    // });
  });
  // Create an object with the collected data and push it to the array
  // exerciseData.push({
  //   set: set,
  //   load: load,
  //   reps: reps,
  //   inputLoad: inputLoad,
  // });
  // });
  // console.log(exerciseData);

  // You can now do something with the exerciseData array, like sending it to the server

  // Clear the form or perform any other actions as needed
  // For example, you can reset the form:
  // $("#create-exercise-form")[0].reset();
});

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

function validateInputField(loadInput, maxLoad) {
  const value = loadInput.value;
  console.log("Value of input", value, typeof value);
  console.log("Inside Validate Inpout");
  const errorMessage = document.getElementById("error-message");
  if (isNaN(value) || value === "") {
    errorMessage.innerText = "Load must be a number.";
    loadInput.focus();
  } else if (value < 0) {
    errorMessage.innerText = "Load cannot be negative.";
    loadInput.focus();
  } else if (value > maxLoad) {
    errorMessage.innerText = "Load cannot exceed the maximum value.";
    loadInput.focus();
  } else if (value === 0) {
    errorMessage.innerText = "Load cannot be blank.";
    loadInput.focus();
  } else {
    errorMessage.innerText = "";
    return true;
  }
}

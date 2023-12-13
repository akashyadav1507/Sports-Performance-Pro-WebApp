// © Author: Darryl Vas Prabhu
"use strict";
// https://stackoverflow.com/questions/56719276/using-javascript-functions-to-add-dynamic-html-content
// Have global variables for some of the things here

// Refactor: Especially for clonedexerciseAssignDetails : DRY princicple required here.

var params = new URLSearchParams(window.location.search);
// var teamId = Number(params.get("teamId"));
// var coachId = Number(params.get("coachId"));
// var teamName = params.get("teamName");
// var currentDate = params.get("date");
// var athleteId = Number(params.get("athleteId"));
// var athleteName = params.get("athleteName");

let DataTableExerciseList = {};
let deleteSetHandler;
let deleteBlockExerciseHandler;
const inputWorkout = document.getElementById("workout-name");
const datePicker = document.getElementById("datepicker");
let workoutSuccessMessage = document.getElementById("workout-success-message");
let workoutErrorMessage = document.getElementById("workout-error-message");

console.log("My Athletes are :", myAthletes);
// Set the default value to the date picked from previous page
// console.log(`Date fetched : ${currentDate}`);
datePicker.value = formatDateToYYYYMMDD(currentDate);
// console.log(`Date formatted : ${currentDate}`);

// console.log(`Team name ${teamName}`);
// Set the Team name :
// document.querySelector("#team-name").textContent =
//   teamName !== null ? teamName : athleteName;

// Additional feature : If required

// console.log("This is the teamId", teamId);
// console.log("This is my coachId :", coachId);
// console.log("This is my TeamName :", teamName);
// console.log("This is the athleteId", athleteId);
// console.log("This is my athleteName :", athleteName);

// Function to fetch the Workout by teamId

// TODO: getTestWorkoutsByTeam

async function fetchTestWorkoutsByTeam(teamId, selectedDate, coachId) {
  const response = await fetch(
    `/getTestWorkoutsByTeam?teamId=${teamId}&date=${selectedDate}&coachId=${coachId}`
  );
  const data = await response.json();
  //console.log("These are the Tests : ", data);
  return data;
}

// TODO: getTestWorkout2
// Function to fetch the Workout for particular athlete by athleteId
async function fetchTestWorkouts(
  athlete_id = null,
  team_id = null,
  coach_id = null,
  date = ""
) {
  const response = await fetch(
    `/getTestWorkout2?athleteId=${athlete_id}&teamId=${team_id}&date=${date}&coachId=${coach_id}`
  );
  const data = await response.json();
  // console.log("These are the workouts assigned for athlete by his athleteId and for his team by teamId: ",data);
  return data;
}

let myAssignedWorkouts = [];
let newBlockName;
// let myWorkouts = [];

let SampleWorkoutData = {
  name: null,
  date_added: null,
  coach_id: null,
  blocks: [],
};

let DefaultsampleWorkoutData = JSON.parse(JSON.stringify(SampleWorkoutData));
let addSingleSetInitialized = 0;

let selectedBlockIndex;
let selectedExerciseIndex;

// JavaScript to populate Exercise Type and Exercise Name based on selected Category and Exercise Type

// Function to fetch data from the server
function fetchData(endpoint, params, callback) {
  $.get(endpoint, params, callback);
}

// Function to populate dropdowns with data
function populateDropdown(element, data) {
  element.innerHTML = "";
  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    element.appendChild(option);
  });
}

// Function to update exercise types dropdown
function updateExerciseTypes(
  categorySelect,
  exerciseTypeSelect,
  exerciseNameSelect
) {
  const selectedCategoryId = categorySelect.value;
  console.log("updateExerciseTypes: categorySelect", categorySelect);
  console.log("updateExerciseTypes: exerciseTypeSelect", exerciseTypeSelect);
  fetchData(
    "/exercise-types",
    { category_id: selectedCategoryId },
    function (data) {
      populateDropdown(exerciseTypeSelect, data.exercise_types);
      updateExerciseNames(
        categorySelect,
        exerciseTypeSelect,
        exerciseNameSelect
      ); // Update exercise names after updating exercise types
    }
  );
}

// Function to update exercise names dropdown
function updateExerciseNames(
  categorySelect,
  exerciseTypeSelect,
  exerciseNameSelect
) {
  const selectedCategoryId = categorySelect.value;
  const selectedExerciseTypeId = exerciseTypeSelect.value;

  fetchData(
    "/getDefinedExercises",
    { exercise_type_id: selectedExerciseTypeId },
    function (data) {
      populateDropdown(exerciseNameSelect, data.exercises);
    }
  );
}

// Format the Date String
function formatDateToYYYYMMDD(dateString) {
  //   let month = String(date.getUTCMonth() + 1).padStart(2, "0");
  //   let day = String(date.getUTCDate()).padStart(2, "0");

  let date = new Date(`${dateString}`);
  console.log(date);

  if (isNaN(date.getTime())) {
    // Invalid date, handle accordingly
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  console.log(`Month : ${month}`);
  console.log(`Day : ${day}`);
  return `${year}-${month}-${day}`;
}

// Function to input Workout Name
document.addEventListener("DOMContentLoaded", function () {
  var workoutNameInput = document.getElementById("workout-name");
  var addBlockButton = document.getElementById("add-block-button");

  workoutNameInput.addEventListener("input", function () {
    // Enable the "Block" tab button if workout name is not empty
    if (workoutNameInput.value.trim() !== "") {
      addBlockButton.classList.remove("add-block-btn-hide");
    } else {
      addBlockButton.classList.add("add-block-btn-hide");
    }
  });
});

// Populate the Team Picker and the Athlete Picker
// Reference: https://stackoverflow.com/questions/9895082/javascript-populate-drop-down-list-with-array

function populateTeamAthletePicker(myAthletes, myTeams) {
  setTimeout(1000);
  var selectTeam = document.getElementById("team-picker");
  var selectAthlete = document.getElementById("athlete-picker");
  if (myAthletes.length > 0) {
    for (var i = 0; i < myAthletes.length; i++) {
      var opt = myAthletes[i].athleteName;
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      el.id = myAthletes[i].athleteId;
      selectAthlete.appendChild(el);
    }
    var el = document.createElement("option");
    el.textContent = "";
    el.value = null;
    el.id = null;
    selectAthlete.appendChild(el);
    // selectAthlete.selectedIndex = selectAthlete.options.length - 1;
    selectAthlete.selectedIndex =
      athleteId === null
        ? selectAthlete.options.length - 1
        : selectAthlete.selectedIndex;
  }

  if (myTeams.length > 0) {
    for (var i = 0; i < myTeams.length; i++) {
      var opt = myTeams[i].teamName;
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      el.id = myTeams[i].teamId;
      selectTeam.appendChild(el);
    }
    var el = document.createElement("option");
    el.textContent = "";
    el.value = null;
    el.id = null;
    selectTeam.appendChild(el);
    selectTeam.selectedIndex =
      teamId === null
        ? selectTeam.options.length - 1
        : selectTeam.selectedIndex;
  }
}

// Setting timeout and retries
setTimeout(() => {
  if (myAthletes && myTeams && myAthletes.length > 0 && myTeams.length > 0) {
    populateTeamAthletePicker(myAthletes, myTeams); // Execute function if data is available
  } else {
    // If data is not available, try again after 1 second
    setTimeout(() => {
      if (
        myAthletes &&
        myTeams &&
        myAthletes.length > 0 &&
        myTeams.length > 0
      ) {
        populateTeamAthletePicker(myAthletes, myTeams);
      }
    }, 1000);
  }
}, 1000);

setTimeout(() => {
  if (athleteId)
    for (let i = 0; i < athletePicker.options.length; i++) {
      if (athletePicker.options[i].id === athleteId) {
        athletePicker.options[i].selected = true;
        break; // Stop the loop once the option is found
      }
    }
}, 1000);

setTimeout(() => {
  if (teamId)
    for (let i = 0; i < teamPicker.options.length; i++) {
      if (teamPicker.options[i].id === teamId) {
        teamPicker.options[i].selected = true;
        break; // Stop the loop once the option is found
      }
    }
}, 1000);

const teamPicker = document.getElementById("team-picker");
const athletePicker = document.getElementById("athlete-picker");

// Keeping track of Team Id
teamPicker.addEventListener("change", function () {
  const selectedOption = teamPicker.options[teamPicker.selectedIndex];

  teamId = Number(selectedOption.id);
  teamName = selectedOption.value;

  console.log("Team ID:", teamId);
  console.log("Team Name:", teamId);
  athletePicker.selectedIndex = athletePicker.options.length - 1;
});

// Keeping track of Athlete Id
athletePicker.addEventListener("change", function () {
  const selectedOption = athletePicker.options[athletePicker.selectedIndex];

  athleteId = Number(selectedOption.id);
  athleteName = selectedOption.value;
  console.log("Athlete ID:", athleteId);
  console.log("Athlete Name:", athleteName);
  teamPicker.selectedIndex = teamPicker.options.length - 1;
});

let addBlockBtn = document.getElementById("add-block-button");
let addExerciseBtn;

const blockAssignTabs = document.getElementById("block-assign-tabs");
const exerciseAssignTabs = document.getElementById("exercise-assign-tabs");
let blockListContainer;

const exerciseAssignDetails = document.getElementById(
  "exercise-assign-details"
);
let tbodyExercise = document.querySelector(".create-exercise-rows");
let tbodyCount = tbodyExercise.childElementCount;

const exerciseAssignDropDown = document.getElementById(
  "dropdown-assign-container"
);
const exerciseTableContainer = document.getElementById("table-container");
const formExercise = document.getElementById("create-exercise-form");
const returnBtn = document.getElementById("return-button");

let categorySelect;
let exerciseTypeSelect;
let exerciseNameSelect;
const addSetBtn = document.getElementById("addSet-btn");

// Function to return to previous Page
returnBtn.addEventListener("click", function (e) {
  // if (teamId !== null)
  //   window.location.href = `/coachTeamWorkout?teamId=${teamId}&coachId=${coachId}&teamName=${teamName}`;
  // else if (athleteId !== null)
  //   window.location.href = `/coachAthleteWorkout?athleteId=${athleteId}&coachId=${coachId}`;
  window.location.reload();
  window.scrollTo(0, 0);
});

// Function to add dataTable rows
function addSingleSet(tableContainer, dataTableExercise) {
  addSingleSetInitialized = 1;

  var setNumber_ = dataTableExercise.rows().count() + 1;
  console.log("Set number: ", setNumber_);

  var tbodyExercise = tableContainer.querySelector(".create-exercise-rows");
  var tbodyCount = tbodyExercise.childElementCount;
  if (tbodyCount >= 1) {
    console.log(`Tbody count : ${tbodyExercise.childElementCount}`);
    // const initialSetsContainer = document.getElementById("initial-sets");
    // initialSetsContainer.style.display = "none";
  }
  const newRowData = [
    setNumber_,
    `<input type="number" name="loads-${setNumber_}" value="">`,
    `<input type="number" name="reps-${setNumber_}" value="">`,
    `<button id="delete-${setNumber_}" class="delete-row-button"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
    //   <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
    //   <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/></svg></button>`,
  ];
  console.log(newRowData);

  // UNCOMMENT IF NOT WORKING dataTableExercise.row.add(newRowData).draw(false);
  dataTableExercise.row.add(newRowData).order([0, "asc"]).draw(false);
}

// HANDLER FOR DELETING  A PARTICULAR SET in an EXERCISE
function handleDeleteSetClick(target, dataTableExercise) {
  var target = target;
  console.log("Clicked Delete button ", target);

  const handleDeleteSet = document.querySelector(".delete-dialog-set");

  handleDeleteSet.querySelector(
    "#delete-set-text"
  ).textContent = `Are you sure you want to delete Set Number: ${
    dataTableExercise.row($(target).closest("tr")).index() + 1
  }`;
  // Remove the previous event listener if it exists
  if (deleteSetHandler)
    handleDeleteSet.removeEventListener("click", deleteSetHandler);

  // Define the event handler
  deleteSetHandler = function (e) {
    handleDeleteSetFunc(e, target, dataTableExercise, handleDeleteSet);
  };

  handleDeleteSet.style.display = "flex";

  // Add the event listener
  handleDeleteSet.addEventListener("click", deleteSetHandler);
}

// DELETE SET FUNCTION
function handleDeleteSetFunc(e, target, dataTableExercise, handleDeleteSet) {
  if (e.target.id === "confirm-delete-set-yes") {
    var rowIdx = dataTableExercise.row($(target).closest("tr")).index();
    deleteRow(dataTableExercise, rowIdx);
  } else {
    console.log("Do nothing");
  }
  handleDeleteSet.querySelector("#delete-set-text").textContent = "";
  handleDeleteSet.style.display = "none";
}

// Function to delete a row
function deleteRow(dataTableExercise, rowIdx) {
  //  Delete confirmation for every delete button clicked

  //: UNCOMMENT if not working dataTableExercise.row(rowIdx).remove().draw(false);
  dataTableExercise.row(rowIdx).remove();
  // UNCOMMENT BELOW IF DELETE DISFUNCTIONS WORKING

  // dataTableExercise.order([0, "asc"]).draw(false);
  // dataTableExercise.rows().invalidate().draw(false);
  updateSetNumbers(dataTableExercise);

  dataTableExercise.rows().invalidate().draw(false); //: DO NOT REMOVE THIS FROM HERE
}

// UPDATE SET numbers in columns after delete
function updateSetNumbers(dataTableExercise) {
  dataTableExercise.rows().every(function (rowIdx) {
    this.data()[0] = rowIdx + 1;
    console.log("This data [0] ", this.data()[0]);
  });

  const loadInputValues = dataTableExercise
    .column(1)
    .nodes()
    .to$()
    .find("input")
    .map(function () {
      return this.value.trim();
    })
    .get();

  console.log("loadInputValues", loadInputValues);
  const repsInputValues = dataTableExercise
    .column(2)
    .nodes()
    .to$()
    .find("input")
    .map(function () {
      return this.value.trim();
    })
    .get();

  console.log("repsInputValues", repsInputValues);
  dataTableExercise.rows().every(function (rowIdx) {
    var rowData = this.data();

    // Check if NULL , then put the values , else leave as it is.

    // Update the names for the 2nd, 3rd, and 4th column cells in each row // FIXME: Workaround: BAD DESIGN, but does the job!
    rowData[1] = `<input type="number" name="loads-${rowIdx + 1}" value="${
      loadInputValues[rowIdx] !== "" ? Number(loadInputValues[rowIdx]) : ""
    }">`;
    rowData[2] = `<input type="number" name="reps-${rowIdx + 1}" value="${
      repsInputValues[rowIdx] !== "" ? Number(repsInputValues[rowIdx]) : ""
    }">`;
    rowData[3] = `<button id="delete-${rowIdx + 1} 
      " class="delete-row-button"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
      //   <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
      //   <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/></svg></button>`;

    // Update the data for the row in the DataTable
    this.data(rowData);

    // Additional functionality if required: Delete the workout from SampleWorkoutData without hitting Save
  });
}

const testingBtn = document.getElementById("testing");

// Fetch the entered loads, sets, and reps
function FormatExerciseData(dataTableExercise) {
  // SAVE EXERCISE BUTTON: Function to collect the data
  const coachExerciseData = [];
  var table = dataTableExercise;

  console.log("Executing Testing");
  // var table = $("#create-exercise").DataTable();
  const sets = table.columns(0).data()[0].length;

  ///////////////////////////////////
  const loadsColumn = table.column(1).nodes(); // Get input elements from column 1
  const repsColumn = table.column(2).nodes(); // Get input elements from column 2

  const loads = [];
  const reps = [];

  // Fetch values from loadsColumn
  $(loadsColumn)
    .find('input[type="number"]')
    .each(function () {
      console.log("Load value here:", $(this).val());
      loads.push($(this).val());
    });

  // Fetch values from repsColumn
  $(repsColumn)
    .find('input[type="number"]')
    .each(function () {
      console.log("Reps value here:", $(this).val());
      reps.push($(this).val());
    });

  console.log("Values from column 1:", loads);
  console.log("Values from column 2:", reps);

  const loadsRepsArray = loadsRepsFormatter(loads, reps);

  console.log(`loadsRepsArray`, loadsRepsArray);

  return { sets: sets, loadsRepsArray: loadsRepsArray };
}

// Function for formatting loadsReps
function loadsRepsFormatter(loadsArray, RepsArray) {
  const loadsRepsArray = loadsArray.map((loadValue, index) => ({
    load: Number(loadValue),
    reps: Number(RepsArray[index]),
  }));
  return loadsRepsArray;
}

// Done while switching Tabs or during Submit // pass the array here
function validateLoadsReps(loadRepsArray) {
  let check = false;

  loadRepsArray.forEach((loadRep) => {
    const load = loadRep.load;
    const reps = loadRep.reps;
    const errorMessage = document.getElementById("error-message");
    if (isNaN(load) || isNaN(reps) || load === "" || reps === "") {
      errorMessage.innerText = "Load/Reps must be a number.";
      //loadInput.focus();
    } else if (load < 0 || reps < 0) {
      errorMessage.innerText = "Load/Reps cannot be negative.";
      //loadInput.focus();
    } else {
      errorMessage.innerText = "";
      return (check = true);
    }
  });
}

// Function to get Block names
function getMyBlockNames(workoutData) {
  const blockNames = [];
  workoutData.forEach((workout) => {
    if (Array.isArray(workout.blocks)) {
      workout.blocks.forEach((block) => {
        blockNames.push({
          test_block_id: block.test_block_id,
          block_name: block.name,
        });
      });
    }
  });
  return blockNames;
}

// Display the blocks once it is clicked : Blocks is an array
function displayBlocks2(blocks) {
  selectedBlock = blockAssignTabs.innerHTML = "";
  exerciseAssignTabs.innerHTML = "";
  // exerciseAssignDetails.innerHTML = "Select a Block to view details.";
  exerciseAssignDropDown.innerHTML = "";
  console.log(exerciseAssignTabs);
  blocks.forEach((block, index) => {
    exerciseAssignTabs.innerHTML = "";
    console.log(`Adding Button ${block.block_name}`);
    const blockButton = document.createElement("button");
    blockButton.innerText = `${block.block_name}`;
    blockButton.id = `${block.test_block_id}`; // Add the id to keep track of block_id
    blockAssignTabs.appendChild(blockButton);
  });
}

// Function to expand the li Block
function expandItems(target) {
  console.log("Opening Block....");
  console.log("target....", target);
  const childLength = target.childElementCount;
  console.log("childLength", childLength);
  for (let i = 2; i < childLength; i++) {
    console.log(target.children[i]);
    target.children[i].style.display = "block";
  }
}

// Function to close the li Block
function shrinkItems(target) {
  console.log("Closing Block....");
  const childLength = target.childElementCount;
  console.log("childLength", childLength);
  for (let i = 2; i < childLength; i++) {
    console.log(target.children[i]);
    target.children[i].style.display = "none";
  }
}

// Function to expand the li exercises
function expandExercise(target) {
  console.log("Opening Exercise....");
  console.log("target Exercise....", target);
  const tableContainer = target.querySelector("#table-container");
  console.log("TableContainer", tableContainer);
  tableContainer.classList.remove(["create-exercise-table-hide"]);
}

// Function to shrink the li exercises
function shrinkExercise(target) {
  console.log("Closing Exercise....");
  console.log("target Exercise....", target);
  const tableContainer = target.querySelector("#table-container");
  console.log("TableContainer", tableContainer);
  tableContainer.classList.add(["create-exercise-table-hide"]);
}

// DELETE BLOCK OR EXERCISE
function deleteItem(target, targetParent) {
  const handleDelete = document.querySelector(".delete-dialog");

  handleDelete.querySelector("#delete-text").textContent =
    target.classList.contains("exercise-buttons")
      ? `Are you sure you want to delete Exercise: ${target.childNodes[0].textContent}`
      : `Are you sure you want to delete Block: ${
          target.querySelector("input").value
        }`;

  if (deleteBlockExerciseHandler)
    handleDelete.removeEventListener("click", deleteBlockExerciseHandler);

  deleteBlockExerciseHandler = function (e) {
    handleDeleteBlockExercise(e, target, targetParent, handleDelete);
  };

  handleDelete.style.display = "flex";

  handleDelete.addEventListener("click", deleteBlockExerciseHandler);
}

function handleDeleteBlockExercise(e, target, targetParent, handleDelete) {
  if (e.target.id === "confirm-yes") {
    console.log("Target Parent removing the child now");
    console.log("TargetParent: ", targetParent);
    console.log("Target to Remove: ", target);
    targetParent.removeChild(target);
  } else {
    console.log("Do nothing");
  }
  handleDelete.style.display = "none";
}

// Functionality : ADD A BLOCK
addBlockBtn.addEventListener("click", function (e) {
  if (e.target.tagName === "BUTTON") {
    // exerciseAssignTabs.innerHTML = "";
    e.preventDefault();
    e.stopPropagation();

    // Create the <li> element for the block in the main container.

    // If first element, then CREATE the BlockListContainer
    if (!blockAssignTabs.querySelector("li")) {
      blockListContainer = document.createElement("ul");
      blockListContainer.id = "blocks-container";
      blockAssignTabs.append(blockListContainer);

      // MAIN CONTAINER FOR BLOCKS. USING EVENT DELEGATION ON PARENT rather than having each element have an AddEventListner
      blockListContainer.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Add SET button
        if (
          e.target.tagName == "BUTTON" &&
          e.target.classList.contains("add-Set--btns")
        ) {
          var key_ = e.target.id;
          key_ = key_.replace("addSet-btn-", "");
          console.log("Key_.", key_);
          console.log("Parent", e.target.parentElement);
          addSingleSet(e.target.parentElement, DataTableExerciseList[key_]);
        }

        // Delete Button click
        if (
          e.target.classList.contains("delete-row-button") ||
          e.target.tagName === "svg" ||
          e.target.tagName === "path"
        )
          if (
            e.target.closest("button").classList.contains("delete-row-button")
          ) {
            var key_ = e.target.closest("tbody").id;
            key_ = key_.replace("create-exercise-rows-", "");
            console.log("Key_.", key_);
            console.log("Parent", e.target.parentElement);

            // display a model here:

            handleDeleteSetClick(e.target, DataTableExerciseList[key_]);
          }

        // EXPANDING and CLOSING the respective block or exercise
        if (e.target.tagName === "LI" && e.target.childElementCount > 0) {
          console.log("Entering e.target", e.target);

          // Clicked an EXERCISE BUTTON
          if (e.target.classList.contains(["exercise-buttons"])) {
            // Check Exercise Exists
            if (checkExerciseExists(e.target)) {
              console.log("Maximize/Minimze functionality");

              e.target
                .querySelector("#table-container")
                .classList.contains("create-exercise-table-hide")
                ? expandExercise(e.target)
                : shrinkExercise(e.target);
            } else {
              // Create the element for the Category, Type, Exercise Name

              const exerciseAssignDetails = document.getElementById(
                "exercise-assign-details"
              );
              const clonedexerciseAssignDetails =
                exerciseAssignDetails.cloneNode(true);
              clonedexerciseAssignDetails
                .querySelector("#table-container")
                .classList.remove(["create-exercise-table-hide"]);

              clonedexerciseAssignDetails.id =
                clonedexerciseAssignDetails.id + "-" + e.target.id;

              clonedexerciseAssignDetails.querySelector(
                'label[for="category"]'
              ).htmlFor = "category" + "-" + e.target.id;

              clonedexerciseAssignDetails.querySelector(
                'select[id="category"]'
              ).id = "category" + "-" + e.target.id;

              clonedexerciseAssignDetails.querySelector(
                'label[for="exerciseType"]'
              ).htmlFor = "exerciseType" + "-" + e.target.id;

              clonedexerciseAssignDetails.querySelector(
                'select[id="exerciseType"]'
              ).id = "exerciseType" + "-" + e.target.id;

              clonedexerciseAssignDetails.querySelector(
                'label[for="exerciseName"]'
              ).htmlFor = "exerciseName" + "-" + e.target.id;

              clonedexerciseAssignDetails.querySelector(
                'select[id="exerciseName"]'
              ).id = "exerciseName" + "-" + e.target.id;

              clonedexerciseAssignDetails
                .querySelector("#create-exercise")
                .classList.add(["create-exercise"]);
              clonedexerciseAssignDetails.querySelector("#create-exercise").id =
                "create-exercise" + "-" + e.target.id;

              clonedexerciseAssignDetails
                .querySelector("#create-exercise-heads")
                .classList.add(["create-exercise-heads"]);
              clonedexerciseAssignDetails.querySelector(
                "#create-exercise-heads"
              ).id = "create-exercise-heads" + "-" + e.target.id;

              clonedexerciseAssignDetails.querySelector(
                ".create-exercise-rows"
              ).id = "create-exercise-rows" + "-" + e.target.id;

              clonedexerciseAssignDetails.querySelector("#addSet-btn").id =
                "addSet-btn" + "-" + e.target.id;
              e.target.append(clonedexerciseAssignDetails);

              // var clonedexerciseAssignDetails = cloneExercise(exerciseAssignDetails)
              createExercise(e, clonedexerciseAssignDetails);
            }
          }
          // If its a block
          // if open ,then close it
          //console.log(e.target.lastChild.style.display);
          if (!e.target.classList.contains("exercise-buttons"))
            e.target.lastChild.style.display === "none" ||
            e.target.lastChild.style.display === ""
              ? expandItems(e.target)
              : shrinkItems(e.target);
        }

        // DELETION of BLOCKS OR EXERCISES : Handled both here.
        else if (
          e.target.classList.contains("delete-block-button") ||
          e.target.classList.contains("delete-exercise-button") ||
          e.target.tagName === "svg" ||
          e.target.tagName === "path"
        ) {
          // This condition is required since the Delete button of the dataTable for each Set should not delete the exercise or block
          if (
            e.target
              .closest("button")
              .classList.contains("delete-block-button") ||
            e.target
              .closest("button")
              .classList.contains("delete-exercise-button")
          ) {
            console.log("Clicked Delete block/Exercise button");
            const elemToRemove = e.target.closest("li");
            console.log("Deleting row", elemToRemove);
            e.target.classList.contains("delete-block-button")
              ? deleteItem(elemToRemove, blockListContainer)
              : deleteItem(elemToRemove, elemToRemove.parentElement);
          }
        }

        // ADDITION OF EXERCISES
        else if (e.target.classList.contains("add-exercise-button")) {
          console.log("Add an Exercise");
          e.preventDefault();
          e.stopPropagation();
          const parentBlock = e.target.closest("li");
          const exerciseNumber =
            parentBlock.lastChild.previousSibling.tagName === "LI"
              ? getIdValue(parentBlock.lastChild.previousSibling)
              : 1;

          // If this is the first exercise, create Exercise Container first
          //   if (
          //     !(
          //       e.target.closest("li").id === `block-${e.target.closest("li").id}`
          //     )
          //   ) {
          console.log("Creating exercises");

          const exercise_ = document.createElement("li");
          exercise_.textContent = `${parentBlock.id}-ex-${exerciseNumber}`;
          exercise_.id = `${parentBlock.id}-ex-${exerciseNumber}`;
          exercise_.classList.add(["exercise-buttons"]);
          let deleteExercisebtn = document.createElement("button");
          deleteExercisebtn.type = "button";
          deleteExercisebtn.classList.add(["delete-exercise-button"]);

          const svgString = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    class="bi bi-trash"
    viewBox="0 0 16 16"
  >
    //{" "}
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
    //{" "}
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
  </svg>`;
          deleteExercisebtn.innerHTML = svgString;
          exercise_.append(deleteExercisebtn);

          /////
          const exerciseAssignDetails = document.getElementById(
            "exercise-assign-details"
          );
          // Add the exercise button with details
          const clonedexerciseAssignDetails =
            exerciseAssignDetails.cloneNode(true);
          clonedexerciseAssignDetails
            .querySelector("#table-container")
            .classList.remove(["create-exercise-table-hide"]);

          clonedexerciseAssignDetails.id =
            clonedexerciseAssignDetails.id + "-" + exercise_.id;

          clonedexerciseAssignDetails.querySelector(
            'label[for="category"]'
          ).htmlFor = "category" + "-" + exercise_.id;

          clonedexerciseAssignDetails.querySelector(
            'select[id="category"]'
          ).id = "category" + "-" + exercise_.id;

          clonedexerciseAssignDetails.querySelector(
            'label[for="exerciseType"]'
          ).htmlFor = "exerciseType" + "-" + exercise_.id;

          clonedexerciseAssignDetails.querySelector(
            'select[id="exerciseType"]'
          ).id = "exerciseType" + "-" + exercise_.id;

          clonedexerciseAssignDetails.querySelector(
            'label[for="exerciseName"]'
          ).htmlFor = "exerciseName" + "-" + exercise_.id;

          clonedexerciseAssignDetails.querySelector(
            'select[id="exerciseName"]'
          ).id = "exerciseName" + "-" + exercise_.id;

          clonedexerciseAssignDetails
            .querySelector("#create-exercise")
            .classList.add(["create-exercise"]);
          clonedexerciseAssignDetails.querySelector("#create-exercise").id =
            "create-exercise" + "-" + exercise_.id;

          clonedexerciseAssignDetails
            .querySelector("#create-exercise-heads")
            .classList.add(["create-exercise-heads"]);
          clonedexerciseAssignDetails.querySelector(
            "#create-exercise-heads"
          ).id = "create-exercise-heads" + "-" + exercise_.id;

          clonedexerciseAssignDetails.querySelector(
            ".create-exercise-rows"
          ).id = "create-exercise-rows" + "-" + exercise_.id;

          clonedexerciseAssignDetails.querySelector("#addSet-btn").id =
            "addSet-btn" + "-" + exercise_.id;
          exercise_.append(clonedexerciseAssignDetails);

          createExercise(exercise_, clonedexerciseAssignDetails);
          // Keep in expanded form

          // const addExerciseBtn_ = document.createElement("button");
          // addExerciseBtn_.classList.add(["add-exercise-button"]);
          // addExerciseBtn_.textContent = "Add an Exercise";
          // block_.appendChild(addExerciseBtn_);
          // addExerciseBtn_.style.display = "block";

          //////

          parentBlock.insertBefore(exercise_, e.target);
          console.log(parentBlock.id);
        }
      });
    }

    // CREATION OF BLOCKS
    const block_ = document.createElement("li");
    let deleteBlockbtn = document.createElement("button");
    deleteBlockbtn.type = "button";
    deleteBlockbtn.classList.add(["delete-block-button"]);

    const svgString = `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-trash"
        viewBox="0 0 16 16"
      >
        //{" "}
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
        //{" "}
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
      </svg>`;
    deleteBlockbtn.innerHTML = svgString;

    const blockNameInput = document.createElement("input");
    blockNameInput.type = "text";
    blockNameInput.placeholder = "Enter block name";
    // blockNameInput.value = "Change Block Name";
    blockNameInput.required = true;

    blockNameInput.classList.add("form-control");
    block_.appendChild(blockNameInput);
    block_.append(deleteBlockbtn);
    //////////////////////////
    console.log("BlockListContainer ", blockListContainer);
    const prevBlock = blockListContainer.lastChild;

    console.log("Previous block:", [prevBlock]);
    const blockNumber =
      blockListContainer.lastChild !== null ? getIdValue(prevBlock) : 1;

    block_.id = `block-${blockNumber}`;

    //////////////////////////////////
    // console.log("BlockList containers", blockListContainer);
    // console.log("Block_", block_);
    blockListContainer.appendChild(block_);

    // Focus on the input field for block name upon creation
    blockNameInput.focus();

    // Add an Exercise and add it's details as well.
    // if (blockListContainer.childElementCount === 1) {
    // Add the exercise and it's details
    const parentBlock = block_;
    const exerciseNumber =
      parentBlock.lastChild.previousSibling.tagName === "LI"
        ? getIdValue(parentBlock.lastChild.previousSibling)
        : 1;

    console.log("Creating exercises");

    const exercise_ = document.createElement("li");

    exercise_.textContent = `${parentBlock.id}-ex-${exerciseNumber}`;
    exercise_.id = `${parentBlock.id}-ex-${exerciseNumber}`;
    exercise_.classList.add(["exercise-buttons"]);
    let deleteExercisebtn = document.createElement("button");
    deleteExercisebtn.type = "button";
    deleteExercisebtn.classList.add(["delete-exercise-button"]);

    const svgString2 = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    class="bi bi-trash"
    viewBox="0 0 16 16"
  >
    //{" "}
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
    //{" "}
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
  </svg>`;
    deleteExercisebtn.innerHTML = svgString2;
    exercise_.append(deleteExercisebtn);
    parentBlock.appendChild(exercise_);
    console.log(parentBlock.id);

    const exerciseAssignDetails = document.getElementById(
      "exercise-assign-details"
    );
    // Add the exercise button with details
    const clonedexerciseAssignDetails = exerciseAssignDetails.cloneNode(true);
    clonedexerciseAssignDetails
      .querySelector("#table-container")
      .classList.remove(["create-exercise-table-hide"]);

    clonedexerciseAssignDetails.id =
      clonedexerciseAssignDetails.id + "-" + exercise_.id;

    clonedexerciseAssignDetails.querySelector('label[for="category"]').htmlFor =
      "category" + "-" + exercise_.id;

    clonedexerciseAssignDetails.querySelector('select[id="category"]').id =
      "category" + "-" + exercise_.id;

    clonedexerciseAssignDetails.querySelector(
      'label[for="exerciseType"]'
    ).htmlFor = "exerciseType" + "-" + exercise_.id;

    clonedexerciseAssignDetails.querySelector('select[id="exerciseType"]').id =
      "exerciseType" + "-" + exercise_.id;

    clonedexerciseAssignDetails.querySelector(
      'label[for="exerciseName"]'
    ).htmlFor = "exerciseName" + "-" + exercise_.id;

    clonedexerciseAssignDetails.querySelector('select[id="exerciseName"]').id =
      "exerciseName" + "-" + exercise_.id;

    clonedexerciseAssignDetails
      .querySelector("#create-exercise")
      .classList.add(["create-exercise"]);
    clonedexerciseAssignDetails.querySelector("#create-exercise").id =
      "create-exercise" + "-" + exercise_.id;

    clonedexerciseAssignDetails
      .querySelector("#create-exercise-heads")
      .classList.add(["create-exercise-heads"]);
    clonedexerciseAssignDetails.querySelector("#create-exercise-heads").id =
      "create-exercise-heads" + "-" + exercise_.id;

    clonedexerciseAssignDetails.querySelector(".create-exercise-rows").id =
      "create-exercise-rows" + "-" + exercise_.id;

    clonedexerciseAssignDetails.querySelector("#addSet-btn").id =
      "addSet-btn" + "-" + exercise_.id;
    exercise_.append(clonedexerciseAssignDetails);

    createExercise(exercise_, clonedexerciseAssignDetails);
    // Keep in expanded form

    const addExerciseBtn_ = document.createElement("button");
    addExerciseBtn_.classList.add(["add-exercise-button"]);
    addExerciseBtn_.textContent = "Add an Exercise";
    block_.appendChild(addExerciseBtn_);
    addExerciseBtn_.style.display = "block";
  }
});

// Function for changing the Block Names :  Write a function to make it editable.✅
blockAssignTabs.addEventListener("change", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.tagName === "INPUT" && e.target.parentElement.tagName !== "TD") {
    if ((e.target.readOnly = true)) e.target.readOnly = false;
    else e.target.readOnly = true;
    //   e.target.closest("li").id = `block-${e.target.value}`;
    console.log("CHANGING EXERCISE ID AS WELL .... ");
    e.target.closest("li").id = `${
      e.target.closest("li").id
    }-${e.target.value.replace(/\s+/g, "-")}`;
    e.target.style.backgroundColor = "#0077b8";
    e.target.style.color = "#fff";
  }
});

// Function to get the ID value. Prevents conflict of ID numbers
function getIdValue(element) {
  console.log("Getting previous element", element);
  // Using regular expression to extract the number
  const id = element.id;

  //   const match = id.match(/block-\w+-ex-(\d+)/);
  // const match = id.match(/block-[^]+-ex-(\d+)/);

  const match = id.includes(`${id}-ex-`)
    ? id.match(/[^]+-ex-(\d+)/)
    : id.match(/[^]+-(\d+)/);
  if (match && match[1]) {
    const extractedNumber = parseInt(match[1], 10);
    console.log(extractedNumber);
    return extractedNumber + 1;
  } else {
    console.log("Number extraction failed");
  }
}

let isEventAdded = false;

// Function so save the workout
function SaveWorkout(SampleWorkoutData) {
  const Structure_ = document.querySelector("#blocks-container");
  if (Structure_ === (undefined || null)) {
    console.log("I'm here inside");
    workoutErrorMessage.textContent = "No blocks defined";
    return false;
  }
  const blocks = Structure_.childNodes;
  if (blocks.length > 0) {
    for (const block of blocks) {
      console.log("Block", block);

      if (block.childNodes[0].value === "") {
        // Enter block name
        workoutErrorMessage.textContent = "Block names should not be empty";
        return false;
      }
      if (!SampleWorkoutData.blocks.some((item) => item.block_id === block.id))
        SampleWorkoutData.blocks.push({
          test_block_id: block.id,
          name: block.childNodes[0].value,
          exercises: [],
        });
      const selectedBlockIndex = findBlockIndex(
        SampleWorkoutData.blocks,
        block.id
      );
      console.log("selectedBlockIndex", selectedBlockIndex);
      const exercises = block.querySelectorAll(".exercise-buttons");
      console.log(exercises);
      if (exercises.length <= 0) {
        workoutErrorMessage.textContent = "No exercises found";
        return false;
      }
      for (const exercise of exercises) {
        console.log(exercise);
        if (
          !SampleWorkoutData.blocks[selectedBlockIndex].exercises.some(
            (item) => item.exercise_id === exercise.id
          )
        ) {
          const loadsRepsSets = FormatExerciseData(
            DataTableExerciseList[exercise.id]
          );

          SampleWorkoutData.blocks[selectedBlockIndex].exercises.push({
            test_exercise_id: exercise.id,
            name: exercise.querySelector(`#exerciseName-${exercise.id}`)
              .options[
              exercise.querySelector(`#exerciseName-${exercise.id}`)
                .selectedIndex
            ].textContent,
            exercise_class: "exercise-buttons",
            sets: loadsRepsSets.sets,
            loads_reps: {
              coach: loadsRepsSets.loadsRepsArray,
            },
            exCat: exercise.querySelector(`#category-${exercise.id}`).options[
              exercise.querySelector(`#category-${exercise.id}`).selectedIndex
            ].textContent,
            exType: exercise.querySelector(`#exerciseType-${exercise.id}`)
              .options[
              exercise.querySelector(`#exerciseType-${exercise.id}`)
                .selectedIndex
            ].textContent,
          });
        }
      }
    }
    return true;
  } else {
    workoutErrorMessage.textContent = "No blocks defined";
    return false;
  }
}
// Function to Create the exercise : Exercise Details
function createExercise(e, createexerciseAssignDetails) {
  const clickedExerciseButton = e.target === undefined ? e : e.target;
  console.log(
    `Exercise Button `,
    clickedExerciseButton,
    clickedExerciseButton.id
  );
  // console.log(`Selected Block`, blockClicked);
  // Create the exercise.
  console.log(
    `createexerciseAssignDetails Table `,
    createexerciseAssignDetails
  );
  let categorySelect = "";
  let exerciseTypeSelect = "";
  let exerciseNameSelect = "";

  categorySelect = createexerciseAssignDetails.querySelector(
    `#category-${clickedExerciseButton.id}`
  );
  exerciseTypeSelect = createexerciseAssignDetails.querySelector(
    `#exerciseType-${clickedExerciseButton.id}`
  );
  exerciseNameSelect = createexerciseAssignDetails.querySelector(
    `#exerciseName-${clickedExerciseButton.id}`
  );

  console.log(categorySelect);
  console.log(exerciseTypeSelect);
  console.log(exerciseNameSelect);
  // Execute
  // Get the selected option
  fetchData("/categories", { coach_id: coachId }, function (data) {
    console.log("I AM FETCHING NOW");
    populateDropdown(categorySelect, data.categories);
    console.log("Data after populate", data);

    updateExerciseTypes(categorySelect, exerciseTypeSelect, exerciseNameSelect); // Update exercise types after populating categories
  });

  categorySelect.addEventListener("change", function () {
    updateExerciseTypes(categorySelect, exerciseTypeSelect, exerciseNameSelect);
  });

  //   // Event listener for exercise type dropdown change

  exerciseTypeSelect.addEventListener("change", function () {
    updateExerciseNames(categorySelect, exerciseTypeSelect, exerciseNameSelect);
  });

  exerciseNameSelect.addEventListener("click", (e) => {
    // Required to change TEXTNODES textContent only
    e.target.closest("li").childNodes[0].textContent =
      exerciseNameSelect.options[exerciseNameSelect.selectedIndex].textContent;
  });

  //   const dataTable = $("#create-exercise").DataTable();

  // CREATION OF THE DATATABLE
  $(document).ready(function () {
    const dataTableExercise = $(
      `#${createexerciseAssignDetails.querySelector("table").id}`
    ).DataTable({
      searching: false,
      info: false,
      pageLength: 5,
      lengthMenu: [0, 5, 10, 20, 50, 100],
      stateSave: true,
    });

    DataTableExerciseList[createexerciseAssignDetails.parentElement.id] =
      dataTableExercise;
    var key_ = createexerciseAssignDetails.parentElement.id;
    key_ = key_.replace("addSet-btn-", "");
    console.log("Key_.", key_);
    console.log("Parent", createexerciseAssignDetails.parentElement);
    addSingleSet(
      createexerciseAssignDetails.parentElement,
      DataTableExerciseList[key_]
    );
  });
}

// Function to simulate a change event on an element
function triggerChangeEvent(element) {
  const event = new Event("change", { bubbles: false });
  element.dispatchEvent(event);
}

function checkExerciseCat(searchString, categorySelect) {
  if (categorySelect.options && categorySelect.options.length > 0) {
    const optionsArray = Array.from(categorySelect.options || []);

    const matchingOption = optionsArray.find(
      (option) => option.textContent === searchString
    );

    if (matchingOption) {
      categorySelect.value = matchingOption.value;
      console.log("Category Value : ", categorySelect.value);
    } else {
      console.log(`Option with text Category "${searchString}" not found.`);
    }
  } else if (categorySelect.options) {
    // If options exists but is not an array or array-like
    const option = categorySelect.options;

    if (option.textContent === searchString) {
      categorySelect.value = option.value;
      console.log("Category Value : ", categorySelect.value);
    } else {
      console.log(`Option with text Category "${searchString}" not found.`);
    }
  } else {
    console.log(`No options found in categorySelect.`);
  }
}

function checkExerciseType(searchString, exerciseTypeSelect) {
  if (exerciseTypeSelect.options && exerciseTypeSelect.options.length > 0) {
    const optionsArray = Array.from(exerciseTypeSelect.options || []);

    const matchingOption = optionsArray.find(
      (option) => option.textContent === searchString
    );

    if (matchingOption) {
      exerciseTypeSelect.value = matchingOption.value;
      console.log("exerciseTypeSelect Value : ", exerciseTypeSelect.value);
    } else {
      console.log(`Option with text  Type "${searchString}" not found.`);
    }
  } else if (exerciseTypeSelect.options) {
    // If options exists but is not an array or array-like
    const option = exerciseTypeSelect.options;

    if (option.textContent === searchString) {
      exerciseTypeSelect.value = option.value;
      console.log("exerciseTypeSelect Value : ", exerciseTypeSelect.value);
    } else {
      console.log(`Option with text Type "${searchString}" not found.`);
    }
  } else {
    console.log(`No options found in exerciseTypeSelect.`);
  }
}

function checkExerciseName(searchString, exerciseNameSelect) {
  if (exerciseNameSelect.options && exerciseNameSelect.options.length > 0) {
    const optionsArray = Array.from(exerciseNameSelect.options || []);

    const matchingOption = optionsArray.find(
      (option) => option.textContent === searchString
    );

    if (matchingOption) {
      exerciseNameSelect.value = matchingOption.value;
      console.log("exerciseName Value : ", exerciseNameSelect.value);
    } else {
      console.log(
        `Option with text  ExerciseName "${searchString}" not found.`
      );
    }
  } else if (exerciseNameSelect.options) {
    // If options exists but is not an array or array-like
    const option = exerciseNameSelect.options;

    if (option.textContent === searchString) {
      exerciseNameSelect.value = option.value;
      console.log("exerciseName Value : ", exerciseNameSelect.value);
    } else {
      console.log(`Option with text ExerciseName "${searchString}" not found.`);
    }
  } else {
    console.log(`No options found in exerciseNameSelect.`);
  }
}

function findBlockIndex(blocks, blockId) {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].test_block_id === blockId) {
      return i;
    }
  }
  return -1; // Return -1 if not found
}

function findExerciseIndex(exercises, exerciseId) {
  for (let i = 0; i < exercises.length; i++) {
    if (exercises[i].test_exercise_id === exerciseId) {
      return i;
    }
  }
  return -1; // Return -1 if not found
}

function checkExerciseExists(exercise) {
  console.log("Inside Check Exiercise");
  //   console.log("Block ID here ", block_id);
  console.log("Exercise ID here ,", exercise.id);
  const exerciseAssignDetail = exercise.querySelector(
    `#exercise-assign-details-${exercise.id}`
  );

  if (exerciseAssignDetail) {
    console.log("Exercise Exists");
    return true;
  } else {
    console.log("No loads reps found");
    return false;
  }
}

// Handle the "Assign Workout" button
$("#saveChangesButton").on("click", function (e) {
  athleteId = Number(athletePicker.options[athletePicker.selectedIndex].id);
  teamId = Number(teamPicker.options[teamPicker.selectedIndex].id);
  if (SampleWorkoutData.name) {
    SampleWorkoutData = JSON.parse(JSON.stringify(DefaultsampleWorkoutData));
  }
  console.log(SampleWorkoutData);
  e.preventDefault();
  workoutSuccessMessage.textContent = "";
  workoutErrorMessage.textContent = "";
  console.log("Team ID", teamId);
  if (teamId === "null") teamId = null;
  if (athleteId === "null") athlete = null;
  console.log("athleteId ID", athleteId);
  // athleteId = athleteId === "null" ? null : Number(athleteId);
  // teamId = teamId === "null" ? null : Number(teamId);
  // coachId = coachId === "null" ? null : Number(coachId);
  const workOutName = document.getElementById("workout-name").value;
  console.log("Workout", workOutName);
  const validation = validateWorkoutData(
    workOutName,
    datePicker.value,
    coachId,
    teamId,
    athleteId
  );

  console.log("Validation,", validation);
  if (!validation.error) {
    const status = SaveWorkout(SampleWorkoutData);

    if (status) {
      SampleWorkoutData = SampleWorkoutDataFormatter(
        SampleWorkoutData,
        workOutName,
        datePicker.value,
        coachId,
        teamId,
        athleteId
      );

      console.log("This is the workout", workOutName);
      // Get the new team name from the input field

      // Send a PUT request to update the team name
      // Send the entries to database
      // TODO:
      fetch("/addTestWorkoutAndAssign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SampleWorkoutData),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("This is the data", data);

          if (data.Success) {
            SampleWorkoutData.test_workout_id = data.workout_id;
            console.log("Successful");
            workoutSuccessMessage.textContent = `${workOutName} ${data.Success}`;
          } else if (data.workoutExists) {
            workoutErrorMessage.textContent = `${workOutName} ${data.workoutExists}`;
          } else {
            console.log("Unsuccefful");
            workoutErrorMessage.textContent = `${workOutName} ${data.error}`;
          }
        })
        .catch((error) => {
          console.log(error);
          console.log({ error: "Failed to store data on server" });
        });
    } else {
      // workoutErrorMessage.textContent =
      //   "Invalid Blocks: Block Name should not be empty or Assign atleast 1 exercise";
      return false;
    }
  } else {
    workoutErrorMessage.textContent = validation.error;
  }
});

function SampleWorkoutDataFormatter(
  SampleWorkoutData,
  WorkoutName,
  dateAdded,
  coachId,
  teamId = null,
  athleteId = null
) {
  SampleWorkoutData.name = WorkoutName;
  SampleWorkoutData.date_added = dateAdded;
  SampleWorkoutData.coach_id = coachId;
  SampleWorkoutData.team_id = teamId; // Add teamId
  SampleWorkoutData.athlete_id = athleteId;

  console.log("This is the workout", SampleWorkoutData);
  return SampleWorkoutData;
}

function validateWorkoutData(
  workoutName,
  dateAdded,
  coachId,
  teamId,
  athleteId
) {
  if (workoutName !== "") console.log("-------Valid Workout Name-------");
  else return { error: "Enter a Valid Workout Name" };
  if (Number(teamId) || Number(athleteId))
    console.log("-----Atleast one is Valid-----");
  else return { error: "Select atleast teamId or athleteId" };
  if (dateAdded === undefined)
    return { error: "Error formatting date. Contact developer" };
  return true;
}

// Handle the "Return" button
$("#returnButton").click(function (e) {
  // Prevent the default behavior of the anchor element
  e.preventDefault();

  // Display a confirmation dialog
  var confirmReturn = window.confirm(
    "Are you sure you want to return? Any unsaved changes will be lost."
  );

  // Check if the user confirmed
  if (confirmReturn) {
    // Redirect to the previous page (coachLanding)
    window.location.href = "/coachLanding";
  } else {
    // If the user cancels, close the confirmation dialog
    // This ensures that the dialog is closed even on the first click
    return;
  }
});

function formatAthleteEntries(inputLoads) {
  let transformedLoads = inputLoads.map((load) => ({ load: load }));
  transformedLoads = JSON.stringify({
    athlete_id: athleteId,
    input_load: transformedLoads,
    test_exercise_id: currentExerciseId,
    date: currentDate,
  });
  console.log(transformedLoads);
  return transformedLoads;
}

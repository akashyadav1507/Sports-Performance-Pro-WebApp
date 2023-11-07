"use strict";
const team_nodes = document.querySelectorAll(".team-nodes");
const btnCloseModal = document.querySelector(".close-modal");
const btnshowModal = document.querySelectorAll(".show-modal"); //
const block_nodes = document.querySelectorAll(".block-nodes");
const exercise_nodes = document.querySelectorAll(".exc_nodes");
const teamTrainTree = document.querySelector(".team-train-sessions");
let trainCount = document.querySelectorAll(".team-nodes").length;
const addExerciseSkeleton = document.getElementById("addExercise");

// console.log(addExerciseSkeleton);
/*
const createBlockButton = document.getElementById("createBlock-btn"); // Change to class --> By ID does'nt work since everywhere a block is required
const addExerciseButton = document.getElementById("addExercise-btn"); // Change to class --> By ID does'nt work since everywhere a block is required
//console.log(block_nodes);
*/

//=============================================
const categorySelect = document.getElementById("category");
const exerciseTypeSelect = document.getElementById("exerciseType");
const exerciseNameSelect = document.getElementById("exerciseName");
const addExerciseButton = document.getElementById("add-exercise-button");
const closeExerciseButton = document.getElementById("closeFormButton");
let jsonData = "";
const exerciseData = {
  Cardio: {
    Treadmill: ["Running"],
    Elliptical: ["Elliptical training"],
    "Stationary bike": ["Cycling"],
    "Rowing machine": ["Rowing"],
    "Stair climber": ["Stair climbing"],
  },
  "Strength training": {
    Push: ["Bench press", "Overhead press", "Push-ups", "Machine chest press"],
    Pull: [
      "Pull-ups",
      "Lat pulldown",
      "Barbell row",
      "Dumbbell row",
      "Cable row",
    ],
    "Hip hinge": [
      "Deadlift",
      "Good morning",
      "Romanian deadlift",
      "Clean",
      "Kettlebell swing",
    ],
    Squat: [
      "Squat",
      "Front squat",
      "Bulgarian split squat",
      "Goblet squat",
      "Leg press",
    ],
  },
  Core: {
    Plank: ["Plank", "Side plank", "Knee raise plank", "Hollow body hold"],
    Crunches: ["Crunches", "Leg raises", "Sit-ups"],
    "Russian twists": ["Russian twists"],
  },
  Yoga: {
    "Downward-facing dog": ["Downward-facing dog"],
    "Warrior I pose": ["Warrior I pose"],
    "Triangle pose": ["Triangle pose"],
    "Tree pose": ["Tree pose"],
    "Bridge pose": ["Bridge pose"],
  },
};

const createEl = function (element, textContent, _classList, _visibility) {
  const el = document.createElement(element);
  el.textContent = textContent;
  console.log(_classList);
  _classList = _classList.split(" ");
  el.classList.add(_classList[0]); // button type
  el.classList.add(_classList[1]); // section : block or exercise
  el.classList.add(_classList[2]); // hidden
  el.setAttribute("visibility", _visibility);
  return el;
};

const btnBlockElem = createEl(
  "button",
  "Add a Block",
  "createBlock-btn block-nodes hidden",
  0
);

const btnExerciseElem = createEl(
  "button",
  "Add an Exercise",
  "addExercise-btn exc_nodes hidden",
  0
);

categorySelect.addEventListener("change", updateExerciseTypes);
exerciseTypeSelect.addEventListener("change", updateExerciseNames);

function updateExerciseTypes() {
  console.log("Inside Update SELECTION--------------");
  const selectedCategory = categorySelect.value;
  console.log(categorySelect.value);
  exerciseTypeSelect.innerHTML = "";
  exerciseNameSelect.innerHTML = "";

  if (exerciseData[selectedCategory]) {
    const exerciseTypes = Object.keys(exerciseData[selectedCategory]);
    exerciseTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      exerciseTypeSelect.appendChild(option);
    });
  }
  updateExerciseNames();
}

function updateExerciseNames() {
  const selectedCategory = categorySelect.value;
  const selectedExerciseType = exerciseTypeSelect.value;
  exerciseNameSelect.innerHTML = "";
  if (
    exerciseData[selectedCategory] &&
    exerciseData[selectedCategory][selectedExerciseType]
  ) {
    exerciseData[selectedCategory][selectedExerciseType].forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      exerciseNameSelect.appendChild(option);
    });
  }
}

// Create the new element from JSON data
function createJsonEl(element, jsonData) {
  console.log("INSIDE CREATE JSON ELEMENT FUNCTION");
  console.log(jsonData);
  console.log(element);
  for (const key in jsonData) {
    if (jsonData.hasOwnProperty(key)) {
      const itemElement = document.createElement("div");
      itemElement.className = "json-item";

      const keyElement = document.createElement("span");
      keyElement.className = "json-key";
      keyElement.textContent = key;
      // console.log(keyElement.textContent);

      const valueElement = document.createElement("span");
      valueElement.className = "json-value";
      valueElement.textContent = jsonData[key];
      // console.log(valueElement.textContent);

      itemElement.appendChild(keyElement);
      itemElement.appendChild(valueElement);
      element.appendChild(itemElement);
    }
  }
}

// Initial population of Exercise Types
updateExerciseTypes();

// Save Exercise Button Click Event

function resetExercises() {
  const selectedCategory = categorySelect.value;
  // exerciseTypeSelect.innerHTML = "";
  // exerciseNameSelect.innerHTML = "";
  document.getElementById("loads").value = "";
  document.getElementById("reps").value = "";
  document.getElementById("sets").value = "";
}

closeExerciseButton.addEventListener("click", function (event) {
  updateExerciseTypes();
  resetExercises();
  addExerciseSkeleton.style.display = "none";
});

// console.log(btnBlockElem, typeof btnBlockElem);
// console.log(btnExerciseElem);

// console.log(team_nodes);
// Adding Add a block button at end of each Team displayed✅
team_nodes.forEach((t) => {
  const tParent = t.querySelector("ul");
  //console.log(tParent);
  // TODO: BUG USING normal append, appends the sampe element to various nodes.✅
  // FIX : Using clone of the node
  tParent.appendChild(btnBlockElem.cloneNode(true)); // Use cloneNode to create a new button each time
  //console.log(tParent);
  //console.log("-----------------");
});

// TODO: Adding add an exercise button at end of each block✅
block_nodes.forEach((b) => {
  const bParent = b.querySelector("ul");
  //console.log(bParent);
  // TODO: BUG USING normal append, appends the sampe element to various nodes.✅
  // FIX : Using clone of the node
  bParent.appendChild(btnExerciseElem.cloneNode(true)); // Use cloneNode to create a new button each time
  //console.log(bParent);
  //console.log("-----------------");
});

// Add click event listeners to tree nodes
// TODO: Refactor to use Event delegation on the main training container

// When Closing the Team click , Refactor as above to have single event handler. Used class to change functionaloty. Might need refactoring further for DRY principle.

// TODO:
// BUG: Shrking team/athlete list does not work
// BUG:
// FEATURE: Delete an exercise, block button
// FEATURE: Modify an exercise, block button.
// FEATURE: While adding the block, block name user input is required
// FEATUER: WHile adding the exercise, exercise name user input is required.
// FEATURE: Changing Block name.
// FEATUER: Changing Exercise name.

team_nodes.forEach((t) =>
  t.addEventListener("click", (e) => {
    const target = e.target;
    console.log(`Outer Target:`, target);

    let vis_ = target.getAttribute("visibility");
    //console.log("Visibility of Target:", vis_);

    // EXERCISE node clicked
    if (target.classList.contains("exc_nodes")) {
      console.log("The EXERICSE NODE IS CLICKED:");
      //   let vis_ = target.getAttribute("visibility");
      //   console.log(target);

      // ADD EXERCISE button :

      if (target.classList.contains("addExercise-btn")) {
        // ADD A NEW Exercise
        console.log("Clicked ADD AN EXERCISE button");

        //console.log(exerciseAdd);
        addExerciseSkeleton.style.display = "block";

        const exerciseAdd = document.createElement("div");

        exerciseAdd.classList.add("exDisplay"); // Changed to id
        console.log("The Exercise div: ", exerciseAdd);
        //============================
        // Create a new list item

        const newExercise = document.createElement("li");

        // Add the visibility and class
        newExercise.classList.add("exc_nodes");

        // SET visibility of the list to 1 , since we want to see the results of the Exercises added immediately
        // BUG : visibility = 0 . The Exercise added button has to be clicked twice to reset the visibility ✅
        // FIX : set visibility during creation.
        newExercise.setAttribute("visibility", 1);

        newExercise.textContent = "New Exercise added"; // MAKE THIS NAME =
        //EXERCISE NAME
        // target = New Exercise button
        // parentElement = immediate block
        // Insert this new Exercise li element before the Add Exercise Button

        // FIXME: ADD EXERCISE BUTTON IN DIALOGUE BOX  // THIS CODE IS INCREASING CUMULATIVELY WITH EACH CLICK
        // FIX: MOVE THE ADDEVENT LISTENER OUTSIDE. KEEP TRACK OF THE TARGET click event separate so as to not interfere with the previous addEventListener
        addExerciseButton.addEventListener("click", (event) => {
          console.log("Clicked 'ADD EXERCISE'");
          const countNodes = document.querySelectorAll(".exc_nodes");
          console.log("CountNodes of ExDisplay", countNodes);
          event.preventDefault(); // Prevent form submission

          //============================

          console.log("I am getting the value now");

          const loadsValue = document.getElementById("loads").value;
          const repsValue = document.getElementById("reps").value;
          const setsValue = document.getElementById("sets").value;
          const category = document.getElementById("category").value;
          const exerciseName = document.getElementById("exerciseName").value;
          const exerciseType = document.getElementById("exerciseType").value;
          console.log(`LOADs ${loadsValue}`);
          console.log(`REPS ${repsValue}`);
          console.log(`SETS ${setsValue}`);

          if (!loadsValue || !repsValue || !setsValue) {
            console.log(`I'm here the bug`);
            alert(
              "Please fill in all the required fields (Loads, Reps, and Sets)."
            );
          } else {
            console.log("THIS IS THE FORM DATA JSON");
            // Form submission:
            // Create a JSON object

            const formData = {
              loadsValue: loadsValue,
              repsValue: repsValue,
              setsValue: setsValue,
              category: category,
              exerciseName: exerciseName,
              exerciseType: exerciseType,
            };

            // Send back to DATABASE
            updateExerciseTypes();
            resetExercises();
            if (formData) {
              // Call the function
              console.log("CONVERTING TO JSON FUNCTION");
              // console.log(jsonData);
              // console.log(exerciseAdd);
              createJsonEl(exerciseAdd, formData);
              console.log("The New EXERCISE element", newExercise);
              console.log("The New Exercise div element", exerciseAdd);
              //console.log(exerciseAdd);
              // newExercise.parentElement.insertBefore(exerciseAdd, newExercise);
              console.log("CHECK THESE PARAMETERS AGAINS!!!!!!!!!!!|");
              console.log(target);
              console.log(target.parentElement);
              console.log(exerciseAdd);
              console.log(newExercise);

              // Entries are added now and are in the exerciseAdd element. Append this to the target
              addExerciseSkeleton.style.display = "none";
            }
          }
          newExercise.appendChild(exerciseAdd); // ---> This one is right , no issues
          target.parentElement.insertBefore(newExercise, target); //
        });
      } else {
        // EXPAND/SHRINK the Exercise node
        const div_ex = target.querySelector(".exDisplay");
        console.log("Clicked an EXISTING EXERCISE BUTTON");
        if (Number(vis_) === 0) {
          console.log("EXERCISE TREE IS EXPANDING NOW");
          // EXPAND THE EXDERCISE TREE
          div_ex.classList.contains(["hidden"])
            ? div_ex.classList.remove(["hidden"])
            : null;
          target.setAttribute("visibility", 1);
        } else {
          console.log("EXERCISE TREE IS SHRIKING NOW");
          // SHRINK THE EXDERCISE TREE
          const div_ex = target.querySelector(".exDisplay");
          //console.log(div_ex);
          div_ex.classList.add(["hidden"]);
          target.setAttribute("visibility", 0);
        }
      }
    }

    // BLOCK node clicked
    if (target.classList.contains("block-nodes")) {
      console.log("Entered block function");
      // console.log(`Inner Target:`, target);
      let vis_ = target.getAttribute("visibility");
      //console.log(vis_);
      //console.log(target);
      if (target.classList.contains("createBlock-btn")) {
        // ADD A NEW BLOCK
        // Keep a count of the current elements in the list : Not required, using insertBefore
        // const blockCount = target.parentElement.children;
        // console.log(blockCount);
        // console.log(target.parentElement);
        // const block = target;
        //        console.log(`createBlockButton:`, target);
        // Create a new list item
        let newBlock = document.createElement("li");
        // Add the visibility and class
        newBlock.classList.add("block-nodes");

        newBlock.setAttribute("visibility", 0);

        newBlock.textContent = "New Block added"; // Create a Block input field

        // ADDING NEW Exercise button inside newly created block
        let newExerciseButton = document
          .createElement("ul")
          .appendChild(btnExerciseElem.cloneNode(true));
        console.log(newExerciseButton);
        newBlock.appendChild(newExerciseButton);

        target.parentElement.insertBefore(newBlock, target);
      }
      if (Number(vis_) === 0) {
        console.log("Entered inner block function ");
        // Expand Block Tree
        // console.log(target)
        const exc_nodes = target.querySelectorAll(".exc_nodes");
        //console.log(exc_nodes);
        exc_nodes.forEach((ex) => ex.classList.remove(["hidden"]));
        target.setAttribute("visibility", 1);
      } else {
        // Shrink Tree
        const exc_nodes = target.querySelectorAll(".exc_nodes");
        //console.log(exc_nodes);
        exc_nodes.forEach((t) => t.classList.add(["hidden"]));
        target.setAttribute("visibility", 0);
      }
      // }
    }
    // TEAM/ATHLETE Name is clicked
    else if (target.classList.contains("team-nodes")) {
      if (Number(vis_) === 0) {
        // Expand Tree
        console.log("Entered Parent Team function ");
        // console.log(target)
        const block_nodes = target.querySelectorAll(".block-nodes");
        //console.log(block_nodes);
        block_nodes.forEach((t) => t.classList.remove(["hidden"]));
        target.setAttribute("visibility", 1);
        //console.log(target.querySelectorAll(".block-nodes"));
        //console.log(target);
        //
      } else {
        // Shrink Tree : NOTE while shrinking Tree, both the block and exc should become hidden
        // console.log(e.target);
        const block_nodes = target.querySelectorAll(".block-nodes");
        // console.log(block_nodes);
        block_nodes.forEach((b) => {
          if (b.childElementCount) {
            //   console.log("EXEC NODES TO BE PRINTED");
            //   t.classList.add(["hidden"]);
            //console.log(t.querySelectorAll(".exc_nodes"));
            b.querySelectorAll(".exc_nodes").forEach((e) => {
              // BUG: DID not check if the new exercise added block has child nodes. As a result error seen during setting "visibility" and ["hidden"] attributes of non-exitent child nodes✅
              // FIX: use hasChildNodes to check if childNodes exis

              if (e.childElementCount) {
                // console.log(e);
                // console.log(e.childElementCount);
                // console.log("=============ERROR==========");
                // Hide the node and change visibility class to 0
                e.querySelectorAll(".exDisplay").forEach((ex) => {
                  ex.setAttribute("visibility", 0);
                  ex.classList.add(["hidden"]);
                });
                e.setAttribute("visibility", 0);
                e.classList.add(["hidden"]);
                e.querySelector(".ex").setAttribute("visibility", 0);
                e.querySelector(".ex").classList.add(["hidden"]);
              }
              e.querySelector(".ex").setAttribute("visibility", 0);
              e.querySelector(".ex").classList.add(["hidden"]);
              e.setAttribute("visibility", 0);
              e.classList.add(["hidden"]);
            });
          }
          //   block_nodes.forEach((b) => {
          //     b.classList.add(["hidden"]);
          //     b.setAttribute(vis);
          //   });
          b.classList.add(["hidden"]);
          b.setAttribute("visibility", 0);
        });
        // block_nodes.setAttribute("visibility", 0);
        // block_nodes.classList.add(["hidden"]);
        target.setAttribute("visibility", 0);
      }
    }
  })
);

// JavaScript for team/Athlete search
document.getElementById("team-search").addEventListener("keyup", function () {
  const searchText = this.value.toLowerCase();
  //console.log(searchText);
  const teamList = document.querySelectorAll(".team-nodes");
  //console.log(teamList);
  teamList.forEach(function (team) {
    //console.log(team);
    const teamName = team.outerText.toLowerCase();
    //console.log(teamName);
    if (teamName.includes(searchText)) {
      team.style.display = "";
    } else {
      team.style.display = "none";
    }
  });
});

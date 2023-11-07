// ADMIN ATHLETE LANDING PAGE
// JAVASCRIPT delegation
// Get the elements by their ID
"use strict";
const getButtonclass = document.querySelector(".buttons__");
const deletePopUp = document.getElementById("popup-window-delete");
const modifyPopUp = document.getElementById("popup-window-modify");

// For delete Pop-up
const cancelButton = document.getElementById("delete__cancel");
const deleteButton = document.getElementById("delete__confirm");

// For Modify Pop-up
const cancelModButton = document.getElementById("modify__cancel");
const modifyButton = document.getElementById("modify__confirm");

// For modifying a coach
const modCoachButton = document.getElementById("modify_coach");
const modCoachDialogBox = document.getElementById("mod_coach_dialog");
const modCoachForm = document.getElementById("mod_coach_form");
const cancelModCoach = document.getElementById("cancel_modCoach");
const submitModCoach = document.getElementById("mod_submit_");

// For adding a coach
const addCoachButton = document.getElementById("add_coach");
const tableCoach = document.querySelector("#coach__table tbody");
const addCoachDialogBox = document.getElementById("add_coach_dialog");
const addCoachForm = document.getElementById("add__coach_form");
const cancelAddCoach = document.getElementById("cancel_addCoach");
const submitAddCoach = document.getElementById("submit_");
// Hide the pop-up window when the close button is clicked

let coachRecover = [];

// DELETE AND MODIFY BUTTONS ON THE TABLE ENTRY

getButtonclass.addEventListener("click", function (e) {
  const targ_c = e.target.closest("tr"); // Find closest parent `tr` for the button
  console.log(e.target.classList);
  if (e.target.classList.contains("delete-button")) {
    // DELETE THE USER ENTRY
    console.log("DELETE A BUTTON POPUP");
    deletePopUp.style.display = "block";
    const targ_c = e.target.closest("tr");
    console.log(targ_c);
    deleteButton.addEventListener("click", function (e) {
      console.log("Inside Delete");
      // Find the parent row
      // Extract data from the row and perform modification
      console.log("Deleted row", targ_c);
      coachRecover.push(targ_c);
      console.log(coachRecover);
      targ_c.remove();
      // Functionality to delete the element on the backend and update HTML
      // Back-end stuff
      // PENDING: Add function clicking Delete , popup with delete
      // Delete user from the table
      deletePopUp.style.display = "none";
    });
    // CANCEL BUTTON
    cancelButton.addEventListener("click", function (e) {
      console.log("Cancelled the delete");
      // Do nothing
      deletePopUp.style.display = "none";
    });
  }
  // MODIFY THE USER ENTRY
  else if (e.target.classList.contains("update-button")) {
    console.log("MODIFY a BUTTON POPUP");
    modifyPopUp.style.display = "block";

    modifyButton.addEventListener("click", function (e) {
      console.log("Inside Modify");
      modifyPopUp.style.display = "";
      modCoachDialogBox.style.display = "block";

      // Refactor : Put function out.
      const removeButtons = function (tdElement) {
        // Create a clone of the <td> element
        let tdClone = tdElement.cloneNode(true);

        // Remove the button elements from the clone
        let buttons_ = tdClone.querySelectorAll("button");
        buttons_.forEach(function (button) {
          button.remove();
        });
        let textContentWithoutButtons = tdClone.textContent.trim();
        console.log(textContentWithoutButtons); // Outputs: "This is some text"
        return textContentWithoutButtons;
        //console.log(tdClone);
      };

      // console.log(targ_c.querySelector('tr .coach_name'));
      const prev_name = removeButtons(targ_c.querySelector("tr .coach_name"));
      console.log(
        (modCoachForm.querySelector("#prev_name").textContent =
          "Previous name :" + prev_name)
      );
    });

    // Input fields for modifying the user
    // Functionality to modify the element on the backend and update HTML
    // Back-end stuff
    // Form submission
    modCoachForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (e.submitter === submitModCoach) {
        console.log(targ_c);
        console.log(e.submitter);
        console.log("Inside event listender");
        const name_ = document.getElementById("mod_name").value;
        const email_ = document.getElementById("mod_email").value;

        const address_ = document.getElementById("mod_address").value;
        const gender_ = document.getElementById("mod_gender").value;
        //const arr_ = [name_, email_, address_, gender_]
        //console.log(arr_)
        // NEEDS TO BE PROCESSES ON BACK_END BEFORE
        //       const response = await fetch("/addCoach", {
        //   method: "POST",
        //   body: JSON.stringify({ name: nameInput, email: emailInput }),
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        targ_c.innerHTML = `
              <td>${email_}</td>
              <td class="coach_name">${name_}<button class="delete-button" href="#" id="delete-pop-up">
                      🗑️
                    </button>
                    <button class="update-button">✏️</button>
                  </td>`;
        //console.log(tableCoach.innerHTML)
        modCoachForm.reset();
        modCoachDialogBox.style.display = "none";
      } else {
        // This code block will run when the "Cancel" button is clicked
        e.preventDefault(); // Prevent form submission
        // alert('Form submission canceled.');
      }
    });

    cancelModCoach.addEventListener("click", function (e) {
      modCoachForm.reset();
      modCoachDialogBox.style.display = "none";
      const cancelEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      modCoachForm.dispatchEvent(cancelEvent);
    });

    // CANCEL BUTTON
    cancelModButton.addEventListener("click", function (e) {
      console.log("Cancelled the modification");
      // Do nothing
      modifyPopUp.style.display = "none";
    });
  }
  // PENDING: Add function clikcing Update, popup with details to add coach
  // Add coach to database , increment row, display the coach entered
});

// ADD A COACH DIALOG AND FUNCTION
addCoachButton.addEventListener("click", () => {
  addCoachDialogBox.style.display = "block";
});

// Form submission
addCoachForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (e.submitter === submitAddCoach) {
    console.log(e.submitter);
    console.log("Inside event listender");
    const name_ = document.getElementById("name").value;
    const email_ = document.getElementById("email").value;

    const address_ = document.getElementById("address").value;
    const gender_ = document.getElementById("gender").value;
    //const arr_ = [name_, email_, address_, gender_]
    //console.log(arr_)
    // NEEDS TO BE PROCESSES ON BACK_END BEFORE
    //       const response = await fetch("/addCoach", {
    //   method: "POST",
    //   body: JSON.stringify({ name: nameInput, email: emailInput }),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    const newRow = document.createElement("tr");
    console.log(newRow);

    // Re-factoring required , hardcoding is not a good option.
    newRow.innerHTML = `
        <td>${name_}</td>
        <td class="coach_name">${email_}<button class="delete-button" href="#" id="delete-pop-up">
                🗑️
              </button>
              <button class="update-button">✏️</button>
            </td>`;
    tableCoach.appendChild(newRow);
    //console.log(tableCoach.innerHTML)
    addCoachForm.reset();
    addCoachDialogBox.style.display = "none";
  } else {
    // This code block will run when the "Cancel" button is clicked
    e.preventDefault(); // Prevent form submission
    // alert('Form submission canceled.');
  }
});

cancelAddCoach.addEventListener("click", function (e) {
  addCoachForm.reset();
  addCoachDialogBox.style.display = "none";
  const cancelEvent = new Event("submit", { bubbles: true, cancelable: true });
  addCoachForm.dispatchEvent(cancelEvent);
});

// Add an event listener to the "Cancel" button
// cancelButton.addEventListener('click', function() {
//   // Trigger a "submit" event on the form to handle the cancellation
//   const cancelEvent = new Event('submit', { bubbles: true, cancelable: true });
//   addCoachForm.dispatchEvent(cancelEvent);
// });
document.getElementById("coach-search").addEventListener("keyup", function () {
  const searchText = this.value.toLowerCase();
  //console.log(searchText);
  const coachList = document.querySelectorAll(".coach_name");
  //console.log(teamList);
  coachList.forEach(function (team) {
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

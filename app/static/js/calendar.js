// Add a global variable to store the selected date
let selectedDate = null;

// Initialize selectedDate with the current date
let currentDay;
let currentMonth;
let currentYear;
let today;
let monthValue;
let currentOperation = 0;
function updateCurrentDate() {
  today = new Date();
  currentDay = today.getDate();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
}

selectYear = document.getElementById("year");
selectMonth = document.getElementById("month");
months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

monthAndYear = document.getElementById("monthAndYear");
updateCurrentDate();

selectedDate = `${currentYear}-${currentMonth + 1}-${currentDay}`;
showCalendar(currentMonth, currentYear);

function next() {
  blockTabs.innerHTML = "";
  // exerciseDetails.innerHTML = "";
  // exerciseTabs.innerHTML = "";
  currentYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  currentMonth = (currentMonth + 1) % 12;
  showCalendar(currentMonth, currentYear);
  handleDateSelection();
  if (typeof coachId !== "undefined") highlightWorkoutDatesForCoaches(coachId);
  else highlightWorkoutDatesForAthletes(athleteId, teamIds);
}

function previous() {
  // blockTabs.innerHTML = "";
  // exerciseDetails.innerHTML = "";
  // exerciseTabs.innerHTML = "";

  currentYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  showCalendar(currentMonth, currentYear);
  handleDateSelection();
  if (typeof coachId !== "undefined") highlightWorkoutDatesForCoaches(coachId);
  else highlightWorkoutDatesForAthletes(athleteId, teamIds);
}

function jump() {
  // blockTabs.innerHTML = "";
  // exerciseDetails.innerHTML = "";
  // exerciseTabs.innerHTML = "";

  currentYear = parseInt(selectYear.value);
  currentMonth = parseInt(selectMonth.value);
  showCalendar(currentMonth, currentYear);
  handleDateSelection();
  if (typeof coachId !== "undefined") highlightWorkoutDatesForCoaches(coachId);
  else highlightWorkoutDatesForAthletes(athleteId, teamIds);
}

function highlightCurrentDate() {
  // Get the current date
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Find the table cells that represent the current date
  const cells = document.querySelectorAll("td");

  cells.forEach((cell) => {
    if (
      cell.innerHTML === currentDay.toString() &&
      cell.classList.contains("bg-info")
    ) {
      // Highlight the current date
      cell.classList.add("today-date");
    }
  });
}

function showCalendar(month, year) {
  const firstDay = new Date(year, month).getDay();
  const tbl = document.getElementById("calendar-body"); // body of the calendar

  // clearing all previous cells
  tbl.innerHTML = "";
  // filling data about month and in the page via DOM.
  monthAndYear.innerHTML = months[month] + " " + year;
  selectYear.value = year;
  selectMonth.value = month;

  // creating all cells
  let date = 1;
  for (let i = 0; i < 6; i++) {
    // creates a table row
    const row = document.createElement("tr");

    // creating individual cells, filling them up with data
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");

      if (i === 0 && j < firstDay) {
        // Empty cells for the days before the first day of the month
        cell.appendChild(document.createTextNode(""));
      } else if (date > daysInMonth(month, year)) {
        // Break if we've filled all days for the month
        break;
      } else {
        // Create a cell with the date
        const cellText = document.createTextNode(date);
        cell.appendChild(cellText);
        // Add a mouseover event listener to the date cell
        cell.addEventListener("mouseover", function () {
          if (cell.classList.contains("workout-date"))
            var operationNumber = ++currentOperation;
          handleCellHover(cell, operationNumber);
        });

        // Add a mouseout event listener to the date cell
        cell.addEventListener("mouseout", function () {
          hoverOut();
        });

        date++;
      }

      row.appendChild(cell);
    }

    tbl.appendChild(row); // appending each row into the calendar body
  }

  // Highlight today's date with the "today-date" class
  tbl.querySelectorAll("td").forEach((cell) => {
    if (
      cell.innerHTML === today.getDate().toString() &&
      year === today.getFullYear() &&
      month === today.getMonth()
    ) {
      cell.classList.add("today-date");
    }

    // Add a click event listener to the date cell
    cell.addEventListener("click", function () {
      // Remove the "clicked-date" class from all cells
      tbl
        .querySelectorAll("td.clicked-date")
        .forEach((c) => c.classList.remove("clicked-date"));
      // Apply the "clicked-date" class to the clicked cell
      cell.classList.add("clicked-date");
    });
  });

  // Call the function to highlight the current date
  highlightCurrentDate();
}

// check how many days in a month code from https://dzone.com/articles/determining-number-days-month
function daysInMonth(iMonth, iYear) {
  return 32 - new Date(iYear, iMonth, 32).getDate();
}

function handleDateSelection() {
  // Select the calendar table
  const tbl = document.querySelector("#calendar");

  // Loop through all the date cells in the calendar
  tbl.querySelectorAll("td").forEach((cell) => {
    // Extract the date from the cell
    const cellDate = parseInt(cell.innerHTML);

    // Check if the cell date matches today's date
    if (
      cellDate === currentDay &&
      currentMonth === month &&
      currentYear === year
    ) {
      cell.classList.add("today-date"); // Add a class to highlight today's date
    }

    // Add a click event listener to the date cell
    cell.addEventListener("click", function () {
      // Clear the tables
      blockTabs.innerHTML = "";
      // exerciseDetails.innerHTML = "";
      // exerciseTabs.innerHTML = "";

      // Remove the "clicked-date" class from all cells
      tbl
        .querySelectorAll("td.clicked-date")
        .forEach((c) => c.classList.remove("clicked-date"));
      // Apply the "clicked-date" class to the clicked cell
      cell.classList.add("clicked-date");

      // Get the selected date
      const selectedDay = cellDate; // Use the date from the cell
      const selectedMonth = parseInt(selectMonth.value); // Use selectMonth.value
      const selectedYear = parseInt(selectYear.value); // Use selectYear.value

      // Format the date as "dd-m-yyyy"
      const selectedDate = `${selectedYear}-${
        selectedMonth + 1
      }-${selectedDay}`;

      // Log the selected date for testing
      console.log("Selected Date:", selectedDate);

      currentDate = selectedDate;

      main();
    });
  });
  monthValue = selectYear.value + "-" + (parseInt(selectMonth.value) + 1);
}

async function highlightWorkoutDatesForAthletes(
  athleteIdForDate,
  teamIdForDate
) {
  try {
    const response = await fetch(
      `getWorkoutDates?athleteId=${athleteIdForDate}&teamId=${teamIdForDate}&date_param=${monthValue}`
    );
    const jsonData = await response.json();
    highlightWorkoutDates(jsonData);
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
}

async function highlightWorkoutDatesForCoaches(coachId) {
  try {
    const response = await fetch(
      `getWorkoutDates?coachId=${coachId}&date_param=${monthValue}`
    );
    const jsonData = await response.json();
    highlightWorkoutDates(jsonData);
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
}

async function highlightWorkoutDates(jsonData) {
  const tbl = document.querySelector("#calendar");
  const cells = document.querySelectorAll("td");
  const workoutDates = jsonData.workoutDates;
  workoutDates.forEach((workoutDate) => {
    const dateObject = new Date(workoutDate);
    const workoutMonth = dateObject.getMonth() + 1; // January is 0, so we add 1
    const workoutYear = dateObject.getFullYear();
    // Check if the month and year match the currentMonth and currentYear
    if (workoutMonth === currentMonth + 1 && workoutYear === currentYear) {
      // Find the corresponding cell and highlight it
      cells.forEach((cell) => {
        const cellDate = cell.innerHTML;
        if (parseInt(cellDate) === dateObject.getDate() && tbl.contains(cell)) {
          cell.classList.add("workout-date");
        }
      });
    }
  });
}

async function handleCellHover(cell, operationNumber) {
  hoverOut();
  try {
    const hoverDate =
      currentYear + "-" + (currentMonth + 1) + "-" + cell.innerHTML;
    const response = await fetch(
      `hoverForCoaches?coachId=${coachId}&dateParam=${hoverDate}`
    );
    if (operationNumber === currentOperation) {
      var infoText = "";
      const jsonData = await response.json();
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        const infoBox = document.createElement("div");
        infoBox.className = "info-box";
        jsonData.forEach((item) => {
          const assignmentType = item.assignment_type;
          const assignmentName = item.assignment_name;
          if(item.workout_name){
            const workoutName = item.workout_name;
            infoText += `Workout : ${workoutName} assigned to ${assignmentType} : ${assignmentName}\n\n`;
          }else{
            const testName = item.test_name;
            infoText += `Test : ${testName} assigned to ${assignmentType} : ${assignmentName}\n\n`;
          }

        });
        infoBox.textContent = infoText;
        // Append the info box to the document body
        document.body.appendChild(infoBox);

        // Position the info box near the cell using absolute positioning
        const cellRect = cell.getBoundingClientRect();
        infoBox.style.position = "absolute";
        infoBox.style.top = cellRect.bottom + window.scrollY + "px";
        infoBox.style.left = cellRect.left + window.scrollX + "px";
      }
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }

  // Add a mouseout event listener to remove the info box when the mouse leaves the cell
}

function hoverOut() {
  var infoBox = document.querySelector(".info-box");
  if (infoBox) {
    console.log("Mouse out");
    infoBox.remove();
    infoBox = null;
  }
}

document.addEventListener("DOMContentLoaded", handleDateSelection);

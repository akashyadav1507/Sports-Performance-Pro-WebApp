// Add a global variable to store the selected date
let selectedDate = null;

// Initialize selectedDate with the current date
let currentDay;
let currentMonth;
let currentYear;
let today;

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
  exerciseDetails.innerHTML = "";
  exerciseTabs.innerHTML = "";
  currentYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  currentMonth = (currentMonth + 1) % 12;
  showCalendar(currentMonth, currentYear);
  handleDateSelection();
}

function previous() {
  blockTabs.innerHTML = "";
  exerciseDetails.innerHTML = "";
  exerciseTabs.innerHTML = "";

  currentYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  showCalendar(currentMonth, currentYear);
  handleDateSelection();
}

function jump() {
  blockTabs.innerHTML = "";
  exerciseDetails.innerHTML = "";
  exerciseTabs.innerHTML = "";

  currentYear = parseInt(selectYear.value);
  currentMonth = parseInt(selectMonth.value);
  showCalendar(currentMonth, currentYear);
  handleDateSelection();
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
  let firstDay = new Date(year, month).getDay();

  let tbl = document.getElementById("calendar-body"); // body of the calendar

  // clearing all previous cells
  tbl.innerHTML = "";

  // filing data about month and in the page via DOM.
  monthAndYear.innerHTML = months[month] + " " + year;
  selectYear.value = year;
  selectMonth.value = month;

  // creating all cells
  let date = 1;
  for (let i = 0; i < 6; i++) {
    // creates a table row
    let row = document.createElement("tr");

    // creating individual cells, filling them up with data
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        cell = document.createElement("td");
        cellText = document.createTextNode("");
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else if (date > daysInMonth(month, year)) {
        break;
      } else {
        cell = document.createElement("td");
        cellText = document.createTextNode(date);

        cell.appendChild(cellText);
        row.appendChild(cell);
        date++;
      }
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
      exerciseDetails.innerHTML = "";
      exerciseTabs.innerHTML = "";

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
}

document.addEventListener("DOMContentLoaded", handleDateSelection);

// Function to update the profile display with new values
function updateProfileDisplay() {
  document.getElementById("name").textContent =
    document.getElementById("editName").value;
  document.getElementById("email").textContent =
    document.getElementById("editEmail").value;
  document.getElementById("phone").textContent =
    document.getElementById("editPhone").value;
  document.getElementById("gender").textContent =
    document.getElementById("editGender").value;
  document.getElementById("age").textContent =
    document.getElementById("editAge").value;
  document.getElementById("institute").textContent =
    document.getElementById("editInstitute").value;
  document.getElementById("sports").textContent =
    document.getElementById("editSports").value;
  // Update the password display with asterisks or leave as is
  let password = document.getElementById("editPassword").value;
  document.getElementById("password").textContent = password
    ? "Password: ********"
    : "Password: Not Set";
}

// Function to save the changes from the modal form
function saveChanges() {
  updateProfileDisplay();
  // Here you would also send the updated profile data to the server using AJAX or a form submit, etc.
  $("#editProfileModal").modal("hide"); // Hide the modal after saving changes
}

// Pre-fill modal with current profile information
$("#editProfileModal").on("show.bs.modal", function (event) {
  // Example: Pre-fill the form fields. In a real scenario, you'd fetch this data from your database or server.
  document.getElementById("editName").value =
    document.getElementById("name").textContent;
  document.getElementById("editEmail").value =
    document.getElementById("email").textContent;
  document.getElementById("editPhone").value =
    document.getElementById("phone").textContent;
  document.getElementById("editGender").value =
    document.getElementById("gender").textContent;
  document.getElementById("editAge").value =
    document.getElementById("age").textContent;
  document.getElementById("editInstitute").value =
    document.getElementById("institute").textContent;
  document.getElementById("editSports").value =
    document.getElementById("sports").textContent;
  // Password should typically not be pre-filled for security reasons
  document.getElementById("editPassword").value = "";
});

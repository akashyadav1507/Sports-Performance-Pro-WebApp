// JavaScript email and phone validation
"use strict";

const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const passwordInput = document.getElementById("password");
const sports = document.getElementsByName("sports[]");
const instituteInput = document.getElementById("institute");
const genderInput = document.getElementById("gender");

const registerButton = document.getElementById("registerButton");
let userInfo = {};
let sportsChecked = [];
// console.log(sports);
let valid_;

function isValidEmail(email) {
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Simple phone number validation regex (assuming 10-digit phone number)
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

function isValidName(name) {
  // Name validation regex (letters only)
  const nameRegex = /^[A-Za-z]+$/;
  return nameRegex.test(name);
}

function isValidAge(age) {
  // Age validation regex (numbers only)
  const ageRegex = /^[0-9]+$/;
  return ageRegex.test(age);
}

function isValidPassword(password) {
  // Password validation: at least 8 characters long
  return password.length >= 8;
}

const validateForm = function isValidForm(name, email, phone, age, password) {
  // Reset error messages
  console.log("Validating...");
  let valid = true;
  let nameError = document.getElementById("name-error");
  let ageError = document.getElementById("age-error");
  let emailError = document.getElementById("email-error");
  let phoneError = document.getElementById("phone-error");
  let passwordError = document.getElementById("password-error");

  nameError.textContent = "";
  ageError.textContent = "";
  emailError.textContent = "";
  phoneError.textContent = "";
  passwordError.textContent = "";

  console.log(email.value);
  if (!isValidEmail(email.value)) {
    valid = false;
    emailError.textContent = "Please enter a valid email address.";
  }

  if (!isValidPhone(phone.value)) {
    valid = false;
    phoneError.textContent = "Please enter a valid phone number (10 digits).";
  }

  if (!isValidName(name.value)) {
    valid = false;
    nameError.textContent = "Please enter a valid name (letters only).";
  }

  if (!isValidAge(age.value)) {
    valid = false;
    ageError.textContent = "Please enter a valid age (numbers only).";
  }

  if (!isValidPassword(password.value)) {
    valid = false;
    passwordError.textContent = "Password must be at least 8 characters long.";
  }
  return valid;
};

registerButton.addEventListener("click", function (event) {
  userInfo = {};
  event.preventDefault();
  // console.log(event.target);
  valid_ = validateForm(
    nameInput,
    emailInput,
    phoneInput,
    ageInput,
    passwordInput
  );
  if (valid_) {
    sports.forEach((sport) => {
      if (sport.checked) sportsChecked.push(sport);
    });
    console.log(sportsChecked);
    // Data created

    // Create the json
    userInfo["name"] = nameInput.value;
    userInfo["email"] = emailInput.value;
    userInfo["password"] = passwordInput.value;
    userInfo["phone"] = phoneInput.value;
    userInfo["institute"] = instituteInput.value;
    userInfo["age"] = ageInput.value;
    userInfo["gender"] = genderInput.value;
    userInfo["sports"] = Array.from(sportsChecked)
      .filter((sport) => sport.checked)
      .map((sport) => sport.value);
    console.log(userInfo);
    console.log(JSON.stringify(userInfo));
    fetch("/signup-athlete", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(userInfo),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error("Error:", error));
  }
});

<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/helpers/validate.php");

$data = json_decode(file_get_contents("php://input"), true);

$name = sanitize($data['name'] ?? '');
$email = sanitize($data['email'] ?? '');
$password = $data['password'] ?? '';
$phone = sanitize($data['phone'] ?? '');
$branch = sanitize($data['branch'] ?? '');
$year = $data['year_of_passing'] ?? '';

// --- Validation ---
$errors = [];

if (!isValidLength($name, 2, 100)) {
    $errors[] = "Name must be between 2 and 100 characters";
}

if (!isValidEmail($email)) {
    $errors[] = "Please enter a valid email address";
}
if (mb_strlen($email) > 100) {
    $errors[] = "Email must not exceed 100 characters";
}

if (!isValidLength($password, 8, 255)) {
    $errors[] = "Password must be between 8 and 255 characters";
}

if (!isValidPhone($phone)) {
    $errors[] = "Please enter a valid phone number (7–15 digits)";
}

if (!empty($branch) && !isValidLength($branch, 1, 50)) {
    $errors[] = "Branch must not exceed 50 characters";
}

if (!empty($year) && !isInRange($year, 2000, 2100)) {
    $errors[] = "Year of passing must be between 2000 and 2100";
}

if (!empty($errors)) {
    sendResponse(false, [], implode(". ", $errors));
}

// --- End Validation ---

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email=?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$check = mysqli_stmt_get_result($stmt);
if (mysqli_num_rows($check) > 0) {
    sendResponse(false, [], "Email already registered");
}
mysqli_stmt_close($stmt);

$stmt = mysqli_prepare($conn, "INSERT INTO users (name,email,password,phone,branch,year_of_passing) VALUES (?,?,?,?,?,?)");
mysqli_stmt_bind_param($stmt, "sssssi", $name, $email, $password_hash, $phone, $branch, $year);

if (mysqli_stmt_execute($stmt)) {
    sendResponse(true, [], "User registered successfully");
} else {
    sendResponse(false, [], "Registration failed");
}

mysqli_stmt_close($stmt);

?>
<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$phone = $data['phone'] ?? '';
$branch = $data['branch'] ?? '';
$year = $data['year_of_passing'] ?? '';

if(empty($name) || empty($email) || empty($password) || empty($phone)){
    sendResponse(false, [], "All required fields must be filled");
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email=?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$check = mysqli_stmt_get_result($stmt);
if(mysqli_num_rows($check) > 0){
    sendResponse(false, [], "Email already registered");
}
mysqli_stmt_close($stmt);

$stmt = mysqli_prepare($conn, "INSERT INTO users (name,email,password,phone,branch,year_of_passing) VALUES (?,?,?,?,?,?)");
mysqli_stmt_bind_param($stmt, "sssssi", $name, $email, $password_hash, $phone, $branch, $year);

if(mysqli_stmt_execute($stmt)){
    sendResponse(true,[],"User registered successfully");
}else{
    sendResponse(false,[],"Registration failed");
}

mysqli_stmt_close($stmt);

?>
<?php

session_start();

include_once(__DIR__ . "/../../config/database.php");
include_once(__DIR__ . "/../helpers/response.php");

if(!isset($_SESSION['user_id'])){
    sendResponse(false, [], "Not logged in");
}

$user_id = $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "SELECT role FROM users WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

if(!$user || $user['role'] != 'admin'){
    sendResponse(false, [], "Admin access required");
}

mysqli_stmt_close($stmt);
?>
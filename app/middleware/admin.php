<?php

session_start();

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");

if(!isset($_SESSION['user_id'])){
    sendResponse(false, [], "Not logged in");
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT role FROM users WHERE id='$user_id'";
$result = mysqli_query($conn,$sql);
$user = mysqli_fetch_assoc($result);

if(!$user || $user['role'] != 'admin'){
    sendResponse(false, [], "Admin access required");
}
?>
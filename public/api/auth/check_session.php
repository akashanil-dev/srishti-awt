<?php

session_start();

include("../../../config/database.php");
include("../../../app/helpers/response.php");

if(!isset($_SESSION['user_id'])){
    sendResponse(false, [], "Not logged in");
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT id, name, email, phone, role, branch, year_of_passing FROM users WHERE id='$user_id'";
$result = mysqli_query($conn, $sql);

if(mysqli_num_rows($result) > 0){
    $user = mysqli_fetch_assoc($result);
    sendResponse(true, $user, "Session active");
} else {
    session_destroy();
    sendResponse(false, [], "User not found");
}

?>

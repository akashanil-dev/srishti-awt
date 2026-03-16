<?php

session_start();

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");

if(!isset($_SESSION['user_id'])){
    sendResponse(false, [], "Not logged in");
}

$user_id = $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "SELECT id, name, email, phone, role, branch, year_of_passing FROM users WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if(mysqli_num_rows($result) > 0){
    $user = mysqli_fetch_assoc($result);
    sendResponse(true, $user, "Session active");
} else {
    session_destroy();
    sendResponse(false, [], "User not found");
}

mysqli_stmt_close($stmt);

?>

<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");
include("../../../app/middleware/auth.php");

$data = json_decode(file_get_contents("php://input"), true);

$team_id = $data['team_id'];
$user_id = $data['user_id'];

if(empty($team_id) || empty($user_id)){
    sendResponse(false,[],"Team ID and User ID required");
}

/* Check if team exists */

$team_check = "SELECT * FROM teams WHERE id='$team_id'";
$team_result = mysqli_query($conn,$team_check);

if(mysqli_num_rows($team_result) == 0){
    sendResponse(false,[],"Team not found");
}

/* Check if user already in team */

$check = "SELECT * FROM team_members 
          WHERE team_id='$team_id' AND user_id='$user_id'";

$check_result = mysqli_query($conn,$check);

if(mysqli_num_rows($check_result) > 0){
    sendResponse(false,[],"User already in team");
}

/* Insert member */

$sql = "INSERT INTO team_members (team_id,user_id)
        VALUES ('$team_id','$user_id')";

if(mysqli_query($conn,$sql)){
    sendResponse(true,[],"Team member added");
}else{
    sendResponse(false,[],"Failed to add member");
}

?>
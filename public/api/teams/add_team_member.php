<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");

$data = json_decode(file_get_contents("php://input"), true);

$team_id = $data['team_id'] ?? '';
$member_user_id = $data['user_id'] ?? '';

if(empty($team_id) || empty($member_user_id)){
    sendResponse(false,[],"Team ID and User ID required");
}

/* Check if team exists */

$stmt = mysqli_prepare($conn, "SELECT id FROM teams WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $team_id);
mysqli_stmt_execute($stmt);
$team_result = mysqli_stmt_get_result($stmt);

if(mysqli_num_rows($team_result) == 0){
    sendResponse(false,[],"Team not found");
}
mysqli_stmt_close($stmt);

/* Check if user already in team */

$stmt = mysqli_prepare($conn, "SELECT id FROM team_members WHERE team_id=? AND user_id=?");
mysqli_stmt_bind_param($stmt, "ii", $team_id, $member_user_id);
mysqli_stmt_execute($stmt);
$check_result = mysqli_stmt_get_result($stmt);

if(mysqli_num_rows($check_result) > 0){
    sendResponse(false,[],"User already in team");
}
mysqli_stmt_close($stmt);

/* Insert member */

$stmt = mysqli_prepare($conn, "INSERT INTO team_members (team_id,user_id) VALUES (?,?)");
mysqli_stmt_bind_param($stmt, "ii", $team_id, $member_user_id);

if(mysqli_stmt_execute($stmt)){
    sendResponse(true,[],"Team member added");
}else{
    sendResponse(false,[],"Failed to add member");
}

mysqli_stmt_close($stmt);

?>
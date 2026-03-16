<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");


$data = json_decode(file_get_contents("php://input"), true);

$team_name = $data['team_name'] ?? '';
$event_id = $data['event_id'] ?? '';
$created_by = $user_id;

if(empty($team_name) || empty($event_id) || empty($created_by)){
    sendResponse(false,[],"All fields are required");
}

/* Check if event exists */

$stmt = mysqli_prepare($conn, "SELECT id FROM events WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $event_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if(mysqli_num_rows($result) == 0){
    sendResponse(false,[],"Event not found");
}
mysqli_stmt_close($stmt);

/* Create team */

$stmt = mysqli_prepare($conn, "INSERT INTO teams (team_name,event_id,created_by) VALUES (?,?,?)");
mysqli_stmt_bind_param($stmt, "sii", $team_name, $event_id, $created_by);

if(mysqli_stmt_execute($stmt)){

    $team_id = mysqli_insert_id($conn);

    sendResponse(true,[
        "team_id"=>$team_id
    ],"Team created successfully");

}else{

    sendResponse(false,[],"Team creation failed");

}

mysqli_stmt_close($stmt);

?>
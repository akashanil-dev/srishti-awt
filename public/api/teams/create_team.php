<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");
include("../../../app/middleware/auth.php");


$data = json_decode(file_get_contents("php://input"), true);

$team_name = $data['team_name'];
$event_id = $data['event_id'];
$created_by = $user_id;

if(empty($team_name) || empty($event_id) || empty($created_by)){
    sendResponse(false,[],"All fields are required");
}

/* Check if event exists */

$event_check = "SELECT * FROM events WHERE id='$event_id'";
$result = mysqli_query($conn,$event_check);

if(mysqli_num_rows($result) == 0){
    sendResponse(false,[],"Event not found");
}

/* Create team */

$sql = "INSERT INTO teams (team_name,event_id,created_by)
        VALUES ('$team_name','$event_id','$created_by')";

if(mysqli_query($conn,$sql)){

    $team_id = mysqli_insert_id($conn);

    sendResponse(true,[
        "team_id"=>$team_id
    ],"Team created successfully");

}else{

    sendResponse(false,[],"Team creation failed");

}

?>
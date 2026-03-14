<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'];
$event_id = $data['event_id'];

if(empty($user_id) || empty($event_id)){
    sendResponse(false,[],"User ID and Event ID required");
}

/* Check if event exists */

$event_sql = "SELECT max_participants FROM events WHERE id='$event_id'";
$event_result = mysqli_query($conn,$event_sql);

if(mysqli_num_rows($event_result) == 0){
    sendResponse(false,[],"Event not found");
}

$event = mysqli_fetch_assoc($event_result);

/* Count current registrations */

$count_sql = "SELECT COUNT(*) AS total FROM event_registrations WHERE event_id='$event_id'";
$count_result = mysqli_query($conn,$count_sql);
$count_row = mysqli_fetch_assoc($count_result);

if($count_row['total'] >= $event['max_participants']){
    sendResponse(false,[],"Event is full");
}

/* Check duplicate registration */

$check_sql = "SELECT * FROM event_registrations WHERE user_id='$user_id' AND event_id='$event_id'";
$check_result = mysqli_query($conn,$check_sql);

if(mysqli_num_rows($check_result) > 0){
    sendResponse(false,[],"User already registered");
}

/* Insert registration */

$sql = "INSERT INTO event_registrations (user_id,event_id)
        VALUES ('$user_id','$event_id')";

if(mysqli_query($conn,$sql)){
    sendResponse(true,[],"Registration successful");
}else{
    sendResponse(false,[],"Registration failed");
}

?>
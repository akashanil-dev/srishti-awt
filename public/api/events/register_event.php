<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");

$data = json_decode(file_get_contents("php://input"), true);

$event_id = $data['event_id'] ?? '';

if(empty($user_id) || empty($event_id)){
    sendResponse(false,[],"User ID and Event ID required");
}

/* Check if event exists */

$stmt = mysqli_prepare($conn, "SELECT max_participants FROM events WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $event_id);
mysqli_stmt_execute($stmt);
$event_result = mysqli_stmt_get_result($stmt);

if(mysqli_num_rows($event_result) == 0){
    sendResponse(false,[],"Event not found");
}

$event = mysqli_fetch_assoc($event_result);
mysqli_stmt_close($stmt);

/* Count current registrations */

$stmt = mysqli_prepare($conn, "SELECT COUNT(*) AS total FROM event_registrations WHERE event_id=?");
mysqli_stmt_bind_param($stmt, "i", $event_id);
mysqli_stmt_execute($stmt);
$count_result = mysqli_stmt_get_result($stmt);
$count_row = mysqli_fetch_assoc($count_result);

if($count_row['total'] >= $event['max_participants']){
    sendResponse(false,[],"Event is full");
}
mysqli_stmt_close($stmt);

/* Check duplicate registration */

$stmt = mysqli_prepare($conn, "SELECT id FROM event_registrations WHERE user_id=? AND event_id=?");
mysqli_stmt_bind_param($stmt, "ii", $user_id, $event_id);
mysqli_stmt_execute($stmt);
$check_result = mysqli_stmt_get_result($stmt);

if(mysqli_num_rows($check_result) > 0){
    sendResponse(false,[],"User already registered");
}
mysqli_stmt_close($stmt);

/* Insert registration */

$stmt = mysqli_prepare($conn, "INSERT INTO event_registrations (user_id,event_id) VALUES (?,?)");
mysqli_stmt_bind_param($stmt, "ii", $user_id, $event_id);

if(mysqli_stmt_execute($stmt)){
    sendResponse(true,[],"Registration successful");
}else{
    sendResponse(false,[],"Registration failed");
}

mysqli_stmt_close($stmt);

?>
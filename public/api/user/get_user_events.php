<?php

include("../config/db.php");
include("../config/response.php");

$user_id = $_GET['user_id'];

if(empty($user_id)){
    sendResponse(false,[],"User ID required");
}

$sql = "SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date
        FROM events e
        JOIN event_registrations r
        ON e.id = r.event_id
        WHERE r.user_id = '$user_id'";

$result = mysqli_query($conn,$sql);

$events = [];

while($row = mysqli_fetch_assoc($result)){
    $events[] = $row;
}

sendResponse(true,$events);

?>
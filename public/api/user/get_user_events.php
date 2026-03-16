<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");

if(empty($user_id)){
    sendResponse(false,[],"User ID required");
}

$stmt = mysqli_prepare($conn, "SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date
        FROM events e
        JOIN event_registrations r
        ON e.id = r.event_id
        WHERE r.user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$events = [];

while($row = mysqli_fetch_assoc($result)){
    $events[] = $row;
}

sendResponse(true,$events);

mysqli_stmt_close($stmt);

?>
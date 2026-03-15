<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");

$sql = "SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.max_participants,
        e.event_type,
        e.team_min,
        e.team_max,
        COUNT(r.id) AS registered
        FROM events e
        LEFT JOIN event_registrations r
        ON e.id = r.event_id
        GROUP BY e.id";

$result = mysqli_query($conn,$sql);

$events = [];

while($row = mysqli_fetch_assoc($result)){

    $row["available_seats"] = $row["max_participants"] - $row["registered"];

    $events[] = $row;
}

sendResponse(true,$events);

?>
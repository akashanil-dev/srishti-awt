<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");

if (empty($user_id)) {
    sendResponse(false, [], "User ID required");
}

/*
 * UNION query to get:
 *  1. Direct event registrations (type = "registration")
 *  2. Team memberships via team_members → teams → events (type = "team")
 */

$sql = "
    SELECT
        e.id            AS event_id,
        e.title,
        e.description,
        e.event_date,
        e.event_type,
        'registration'  AS reg_type,
        NULL            AS team_id,
        NULL            AS team_name,
        NULL            AS team_role
    FROM events e
    JOIN event_registrations r ON e.id = r.event_id
    WHERE r.user_id = ?

    UNION

    SELECT
        e.id            AS event_id,
        e.title,
        e.description,
        e.event_date,
        e.event_type,
        'team'          AS reg_type,
        t.id            AS team_id,
        t.team_name     AS team_name,
        tm.role         AS team_role
    FROM events e
    JOIN teams t        ON e.id = t.event_id
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ?

    ORDER BY event_date ASC
";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ii", $user_id, $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$events = [];

while ($row = mysqli_fetch_assoc($result)) {
    $events[] = $row;
}

sendResponse(true, $events);

mysqli_stmt_close($stmt);

?>
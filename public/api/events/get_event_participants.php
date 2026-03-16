<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");
include_once("../../../app/helpers/validate.php");

$event_id = $_GET['event_id'] ?? '';

// --- Validation ---
if (!isPositiveInt($event_id)) {
    sendResponse(false, [], "Valid Event ID is required");
}
// --- End Validation ---

$event_id = intval($event_id);

$stmt = mysqli_prepare($conn, "SELECT users.name, users.email
        FROM event_registrations
        JOIN users
        ON users.id = event_registrations.user_id
        WHERE event_registrations.event_id=?");
mysqli_stmt_bind_param($stmt, "i", $event_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$data = array();

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

sendResponse(true, $data);

mysqli_stmt_close($stmt);

?>
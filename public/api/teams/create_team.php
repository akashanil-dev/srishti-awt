<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");
include_once("../../../app/helpers/validate.php");


$data = json_decode(file_get_contents("php://input"), true);

$team_name = sanitize($data['team_name'] ?? '');
$event_id = $data['event_id'] ?? '';
$created_by = $user_id;

// --- Validation ---
$errors = [];

if (!isValidLength($team_name, 2, 100)) {
    $errors[] = "Team name must be between 2 and 100 characters";
}

if (!isPositiveInt($event_id)) {
    $errors[] = "Valid Event ID is required";
}

if (!empty($errors)) {
    sendResponse(false, [], implode(". ", $errors));
}
// --- End Validation ---

$event_id = intval($event_id);

/* Check if event exists */

$stmt = mysqli_prepare($conn, "SELECT id FROM events WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $event_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 0) {
    sendResponse(false, [], "Event not found");
}
mysqli_stmt_close($stmt);

/* Create team */

$stmt = mysqli_prepare($conn, "INSERT INTO teams (team_name,event_id,created_by) VALUES (?,?,?)");
mysqli_stmt_bind_param($stmt, "sii", $team_name, $event_id, $created_by);

if (mysqli_stmt_execute($stmt)) {

    $team_id = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt);

    /* Auto-add creator as team leader */
    $leader_role = 'leader';
    $stmt = mysqli_prepare($conn, "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "iis", $team_id, $created_by, $leader_role);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    /* Fetch creator's name and email for the UI */
    $stmt = mysqli_prepare($conn, "SELECT name, email FROM users WHERE id=?");
    mysqli_stmt_bind_param($stmt, "i", $created_by);
    mysqli_stmt_execute($stmt);
    $creator_result = mysqli_stmt_get_result($stmt);
    $creator = mysqli_fetch_assoc($creator_result);
    mysqli_stmt_close($stmt);

    sendResponse(true, [
        "team_id" => $team_id,
        "leader" => [
            "name" => $creator['name'],
            "email" => $creator['email'],
            "role" => "leader"
        ]
    ], "Team created successfully");

} else {

    sendResponse(false, [], "Team creation failed");

}

?>
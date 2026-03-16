<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/admin.php");
include_once("../../../app/helpers/validate.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? '';
$title = sanitize($data['title'] ?? '');
$description = sanitize($data['description'] ?? '');
$event_date = $data['event_date'] ?? '';
$max_participants = $data['max_participants'] ?? 0;
$event_type = $data['event_type'] ?? 'solo';
$team_min = $data['team_min'] ?? null;
$team_max = $data['team_max'] ?? null;

// --- Validation ---
$errors = [];

if (!isPositiveInt($id)) {
    $errors[] = "Valid Event ID is required";
}

if (!isValidLength($title, 3, 200)) {
    $errors[] = "Title must be between 3 and 200 characters";
}

if (!empty($description) && !isValidLength($description, 0, 600)) {
    $errors[] = "Description must not exceed 600 characters";
}

if (!isValidDate($event_date)) {
    $errors[] = "Please enter a valid date (YYYY-MM-DD)";
}

if (!isPositiveInt($max_participants) || !isInRange($max_participants, 1, 1000)) {
    $errors[] = "Max participants must be a number between 1 and 1000";
}

if (!in_array($event_type, ['solo', 'team'])) {
    $errors[] = "Event type must be 'solo' or 'team'";
}

if ($event_type === 'team') {
    if (!isPositiveInt($team_min) || !isInRange($team_min, 2, 20)) {
        $errors[] = "Team min size must be between 2 and 20";
    }
    if (!isPositiveInt($team_max) || !isInRange($team_max, 2, 20)) {
        $errors[] = "Team max size must be between 2 and 20";
    }
    if (isPositiveInt($team_min) && isPositiveInt($team_max) && intval($team_min) > intval($team_max)) {
        $errors[] = "Team min size cannot be greater than team max size";
    }
}

if (!empty($errors)) {
    sendResponse(false, [], implode(". ", $errors));
}

// --- End Validation ---

$id = intval($id);
$max_participants = intval($max_participants);
$team_min = $team_min !== null ? intval($team_min) : null;
$team_max = $team_max !== null ? intval($team_max) : null;

$stmt = mysqli_prepare($conn, "UPDATE events 
        SET title=?,
            description=?,
            event_date=?,
            max_participants=?,
            event_type=?,
            team_min=?,
            team_max=?
        WHERE id=?");
mysqli_stmt_bind_param($stmt, "sssisiii", $title, $description, $event_date, $max_participants, $event_type, $team_min, $team_max, $id);

$result = mysqli_stmt_execute($stmt);

if ($result) {
    sendResponse(true, [], "Event updated successfully");
} else {
    sendResponse(false, [], "Update failed");
}

mysqli_stmt_close($stmt);

?>
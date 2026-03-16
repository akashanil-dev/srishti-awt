<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");
include_once("../../../app/helpers/validate.php");

$data = json_decode(file_get_contents("php://input"), true);

$team_id = $data['team_id'] ?? '';
$email = sanitize($data['email'] ?? '');

// --- Validation ---
$errors = [];

if (!isPositiveInt($team_id)) {
    $errors[] = "Valid Team ID is required";
}

if (!isValidEmail($email)) {
    $errors[] = "Please enter a valid email address";
}

if (!empty($errors)) {
    sendResponse(false, [], implode(". ", $errors));
}
// --- End Validation ---

$team_id = intval($team_id);

/* Look up user by email */

$stmt = mysqli_prepare($conn, "SELECT id, name FROM users WHERE email=?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$user_result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($user_result) == 0) {
    sendResponse(false, [], "No account found with that email. Please ask your team member to create an account with us first, then try adding them again 🙂");
}

$user_row = mysqli_fetch_assoc($user_result);
$member_user_id = $user_row['id'];
mysqli_stmt_close($stmt);

/* Check if team exists */

$stmt = mysqli_prepare($conn, "SELECT id FROM teams WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $team_id);
mysqli_stmt_execute($stmt);
$team_result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($team_result) == 0) {
    sendResponse(false, [], "Team not found");
}
mysqli_stmt_close($stmt);

/* Check if user already in team */

$stmt = mysqli_prepare($conn, "SELECT id FROM team_members WHERE team_id=? AND user_id=?");
mysqli_stmt_bind_param($stmt, "ii", $team_id, $member_user_id);
mysqli_stmt_execute($stmt);
$check_result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($check_result) > 0) {
    sendResponse(false, [], "This member is already in the team");
}
mysqli_stmt_close($stmt);

/* Insert member */

$stmt = mysqli_prepare($conn, "INSERT INTO team_members (team_id,user_id) VALUES (?,?)");
mysqli_stmt_bind_param($stmt, "ii", $team_id, $member_user_id);

if (mysqli_stmt_execute($stmt)) {
    sendResponse(true, [], "Added " . $user_row['name'] . " to the team successfully!");
} else {
    sendResponse(false, [], "Failed to add member");
}

mysqli_stmt_close($stmt);

?>
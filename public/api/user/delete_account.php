<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");
include_once("../../../app/helpers/validate.php");

$data = json_decode(file_get_contents("php://input"), true);

$email = sanitize($data['email'] ?? '');

// --- Validation ---
if (!isValidEmail($email)) {
    sendResponse(false, [], "Please enter a valid email address");
}

/* Verify the email matches the logged-in user */

$stmt = mysqli_prepare($conn, "SELECT email FROM users WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 0) {
    sendResponse(false, [], "User not found");
}

$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (strtolower($email) !== strtolower($user['email'])) {
    sendResponse(false, [], "Email does not match your account");
}

/* Delete related data first (FKs use RESTRICT, not CASCADE) */

// Remove from team_members
$stmt = mysqli_prepare($conn, "DELETE FROM team_members WHERE user_id=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

// Remove event registrations
$stmt = mysqli_prepare($conn, "DELETE FROM event_registrations WHERE user_id=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

// Remove teams created by this user (and their members)
$stmt = mysqli_prepare($conn, "SELECT id FROM teams WHERE created_by=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$teams_result = mysqli_stmt_get_result($stmt);
while ($team = mysqli_fetch_assoc($teams_result)) {
    $del_members = mysqli_prepare($conn, "DELETE FROM team_members WHERE team_id=?");
    mysqli_stmt_bind_param($del_members, "i", $team['id']);
    mysqli_stmt_execute($del_members);
    mysqli_stmt_close($del_members);
}
mysqli_stmt_close($stmt);

$stmt = mysqli_prepare($conn, "DELETE FROM teams WHERE created_by=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

// Remove events created by this user (admin-created events)
$stmt = mysqli_prepare($conn, "DELETE FROM events WHERE created_by=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

/* Now delete the user */

$stmt = mysqli_prepare($conn, "DELETE FROM users WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);

if (mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);

    // Destroy session
    session_destroy();

    sendResponse(true, [], "Account deleted successfully");
} else {
    sendResponse(false, [], "Failed to delete account");
}

mysqli_stmt_close($stmt);

?>
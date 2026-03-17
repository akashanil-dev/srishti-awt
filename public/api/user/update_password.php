<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");
include_once("../../../app/helpers/validate.php");

$data = json_decode(file_get_contents("php://input"), true);

$current_pass = $data['current_pass'] ?? '';
$new_pass = $data['new_pass'] ?? '';

// --- Validation ---
$errors = [];

if (empty($current_pass)) {
    $errors[] = "Current password is required";
}

if (!isValidLength($new_pass, 8, 255)) {
    $errors[] = "New password must be between 8 and 255 characters";
}

if (!empty($errors)) {
    sendResponse(false, [], implode(". ", $errors));
}
// --- End Validation ---

/* Fetch current password hash */

$stmt = mysqli_prepare($conn, "SELECT password FROM users WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 0) {
    sendResponse(false, [], "User not found");
}

$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

/* Verify current password (supports hashed + legacy plaintext) */

$valid = false;
if (password_verify($current_pass, $user['password'])) {
    $valid = true;
} elseif ($current_pass === $user['password']) {
    // Legacy plaintext match
    $valid = true;
}

if (!$valid) {
    sendResponse(false, [], "Current password is incorrect");
}

/* Hash and save new password */

$hashed = password_hash($new_pass, PASSWORD_DEFAULT);

$stmt = mysqli_prepare($conn, "UPDATE users SET password=? WHERE id=?");
mysqli_stmt_bind_param($stmt, "si", $hashed, $user_id);

if (mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);

    // Destroy session to force re-login
    session_destroy();

    sendResponse(true, [], "Password changed successfully. Please log in again.");
} else {
    sendResponse(false, [], "Failed to update password");
}

mysqli_stmt_close($stmt);

?>
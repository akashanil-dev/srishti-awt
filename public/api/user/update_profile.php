<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");
include_once("../../../app/helpers/validate.php");

$data = json_decode(file_get_contents("php://input"), true);

$name = sanitize($data['name'] ?? '');
$phone = sanitize($data['phone'] ?? '');
$branch = sanitize($data['branch'] ?? '');
$year = $data['year_of_passing'] ?? '';

// --- Validation ---
$errors = [];

if (!isValidLength($name, 2, 100)) {
    $errors[] = "Name must be between 2 and 100 characters";
}

if (!isValidPhone($phone)) {
    $errors[] = "Please enter a valid phone number (7–15 digits)";
}

$allowed_branches = ['B.Tech', 'MCA'];
if (!in_array($branch, $allowed_branches)) {
    $errors[] = "Please select a valid branch";
}

if (!isPositiveInt($year) || !isInRange(intval($year), 2000, 2100)) {
    $errors[] = "Year of passing must be between 2000 and 2100";
}

if (!empty($errors)) {
    sendResponse(false, [], implode(". ", $errors));
}
// --- End Validation ---

$year = intval($year);

/* Update user */

$stmt = mysqli_prepare($conn, "UPDATE users SET name=?, phone=?, branch=?, year_of_passing=? WHERE id=?");
mysqli_stmt_bind_param($stmt, "sssii", $name, $phone, $branch, $year, $user_id);

if (mysqli_stmt_execute($stmt)) {
    // Update session name
    $_SESSION['user_name'] = $name;

    sendResponse(true, [
        "name" => $name,
        "phone" => $phone,
        "branch" => $branch,
        "year_of_passing" => $year
    ], "Profile updated successfully");
} else {
    sendResponse(false, [], "Failed to update profile");
}

mysqli_stmt_close($stmt);

?>
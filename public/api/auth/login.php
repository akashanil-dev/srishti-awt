<?php

session_start();

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/helpers/validate.php");

$data = json_decode(file_get_contents("php://input"), true);

$email = sanitize($data['email'] ?? '');
$password = $data['password'] ?? '';

// --- Validation ---
if (!isValidEmail($email)) {
    sendResponse(false, [], "Please enter a valid email address");
}

if (empty($password)) {
    sendResponse(false, [], "Password is required");
}
// --- End Validation ---

$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE email=?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) > 0) {

    $user = mysqli_fetch_assoc($result);

    // Try hashed password first
    if (password_verify($password, $user['password'])) {

        // create session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];

        // remove password from response
        unset($user['password']);

        sendResponse(true, $user, "Login successful");

    } elseif ($password === $user['password']) {
        // Legacy plaintext password match — hash it and update DB for security
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $update_stmt = mysqli_prepare($conn, "UPDATE users SET password=? WHERE id=?");
        mysqli_stmt_bind_param($update_stmt, "si", $hashed, $user['id']);
        mysqli_stmt_execute($update_stmt);
        mysqli_stmt_close($update_stmt);

        // create session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];

        // remove password from response
        unset($user['password']);

        sendResponse(true, $user, "Login successful");

    } else {

        sendResponse(false, [], "Invalid password");

    }

} else {

    sendResponse(false, [], "User not found");

}

?>
<?php

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['created_by'];

$sql = "SELECT role FROM users WHERE id='$user_id'";
$result = mysqli_query($conn,$sql);
$user = mysqli_fetch_assoc($result);

if($user['role'] != 'admin'){
    sendResponse(false,[],"Admin access required");
}

?>
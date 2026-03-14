<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$password = $data['password'];

$sql = "SELECT * FROM users WHERE email='$email'";
$result = mysqli_query($conn,$sql);

if(mysqli_num_rows($result) > 0){

    $user = mysqli_fetch_assoc($result);

    if($user['password'] == $password){

        sendResponse(true,$user,"Login successful");

    } else {

        sendResponse(false,[],"Invalid password");

    }

}else{

    sendResponse(false,[],"User not found");

}

?>
<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$password = $data['password'];
$phone = $data['phone'];

$sql = "INSERT INTO users (name,email,password,phone)
        VALUES ('$name','$email','$password','$phone')";

if(mysqli_query($conn,$sql)){

    sendResponse(true,[],"User registered successfully");

}else{

    sendResponse(false,[],"Registration failed");

}

?>
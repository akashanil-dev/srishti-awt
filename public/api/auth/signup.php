<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$phone = $data['phone'];
$branch = $data['branch'];
$year = $data['year_of_passing'];

$sql = "INSERT INTO users (name,email,password,phone,branch,year_of_passing)
        VALUES ('$name','$email','$password','$phone','$branch','$year')";

if(mysqli_query($conn,$sql)){

    sendResponse(true,[],"User registered successfully");

}else{

    sendResponse(false,[],"Registration failed");

}

?>
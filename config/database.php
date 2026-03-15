<?php

$host = "localhost";
$user = "root";
$password = "2208";
$database = "tech_event";

$conn = mysqli_connect($host,$user,$password,$database);

if(!$conn){
    die("Database connection failed");
}

?>
<?php

session_start();

include_once(__DIR__ . "/../../config/database.php");
include_once(__DIR__ . "/../helpers/response.php");

if(!isset($_SESSION['user_id'])){
    sendResponse(false,array(),"Not logged in");
}

$user_id = $_SESSION['user_id'];

?>
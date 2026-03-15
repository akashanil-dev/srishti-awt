<?php

include_once("../../../app/helpers/response.php");

session_start();

// unset all session variables
session_unset();

// destroy the session
session_destroy();

sendResponse(true,[],"Logged out successfully");

?>
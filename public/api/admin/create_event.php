<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");
include("../../../app/middleware/admin.php");

$data = json_decode(file_get_contents("php://input"), true);

$title = $data['title'];
$description = $data['description'];
$date = $data['event_date'];
$max_participants = $data['max_participants'];
$created_by = $data['created_by'];

if(empty($title) || empty($date) || empty($max_participants)){
    sendResponse(false,[],"Required fields missing");
}

$sql = "INSERT INTO events
(title,description,event_date,max_participants,created_by)
VALUES
('$title','$description','$date','$max_participants','$created_by')";

$result = mysqli_query($conn,$sql);

if($result){
    sendResponse(true,[],"Event created successfully");
}else{
    sendResponse(false,[],"Event creation failed");
}

?>
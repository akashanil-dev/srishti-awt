<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/admin.php");

$data = json_decode(file_get_contents("php://input"), true);

$title = $data['title'];
$description = $data['description'];
$date = $data['event_date'];
$max_participants = $data['max_participants'];
$event_type = $data['event_type'] ?? 'solo';
$team_min = $data['team_min'] ?? null;
$team_max = $data['team_max'] ?? null;

$created_by = $_SESSION['user_id'];

if(empty($title) || empty($date) || empty($max_participants)){
    sendResponse(false, [], "Required fields missing");
}

$team_min_sql = $team_min ? "'$team_min'" : "NULL";
$team_max_sql = $team_max ? "'$team_max'" : "NULL";

$sql = "INSERT INTO events
(title, description, event_date, max_participants, event_type, team_min, team_max, created_by)
VALUES
('$title','$description','$date','$max_participants','$event_type',$team_min_sql,$team_max_sql,'$created_by')";

$result = mysqli_query($conn,$sql);

if($result){
    sendResponse(true, [], "Event created successfully");
}else{
    sendResponse(false, [], "Event creation failed");
}

?>
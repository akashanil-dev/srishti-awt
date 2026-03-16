<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/admin.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$title = $data['title'];
$description = $data['description'];
$event_date = $data['event_date'];
$max_participants = $data['max_participants'];
$event_type = $data['event_type'] ?? 'solo';
$team_min = $data['team_min'] ?? null;
$team_max = $data['team_max'] ?? null;

if(empty($id)){
    sendResponse(false, [], "Event ID required");
}

$team_min_sql = $team_min ? "'$team_min'" : "NULL";
$team_max_sql = $team_max ? "'$team_max'" : "NULL";

$sql = "UPDATE events 
        SET title='$title',
            description='$description',
            event_date='$event_date',
            max_participants='$max_participants',
            event_type='$event_type',
            team_min=$team_min_sql,
            team_max=$team_max_sql
        WHERE id='$id'";

$result = mysqli_query($conn,$sql);

if($result){
    sendResponse(true, [], "Event updated successfully");
}else{
    sendResponse(false, [], "Update failed");
}

?>
<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/admin.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? '';
$title = $data['title'] ?? '';
$description = $data['description'] ?? '';
$event_date = $data['event_date'] ?? '';
$max_participants = $data['max_participants'] ?? 0;
$event_type = $data['event_type'] ?? 'solo';
$team_min = $data['team_min'] ?? null;
$team_max = $data['team_max'] ?? null;

if(empty($id)){
    sendResponse(false, [], "Event ID required");
}

$stmt = mysqli_prepare($conn, "UPDATE events 
        SET title=?,
            description=?,
            event_date=?,
            max_participants=?,
            event_type=?,
            team_min=?,
            team_max=?
        WHERE id=?");
mysqli_stmt_bind_param($stmt, "sssisiii", $title, $description, $event_date, $max_participants, $event_type, $team_min, $team_max, $id);

$result = mysqli_stmt_execute($stmt);

if($result){
    sendResponse(true, [], "Event updated successfully");
}else{
    sendResponse(false, [], "Update failed");
}

mysqli_stmt_close($stmt);

?>
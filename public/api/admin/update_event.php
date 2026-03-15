<?php

include("../../../config/database.php");
include("../../../app/helpers/response.php");
include("../../../app/middleware/admin.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$title = $data['title'];
$description = $data['description'];
$event_date = $data['event_date'];
$max_participants = $data['max_participants'];

if(empty($id)){
    sendResponse(false, [], "Event ID required");
}

$sql = "UPDATE events 
        SET title='$title',
            description='$description',
            event_date='$event_date',
            max_participants='$max_participants'
        WHERE id='$id'";

$result = mysqli_query($conn,$sql);

if($result){
    sendResponse(true, [], "Event updated successfully");
}else{
    sendResponse(false, [], "Update failed");
}

?>
<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/admin.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];

if(empty($id)){
    sendResponse(false, [], "Event ID required");
}

$sql = "DELETE FROM events WHERE id='$id'";

$result = mysqli_query($conn,$sql);

if($result){
    sendResponse(true, [], "Event deleted successfully");
}else{
    sendResponse(false, [], "Delete failed");
}

?>
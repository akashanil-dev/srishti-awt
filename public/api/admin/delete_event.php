<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/admin.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? '';

if(empty($id)){
    sendResponse(false, [], "Event ID required");
}

$stmt = mysqli_prepare($conn, "DELETE FROM events WHERE id=?");
mysqli_stmt_bind_param($stmt, "i", $id);
$result = mysqli_stmt_execute($stmt);

if($result){
    sendResponse(true, [], "Event deleted successfully");
}else{
    sendResponse(false, [], "Delete failed");
}

mysqli_stmt_close($stmt);

?>
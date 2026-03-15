<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");

$event_id = $_GET['event_id'];

$sql = "SELECT users.name, users.email
        FROM event_registrations
        JOIN users
        ON users.id = event_registrations.user_id
        WHERE event_registrations.event_id='$event_id'";

$result = mysqli_query($conn,$sql);

$data = array();

while($row = mysqli_fetch_assoc($result)){
    $data[] = $row;
}

sendResponse(true,$data);

?>
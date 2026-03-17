<?php

include_once("../../../config/database.php");
include_once("../../../app/helpers/response.php");
include_once("../../../app/middleware/auth.php");
include_once("../../../app/helpers/validate.php");

$data = json_decode(file_get_contents("php://input"), true);

$type = sanitize($data['type'] ?? '');
$event_id = $data['event_id'] ?? '';
$team_id = $data['team_id'] ?? null;

// --- Validation ---
if (!in_array($type, ['registration', 'team'])) {
    sendResponse(false, [], "Invalid registration type");
}

if (!isPositiveInt($event_id)) {
    sendResponse(false, [], "Valid event ID is required");
}
$event_id = intval($event_id);

/* ═══════════════════════════════════════
   TYPE: DIRECT REGISTRATION
═══════════════════════════════════════ */
if ($type === 'registration') {

    $stmt = mysqli_prepare($conn, "DELETE FROM event_registrations WHERE user_id=? AND event_id=?");
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $event_id);

    if (mysqli_stmt_execute($stmt)) {
        if (mysqli_stmt_affected_rows($stmt) > 0) {
            sendResponse(true, [], "Successfully de-registered from the event");
        } else {
            sendResponse(false, [], "You are not registered for this event");
        }
    } else {
        sendResponse(false, [], "Failed to de-register");
    }
    mysqli_stmt_close($stmt);
    exit;
}

/* ═══════════════════════════════════════
   TYPE: TEAM MEMBERSHIP
═══════════════════════════════════════ */
if ($type === 'team') {

    if (!isPositiveInt($team_id)) {
        sendResponse(false, [], "Valid team ID is required");
    }
    $team_id = intval($team_id);

    // Check user's role in this team
    $stmt = mysqli_prepare($conn, "SELECT role FROM team_members WHERE team_id=? AND user_id=?");
    mysqli_stmt_bind_param($stmt, "ii", $team_id, $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) == 0) {
        sendResponse(false, [], "You are not a member of this team");
    }

    $member = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if ($member['role'] === 'leader') {

        // LEADER: Delete all team members, then the team itself
        $stmt = mysqli_prepare($conn, "DELETE FROM team_members WHERE team_id=?");
        mysqli_stmt_bind_param($stmt, "i", $team_id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        $stmt = mysqli_prepare($conn, "DELETE FROM teams WHERE id=?");
        mysqli_stmt_bind_param($stmt, "i", $team_id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        sendResponse(true, ["action" => "team_deleted"], "Team has been disbanded and all members removed");

    } else {

        // MEMBER: Just remove self from team
        $stmt = mysqli_prepare($conn, "DELETE FROM team_members WHERE team_id=? AND user_id=?");
        mysqli_stmt_bind_param($stmt, "ii", $team_id, $user_id);

        if (mysqli_stmt_execute($stmt)) {
            sendResponse(true, ["action" => "member_removed"], "You have left the team");
        } else {
            sendResponse(false, [], "Failed to leave team");
        }
        mysqli_stmt_close($stmt);
    }
}

?>
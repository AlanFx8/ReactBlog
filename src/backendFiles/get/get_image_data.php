<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: PUT, GET, POST");
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Type: application/x-www-form-urlencoded');
    
    require_once '../db/db.php';

    $imageIDs = json_decode($_POST['imageIDs']);
    $returnObject = array();

    for($x = 0; $x < count($imageIDs); $x++){
        $id = $imageIDs[$x]; //Array is only IDs
        $query = "SELECT file_name, image_data FROM images WHERE id = $id";
        $result = $conn->query($query) or die("Fatal error: " . $conn->error);

        if ($result->num_rows === 0){
            die("$id returned null");
        }

        $row = $result->fetch_array(MYSQLI_ASSOC);
        $row['image_data'] = base64_encode($row['image_data']);

        array_push($returnObject, $row);
    }

    echo json_encode($returnObject);
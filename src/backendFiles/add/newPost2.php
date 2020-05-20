<?php
    //This version is for testing, it doesn't add to the database
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: PUT, GET, POST");
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Type: application/x-www-form-urlencoded');

    //Import files - project is too small to need an AutoLoader
    require_once '../db/db.php';
    require_once './validateImage.php';

    $postContent = json_decode($_POST['postContent']); //Holds info on which item is a text post or image
    $postItems = array(); //The actual items sent

    $TEXT_TYPE = 0;
    $IMAGE_TYPE = 1;
    
    ///INITITAL LOOP///
    for($x = 0; $x < count($postContent); $x++){
        if ($postContent[$x][0] == "text"){
            array_push($postItems, $_POST[$postContent[$x][1]]);
        }
        else {
            if (!isset($_FILES[$postContent[$x][1]])){
                $name = $postContent[$x][1];
                SendResult(true, "No image was loaded for $name");
            }
            array_push($postItems, $_FILES[$postContent[$x][1]]);
        }
    }

    ///VALIDATION LOOP///
    for ($x = 0; $x < count($postContent); $x++){
        if ($postContent[$x][0] == "text"){
            if (trim($postItems[$x]) == ""){
                $name = $postContent[$x][1];
                SendResult(true, "$name is empty");
            }
            $postItems[$x] = $conn->real_escape_string(stripslashes(htmlentities(strip_tags($postItems[$x]))));
        }
        else {
            $result = ImageValidator::ValidateImage($postItems[$x]);
            if ($result != "OK"){
                $name = $postItems[$x]['name'];
                SendResult(true, "Error found for $name: " . $result);
            }
        }
    }

    //ALL IS VALID - TELL USER
    SendResult(false, "All post items are valid, however, no new post was made.");

    ///FUNCTIONS///
    function SendResult($error, $msg){
        $status = ($error)?"failure":"success";
        die(
            json_encode($response = array(
            "status" => $status,
            "error" => $error,
            "message" => $msg,
            ))
        );
    }
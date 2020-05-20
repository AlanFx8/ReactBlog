<?php
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

    ///NEW POST CREATION///
    $postBody = array();
    $conn->begin_transaction();
    for ($x = 0; $x < count($postItems); $x++){
        if ($postContent[$x][0] == "text"){
            $query_string = "INSERT INTO texts (content) VALUES (?)";
            $stmt = $conn->prepare($query_string);
            $stmt->bind_param('s', $postItems[$x]);
            if ($stmt->execute()){
                $id = $conn->insert_id;              
                array_push($postBody, array(
                    'type' => $TEXT_TYPE,
                    'id' => $id
                ));
            }
            else {
                $conn->rollback();
                SendResult(true, "Post upload error: " . $conn->error);
            }
        }
        else { //NEW IMAGE
            $image = $postItems[$x]; //Image array
            $file_name = strtolower(preg_replace('/\s+/', '-', $image['name'])); //Originial name
            $original_file_path = $image['tmp_name']; //Actual image and data
            
            $image_info = getimagesize($original_file_path);
            $mime_type = $image_info['mime'];
            $file_size = $image['size'];
            $image_data = file_get_contents($original_file_path);
            $file_name = $conn->real_escape_string($file_name);
            $mime_type = $conn->real_escape_string($mime_type);
            $file_size = $conn->real_escape_string($file_size);

            $query_string = "INSERT INTO images (file_name, mime_type, file_size, image_data) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($query_string);
            $stmt->bind_param('ssds', $file_name, $mime_type, $file_size, $image_data);

            if (!$stmt->execute()){
                $conn->rollback();
                SendResult(true, "Image upload error: " . $conn->error);
            }

            ResizeImage($original_file_path, "250", $mime_type); //Replace the file in tmp_name to the resized one
            $file_size = filesize($original_file_path);
            $image_data = file_get_contents($original_file_path);
            $file_size = $conn->real_escape_string($file_size);

            $query_string = "INSERT INTO images_min (file_name, mime_type, file_size, image_data) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($query_string);
            $stmt->bind_param('ssds', $file_name, $mime_type, $file_size, $image_data);

            if ($stmt->execute()){
                $id = $conn->insert_id;
                array_push($postBody, array(
                    'type' => $IMAGE_TYPE,
                    'id' => $id
                ));
            }
            else {
                $conn->rollback();
                SendResult(true, "Image thumbnail upload error: " . $conn->error);
            }
        }
    }

    $postBody = json_encode($postBody);
    $postID;
    $query_string = "INSERT INTO posts (blueprint) VALUES (?)";
    $stmt = $conn->prepare($query_string);
    $stmt->bind_param('s', $postBody);
    if ($stmt->execute()){
        $postID = $conn->insert_id;
    }
    else {
        $conn->rollback();
        SendResult(true, "Post upload error: " . $conn->error);
    }

    $conn->commit();
    $conn->close();

    ///FINISH///
    SendResult(false, "New post has been added to the database. ID: " . $postID);

    ///FUNCTIONS///
    function ResizeImage($file, $max_res, $mime_type){
        $originalImage = ($mime_type=='image/jpeg')?imagecreatefromjpeg($file):imagecreatefrompng($file);
        $originalWidth = imagesx($originalImage);
        $originalHeight = imagesy($originalImage);

        if ($originalImage){
            $ratio = $max_res / $originalWidth;
            $newWidth = $max_res;
            $newHeight = $originalHeight * $ratio;

            if ($newHeight > $max_res){
                $ratio = $max_res / $originalHeight;
                $newHeight = $max_res;
                $newWidth = $originalWidth * $ratio;
            }

            $newImage = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($newImage, $originalImage, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);
        
            //Create the image
            if ($mime_type=='image/jpeg'){
                imagejpeg($newImage, $file, 90);
            }
            else {
                imagepng($newImage, $file);
            }
        }
    }

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
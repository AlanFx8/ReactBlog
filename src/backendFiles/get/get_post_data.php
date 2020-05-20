<?php
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json; charset=utf-8');
    require_once '../db/db.php';

    ///VALIDATION CHECKS///
    //Check for valid amount
    if (!isset($_GET['amount']) || empty($_GET['amount']))
    die (json_encode("ERROR: No amount was given"));

    if (!is_numeric($_GET['amount']))
        die(json_encode("ERROR: amount is not a number"));

    //Check for valid skip amount
    //We don't check if empty as we need to skip 0
    if (!isset($_GET['skip']))
        die (json_encode("ERROR: No skip amount was given"));

    if (!is_numeric($_GET['skip']))
        die(json_encode("ERROR: skip amount is not a number"));

    //DECLARATIONS///
    $skip = $_GET['skip'];
    $amount = $_GET['amount'];
    $returnObject = array();

    $TEXT_TYPE = 0;
    $IMAGE_TYPE = 1;

    ///QUERY///
    $query = "SELECT blueprint FROM posts LIMIT $skip, $amount";
    $result = $conn->query($query) or die($conn->error);

    ///BUILD RESULT///
    $resultsNo = $result->num_rows;
    for ($x = 0; $x < $resultsNo; $x++){
        $result->data_seek($x);
        $row = $result->fetch_array(MYSQLI_ASSOC);

        $blueprint = json_decode($row['blueprint']);
        $subArray = array();
        $subArrayLength = count($blueprint);

        for ($y = 0; $y < $subArrayLength; $y++){
            if ($blueprint[$y]->type === $TEXT_TYPE){
                $id = $blueprint[$y]->id;
                $subQuery = "SELECT content FROM texts WHERE id = $id";
                $subResult = $conn->query($subQuery) or die("Fatal error: " . $conn->error);
                if ($subResult->num_rows === 0){
                    die("$id returned null");
                }

                $type = $TEXT_TYPE;
                $value = $subResult->fetch_array(MYSQLI_ASSOC);
                array_push($subArray, new PostType($type, $value));
            }
            else {
                $id = $blueprint[$y]->id;
                $subQuery = "SELECT id, file_name, image_data FROM images_min WHERE id = $id";
                $subResult = $conn->query($subQuery) or die("Fatal error: " . $conn->error);
                if ($subResult->num_rows === 0){
                    die("$id returned null");
                }
                $subRow = $subResult->fetch_array(MYSQLI_ASSOC);
                $subRow['image_data'] = base64_encode($subRow['image_data']);

                $type = $IMAGE_TYPE;
                $value = $subRow;
                array_push($subArray, new PostType($type, $value));
            }
        } //Y LOOP

        array_push($returnObject, $subArray);
    } //X LOOP

    ///SEND RESULT///
    echo json_encode($returnObject);

    ///CLASS///
    class PostType {
        public $type;
        public $value;

        function __construct($type, $value){
            $this->type = $type;
            $this->value = $value;
        }
    }
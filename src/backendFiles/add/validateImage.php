<?php
    //This class is used to validate images
    class ImageValidator {
        public static function ValidateImage($img){
            //Is it empty
            if ($img === null){
                return "No image has been submitted";
            }

            //Pre-existing errors
            if ($img['error'] !== 0){
                return "There was an upload error: " . self::$image_errors[$img['error']];
            }

            //There a hack attempt?
            if (!is_uploaded_file($img['tmp_name'])){
                return "Sorry, there was a error with the file."; //Don't give away too much info
            }

            //Is the filename safe
            if (!preg_match("`^[-0-9A-Z_\.]+$`i", $img['name'])){
                return "Filename has illegal characters";
            }

            //Is the filename too long
            if(mb_strlen($img['name'],"UTF-8") > 225){
                return "Filename cannot be longer than 225 characters";
            }

            //Was the file a valid image file
            if (!self::_fileIsImage($img['type'])){
                return "File is not an image.";
            }

            //Everything OK
            return "OK";
        }

        //Private functions
        //Note: this is a very simple method that doesn't check for x-png, webp, etc.
        private static function _fileIsImage($fileType){
            switch($fileType){
                case 'image/jpeg':
                case 'image/gif':
                case 'image/png':
                    return true;
            }
            return false;
        }

        private static $image_errors = array(
            1 => 'Maximum file size in php.ini exceeded',
            2 => 'Maximum file size in HTML form exceeded',
            3 => 'Only part of the file was uploaded',
            4 => 'No file was selected to upload'
        );
    }
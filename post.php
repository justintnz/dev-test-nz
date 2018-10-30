<?php
// only handle POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST')   {
    throw new Exception("Invalid request",201);
    exit();
}

session_start();
if (!$_SESSION['postkey']) {
    // echo ("Invalid request 1");var_dump($_SESSION['postkey']);
    throw new Exception("Invalid request",202);
}

if ($_SESSION['postkey']!=$_POST['postkey'])
{
    throw new Exception("Invalid request",203);
}

$title = str_replace(' ','_',$_POST['title']);
list($type, $data) = explode(';', $_POST['file']);

// Set a unique name to the file and save
$file_name = uniqid().'_'.$title;
file_put_contents('./uploads/'.$file_name, $data);

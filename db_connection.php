<?php
// Database connection configuration
$db_host = 'localhost';
$db_port = '3307';  // Non-default port as specified
$db_name = 'athensdb';
$db_user = 'root';  // Update with your MySQL username
$db_password = '';  // Update with your MySQL password if needed

// Create connection
$conn = mysqli_connect($db_host, $db_user, $db_password, $db_name, $db_port);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Set character set
mysqli_set_charset($conn, "utf8");
?>

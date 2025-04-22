<?php
// Include database connection
require_once 'db_connection.php';

// Get major from URL parameter 
$major = isset($_GET['major']) ? $_GET['major'] : 'cs';
$major = mysqli_real_escape_string($conn, $major);

// Validate major code (only allow 'cs' or 'ite')
$validMajor = in_array($major, ['cs', 'ite']) ? $major : 'cs';

// Initialize the response array
$response = array(
    'courseDatabase' => array(),
    'majorRequirements' => array(),
    'electiveCourses' => array()
);

// Get all courses
$query = "SELECT * FROM courses";
$result = mysqli_query($conn, $query);

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Convert string values back to arrays where needed
        $prereqs = !empty($row['prereqs']) ? explode(', ', $row['prereqs']) : array();
        $availableSemesters = !empty($row['availableSemesters']) ? explode(', ', $row['availableSemesters']) : array();
        $availableYears = !empty($row['availableYears']) ? explode(', ', $row['availableYears']) : array();
        
        // Format the course data similar to original JavaScript structure
        $response['courseDatabase'][$row['code']] = array(
            'code' => $row['code'],
            'title' => $row['title'],
            'prereqs' => $prereqs,
            'availableSemesters' => $availableSemesters,
            'availableYears' => $availableYears,
            'credits' => (int)$row['credits']
        );
    }
    mysqli_free_result($result);
}

// Get major requirements
$query = "SELECT * FROM majors";
$result = mysqli_query($conn, $query);

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $majorCode = $row['major'];
        $requiredCourses = !empty($row['requiredCourses']) ? explode(', ', $row['requiredCourses']) : array();
        
        $response['majorRequirements'][$majorCode] = array(
            'name' => $row['name'],
            'requiredCourses' => $requiredCourses
        );
    }
    mysqli_free_result($result);
}

// Get elective courses
$query = "SELECT * FROM electives";
$result = mysqli_query($conn, $query);

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $majorCode = $row['major'];
        $courses = !empty($row['courses']) ? explode(', ', $row['courses']) : array();
        
        $response['electiveCourses'][$majorCode] = array(
            'name' => $row['name'],
            'courses' => $courses
        );
    }
    mysqli_free_result($result);
}

// Return as JSON
header('Content-Type: application/json');
echo json_encode($response);

// Close connection
mysqli_close($conn);
?>

<?php
// CORS compliance headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle CORS Preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set up error reporting (can be customized for production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set default timezone
date_default_timezone_set('Asia/Kolkata');

// Load configurations, middleware, and models
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/middleware/authMiddleware.php';

// Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/StudentController.php';
require_once __DIR__ . '/controllers/QuizController.php';
require_once __DIR__ . '/controllers/ResultController.php';

// Parse Request URI and method
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize URL by removing subfolders and index.php if running inside WAMP/XAMPP subfolders
$requestUri = str_replace(['/backend/index.php', '/backend', '/index.php'], '', $requestUri);
$requestUri = rtrim($requestUri, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Database instance
$database = Database::getInstance();
$db = $database->getConnection();

// Basic routing engine
try {
    switch ($requestUri) {
        // --- Authentication ---
        case '/api/auth/register':
            if ($method === 'POST') {
                $controller = new AuthController($db);
                $controller->register();
            } else {
                methodNotAllowed();
            }
            break;

        case '/api/auth/login':
            if ($method === 'POST') {
                $controller = new AuthController($db);
                $controller->login();
            } else {
                methodNotAllowed();
            }
            break;

        case '/api/auth/logout':
            if ($method === 'POST') {
                $controller = new AuthController($db);
                $controller->logout();
            } else {
                methodNotAllowed();
            }
            break;

        // --- Students ---
        case '/api/students':
            $controller = new StudentController($db);
            if ($method === 'GET') {
                // Anyone authenticated can fetch (middleware is executed inside the controller or here)
                AuthMiddleware::authenticate();
                $controller->getStudents();
            } elseif ($method === 'POST') {
                // Admin only
                AuthMiddleware::authorize(['admin']);
                $controller->addStudent();
            } elseif ($method === 'PUT') {
                // Authenticated
                AuthMiddleware::authenticate();
                $controller->updateStudent();
            } elseif ($method === 'DELETE') {
                // Admin only
                AuthMiddleware::authorize(['admin']);
                $controller->deleteStudent();
            } else {
                methodNotAllowed();
            }
            break;

        // --- Quizzes ---
        case '/api/quizzes':
            $controller = new QuizController($db);
            if ($method === 'GET') {
                $controller->getQuizzes();
            } elseif ($method === 'POST') {
                $controller->createQuiz();
            } elseif ($method === 'PUT') {
                $controller->updateQuiz();
            } elseif ($method === 'DELETE') {
                $controller->deleteQuiz();
            } else {
                methodNotAllowed();
            }
            break;

        // --- Results & Progress ---
        case '/api/results/submit':
            if ($method === 'POST') {
                $controller = new ResultController($db);
                $controller->submitQuiz();
            } else {
                methodNotAllowed();
            }
            break;

        case '/api/results/student':
            if ($method === 'GET') {
                $controller = new ResultController($db);
                $controller->getStudentResults();
            } else {
                methodNotAllowed();
            }
            break;

        case '/api/results/quiz':
            if ($method === 'GET') {
                $controller = new ResultController($db);
                $controller->getQuizResults();
            } else {
                methodNotAllowed();
            }
            break;

        case '/api/results/progress':
            if ($method === 'GET') {
                $controller = new ResultController($db);
                $controller->getProgress();
            } else {
                methodNotAllowed();
            }
            break;

        case '/api/results/admin-stats':
            if ($method === 'GET') {
                $controller = new ResultController($db);
                $controller->getAdminStats();
            } else {
                methodNotAllowed();
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Endpoint not found: " . $requestUri]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}

function methodNotAllowed() {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "HTTP method not allowed."]);
}

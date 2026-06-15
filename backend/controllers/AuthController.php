<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Student.php';

class AuthController {
    private $db;
    private $userModel;
    private $studentModel;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
        $this->userModel = new User($databaseConnection);
        $this->studentModel = new Student($databaseConnection);
    }

    /**
     * Handle user registration.
     */
    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['role'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Name, email, password, and role are required."]);
            return;
        }

        $name = strip_tags($data['name']);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = $data['password'];
        $role = $data['role'];

        if ($role !== 'admin' && $role !== 'student') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid role."]);
            return;
        }

        // Validate student specific fields
        if ($role === 'student') {
            if (empty($data['department']) || empty($data['year']) || empty($data['phone'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Student department, year, and phone are required."]);
                return;
            }
        }

        // Check if email already exists
        if ($this->userModel->findByEmail($email) !== null) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Email is already registered."]);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Create user
            $userId = $this->userModel->create($name, $email, $password, $role);

            // Create student profile if applicable
            $studentId = null;
            if ($role === 'student') {
                $department = strip_tags($data['department']);
                $year = (int)$data['year'];
                $phone = strip_tags($data['phone']);
                $studentId = $this->studentModel->create($userId, $department, $year, $phone);
            }

            $this->db->commit();

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "User registered successfully.",
                "data" => [
                    "id" => $userId,
                    "name" => $name,
                    "email" => $email,
                    "role" => $role,
                    "student_id" => $studentId
                ]
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Registration failed: " . $e->getMessage()]);
        }
    }

    /**
     * Handle user login.
     */
    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Email and password are required."]);
            return;
        }

        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = $data['password'];

        $user = $this->userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Invalid email or password."]);
            return;
        }

        // Fetch Student ID if role is student
        $studentId = null;
        if ($user['role'] === 'student') {
            $student = $this->studentModel->findByUserId($user['id']);
            if ($student) {
                $studentId = $student['student_id'];
            }
        }

        // Prepare token payload
        $payload = [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role'],
            "student_id" => $studentId
        ];

        // Generate JWT token
        $token = JWT::encode($payload);

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login successful.",
            "token" => $token,
            "user" => [
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email'],
                "role" => $user['role'],
                "student_id" => $studentId
            ]
        ]);
    }

    /**
     * Logout placeholder.
     */
    public function logout() {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Logged out successfully."]);
    }
}

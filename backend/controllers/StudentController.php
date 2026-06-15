<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Student.php';

class StudentController {
    private $db;
    private $userModel;
    private $studentModel;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
        $this->userModel = new User($databaseConnection);
        $this->studentModel = new Student($databaseConnection);
    }

    /**
     * Get all students or a single student profile.
     */
    public function getStudents() {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if ($id) {
            $student = $this->studentModel->findById($id);
            if (!$student) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Student not found."]);
                return;
            }
            echo json_encode(["success" => true, "data" => $student]);
        } else {
            $students = $this->studentModel->getAll();
            echo json_encode(["success" => true, "data" => $students]);
        }
    }

    /**
     * Add a student (Admin feature).
     */
    public function addStudent() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password']) ||
            empty($data['department']) || empty($data['year']) || empty($data['phone'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "All fields (name, email, password, department, year, phone) are required."]);
            return;
        }

        $name = strip_tags($data['name']);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = $data['password'];
        $department = strip_tags($data['department']);
        $year = (int)$data['year'];
        $phone = strip_tags($data['phone']);

        // Check duplicate email
        if ($this->userModel->findByEmail($email) !== null) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Email is already in use."]);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Create base user account as a student
            $userId = $this->userModel->create($name, $email, $password, 'student');

            // Create student details
            $studentId = $this->studentModel->create($userId, $department, $year, $phone);

            $this->db->commit();

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Student account created successfully.",
                "data" => [
                    "student_id" => $studentId,
                    "user_id" => $userId,
                    "name" => $name,
                    "email" => $email,
                    "department" => $department,
                    "year" => $year,
                    "phone" => $phone
                ]
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to create student: " . $e->getMessage()]);
        }
    }

    /**
     * Update student details (can be used by Admin, or Student on their profile).
     */
    public function updateStudent() {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['student_id']) ? (int)$data['student_id'] : null);

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Student ID is required."]);
            return;
        }

        $student = $this->studentModel->findById($id);
        if (!$student) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Student profile not found."]);
            return;
        }

        $name = !empty($data['name']) ? strip_tags($data['name']) : $student['name'];
        $email = !empty($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : $student['email'];
        $department = !empty($data['department']) ? strip_tags($data['department']) : $student['department'];
        $year = !empty($data['year']) ? (int)$data['year'] : (int)$student['year'];
        $phone = !empty($data['phone']) ? strip_tags($data['phone']) : $student['phone'];

        // If email is changing, check for duplicates
        if ($email !== $student['email'] && $this->userModel->findByEmail($email) !== null) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Email is already in use."]);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Update user details
            $this->userModel->update($student['user_id'], $name, $email);

            // Update student specifics
            $this->studentModel->update($id, $department, $year, $phone);

            // Optionally update password if provided
            if (!empty($data['password'])) {
                $this->userModel->updatePassword($student['user_id'], $data['password']);
            }

            $this->db->commit();

            echo json_encode([
                "success" => true,
                "message" => "Student details updated successfully.",
                "data" => [
                    "student_id" => $id,
                    "name" => $name,
                    "email" => $email,
                    "department" => $department,
                    "year" => $year,
                    "phone" => $phone
                ]
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to update student: " . $e->getMessage()]);
        }
    }

    /**
     * Delete student (Admin feature).
     */
    public function deleteStudent() {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Student ID is required."]);
            return;
        }

        $student = $this->studentModel->findById($id);
        if (!$student) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Student not found."]);
            return;
        }

        // Deleting the corresponding User record cascades the deletion of the student details record in MySQL.
        if ($this->userModel->delete($student['user_id'])) {
            echo json_encode(["success" => true, "message" => "Student deleted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to delete student."]);
        }
    }
}

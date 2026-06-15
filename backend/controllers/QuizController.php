<?php
require_once __DIR__ . '/../models/Quiz.php';
require_once __DIR__ . '/../models/Question.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

class QuizController {
    private $db;
    private $quizModel;
    private $questionModel;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
        $this->quizModel = new Quiz($databaseConnection);
        $this->questionModel = new Question($databaseConnection);
    }

    /**
     * Get all quizzes or a specific quiz with questions.
     */
    public function getQuizzes() {
        $user = AuthMiddleware::authenticate();
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if ($id) {
            $quiz = $this->quizModel->findById($id);
            if (!$quiz) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Quiz not found."]);
                return;
            }

            // Exclude correct answer keys for student role to prevent inspector-based cheating
            $includeCorrectAnswer = ($user['role'] === 'admin');
            $questions = $this->questionModel->getByQuizId($id, $includeCorrectAnswer);
            $quiz['questions'] = $questions;

            echo json_encode(["success" => true, "data" => $quiz]);
        } else {
            $quizzes = $this->quizModel->getAll();
            echo json_encode(["success" => true, "data" => $quizzes]);
        }
    }

    /**
     * Create a new quiz and add questions (Admin only).
     */
    public function createQuiz() {
        $user = AuthMiddleware::authorize(['admin']);
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['title']) || empty($data['total_marks']) || empty($data['duration'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Title, total marks, and duration are required."]);
            return;
        }

        $title = strip_tags($data['title']);
        $description = isset($data['description']) ? strip_tags($data['description']) : '';
        $totalMarks = (int)$data['total_marks'];
        $duration = (int)$data['duration'];
        $questions = isset($data['questions']) ? $data['questions'] : [];

        try {
            $this->db->beginTransaction();

            // Create Quiz
            $quizId = $this->quizModel->create($title, $description, $totalMarks, $duration, $user['id']);

            // Insert questions
            foreach ($questions as $q) {
                if (empty($q['question_text']) || empty($q['option_a']) || empty($q['option_b']) || 
                    empty($q['option_c']) || empty($q['option_d']) || empty($q['correct_answer'])) {
                    throw new Exception("All questions must have a question text, options (a, b, c, d), and correct answer.");
                }
                
                $this->questionModel->create(
                    $quizId,
                    strip_tags($q['question_text']),
                    strip_tags($q['option_a']),
                    strip_tags($q['option_b']),
                    strip_tags($q['option_c']),
                    strip_tags($q['option_d']),
                    strtoupper(trim($q['correct_answer']))
                );
            }

            $this->db->commit();

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Quiz and questions created successfully.",
                "data" => ["quiz_id" => $quizId]
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Quiz creation failed: " . $e->getMessage()]);
        }
    }

    /**
     * Update an existing quiz and its questions (Admin only).
     */
    public function updateQuiz() {
        $user = AuthMiddleware::authorize(['admin']);
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['quiz_id']) ? (int)$data['quiz_id'] : null);

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Quiz ID is required."]);
            return;
        }

        $quiz = $this->quizModel->findById($id);
        if (!$quiz) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Quiz not found."]);
            return;
        }

        $title = !empty($data['title']) ? strip_tags($data['title']) : $quiz['title'];
        $description = isset($data['description']) ? strip_tags($data['description']) : $quiz['description'];
        $totalMarks = !empty($data['total_marks']) ? (int)$data['total_marks'] : (int)$quiz['total_marks'];
        $duration = !empty($data['duration']) ? (int)$data['duration'] : (int)$quiz['duration'];
        $questions = isset($data['questions']) ? $data['questions'] : null;

        try {
            $this->db->beginTransaction();

            // Update Quiz details
            $this->quizModel->update($id, $title, $description, $totalMarks, $duration);

            // If questions are provided, clear old questions and insert new ones
            if ($questions !== null) {
                $this->questionModel->deleteByQuizId($id);

                foreach ($questions as $q) {
                    if (empty($q['question_text']) || empty($q['option_a']) || empty($q['option_b']) || 
                        empty($q['option_c']) || empty($q['option_d']) || empty($q['correct_answer'])) {
                        throw new Exception("All questions must have a question text, options, and a correct answer.");
                    }
                    
                    $this->questionModel->create(
                        $id,
                        strip_tags($q['question_text']),
                        strip_tags($q['option_a']),
                        strip_tags($q['option_b']),
                        strip_tags($q['option_c']),
                        strip_tags($q['option_d']),
                        strtoupper(trim($q['correct_answer']))
                    );
                }
            }

            $this->db->commit();

            echo json_encode(["success" => true, "message" => "Quiz updated successfully."]);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Quiz update failed: " . $e->getMessage()]);
        }
    }

    /**
     * Delete quiz (Admin only).
     */
    public function deleteQuiz() {
        AuthMiddleware::authorize(['admin']);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Quiz ID is required."]);
            return;
        }

        $quiz = $this->quizModel->findById($id);
        if (!$quiz) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Quiz not found."]);
            return;
        }

        if ($this->quizModel->delete($id)) {
            echo json_encode(["success" => true, "message" => "Quiz deleted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to delete quiz."]);
        }
    }
}

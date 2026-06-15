<?php
require_once __DIR__ . '/../models/Result.php';
require_once __DIR__ . '/../models/Question.php';
require_once __DIR__ . '/../models/Quiz.php';
require_once __DIR__ . '/../middleware/authMiddleware.php';

class ResultController {
    private $db;
    private $resultModel;
    private $questionModel;
    private $quizModel;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
        $this->resultModel = new Result($databaseConnection);
        $this->questionModel = new Question($databaseConnection);
        $this->quizModel = new Quiz($databaseConnection);
    }

    /**
     * Submit a quiz attempt and calculate score.
     */
    public function submitQuiz() {
        $user = AuthMiddleware::authorize(['student']);
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['quiz_id']) || !isset($data['answers'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Quiz ID and answers are required."]);
            return;
        }

        $quizId = (int)$data['quiz_id'];
        $submittedAnswers = $data['answers']; // key-value array: question_id => 'A', 'B', 'C', 'D'

        // Fetch Quiz details
        $quiz = $this->quizModel->findById($quizId);
        if (!$quiz) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Quiz not found."]);
            return;
        }

        // Fetch actual questions (including correct answers)
        $questions = $this->questionModel->getByQuizId($quizId, true);
        if (count($questions) === 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Quiz contains no questions."]);
            return;
        }

        $correctCount = 0;
        $totalQuestions = count($questions);
        $detailedResults = [];

        foreach ($questions as $q) {
            $qId = $q['question_id'];
            $correctAns = strtoupper($q['correct_answer']);
            $submittedAns = isset($submittedAnswers[$qId]) ? strtoupper(trim($submittedAnswers[$qId])) : null;

            $isCorrect = ($submittedAns === $correctAns);
            if ($isCorrect) {
                $correctCount++;
            }

            $detailedResults[] = [
                "question_id" => $qId,
                "question_text" => $q['question_text'],
                "option_a" => $q['option_a'],
                "option_b" => $q['option_b'],
                "option_c" => $q['option_c'],
                "option_d" => $q['option_d'],
                "submitted_answer" => $submittedAns,
                "correct_answer" => $correctAns,
                "is_correct" => $isCorrect
            ];
        }

        // Calculate score proportional to quiz total marks
        // Score = (correctCount / totalQuestions) * totalMarks
        $totalMarks = (int)$quiz['total_marks'];
        $calculatedScore = (int)round(($correctCount / $totalQuestions) * $totalMarks);

        $studentId = (int)$user['student_id'];

        try {
            $attemptId = $this->resultModel->createAttempt($studentId, $quizId, $calculatedScore, $totalQuestions, 'completed');

            echo json_encode([
                "success" => true,
                "message" => "Quiz submitted successfully.",
                "data" => [
                    "attempt_id" => $attemptId,
                    "score" => $calculatedScore,
                    "total_marks" => $totalMarks,
                    "correct_count" => $correctCount,
                    "total_questions" => $totalQuestions,
                    "detailed_results" => $detailedResults
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to record quiz attempt: " . $e->getMessage()]);
        }
    }

    /**
     * Get attempts for the logged-in student.
     */
    public function getStudentResults() {
        $user = AuthMiddleware::authorize(['student']);
        $studentId = (int)$user['student_id'];

        $results = $this->resultModel->getByStudentId($studentId);
        echo json_encode(["success" => true, "data" => $results]);
    }

    /**
     * Get student attempts for a quiz (Admin only).
     */
    public function getQuizResults() {
        AuthMiddleware::authorize(['admin']);
        $quizId = isset($_GET['quiz_id']) ? (int)$_GET['quiz_id'] : null;

        if (!$quizId) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Quiz ID is required."]);
            return;
        }

        $results = $this->resultModel->getByQuizId($quizId);
        echo json_encode(["success" => true, "data" => $results]);
    }

    /**
     * Get overall progress stats for logged-in student.
     */
    public function getProgress() {
        $user = AuthMiddleware::authorize(['student']);
        $studentId = (int)$user['student_id'];

        $stats = $this->resultModel->getProgress($studentId);
        echo json_encode(["success" => true, "data" => $stats]);
    }

    /**
     * Get admin statistics for dashboard.
     */
    public function getAdminStats() {
        AuthMiddleware::authorize(['admin']);
        $stats = $this->resultModel->getAdminStats();
        echo json_encode(["success" => true, "data" => $stats]);
    }
}

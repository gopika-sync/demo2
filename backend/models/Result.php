<?php
class Result {
    private $db;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
    }

    /**
     * Create a new quiz attempt.
     */
    public function createAttempt(int $studentId, int $quizId, int $score, int $totalQuestions, string $status = 'completed'): int {
        $query = "INSERT INTO quiz_attempts (student_id, quiz_id, score, total_questions, status) 
                  VALUES (:student_id, :quiz_id, :score, :total_questions, :status)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            'student_id' => $studentId,
            'quiz_id' => $quizId,
            'score' => $score,
            'total_questions' => $totalQuestions,
            'status' => $status
        ]);
        return (int) $this->db->lastInsertId();
    }

    /**
     * Get all attempts made by a specific student.
     */
    public function getByStudentId(int $studentId): array {
        $query = "SELECT a.*, q.title as quiz_title, q.description as quiz_description, q.total_marks as quiz_total_marks
                  FROM quiz_attempts a
                  JOIN quizzes q ON a.quiz_id = q.quiz_id
                  WHERE a.student_id = :student_id
                  ORDER BY a.completed_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all attempts for a specific quiz (for Admin view).
     */
    public function getByQuizId(int $quizId): array {
        $query = "SELECT a.*, u.name as student_name, s.department, s.year, q.title as quiz_title, q.total_marks as quiz_total_marks
                  FROM quiz_attempts a
                  JOIN students s ON a.student_id = s.student_id
                  JOIN users u ON s.user_id = u.id
                  JOIN quizzes q ON a.quiz_id = q.quiz_id
                  WHERE a.quiz_id = :quiz_id
                  ORDER BY a.score DESC, a.completed_at ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['quiz_id' => $quizId]);
        return $stmt->fetchAll();
    }

    /**
     * Get progress stats for a specific student.
     */
    public function getProgress(int $studentId): array {
        // Total quizzes available
        $totalQuizzesQuery = "SELECT COUNT(*) as total FROM quizzes";
        $totalQuizzesStmt = $this->db->prepare($totalQuizzesQuery);
        $totalQuizzesStmt->execute();
        $totalQuizzes = (int) $totalQuizzesStmt->fetch()['total'];

        // Total quizzes attempted by this student (unique quizzes)
        $attemptedQuery = "SELECT COUNT(DISTINCT quiz_id) as total_attempted, AVG(score) as avg_score 
                            FROM quiz_attempts 
                            WHERE student_id = :student_id AND status = 'completed'";
        $attemptedStmt = $this->db->prepare($attemptedQuery);
        $attemptedStmt->execute(['student_id' => $studentId]);
        $attemptData = $attemptedStmt->fetch();

        $attempted = (int) ($attemptData['total_attempted'] ?? 0);
        $averageScore = (float) ($attemptData['avg_score'] ?? 0);
        $pending = max(0, $totalQuizzes - $attempted);
        $completionPercentage = $totalQuizzes > 0 ? round(($attempted / $totalQuizzes) * 100, 1) : 0;

        return [
            "total_quizzes" => $totalQuizzes,
            "attempted_quizzes" => $attempted,
            "pending_quizzes" => $pending,
            "average_score" => $averageScore,
            "completion_percentage" => $completionPercentage
        ];
    }

    /**
     * Get global analytics statistics (for Admin Dashboard).
     */
    public function getAdminStats(): array {
        // Total Students
        $studentsQuery = "SELECT COUNT(*) as total FROM students";
        $studentsStmt = $this->db->prepare($studentsQuery);
        $studentsStmt->execute();
        $totalStudents = (int) $studentsStmt->fetch()['total'];

        // Total Quizzes
        $quizzesQuery = "SELECT COUNT(*) as total FROM quizzes";
        $quizzesStmt = $this->db->prepare($quizzesQuery);
        $quizzesStmt->execute();
        $totalQuizzes = (int) $quizzesStmt->fetch()['total'];

        // Completed Quiz Attempts
        $attemptsQuery = "SELECT COUNT(*) as total, AVG(score) as avg_score FROM quiz_attempts WHERE status = 'completed'";
        $attemptsStmt = $this->db->prepare($attemptsQuery);
        $attemptsStmt->execute();
        $attemptData = $attemptsStmt->fetch();
        $completedAttempts = (int) ($attemptData['total'] ?? 0);
        $averageScore = (float) ($attemptData['avg_score'] ?? 0);

        return [
            "total_students" => $totalStudents,
            "total_quizzes" => $totalQuizzes,
            "completed_quizzes" => $completedAttempts,
            "average_score" => round($averageScore, 1)
        ];
    }
}

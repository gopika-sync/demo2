<?php
class Question {
    private $db;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
    }

    /**
     * Get all questions for a specific quiz.
     * Option to exclude the correct answer for student attempts.
     */
    public function getByQuizId(int $quizId, bool $includeCorrectAnswer = true): array {
        if ($includeCorrectAnswer) {
            $query = "SELECT * FROM questions WHERE quiz_id = :quiz_id ORDER BY question_id ASC";
        } else {
            $query = "SELECT question_id, quiz_id, question_text, option_a, option_b, option_c, option_d 
                      FROM questions 
                      WHERE quiz_id = :quiz_id 
                      ORDER BY question_id ASC";
        }
        $stmt = $this->db->prepare($query);
        $stmt->execute(['quiz_id' => $quizId]);
        return $stmt->fetchAll();
    }

    /**
     * Get a single question by its ID.
     */
    public function findById(int $questionId): ?array {
        $query = "SELECT * FROM questions WHERE question_id = :question_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['question_id' => $questionId]);
        $question = $stmt->fetch();
        return $question ? $question : null;
    }

    /**
     * Create a new question.
     */
    public function create(int $quizId, string $questionText, string $optionA, string $optionB, string $optionC, string $optionD, string $correctAnswer): int {
        $query = "INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer) 
                  VALUES (:quiz_id, :question_text, :option_a, :option_b, :option_c, :option_d, :correct_answer)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            'quiz_id' => $quizId,
            'question_text' => $questionText,
            'option_a' => $optionA,
            'option_b' => $optionB,
            'option_c' => $optionC,
            'option_d' => $optionD,
            'correct_answer' => $correctAnswer
        ]);
        return (int) $this->db->lastInsertId();
    }

    /**
     * Update an existing question.
     */
    public function update(int $questionId, string $questionText, string $optionA, string $optionB, string $optionC, string $optionD, string $correctAnswer): bool {
        $query = "UPDATE questions 
                  SET question_text = :question_text, option_a = :option_a, option_b = :option_b, option_c = :option_c, option_d = :option_d, correct_answer = :correct_answer 
                  WHERE question_id = :question_id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            'question_text' => $questionText,
            'option_a' => $optionA,
            'option_b' => $optionB,
            'option_c' => $optionC,
            'option_d' => $optionD,
            'correct_answer' => $correctAnswer,
            'question_id' => $questionId
        ]);
    }

    /**
     * Delete a single question.
     */
    public function delete(int $questionId): bool {
        $query = "DELETE FROM questions WHERE question_id = :question_id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute(['question_id' => $questionId]);
    }

    /**
     * Delete all questions associated with a quiz.
     */
    public function deleteByQuizId(int $quizId): bool {
        $query = "DELETE FROM questions WHERE quiz_id = :quiz_id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute(['quiz_id' => $quizId]);
    }
}

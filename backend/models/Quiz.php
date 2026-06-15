<?php
class Quiz {
    private $db;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
    }

    /**
     * Get all quizzes, including the creator's name.
     */
    public function getAll(): array {
        $query = "SELECT q.*, u.name as creator_name 
                  FROM quizzes q 
                  JOIN users u ON q.created_by = u.id 
                  ORDER BY q.quiz_id DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Get a quiz by its ID.
     */
    public function findById(int $quizId): ?array {
        $query = "SELECT q.*, u.name as creator_name 
                  FROM quizzes q 
                  JOIN users u ON q.created_by = u.id 
                  WHERE q.quiz_id = :quiz_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['quiz_id' => $quizId]);
        $quiz = $stmt->fetch();
        return $quiz ? $quiz : null;
    }

    /**
     * Create a new quiz.
     */
    public function create(string $title, string $description, int $totalMarks, int $duration, int $createdBy): int {
        $query = "INSERT INTO quizzes (title, description, total_marks, duration, created_by) 
                  VALUES (:title, :description, :total_marks, :duration, :created_by)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            'title' => $title,
            'description' => $description,
            'total_marks' => $totalMarks,
            'duration' => $duration,
            'created_by' => $createdBy
        ]);
        return (int) $this->db->lastInsertId();
    }

    /**
     * Update an existing quiz.
     */
    public function update(int $quizId, string $title, string $description, int $totalMarks, int $duration): bool {
        $query = "UPDATE quizzes 
                  SET title = :title, description = :description, total_marks = :total_marks, duration = :duration 
                  WHERE quiz_id = :quiz_id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            'title' => $title,
            'description' => $description,
            'total_marks' => $totalMarks,
            'duration' => $duration,
            'quiz_id' => $quizId
        ]);
    }

    /**
     * Delete a quiz by its ID (cascades questions and attempts via database constraints).
     */
    public function delete(int $quizId): bool {
        $query = "DELETE FROM quizzes WHERE quiz_id = :quiz_id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute(['quiz_id' => $quizId]);
    }
}

<?php
class Student {
    private $db;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
    }

    /**
     * Get list of all students with their user account details.
     */
    public function getAll(): array {
        $query = "SELECT s.student_id, s.user_id, u.name, u.email, s.department, s.year, s.phone, u.created_at 
                  FROM students s 
                  JOIN users u ON s.user_id = u.id 
                  WHERE u.role = 'student'
                  ORDER BY s.student_id DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Find student details by student_id.
     */
    public function findById(int $studentId): ?array {
        $query = "SELECT s.student_id, s.user_id, u.name, u.email, s.department, s.year, s.phone, u.created_at 
                  FROM students s 
                  JOIN users u ON s.user_id = u.id 
                  WHERE s.student_id = :student_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['student_id' => $studentId]);
        $student = $stmt->fetch();
        return $student ? $student : null;
    }

    /**
     * Find student details by user_id.
     */
    public function findByUserId(int $userId): ?array {
        $query = "SELECT s.student_id, s.user_id, u.name, u.email, s.department, s.year, s.phone, u.created_at 
                  FROM students s 
                  JOIN users u ON s.user_id = u.id 
                  WHERE s.user_id = :user_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['user_id' => $userId]);
        $student = $stmt->fetch();
        return $student ? $student : null;
    }

    /**
     * Create student profile details.
     */
    public function create(int $userId, string $department, int $year, string $phone): int {
        $query = "INSERT INTO students (user_id, department, year, phone) VALUES (:user_id, :department, :year, :phone)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            'user_id' => $userId,
            'department' => $department,
            'year' => $year,
            'phone' => $phone
        ]);
        return (int) $this->db->lastInsertId();
    }

    /**
     * Update student profile details.
     */
    public function update(int $studentId, string $department, int $year, string $phone): bool {
        $query = "UPDATE students SET department = :department, year = :year, phone = :phone WHERE student_id = :student_id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            'department' => $department,
            'year' => $year,
            'phone' => $phone,
            'student_id' => $studentId
        ]);
    }
}

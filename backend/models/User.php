<?php
class User {
    private $db;

    public function __construct($databaseConnection) {
        $this->db = $databaseConnection;
    }

    /**
     * Find a user by their email address.
     */
    public function findByEmail(string $email): ?array {
        $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();
        return $user ? $user : null;
    }

    /**
     * Find user by ID.
     */
    public function findById(int $id): ?array {
        $query = "SELECT id, name, email, role, created_at FROM users WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();
        return $user ? $user : null;
    }

    /**
     * Create a new user with a hashed password.
     */
    public function create(string $name, string $email, string $password, string $role): int {
        $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $this->db->prepare($query);
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password' => $hashedPassword,
            'role' => $role
        ]);
        return (int) $this->db->lastInsertId();
    }

    /**
     * Update user details (excluding password).
     */
    public function update(int $id, string $name, string $email): bool {
        $query = "UPDATE users SET name = :name, email = :email WHERE id = :id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            'name' => $name,
            'email' => $email,
            'id' => $id
        ]);
    }

    /**
     * Update user password.
     */
    public function updatePassword(int $id, string $newPassword): bool {
        $query = "UPDATE users SET password = :password WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        return $stmt->execute([
            'password' => $hashedPassword,
            'id' => $id
        ]);
    }

    /**
     * Delete a user by ID.
     */
    public function delete(int $id): bool {
        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute(['id' => $id]);
    }
}

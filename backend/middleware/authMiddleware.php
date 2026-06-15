<?php
require_once __DIR__ . '/../config/jwt.php';

class AuthMiddleware {
    /**
     * Authenticate the request using JWT. Returns the decoded token payload on success.
     * Terminating execution with a 401 response if validation fails.
     */
    public static function authenticate(): array {
        $authHeader = null;

        // Try standard PHP variables first, then fallback to getallheaders
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
            } elseif (isset($headers['authorization'])) {
                $authHeader = $headers['authorization'];
            }
        }

        if (!$authHeader) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Access denied. Token missing."]);
            exit;
        }

        // Expected format: Bearer <token>
        $parts = explode(" ", $authHeader);
        if (count($parts) !== 2 || strtolower($parts[0]) !== 'bearer') {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Access denied. Invalid token format."]);
            exit;
        }

        $token = $parts[1];
        $payload = JWT::decode($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Access denied. Expired or invalid token."]);
            exit;
        }

        return $payload;
    }

    /**
     * Authenticate and authorize a user based on matching roles.
     */
    public static function authorize(array $allowedRoles): array {
        $payload = self::authenticate();
        if (!isset($payload['role']) || !in_array($payload['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Forbidden. Insufficient permissions."]);
            exit;
        }
        return $payload;
    }
}

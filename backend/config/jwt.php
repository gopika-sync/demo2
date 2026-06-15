<?php
class JWT {
    // A secure secret key. In a production environment, this should ideally be loaded from environment variables.
    private static $secret = "lms_quiz_jwt_super_secret_key_2026_antigravity";

    /**
     * Encode payload into a JWT string.
     */
    public static function encode(array $payload, int $expirySeconds = 86400): string {
        $issuedAt = time();
        $expireAt = $issuedAt + $expirySeconds;

        $payload['iat'] = $issuedAt;
        $payload['exp'] = $expireAt;

        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Decode JWT string and return the payload. Returns null if invalid or expired.
     */
    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($header, $payload, $signature) = $parts;

        // Verify Signature
        $expectedSignature = self::base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, self::$secret, true));
        if (!hash_equals($expectedSignature, $signature)) {
            return null; // Invalid signature
        }

        $decodedPayload = json_decode(self::base64UrlDecode($payload), true);
        if (!$decodedPayload) {
            return null; // Invalid payload JSON
        }

        // Check expiration
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return null; // Expired token
        }

        return $decodedPayload;
    }

    /**
     * Base64URL encoding.
     */
    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64URL decoding.
     */
    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}

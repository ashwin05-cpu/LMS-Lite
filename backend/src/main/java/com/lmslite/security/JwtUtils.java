package com.lmslite.security;

import com.lmslite.entity.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-student-ms:28800000}")
    private long jwtExpirationStudentMs; // 8 hours

    @Value("${app.jwt.expiration-instructor-ms:43200000}")
    private long jwtExpirationInstructorMs; // 12 hours

    @Value("${app.jwt.expiration-admin-ms:21600000}")
    private long jwtExpirationAdminMs; // 6 hours

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long jwtRefreshExpirationMs; // 7 days

    // In-memory blacklist for logged-out tokens (Appendix D requirement)
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    private SecretKey getSigningKey() {
        try {
            // Ensure minimum 256 bits by SHA-256 hashing the configured secret
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        }
    }

    public String generateAccessToken(UserDetailsImpl userPrincipal) {
        Role role = userPrincipal.getRole();
        long expirationMs = switch (role) {
            case STUDENT -> jwtExpirationStudentMs;
            case INSTRUCTOR, TEACHING_ASSISTANT -> jwtExpirationInstructorMs;
            case ADMIN -> jwtExpirationAdminMs;
            default -> jwtExpirationStudentMs;
        };

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("userId", userPrincipal.getId())
                .claim("email", userPrincipal.getEmail())
                .claim("role", role.name())
                .claim("fullName", userPrincipal.getFullName())
                .claim("studentId", userPrincipal.getStudentId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .subject(username)
                .claim("type", "REFRESH")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtRefreshExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateJwtToken(String authToken) {
        if (blacklistedTokens.contains(authToken)) {
            logger.warn("Attempted use of blacklisted JWT token");
            return false;
        }

        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("JWT validation error: {}", e.getMessage());
        }

        return false;
    }

    public void blacklistToken(String token) {
        if (token != null && !token.isBlank()) {
            blacklistedTokens.add(token);
        }
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
}

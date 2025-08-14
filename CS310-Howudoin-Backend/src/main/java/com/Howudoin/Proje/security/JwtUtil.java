package com.Howudoin.Proje.security;

import io.jsonwebtoken.Claims; // Used to access claims from a JWT.
import io.jsonwebtoken.Jwts; // Provides methods to create, parse, and validate JWTs.
import io.jsonwebtoken.SignatureAlgorithm; // Represents the algorithm used for signing the token.
import org.springframework.stereotype.Component; // Marks this class as a Spring-managed component.

import javax.crypto.SecretKey; // Represents the cryptographic key for signing.
import io.jsonwebtoken.security.Keys; // Utility class for generating secure keys.
import java.util.Date; // Used for handling token expiration times.
import java.util.HashMap; // Provides a map implementation for storing claims.
import java.util.Map; // Represents a collection of key-value pairs.

@Component // Declares this class as a Spring-managed bean.
public class JwtUtil {

    private SecretKey secret = Keys.secretKeyFor(SignatureAlgorithm.HS512); // Generates a secure key for HS512 signing.

    // Generates a JWT token with the given email as the subject.
    public String generateToken(String email) {
        Map<String, Object> claims = new HashMap<>(); // Creates an empty map for claims.
        return createToken(claims, email); // Calls the helper method to create the token.
    }

    // Helper method to create a JWT token with claims and a subject.
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims) // Adds claims to the token.
                .setSubject(subject) // Sets the subject (e.g., email).
                .setIssuedAt(new Date(System.currentTimeMillis())) // Sets the current time as the issue time.
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // Sets expiration time (1 hour from issue).
                .signWith(SignatureAlgorithm.HS512, secret) // Signs the token using the secret key and algorithm.
                .compact(); // Builds and returns the JWT.
    }

    // Extracts the username (subject) from the JWT token.
    public String extractUsername(String token) {
        return extractClaims(token).getSubject(); // Retrieves the subject claim.
    }

    // Validates the JWT token by checking its expiration.
    public boolean validateToken(String token) {
        return !isTokenExpired(token); // Returns true if the token is not expired.
    }

    // Checks if the JWT token has expired.
    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date()); // Compares the expiration date with the current date.
    }

    // Extracts all claims from the JWT token.
    private Claims extractClaims(String token) {
        return Jwts.parser() // Initializes the JWT parser.
                .setSigningKey(secret) // Sets the signing key for verification.
                .parseClaimsJws(token) // Parses the JWT string.
                .getBody(); // Returns the claims.
    }

    // Validates the JWT token format and checks its validity.
    public boolean isValidToken(String token) {
        try {
            String jwtToken = token.replace("Bearer", "").trim(); // Removes "Bearer" prefix and trims whitespace.
            return validateToken(jwtToken); // Validates the cleaned token.
        } catch (Exception e) {
            return false; // Returns false if the token is invalid or expired.
        }
    }
}
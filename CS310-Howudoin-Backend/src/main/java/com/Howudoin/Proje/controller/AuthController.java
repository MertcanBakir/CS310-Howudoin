package com.Howudoin.Proje.controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.Howudoin.Proje.dto.LoginRequest;
import com.Howudoin.Proje.dto.RegisterRequest;
import com.Howudoin.Proje.model.User;
import com.Howudoin.Proje.security.JwtUtil;
import com.Howudoin.Proje.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Register endpoint for user registration
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        // Check if the email is already registered
        if (userService.isEmailRegistered(registerRequest.getEmail())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email already registered.");
            return ResponseEntity.badRequest().body(response);
        }

        // Create a new user object and set its properties
        User newUser = new User();
        newUser.setName(registerRequest.getName());
        newUser.setLastName(registerRequest.getLastName());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(registerRequest.getPassword());

        // Save the new user to the database
        userService.saveUser(newUser);

        // Return a success message
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    // Login endpoint for user authentication
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());

        // Authenticate the user by checking the email and password
        return userService.findByEmail(loginRequest.getEmail())
                .filter(user -> {
                    boolean isPasswordMatch = user.getPassword().equals(loginRequest.getPassword());
                    if (!isPasswordMatch) {
                        // Log a warning if the password does not match
                        logger.warn("Password mismatch for email: {}", loginRequest.getEmail());
                    }
                    return isPasswordMatch;
                })
                .map(user -> {
                    // Log success and generate JWT token for the authenticated user
                    logger.info("User authenticated: {}", user.getEmail());
                    String token = jwtUtil.generateToken(user.getId());
                    logger.debug("Generated JWT token for user ID: {}", user.getId());

                    // Add user details and groups to the response map
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("id", user.getId());
                    response.put("name", user.getName());
                    response.put("lastName", user.getLastName());
                    response.put("email", user.getEmail());
                    response.put("groups", user.getGroups()); // User's groups

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    // Log warning if the login credentials are invalid
                    logger.warn("Invalid login attempt for email: {}", loginRequest.getEmail());

                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Invalid email or password");
                    return ResponseEntity.ok(response);
                });
    }
}
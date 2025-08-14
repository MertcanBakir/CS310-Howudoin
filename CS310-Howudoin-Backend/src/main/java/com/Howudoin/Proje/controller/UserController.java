package com.Howudoin.Proje.controller;

import com.Howudoin.Proje.service.UserService;
import com.Howudoin.Proje.security.JwtUtil;
import com.Howudoin.Proje.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/friends")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Method to send a friend request
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> sendFriendRequest(
            @RequestBody Map<String, String> requestBody,
            @RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();

        // Token validation
        if (!jwtUtil.isValidToken(token)) {
            response.put("message", "Unauthorized request");
            return ResponseEntity.status(401).body(response);
        }

        // Extract senderId and receiverId from the request
        String senderId = requestBody.get("senderId");
        String receiverId = requestBody.get("receiverId");

        if (senderId == null || receiverId == null) {
            response.put("message", "SenderId and ReceiverId must be provided");
            return ResponseEntity.status(400).body(response);
        }

        // Find users by their IDs
        User sender = userService.getUserById(senderId);
        User receiver = userService.getUserById(receiverId);

        if (sender == null || receiver == null) {
            response.put("message", "User not found");
            return ResponseEntity.status(404).body(response);
        }

        // 1. Check if they are already friends
        if (receiver.getFriends().contains(senderId)) {
            response.put("message", "You are already friends.");
            return ResponseEntity.status(400).body(response);
        }

        // 2. Check if the request has already been sent
        if (receiver.getPendingFriendRequests().contains(senderId)) {
            response.put("message", "Friend request already sent.");
            return ResponseEntity.status(400).body(response);
        }

        // Add the friend request to the receiver
        receiver.getPendingFriendRequests().add(senderId);
        userService.saveUser(receiver);

        response.put("message", "Friend request sent!");
        return ResponseEntity.ok(response);
    }

    // Method to accept a friend request
    @PostMapping("/accept")
    public ResponseEntity<String> acceptFriendRequest(
            @RequestBody Map<String, String> requestBody,
            @RequestHeader("Authorization") String token) {
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        // Extract senderId and receiverId from the request
        String senderId = requestBody.get("senderId");
        String receiverId = requestBody.get("receiverId");

        if (senderId == null || receiverId == null) {
            return ResponseEntity.status(400).body("SenderId and ReceiverId must be provided");
        }

        User sender = userService.getUserById(senderId);
        User receiver = userService.getUserById(receiverId);

        if (sender == null || receiver == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        // 1. Check if they are already friends
        if (sender.getFriends().contains(receiverId)) {
            return ResponseEntity.status(400).body("You are already friends");
        }

        // 2. Check if the receiver has the pending friend request
        if (!receiver.getPendingFriendRequests().contains(senderId)) {
            return ResponseEntity.status(400).body("No pending friend request from this user");
        }

        // Add the friend to both users' friend lists
        sender.getFriends().add(receiverId);
        receiver.getFriends().add(senderId);

        // Remove the friend request from the receiver's pending list
        receiver.getPendingFriendRequests().remove(senderId);

        userService.saveUser(sender);
        userService.saveUser(receiver);

        return ResponseEntity.ok("Friend request accepted!");
    }

    // Method to get a user's friend list with details
    @GetMapping
    public ResponseEntity<List<User>> getFriendListWithDetails(
            @RequestParam String userId,
            @RequestHeader("Authorization") String token) {
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(401).body(null);
        }

        // Find the user by their ID
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(404).body(null);
        }

        // Get the details of all the user's friends
        List<User> friendsWithDetails = userService.getFriendsWithDetails(userId);

        return ResponseEntity.ok(friendsWithDetails);
    }
}
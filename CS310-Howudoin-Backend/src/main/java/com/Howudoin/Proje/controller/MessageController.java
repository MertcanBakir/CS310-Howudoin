package com.Howudoin.Proje.controller;

import com.Howudoin.Proje.model.Message;
import com.Howudoin.Proje.service.MessageService;
import com.Howudoin.Proje.service.UserService;
import com.Howudoin.Proje.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Send a message between users
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader("Authorization") String token) {

        // Validate the token
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Unauthorized request"));
        }

        // Extract necessary fields from the request body
        String senderId = (String) requestBody.get("senderId");
        String receiverId = (String) requestBody.get("receiverId");
        String content = (String) requestBody.get("content");

        // Check if all required fields are provided
        if (senderId == null || receiverId == null || content == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Invalid request: Missing required fields"));
        }

        // Check if the users are friends
        boolean areFriends = userService.getFriends(senderId).contains(receiverId);
        if (!areFriends) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Users are not friends"));
        }

        // Create and save the message
        Date timestamp = new Date(); // Get the current time
        Message message = new Message(senderId, receiverId, content, timestamp); // Create the message
        messageService.saveMessage(message);

        // Prepare the response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Message sent!");
        response.put("content", content);
        response.put("receiverId", receiverId);
        response.put("timestamp", timestamp.toString()); // Return timestamp in ISO 8601 format

        return ResponseEntity.ok(response);
    }

    // Get the conversation between two users
    @GetMapping
    public ResponseEntity<List<Message>> getConversation(
            @RequestParam String userId1,
            @RequestParam String userId2,
            @RequestHeader("Authorization") String token) {

        // Validate the token
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(401).build();
        }

        // Check if the users are friends
        boolean areFriends = userService.getFriends(userId1).contains(userId2);
        if (!areFriends) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        // Retrieve the conversation between the users and sort by timestamp
        List<Message> conversation = messageService.getConversation(userId1, userId2);
        conversation.sort(Comparator.comparing(Message::getTimestamp));
        return ResponseEntity.ok(conversation);
    }
}
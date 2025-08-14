package com.Howudoin.Proje.controller;

import com.Howudoin.Proje.model.Group;
import com.Howudoin.Proje.model.Message;
import com.Howudoin.Proje.model.User;
import com.Howudoin.Proje.service.GroupService;
import com.Howudoin.Proje.service.MessageService;
import com.Howudoin.Proje.service.UserService;
import com.Howudoin.Proje.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Create a new group
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createGroup(@RequestBody Group group, @RequestHeader("Authorization") String token) {
        // Token validation
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(403).body(Map.of("message", "Invalid token."));
        }

        // Group must have at least one member
        if (group.getMembers().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Group must have at least one member."));
        }

        // Check if the creator is friends with all members
        String creatorId = group.getMembers().get(0);
        for (int i = 1; i < group.getMembers().size(); i++) {
            String memberId = group.getMembers().get(i);
            if (!userService.getFriends(creatorId).contains(memberId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "All group members must be friends of the group creator."));
            }
        }

        try {
            // Set the creation time
            group.setCreationTime(new Date());

            // Save the group
            Group savedGroup = groupService.saveGroup(group);

            // MongoDB will automatically generate the groupId
            String groupId = savedGroup.getId();
            String groupName = savedGroup.getName();

            // Add the groupId to the creator and members' group list
            for (String memberId : group.getMembers()) {
                Optional<User> userOpt = userService.findById(memberId);
                if (userOpt.isPresent()) {
                    User member = userOpt.get();
                    member.addGroup(groupId); // Add the group ID to the user's group list
                    userService.saveUser(member); // Update the user
                } else {
                    return ResponseEntity.status(404).body(Map.of("message", "User with ID " + memberId + " not found."));
                }
            }

            // Return success response with group details
            Map<String, Object> response = new HashMap<>();
            response.put("groupId", groupId);
            response.put("groupName", groupName);
            response.put("creationTime", savedGroup.getCreationTime());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error saving group: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "An error occurred while creating the group."));
        }
    }

    // Add a member to a group
    @PostMapping("/{groupId}/add-member")
    public ResponseEntity<String> addMemberToGroup(
            @PathVariable String groupId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {

        // Token validation
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(403).body("Invalid token.");
        }

        // Check if the group exists
        Optional<Group> groupOpt = groupService.findGroupById(groupId);
        if (groupOpt.isPresent()) {
            Group group = groupOpt.get();

            String senderId = request.get("senderId");
            String memberId = request.get("memberId");

            List<String> friends = userService.getFriends(memberId);

            // Ensure that only friends can be added to the group
            if (!friends.contains(senderId)) {
                return ResponseEntity.badRequest().body("You can only add your friends to the group.");
            }

            // Check if the person is already in the group
            if (group.getMembers().contains(senderId)) {
                return ResponseEntity.badRequest().body("The person you want to add is already in the group.");
            }

            // Add member to the group
            group.addMember(senderId);
            groupService.saveGroup(group);

            // Add groupId to the sender's group list
            Optional<User> senderOpt = userService.findById(senderId);
            if (senderOpt.isPresent()) {
                User sender = senderOpt.get();
                sender.addGroup(groupId);  // Add the group ID to the sender's group list
                userService.saveUser(sender);  // Update the sender's user data
            } else {
                return ResponseEntity.status(404).body("Sender not found.");
            }

            return ResponseEntity.ok("Person added to the group successfully.");
        } else {
            return ResponseEntity.status(404).body("Group not found.");
        }
    }

    // Send a message to a group
    @PostMapping("/{groupId}/send")
    public ResponseEntity<Map<String, Object>> sendMessageToGroup(
            @PathVariable String groupId,
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader("Authorization") String token) {

        // Token validation
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Unauthorized request"));
        }

        // Extract necessary fields from the request body
        String senderId = (String) requestBody.get("senderId");
        String content = (String) requestBody.get("content");

        // Check for missing required fields
        if (senderId == null || content == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Invalid request: Missing required fields"));
        }

        // Check if the group exists and if the sender is a member
        Optional<Group> groupOpt = groupService.findGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Collections.singletonMap("message", "Group not found"));
        }

        Group group = groupOpt.get();
        if (!group.getMembers().contains(senderId)) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Only group members can send messages"));
        }

        // Find the sender user
        Optional<User> userOpt = userService.findById(senderId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Collections.singletonMap("message", "User not found"));
        }

        User sender = userOpt.get();
        String senderName = sender.getName();
        String senderLastName = sender.getLastName();


        Date timestamp = new Date();
        Message message = new Message(senderId, null, content, timestamp);
        message.setGroupId(groupId);
        messageService.saveMessage(message);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Message sent!");
        response.put("content", content);
        response.put("groupId", groupId);
        response.put("timestamp", timestamp.toString());

        return ResponseEntity.ok(response);
    }

    // Get messages for a group
    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<Map<String, Object>>> getGroupMessages(
            @PathVariable String groupId,
            @RequestHeader("Authorization") String token) {

        // Token validation
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(401).build();
        }

        // Check if the group exists
        Optional<Group> groupOpt = groupService.findGroupById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        // Retrieve group messages
        List<Message> messages = messageService.getMessagesByGroupId(groupId);

        // Prepare response with message details
        List<Map<String, Object>> response = new ArrayList<>();
        for (Message message : messages) {
            Map<String, Object> messageData = new HashMap<>();
            messageData.put("senderId", message.getSenderId());
            messageData.put("content", message.getContent());
            messageData.put("timestamp", message.getTimestamp().toString());
            response.add(messageData);
        }

        return ResponseEntity.ok(response);
    }

    // Get group members
    @GetMapping("/{groupId}/members")
    public ResponseEntity<Map<String, Object>> getGroupMembers(@PathVariable String groupId, @RequestHeader("Authorization") String token) {
        // Token validation
        if (!jwtUtil.isValidToken(token)) {
            return ResponseEntity.status(403).build();
        }

        Optional<Group> groupOpt = groupService.findGroupById(groupId);
        if (groupOpt.isPresent()) {
            Group group = groupOpt.get();

            String groupName = group.getName();
            Date creationTime = group.getCreationTime();


            List<String> members = group.getMembers();

            Map<String, Object> response = new HashMap<>();
            response.put("groupName", groupName);
            response.put("creationTime", creationTime.toString());
            response.put("members", members);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).build();
        }
    }
}
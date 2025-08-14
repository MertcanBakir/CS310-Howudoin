package com.Howudoin.Proje.model;

import org.springframework.data.annotation.Id; // Marks the field as the unique identifier in the MongoDB collection.
import org.springframework.data.mongodb.core.mapping.Document; // Specifies that this class is a MongoDB document.
import lombok.Data; // Generates getters, setters, equals, hashCode, toString methods, and a constructor.

import java.util.Date; // Represents date and time.

@Data // Automatically generates getters, setters, toString, equals, and hashCode methods for this class.
@Document(collection = "messages") // Marks this class as a MongoDB document for the "messages" collection.
public class Message {

    @Id
    private String id; // The unique identifier for the message.
    private String senderId; // The ID of the user who sent the message.
    private String receiverId; // The ID of the user who received the message.
    private String groupId; // The group ID (can be null if the message is between users).
    private String content; // The actual content of the message.

    private Date timestamp; // The timestamp when the message was sent. Stores the date and time.

    // Constructor to initialize a new message.
    // If no timestamp is provided, the current date and time is set by default.
    public Message(String senderId, String receiverId, String content, Date timestamp) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.timestamp = timestamp != null ? timestamp : new Date(); // Sets the timestamp to the current time if null.
        this.groupId = null; // Initializes groupId as null (can be set later).
    }
}
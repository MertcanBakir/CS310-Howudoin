package com.Howudoin.Proje.service;

import com.Howudoin.Proje.model.Message; // Imports the Message model class.
import com.Howudoin.Proje.repository.MessageRepository; // Imports the repository for database operations on messages.
import org.springframework.beans.factory.annotation.Autowired; // Imports for automatic dependency injection.
import org.springframework.stereotype.Service; // Marks this class as a service in the application context.

import java.util.List; // Imports for working with lists.

@Service // Declares this class as a Service component.
public class MessageService {

    @Autowired // Automatically injects the MessageRepository dependency.
    private MessageRepository messageRepository;

    // Saves a message to the database.
    public void saveMessage(Message message) {
        messageRepository.save(message); // Persists the message data in the database.
    }

    // Retrieves the conversation between two users.
    public List<Message> getConversation(String senderId, String receiverId) {
        // Fetches messages sent from sender to receiver.
        List<Message> sentMessages = messageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
        // Fetches messages sent from receiver to sender.
        List<Message> receivedMessages = messageRepository.findBySenderIdAndReceiverId(receiverId, senderId);
        sentMessages.addAll(receivedMessages); // Combines both lists into one conversation.
        return sentMessages; // Returns the complete conversation.
    }

    // Retrieves all messages for a given group by its ID.
    public List<Message> getMessagesByGroupId(String groupId) {
        return messageRepository.findByGroupId(groupId); // Queries the database for messages in the group.
    }
}
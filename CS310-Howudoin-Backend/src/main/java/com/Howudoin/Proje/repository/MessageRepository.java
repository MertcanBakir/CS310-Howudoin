package com.Howudoin.Proje.repository;

import com.Howudoin.Proje.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    // Finds messages sent from one user to another based on sender and receiver IDs.
    List<Message> findBySenderIdAndReceiverId(String senderId, String receiverId);

    // Finds messages in a specific group based on the group ID.
    List<Message> findByGroupId(String groupId);
}
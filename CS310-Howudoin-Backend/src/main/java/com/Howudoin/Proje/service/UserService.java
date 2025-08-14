package com.Howudoin.Proje.service;

import com.Howudoin.Proje.model.User; // Imports the User model class.
import com.Howudoin.Proje.repository.UserRepository; // Imports the repository class for database operations on User.
import org.springframework.beans.factory.annotation.Autowired; // Imports the annotation for automatic dependency injection.
import org.springframework.stereotype.Service; // Marks this class as a service in the application context.

import java.util.ArrayList; // Imports for creating dynamic lists.
import java.util.List; // Imports for working with lists.
import java.util.Optional; // Imports for optional values, providing null safety.

@Service // Declares this class as a Service component.
public class UserService {

    @Autowired // Automatically injects the UserRepository dependency.
    private UserRepository userRepository;

    // Checks if the given email is already registered.
    public boolean isEmailRegistered(String email) {
        return userRepository.existsByEmail(email); // Checks the database for the existence of the email.
    }

    // Saves a new user or updates an existing one.
    public void saveUser(User user) {
        userRepository.save(user); // Persists the user data in the database.
    }

    // Finds a user by their email address.
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email); // Queries the database using the email.
    }

    // Finds a user by their unique ID.
    public Optional<User> findById(String userId) {
        return userRepository.findById(userId); // Queries the database using the ID.
    }

    // Sends a friend request from one user to another.
    public void sendFriendRequest(String senderId, String receiverId) {
        Optional<User> senderOpt = userRepository.findById(senderId); // Retrieves the sender user.
        Optional<User> receiverOpt = userRepository.findById(receiverId); // Retrieves the receiver user.

        if (senderOpt.isPresent() && receiverOpt.isPresent()) { // Checks if both users exist.
            User sender = senderOpt.get(); // Gets the sender user object.
            User receiver = receiverOpt.get(); // Gets the receiver user object.

            // Adds the friend request if it doesn't already exist.
            if (!receiver.getPendingFriendRequests().contains(senderId)) {
                receiver.getPendingFriendRequests().add(senderId); // Adds the sender ID to the receiver's pending requests.
                userRepository.save(receiver); // Saves the updated receiver user.
            }
        }
    }

    // Accepts a friend request between two users.
    public void acceptFriendRequest(String senderId, String receiverId) {
        Optional<User> senderOpt = userRepository.findById(senderId); // Retrieves the sender user.
        Optional<User> receiverOpt = userRepository.findById(receiverId); // Retrieves the receiver user.

        if (senderOpt.isPresent() && receiverOpt.isPresent()) { // Checks if both users exist.
            User sender = senderOpt.get(); // Gets the sender user object.
            User receiver = receiverOpt.get(); // Gets the receiver user object.

            // If the friend request is in the receiver's pending list.
            if (receiver.getPendingFriendRequests().remove(senderId)) {
                sender.getFriends().add(receiverId); // Adds the receiver ID to the sender's friends list.
                receiver.getFriends().add(senderId); // Adds the sender ID to the receiver's friends list.

                userRepository.save(sender); // Saves the updated sender user.
                userRepository.save(receiver); // Saves the updated receiver user.
            }
        }
    }

    // Retrieves the list of friend IDs for a given user.
    public List<String> getFriends(String userId) {
        Optional<User> userOpt = userRepository.findById(userId); // Finds the user by ID.
        return userOpt.map(User::getFriends) // Returns the user's friends list.
                .orElseThrow(() -> new RuntimeException("User not found")); // Throws an exception if the user is not found.
    }

    // Retrieves the user object for a given ID (returns null if not found).
    public User getUserById(String userId) {
        Optional<User> userOpt = userRepository.findById(userId); // Finds the user by ID.
        return userOpt.orElse(null); // Returns the user if found, otherwise null.
    }

    // Retrieves the detailed information of a user's friends.
    public List<User> getFriendsWithDetails(String userId) {
        Optional<User> userOpt = userRepository.findById(userId); // Finds the user by ID.
        if (userOpt.isPresent()) { // Checks if the user exists.
            User user = userOpt.get(); // Gets the user object.
            List<User> friends = new ArrayList<>(); // Creates a list to store friends' details.

            // Iterates through the user's friends' IDs and retrieves their details.
            for (String friendId : user.getFriends()) {
                Optional<User> friendOpt = userRepository.findById(friendId); // Finds a friend by ID.
                friendOpt.ifPresent(friends::add); // Adds the friend to the list if found.
            }

            return friends; // Returns the list of friends with details.
        } else {
            throw new RuntimeException("User not found"); // Throws an exception if the user is not found.
        }
    }
}
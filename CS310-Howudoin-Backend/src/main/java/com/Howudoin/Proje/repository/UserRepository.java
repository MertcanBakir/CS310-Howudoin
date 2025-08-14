package com.Howudoin.Proje.repository;

import com.Howudoin.Proje.model.User; // Imports the User model class.
import org.springframework.data.mongodb.repository.MongoRepository; // Provides CRUD operations for MongoDB.

import java.util.Optional; // Used for handling optional values, providing null safety.

public interface UserRepository extends MongoRepository<User, String> {

    // Finds a user by their email address.
    Optional<User> findByEmail(String email);

    // Checks if a user already exists with the provided email.
    boolean existsByEmail(String email);
}
package com.Howudoin.Proje.repository;

import com.Howudoin.Proje.model.Group; // Imports the Group model class.
import org.springframework.data.mongodb.repository.MongoRepository; // Provides CRUD operations for MongoDB.

public interface GroupRepository extends MongoRepository<Group, String> {

}
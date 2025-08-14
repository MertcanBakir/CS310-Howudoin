package com.Howudoin.Proje.service;

import com.Howudoin.Proje.model.Group; // Imports the Group model class.
import com.Howudoin.Proje.repository.GroupRepository; // Imports the repository for database operations on groups.
import org.springframework.beans.factory.annotation.Autowired; // Imports for automatic dependency injection.
import org.springframework.stereotype.Service; // Marks this class as a service in the application context.

import java.util.Optional; // Imports for optional values, providing null safety.

@Service // Declares this class as a Service component.
public class GroupService {

    @Autowired // Automatically injects the GroupRepository dependency.
    private GroupRepository groupRepository;

    // Finds a group by its unique ID.
    public Optional<Group> findGroupById(String groupId) {
        return groupRepository.findById(groupId); // Queries the database for the group with the given ID.
    }

    // Saves a group to the database and returns the saved group object.
    public Group saveGroup(Group group) {
        return groupRepository.save(group); // Persists the group data and returns the saved entity.
    }
}
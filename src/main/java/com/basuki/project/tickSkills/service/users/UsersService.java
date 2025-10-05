package com.basuki.project.tickSkills.service.users;

import com.basuki.project.tickSkills.dtos.UserDTO;
import com.basuki.project.tickSkills.entities.users.Users;
import com.basuki.project.tickSkills.exceptions.TickSkillExceptions;
import com.basuki.project.tickSkills.repository.users.UsersRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UsersService {

    private final UsersRepository usersRepository;

    public UsersService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Transactional
    public List<String> addBulkUsers(List<UserDTO> userDTOs) {
        // Check for duplicates within the batch
        Set<String> usernamesInBatch = new HashSet<>();
        for (UserDTO dto : userDTOs) {
            if (!usernamesInBatch.add(dto.getUsername())) {
                throw new TickSkillExceptions(dto.getUsername() + " (duplicate in request)");
            }

            // Check if username already exists in database (only active users)
            if (usersRepository.existsByUsernameAndIsDeleted(dto.getUsername(), false)) {
                throw new TickSkillExceptions(dto.getUsername());
            }
        }

        List<Users> users = userDTOs.stream()
                .map(this::convertToEntity)
                .collect(Collectors.toList());

        usersRepository.saveAll(users);
        return users.stream().map(Users::getName).collect(Collectors.toList());
    }

    // Get all active usernames only
    public List<String> getAllActiveUsernames() {
        return usersRepository.findAllByIsDeleted(false).stream()
                .map(Users::getUsername)
                .collect(Collectors.toList());
    }

    // Get all usernames (active and inactive)
    public List<String> getAllUsernames() {
        return usersRepository.findAll().stream()
                .map(Users::getUsername)
                .collect(Collectors.toList());
    }

    private Users convertToEntity(UserDTO userDTO) {
        return Users.builder()
                .name(userDTO.getName())
                .username(userDTO.getUsername())
                .password(userDTO.getPassword())
                .email(userDTO.getEmail())
                .phone(userDTO.getPhone())
                .userType(userDTO.getUserType())
                .photoUrl(userDTO.getPhotoUrl())
                .createdOn(LocalDateTime.now())
                .createdBy("Basu")
                .isDeleted(false)
                .build();
    }

    public String addUser(UserDTO userDTO) {
        if (usersRepository.existsByUsernameAndIsDeleted(userDTO.getUsername(), false)) {
            throw new TickSkillExceptions("Username already exists: " + userDTO.getUsername());
        } else
        {
            Users user = convertToEntity(userDTO);
            usersRepository.save(user);
            return user.getUsername();
        }
    }

    public String editUser(String username, UserDTO userDTO) {
        // Find the existing active user by username
        Users existingUser = usersRepository.findFirstByUsernameAndIsDeleted(username, false)
                .orElseThrow(() -> new TickSkillExceptions("Username doesn't exist: " + username));

        // Update the user details while preserving id, createdOn, createdBy, and isDeleted
        Users updatedUser = Users.builder()
                .id(existingUser.getId())
                .name(userDTO.getName())
                .username(existingUser.getUsername()) // Username cannot be changed
                .password(userDTO.getPassword())
                .email(userDTO.getEmail())
                .phone(userDTO.getPhone())
                .userType(userDTO.getUserType())
                .photoUrl(userDTO.getPhotoUrl() != null ? userDTO.getPhotoUrl() : existingUser.getPhotoUrl())
                .createdOn(existingUser.getCreatedOn())
                .createdBy(existingUser.getCreatedBy())
                .isDeleted(existingUser.getIsDeleted())
                .build();

        usersRepository.save(updatedUser);
        return updatedUser.getUsername();
    }

    public Users getUser(String username) {
        return usersRepository.findFirstByUsernameAndIsDeleted(username, false)
                .orElseThrow(() -> new TickSkillExceptions("User not found: " + username));
    }

    // Soft delete - mark user as deleted instead of actually deleting
    public String deleteUser(String username) {
        Users user = usersRepository.findFirstByUsernameAndIsDeleted(username, false)
                .orElseThrow(() -> new TickSkillExceptions("User not found: " + username));
        user.setIsDeleted(true);
        usersRepository.save(user);
        return username;
    }

    @Transactional
    public List<String> deleteBulkUsers(List<String> usernames) {
        List<String> deletedUsers = new java.util.ArrayList<>();
        List<String> notFoundUsers = new java.util.ArrayList<>();

        for (String username : usernames) {
            if (usersRepository.existsByUsernameAndIsDeleted(username, false)) {
                Users user = usersRepository.findFirstByUsernameAndIsDeleted(username, false).get();
                user.setIsDeleted(true);
                usersRepository.save(user);
                deletedUsers.add(username);
            } else {
                notFoundUsers.add(username);
            }
        }

        if (!notFoundUsers.isEmpty()) {
            log.warn("Users not found: {}", notFoundUsers);
        }

        return deletedUsers;
    }
}

package com.basuki.project.tickSkills.service.users;

import com.basuki.project.tickSkills.dtos.UserDTO;
import com.basuki.project.tickSkills.entities.users.Users;
import com.basuki.project.tickSkills.exceptions.DuplicateUsernameException;
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
                throw new DuplicateUsernameException(dto.getUsername() + " (duplicate in request)");
            }

            // Check if username already exists in database
            if (usersRepository.existsByUsername(dto.getUsername())) {
                throw new DuplicateUsernameException(dto.getUsername());
            }
        }

        List<Users> users = userDTOs.stream()
                .map(this::convertToEntity)
                .collect(Collectors.toList());

        usersRepository.saveAll(users);
        return users.stream().map(Users::getName).collect(Collectors.toList());
    }

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
                .createdOn(LocalDateTime.now())
                .createdBy("Basu")
                .build();
    }

    public String addUser(UserDTO userDTO) {
        if (usersRepository.existsByUsername(userDTO.getUsername())) {
            throw new DuplicateUsernameException(userDTO.getUsername());
        } else
        {
            Users user = convertToEntity(userDTO);
            usersRepository.save(user);
            return user.getUsername();
        }
    }
}

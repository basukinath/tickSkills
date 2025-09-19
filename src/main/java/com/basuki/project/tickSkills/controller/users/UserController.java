package com.basuki.project.tickSkills.controller.users;

import com.basuki.project.tickSkills.dtos.UserDTO;
import com.basuki.project.tickSkills.service.users.UsersService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/")
public class UserController {

    private final UsersService usersService;

    public UserController(UsersService usersService) {
        this.usersService = usersService;
    }

    @GetMapping(value = "getAllUsers")
    public ResponseEntity<List<String>> getAllUsers() {
        return ResponseEntity.ok(usersService.getAllUsernames());
    }

    @PostMapping(value = "addBulkUsers", consumes = "application/json")
    public ResponseEntity<List<String>> addBulkUsers(@RequestBody List<UserDTO> userDTOs) {
        return ResponseEntity.ok(usersService.addBulkUsers(userDTOs));
    }

    @PostMapping(value = "addUser", consumes = "application/json")
    public ResponseEntity<String> addUser(@RequestBody UserDTO userDTO) {
        String username = usersService.addUser(userDTO);
        return ResponseEntity.ok(username + " added successfully");
    }
}

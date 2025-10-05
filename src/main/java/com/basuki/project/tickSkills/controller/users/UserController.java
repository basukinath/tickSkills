package com.basuki.project.tickSkills.controller.users;

import com.basuki.project.tickSkills.dtos.UserDTO;
import com.basuki.project.tickSkills.entities.users.Users;
// ...existing imports...
import com.basuki.project.tickSkills.service.users.UsersService;
import lombok.extern.slf4j.Slf4j;
// ...existing imports...
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
// ...existing imports...

// ...existing imports...
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/users")
public class UserController {

    private final UsersService usersService;

    public UserController(UsersService usersService) {
        this.usersService = usersService;
    }

    @PostMapping(value = "/addUser", consumes = "application/json")
    public ResponseEntity<String> addUser(@RequestBody UserDTO userDTO) {
        String username = usersService.addUser(userDTO);
        return ResponseEntity.ok(username + " added successfully");
    }

    @PostMapping(value = "/addBulkUsers", consumes = "application/json")
    public ResponseEntity<List<String>> addBulkUsers(@RequestBody List<UserDTO> userDTOs) {
        return ResponseEntity.ok(usersService.addBulkUsers(userDTOs));
    }

    @GetMapping(value = "/getUser/{username}")
    public ResponseEntity<Users> getUser(@PathVariable String username) {
        return ResponseEntity.ok(usersService.getUser(username));
    }

    @GetMapping(value = "/getAllUsers")
    public ResponseEntity<List<String>> getAllUsers() {
        return ResponseEntity.ok(usersService.getAllUsernames());
    }

    @GetMapping(value = "/getAllActiveUsers")
    public ResponseEntity<List<String>> getAllActiveUsers() {
        return ResponseEntity.ok(usersService.getAllActiveUsernames());
    }

    @PutMapping(value = "/updateUser/{username}", consumes = "application/json")
    public ResponseEntity<String> updateUser(@PathVariable String username, @RequestBody UserDTO userDTO) {
        String updatedUsername = usersService.editUser(username, userDTO);
        return ResponseEntity.ok(updatedUsername + " updated successfully");
    }

    @DeleteMapping(value = "/deleteUser/{username}")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        String deletedUsername = usersService.deleteUser(username);
        return ResponseEntity.ok(deletedUsername + " deleted successfully");
    }
}

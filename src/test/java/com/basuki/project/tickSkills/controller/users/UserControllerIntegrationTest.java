package com.basuki.project.tickSkills.controller.users;

import com.basuki.project.tickSkills.dtos.UserDTO;
import com.basuki.project.tickSkills.entities.users.UserTypes;
import com.basuki.project.tickSkills.entities.users.Users;
import com.basuki.project.tickSkills.repository.users.UsersRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("UserController Integration Tests")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UserDTO testUserDTO;
    private Users testUser;

    @BeforeEach
    void setUp() {
        usersRepository.deleteAll();

        testUserDTO = UserDTO.builder()
                .name("Test User")
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .phone("1234567890")
                .userType(UserTypes.USER)
                .build();

        testUser = Users.builder()
                .name("Existing User")
                .username("existinguser")
                .password("password123")
                .email("existing@example.com")
                .phone("0987654321")
                .userType(UserTypes.USER)
                .createdOn(LocalDateTime.now())
                .createdBy("Basu")
                .isDeleted(false)
                .build();
    }

    @Test
    @DisplayName("POST /api/users/addUser - Should create user successfully")
    void testAddUser_Success() throws Exception {
        mockMvc.perform(post("/api/users/addUser")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testUserDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("testuser added successfully"));
    }

    @Test
    @DisplayName("POST /api/users/addUser - Should return 409 when username already exists")
    void testAddUser_UsernameExists() throws Exception {
        usersRepository.save(testUser);

        UserDTO duplicateUser = UserDTO.builder()
                .name("Duplicate")
                .username("existinguser")
                .password("password")
                .email("dup@example.com")
                .phone("1111111111")
                .userType(UserTypes.USER)
                .build();

        mockMvc.perform(post("/api/users/addUser")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateUser)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/users/addBulkUsers - Should create multiple users successfully")
    void testAddBulkUsers_Success() throws Exception {
        UserDTO user2 = UserDTO.builder()
                .name("Test User 2")
                .username("testuser2")
                .password("password123")
                .email("test2@example.com")
                .phone("1111111111")
                .userType(UserTypes.USER)
                .build();

        mockMvc.perform(post("/api/users/addBulkUsers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Arrays.asList(testUserDTO, user2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*]", containsInAnyOrder("Test User", "Test User 2")));  // Returns names, not usernames
    }

    @Test
    @DisplayName("GET /api/users/getUser - Should return user details")
    void testGetUser_Success() throws Exception {
        usersRepository.save(testUser);

        mockMvc.perform(get("/api/users/getUser/{username}", "existinguser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("existinguser"))
                .andExpect(jsonPath("$.name").value("Existing User"))
                .andExpect(jsonPath("$.email").value("existing@example.com"));
    }

    @Test
    @DisplayName("GET /api/users/getUser - Should return 409 when user not found")
    void testGetUser_NotFound() throws Exception {
        mockMvc.perform(get("/api/users/getUser/{username}", "nonexistent"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("GET /api/users/getAllUsers - Should return list of all usernames")
    void testGetAllUsers() throws Exception {
        usersRepository.save(testUser);
        usersRepository.save(Users.builder()
                .name("User 2")
                .username("user2")
                .password("pass")
                .email("user2@example.com")
                .phone("2222222222")
                .userType(UserTypes.USER)
                .createdOn(LocalDateTime.now())
                .createdBy("Basu")
                .isDeleted(false)
                .build());

        mockMvc.perform(get("/api/users/getAllUsers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*]", containsInAnyOrder("existinguser", "user2")));
    }

    @Test
    @DisplayName("GET /api/users/getAllActiveUsers - Should return only active usernames")
    void testGetAllActiveUsers() throws Exception {
        usersRepository.save(testUser);
        
        Users deletedUser = Users.builder()
                .name("Deleted User")
                .username("deleteduser")
                .password("pass")
                .email("deleted@example.com")
                .phone("3333333333")
                .userType(UserTypes.USER)
                .createdOn(LocalDateTime.now())
                .createdBy("Basu")
                .isDeleted(true)
                .build();
        usersRepository.save(deletedUser);

        mockMvc.perform(get("/api/users/getAllActiveUsers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0]").value("existinguser"));
    }

    @Test
    @DisplayName("GET /api/users/getAllUsersWithDetails - Should return full user details")
    void testGetAllUsersDetails() throws Exception {
        usersRepository.save(testUser);

        mockMvc.perform(get("/api/users/getAllUsersWithDetails"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username").value("existinguser"))
                .andExpect(jsonPath("$[0].name").value("Existing User"))
                .andExpect(jsonPath("$[0].isDeleted").value(false));
    }

    @Test
    @DisplayName("PUT /api/users/updateUser - Should update user successfully")
    void testUpdateUser_Success() throws Exception {
        usersRepository.save(testUser);

        UserDTO updateDTO = UserDTO.builder()
                .name("Updated Name")
                .username("existinguser")
                .password("newpassword")
                .email("updated@example.com")
                .phone("9999999999")
                .userType(UserTypes.ADMIN)
                .build();

        mockMvc.perform(put("/api/users/updateUser/{username}", "existinguser")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("existinguser updated successfully"));
    }

    @Test
    @DisplayName("PUT /api/users/updateUser - Should return 409 when user not found")
    void testUpdateUser_NotFound() throws Exception {
        UserDTO updateDTO = UserDTO.builder()
                .name("Updated Name")
                .username("nonexistent")
                .password("newpassword")
                .email("updated@example.com")
                .phone("9999999999")
                .userType(UserTypes.ADMIN)
                .build();

        mockMvc.perform(put("/api/users/updateUser/{username}", "nonexistent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("DELETE /api/users/deleteUser - Should soft delete user successfully")
    void testDeleteUser_Success() throws Exception {
        usersRepository.save(testUser);

        mockMvc.perform(delete("/api/users/deleteUser/{username}", "existinguser"))
                .andExpect(status().isOk())
                .andExpect(content().string("existinguser deleted successfully"));

        // Verify user is marked as deleted
        Users deletedUser = usersRepository.findById(testUser.getId()).orElseThrow();
        assert deletedUser.getIsDeleted();
    }

    @Test
    @DisplayName("DELETE /api/users/deleteUser - Should return 409 when user not found")
    void testDeleteUser_NotFound() throws Exception {
        mockMvc.perform(delete("/api/users/deleteUser/{username}", "nonexistent"))
                .andExpect(status().isConflict());
    }
}

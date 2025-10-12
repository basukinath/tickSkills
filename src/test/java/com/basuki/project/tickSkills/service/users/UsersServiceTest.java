package com.basuki.project.tickSkills.service.users;

import com.basuki.project.tickSkills.dtos.UserDTO;
import com.basuki.project.tickSkills.entities.users.Users;
import com.basuki.project.tickSkills.entities.users.UserTypes;
import com.basuki.project.tickSkills.exceptions.TickSkillExceptions;
import com.basuki.project.tickSkills.repository.users.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsersService Unit Tests")
class UsersServiceTest {

    @Mock
    private UsersRepository usersRepository;

    @InjectMocks
    private UsersService usersService;

    private UserDTO testUserDTO;
    private Users testUser;

    @BeforeEach
    void setUp() {
        testUserDTO = UserDTO.builder()
                .name("Test User")
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .phone("1234567890")
                .userType(UserTypes.USER)
                .build();

        testUser = Users.builder()
                .id(1L)
                .name("Test User")
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .phone("1234567890")
                .userType(UserTypes.USER)
                .createdOn(LocalDateTime.now())
                .createdBy("Basu")
                .isDeleted(false)
                .build();
    }

    @Test
    @DisplayName("Should add user successfully when username doesn't exist")
    void testAddUser_Success() {
        // Given
        when(usersRepository.existsByUsernameAndIsDeleted("testuser", false)).thenReturn(false);
        when(usersRepository.save(any(Users.class))).thenReturn(testUser);

        // When
        String result = usersService.addUser(testUserDTO);

        // Then
        assertThat(result).isEqualTo("testuser");
        verify(usersRepository).existsByUsernameAndIsDeleted("testuser", false);
        verify(usersRepository).save(any(Users.class));
    }

    @Test
    @DisplayName("Should throw exception when adding user with existing username")
    void testAddUser_UsernameExists() {
        // Given
        when(usersRepository.existsByUsernameAndIsDeleted("testuser", false)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> usersService.addUser(testUserDTO))
                .isInstanceOf(TickSkillExceptions.class)
                .hasMessageContaining("Username already exists");

        verify(usersRepository).existsByUsernameAndIsDeleted("testuser", false);
        verify(usersRepository, never()).save(any(Users.class));
    }

    @Test
    @DisplayName("Should add bulk users successfully")
    void testAddBulkUsers_Success() {
        // Given
        UserDTO user2DTO = UserDTO.builder()
                .name("Test User 2")
                .username("testuser2")
                .password("password123")
                .email("test2@example.com")
                .phone("0987654321")
                .userType(UserTypes.USER)
                .build();

        List<UserDTO> userDTOs = Arrays.asList(testUserDTO, user2DTO);

        when(usersRepository.existsByUsernameAndIsDeleted(anyString(), eq(false))).thenReturn(false);
        when(usersRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        List<String> result = usersService.addBulkUsers(userDTOs);

        // Then
        assertThat(result).hasSize(2);
        verify(usersRepository, times(2)).existsByUsernameAndIsDeleted(anyString(), eq(false));
        verify(usersRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Should throw exception when bulk users contain duplicate usernames")
    void testAddBulkUsers_DuplicateInBatch() {
        // Given
        List<UserDTO> userDTOs = Arrays.asList(testUserDTO, testUserDTO);

        // When & Then
        assertThatThrownBy(() -> usersService.addBulkUsers(userDTOs))
                .isInstanceOf(TickSkillExceptions.class)
                .hasMessageContaining("duplicate in request");

        verify(usersRepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("Should throw exception when bulk users contain existing username")
    void testAddBulkUsers_UsernameExists() {
        // Given
        UserDTO user2DTO = UserDTO.builder()
                .name("Test User 2")
                .username("testuser2")
                .password("password123")
                .email("test2@example.com")
                .phone("0987654321")
                .userType(UserTypes.USER)
                .build();

        List<UserDTO> userDTOs = Arrays.asList(testUserDTO, user2DTO);

        when(usersRepository.existsByUsernameAndIsDeleted("testuser", false)).thenReturn(false);
        when(usersRepository.existsByUsernameAndIsDeleted("testuser2", false)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> usersService.addBulkUsers(userDTOs))
                .isInstanceOf(TickSkillExceptions.class)
                .hasMessageContaining("testuser2");

        verify(usersRepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("Should get user successfully")
    void testGetUser_Success() {
        // Given
        when(usersRepository.findFirstByUsernameAndIsDeleted("testuser", false))
                .thenReturn(Optional.of(testUser));

        // When
        Users result = usersService.getUser("testuser");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getName()).isEqualTo("Test User");
        verify(usersRepository).findFirstByUsernameAndIsDeleted("testuser", false);
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testGetUser_NotFound() {
        // Given
        when(usersRepository.findFirstByUsernameAndIsDeleted("nonexistent", false))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> usersService.getUser("nonexistent"))
                .isInstanceOf(TickSkillExceptions.class)
                .hasMessageContaining("User not found");

        verify(usersRepository).findFirstByUsernameAndIsDeleted("nonexistent", false);
    }

    @Test
    @DisplayName("Should edit user successfully")
    void testEditUser_Success() {
        // Given
        UserDTO updatedDTO = UserDTO.builder()
                .name("Updated Name")
                .username("testuser")
                .password("newpassword")
                .email("updated@example.com")
                .phone("9999999999")
                .userType(UserTypes.ADMIN)
                .build();

        when(usersRepository.findFirstByUsernameAndIsDeleted("testuser", false))
                .thenReturn(Optional.of(testUser));
        when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        String result = usersService.editUser("testuser", updatedDTO);

        // Then
        assertThat(result).isEqualTo("testuser");
        verify(usersRepository).findFirstByUsernameAndIsDeleted("testuser", false);
        verify(usersRepository).save(any(Users.class));
    }

    @Test
    @DisplayName("Should throw exception when editing non-existent user")
    void testEditUser_NotFound() {
        // Given
        when(usersRepository.findFirstByUsernameAndIsDeleted("nonexistent", false))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> usersService.editUser("nonexistent", testUserDTO))
                .isInstanceOf(TickSkillExceptions.class)
                .hasMessageContaining("Username doesn't exist");

        verify(usersRepository).findFirstByUsernameAndIsDeleted("nonexistent", false);
        verify(usersRepository, never()).save(any(Users.class));
    }

    @Test
    @DisplayName("Should delete user successfully (soft delete)")
    void testDeleteUser_Success() {
        // Given
        when(usersRepository.findFirstByUsernameAndIsDeleted("testuser", false))
                .thenReturn(Optional.of(testUser));
        when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        String result = usersService.deleteUser("testuser");

        // Then
        assertThat(result).isEqualTo("testuser");
        verify(usersRepository).findFirstByUsernameAndIsDeleted("testuser", false);
        verify(usersRepository).save(argThat(user -> user.getIsDeleted()));
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent user")
    void testDeleteUser_NotFound() {
        // Given
        when(usersRepository.findFirstByUsernameAndIsDeleted("nonexistent", false))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> usersService.deleteUser("nonexistent"))
                .isInstanceOf(TickSkillExceptions.class)
                .hasMessageContaining("User not found");

        verify(usersRepository).findFirstByUsernameAndIsDeleted("nonexistent", false);
        verify(usersRepository, never()).save(any(Users.class));
    }

    @Test
    @DisplayName("Should delete bulk users successfully")
    void testDeleteBulkUsers_Success() {
        // Given
        Users user2 = Users.builder()
                .id(2L)
                .username("testuser2")
                .name("Test User 2")
                .isDeleted(false)
                .build();

        List<String> usernames = Arrays.asList("testuser", "testuser2");

        when(usersRepository.existsByUsernameAndIsDeleted("testuser", false)).thenReturn(true);
        when(usersRepository.existsByUsernameAndIsDeleted("testuser2", false)).thenReturn(true);
        when(usersRepository.findFirstByUsernameAndIsDeleted("testuser", false))
                .thenReturn(Optional.of(testUser));
        when(usersRepository.findFirstByUsernameAndIsDeleted("testuser2", false))
                .thenReturn(Optional.of(user2));
        when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        List<String> result = usersService.deleteBulkUsers(usernames);

        // Then
        assertThat(result).hasSize(2).containsExactly("testuser", "testuser2");
        verify(usersRepository, times(2)).save(any(Users.class));
    }

    @Test
    @DisplayName("Should return only found users when deleting bulk users with some non-existent")
    void testDeleteBulkUsers_PartialSuccess() {
        // Given
        List<String> usernames = Arrays.asList("testuser", "nonexistent");

        when(usersRepository.existsByUsernameAndIsDeleted("testuser", false)).thenReturn(true);
        when(usersRepository.existsByUsernameAndIsDeleted("nonexistent", false)).thenReturn(false);
        when(usersRepository.findFirstByUsernameAndIsDeleted("testuser", false))
                .thenReturn(Optional.of(testUser));
        when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        List<String> result = usersService.deleteBulkUsers(usernames);

        // Then
        assertThat(result).hasSize(1).containsExactly("testuser");
        verify(usersRepository, times(1)).save(any(Users.class));
    }

    @Test
    @DisplayName("Should get all active usernames")
    void testGetAllActiveUsernames() {
        // Given
        Users user2 = Users.builder()
                .username("testuser2")
                .isDeleted(false)
                .build();

        List<Users> activeUsers = Arrays.asList(testUser, user2);
        when(usersRepository.findAllByIsDeleted(false)).thenReturn(activeUsers);

        // When
        List<String> result = usersService.getAllActiveUsernames();

        // Then
        assertThat(result).hasSize(2).containsExactly("testuser", "testuser2");
        verify(usersRepository).findAllByIsDeleted(false);
    }

    @Test
    @DisplayName("Should get all usernames including deleted")
    void testGetAllUsernames() {
        // Given
        Users deletedUser = Users.builder()
                .username("deleteduser")
                .isDeleted(true)
                .build();

        List<Users> allUsers = Arrays.asList(testUser, deletedUser);
        when(usersRepository.findAll()).thenReturn(allUsers);

        // When
        List<String> result = usersService.getAllUsernames();

        // Then
        assertThat(result).hasSize(2).containsExactly("testuser", "deleteduser");
        verify(usersRepository).findAll();
    }

    @Test
    @DisplayName("Should get all users with full details")
    void testGetAllUsers() {
        // Given
        Users user2 = Users.builder()
                .id(2L)
                .username("testuser2")
                .name("Test User 2")
                .isDeleted(false)
                .build();

        List<Users> allUsers = Arrays.asList(testUser, user2);
        when(usersRepository.findAll()).thenReturn(allUsers);

        // When
        List<Users> result = usersService.getAllUsers();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getUsername()).isEqualTo("testuser");
        assertThat(result.get(1).getUsername()).isEqualTo("testuser2");
        verify(usersRepository).findAll();
    }
}

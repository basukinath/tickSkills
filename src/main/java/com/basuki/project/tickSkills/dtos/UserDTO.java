package com.basuki.project.tickSkills.dtos;

import com.basuki.project.tickSkills.entities.users.UserTypes;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;

    private String name;

    private String username;

    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    @NotNull(message = "User type is required")
    private UserTypes userType;
}

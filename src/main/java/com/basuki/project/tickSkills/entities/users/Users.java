package com.basuki.project.tickSkills.entities.users;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
@Entity
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String name;

    @Column(unique = true)
    private String username;

    private String password;
    private String email;
    private String phone;
    private UserTypes userType;
    private LocalDateTime lastLogin;
    private LocalDateTime createdOn;
    private String createdBy;
    private String photoUrl;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

}

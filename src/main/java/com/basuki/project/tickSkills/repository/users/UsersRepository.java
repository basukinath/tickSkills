package com.basuki.project.tickSkills.repository.users;

import com.basuki.project.tickSkills.entities.users.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    boolean existsByUsername(String username);

    Optional<Users> findFirstByUsername(String username);

    Optional<Users> findFirstByUsernameAndIsDeleted(String username, Boolean isDeleted);

    boolean existsByUsernameAndIsDeleted(String username, Boolean isDeleted);

    List<Users> findAllByIsDeleted(Boolean isDeleted);
}

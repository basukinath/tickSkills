package com.basuki.project.tickSkills.repository.users;

import com.basuki.project.tickSkills.entities.users.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    boolean existsByUsername(String username);
}

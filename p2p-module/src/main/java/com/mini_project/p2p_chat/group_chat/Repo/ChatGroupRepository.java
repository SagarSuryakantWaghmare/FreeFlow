package com.mini_project.p2p_chat.group_chat.Repo;

import com.mini_project.p2p_chat.group_chat.model.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
    Optional<ChatGroup> findByToken(String token);
}


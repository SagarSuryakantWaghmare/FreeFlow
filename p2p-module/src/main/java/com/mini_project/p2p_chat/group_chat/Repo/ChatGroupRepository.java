package com.mini_project.p2p_chat.group_chat.Repo;

import com.mini_project.p2p_chat.group_chat.model.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
    Optional<ChatGroup> findByToken(String token);
    
    @Query("SELECT COUNT(g) > 0 FROM ChatGroup g JOIN g.members m WHERE g.groupId = :groupId AND m = :userId")
    boolean isUserMemberOfGroup(@Param("groupId") Long groupId, @Param("userId") String userId);
}


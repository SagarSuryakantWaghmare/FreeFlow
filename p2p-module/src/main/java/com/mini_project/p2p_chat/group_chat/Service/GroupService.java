package com.mini_project.p2p_chat.group_chat.Service;

import com.mini_project.p2p_chat.group_chat.Repo.ChatGroupRepository;
import com.mini_project.p2p_chat.group_chat.model.ChatGroup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class GroupService {
    @Autowired
    private ChatGroupRepository groupRepo;

    @Transactional
    public ChatGroup createGroup(String groupName, String creatorId) {
        ChatGroup group = new ChatGroup();
        group.setGroupName(groupName);
        group.setCreatedAt(LocalDateTime.now());
        group.setToken(UUID.randomUUID().toString());
        group.getMembers().add(creatorId);
        ChatGroup cg = groupRepo.save(group);
        System.out.println(cg.toString());
        return cg;
    }

    @Transactional
    public boolean joinGroup(String token, String userId) {
        Optional<ChatGroup> groupOpt = groupRepo.findByToken(token);
        if (groupOpt.isEmpty()) return false;

        ChatGroup group = groupOpt.get();
        group.getMembers().add(userId);
        groupRepo.save(group);
        return true;
    }

    @Transactional
    public boolean leaveGroupById(Long groupId, String userId) {
        Optional<ChatGroup> groupOpt = groupRepo.findById(groupId);
        if (groupOpt.isEmpty()) return false;

        ChatGroup group = groupOpt.get();
        group.getMembers().remove(userId);

        if (group.getMembers().isEmpty()) {
            groupRepo.delete(group);
        } else {
            groupRepo.save(group);
        }

        return true;
    }
    public Optional<ChatGroup> getGroupByToken(String token) {
        return groupRepo.findByToken(token);
    }    public boolean isUserInGroup(Long groupId, String userId) {
        return groupRepo.isUserMemberOfGroup(groupId, userId);
    }
}


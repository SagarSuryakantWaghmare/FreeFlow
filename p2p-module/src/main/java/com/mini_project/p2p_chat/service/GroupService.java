package com.mini_project.p2p_chat.service;

import com.mini_project.p2p_chat.model.Group;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class GroupService {
    private final Map<String, Group> groups = new ConcurrentHashMap<>();
    private final Map<String, String> inviteTokenToGroupId = new ConcurrentHashMap<>();
    private final AtomicLong groupIdCounter = new AtomicLong(1);
    
    public Group createGroup(String groupName, String creatorId) {
        String groupId = String.valueOf(groupIdCounter.getAndIncrement());
        String inviteLink = UUID.randomUUID().toString();
        
        Group group = new Group(groupId, groupName, inviteLink, creatorId);
        groups.put(groupId, group);
        inviteTokenToGroupId.put(inviteLink, groupId);
        
        return group;
    }
    
    public Group joinGroup(String token, String userId) {
        String groupId = inviteTokenToGroupId.get(token);
        if (groupId == null) {
            throw new RuntimeException("Invalid invite token");
        }
        
        Group group = groups.get(groupId);
        if (group == null) {
            throw new RuntimeException("Group not found");
        }
        
        group.addMember(userId);
        return group;
    }
    
    public boolean leaveGroup(String groupId, String userId) {
        Group group = groups.get(groupId);
        if (group == null) {
            return false;
        }
        
        group.removeMember(userId);
        
        // If creator leaves and no members left, delete group
        if (group.getMembers().isEmpty()) {
            groups.remove(groupId);
            inviteTokenToGroupId.entrySet().removeIf(entry -> entry.getValue().equals(groupId));
        }
        
        return true;
    }
    
    public Group getGroup(String groupId) {
        return groups.get(groupId);
    }
    
    public boolean isUserInGroup(String groupId, String userId) {
        Group group = groups.get(groupId);
        return group != null && group.getMembers().contains(userId);
    }
}

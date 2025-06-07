package com.mini_project.p2p_chat.model;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

public class Group {
    private String groupId;
    private String groupName;
    private String inviteLink;
    private String creatorId;
    private Set<String> members;
    private LocalDateTime createdAt;
    
    public Group() {
        this.members = new HashSet<>();
        this.createdAt = LocalDateTime.now();
    }
    
    public Group(String groupId, String groupName, String inviteLink, String creatorId) {
        this();
        this.groupId = groupId;
        this.groupName = groupName;
        this.inviteLink = inviteLink;
        this.creatorId = creatorId;
        this.members.add(creatorId);
    }
    
    // Getters and Setters
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    
    public String getInviteLink() { return inviteLink; }
    public void setInviteLink(String inviteLink) { this.inviteLink = inviteLink; }
    
    public String getCreatorId() { return creatorId; }
    public void setCreatorId(String creatorId) { this.creatorId = creatorId; }
    
    public Set<String> getMembers() { return members; }
    public void setMembers(Set<String> members) { this.members = members; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public void addMember(String userId) {
        this.members.add(userId);
    }
    
    public void removeMember(String userId) {
        this.members.remove(userId);
    }
}

package com.mini_project.p2p_chat.model;

import java.time.LocalDateTime;

public class GroupMessage {
    private String groupId;
    private String senderId;
    private String senderName;
    private String content;
    private LocalDateTime timestamp;
    
    public GroupMessage() {
        this.timestamp = LocalDateTime.now();
    }
    
    public GroupMessage(String groupId, String senderId, String senderName, String content) {
        this();
        this.groupId = groupId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
    }
    
    // Getters and Setters
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

package com.mini_project.p2p_chat.group_chat.DTO;

import lombok.Data;

@Data
public class ChatMessage {
    private String senderId;  // from external auth system
    private String content;
    private Long groupId;
}

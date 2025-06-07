package com.mini_project.p2p_chat.controller;

import com.mini_project.p2p_chat.group_chat.DTO.ChatMessage;
import com.mini_project.p2p_chat.group_chat.Service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private GroupService groupService;
    
    @MessageMapping("/chat/send")
    public void sendMessage(@Payload ChatMessage message) {
        try {
            // Verify that the sender is a member of the group
            if (groupService.isUserInGroup(message.getGroupId(), message.getSenderId())) {
                // Send message to all subscribers of the group topic
                String destination = "/topic/group/" + message.getGroupId();
                messagingTemplate.convertAndSend(destination, message);
                
                System.out.println("Message sent to group " + message.getGroupId() + 
                                 " from " + message.getSenderId() + ": " + message.getContent());
            } else {
                System.err.println("User " + message.getSenderId() + 
                                 " is not a member of group " + message.getGroupId());
            }
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
        }
    }
}

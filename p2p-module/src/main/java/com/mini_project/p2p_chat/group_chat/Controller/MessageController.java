package com.mini_project.p2p_chat.group_chat.Controller;

import com.mini_project.p2p_chat.group_chat.DTO.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/send") // /app/chat/send
    public void sendMessage(@Payload ChatMessage message) {

        System.out.println("received : "+ message.getContent());
        messagingTemplate.convertAndSend("/topic/group/" + message.getGroupId(), message);
    }
}


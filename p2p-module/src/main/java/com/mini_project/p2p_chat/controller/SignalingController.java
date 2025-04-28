package com.mini_project.p2p_chat.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mini_project.p2p_chat.socket_communication.SignalingHandler;

import java.util.Set;

@RestController
@RequestMapping("/api")
public class SignalingController {

    private final SignalingHandler signalingHandler;

    public SignalingController(SignalingHandler signalingHandler) {
        this.signalingHandler = signalingHandler;
    }

    @GetMapping("/online-users")
    public Set<String> getOnlineUsers() {
        return signalingHandler.getOnlineUserIds();
    }
}


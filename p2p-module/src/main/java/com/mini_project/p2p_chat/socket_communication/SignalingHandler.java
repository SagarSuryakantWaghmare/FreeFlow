package com.mini_project.p2p_chat.socket_communication;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
public class SignalingHandler extends TextWebSocketHandler {

    private final ConcurrentHashMap<String, WebSocketSession> onlineUsers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> sessionIdToUserId = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = sessionIdToUserId.remove(session.getId());
        if (userId != null) {
            onlineUsers.remove(userId);
        }
        
        // Broadcast updated user list after a user disconnects
        try {
            broadcastOnlineUsers();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        JsonNode jsonNode = objectMapper.readTree(message.getPayload());
        String type = jsonNode.get("type").asText();

        switch (type) {
            case "user_online":
                handleUserOnline(session, jsonNode);
                break;
            case "connection_request":
                handleRequestConnection(session, jsonNode);
                break;
            case "connection_accepted":
                handleConnectionAccepted(session, jsonNode);
                break;
            case "offer":
                handleOffer(session, jsonNode);
                break;
            case "answer":
                handleAnswer(session, jsonNode);
                break;
            case "ice-candidate":
                handleIceCandidate(session, jsonNode);
                break;
            default:
                System.out.println("Unknown message type: " + type);
        }
    }

    private void handleConnectionAccepted(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String toUserId = jsonNode.get("toUserId").asText();
        WebSocketSession toSession = onlineUsers.get(toUserId);
        if (toSession != null && toSession.isOpen()) {
            toSession.sendMessage(new TextMessage(jsonNode.toString()));
        }
    }

    private void handleUserOnline(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String userId = jsonNode.get("userId").asText();
        onlineUsers.put(userId, session);
        sessionIdToUserId.put(session.getId(), userId);
        
        // Broadcast updated list of online users to all connected clients
        broadcastOnlineUsers();
    }

    private void broadcastOnlineUsers() throws IOException {
    // Get the list of online users
    List<String> onlineUserList = new ArrayList<>(onlineUsers.keySet());

    // Create a new message to send to all connected clients
    ObjectNode onlineUsersMessage = objectMapper.createObjectNode();
    onlineUsersMessage.put("type", "online_users");

    // Create a new ArrayNode to hold the user list as JsonNode
    ArrayNode usersArray = objectMapper.createArrayNode();
    
    // Add each user as a JsonNode to the array
    for (String user : onlineUserList) {
        usersArray.add(user);
    }
    
    // Attach the array to the message
    onlineUsersMessage.set("users", usersArray);

    // Send the message to all users
    for (WebSocketSession webSocketSession : onlineUsers.values()) {
        try {
            webSocketSession.sendMessage(new TextMessage(onlineUsersMessage.toString()));
        } catch (IOException e) {
            // Log the error and continue broadcasting to other sessions
            e.printStackTrace();
        }
    }
}


    private void handleRequestConnection(WebSocketSession session, JsonNode jsonNode) throws IOException {
        if (!jsonNode.has("toUserId")) {
            System.out.println("Missing 'toUserId' in message");
            return;
        }
        String toUserId = jsonNode.get("toUserId").asText();
        WebSocketSession toSession = onlineUsers.get(toUserId);
        if (toSession != null && toSession.isOpen()) {
            toSession.sendMessage(new TextMessage(jsonNode.toString()));
        }
    }

    private void handleOffer(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String toUserId = jsonNode.get("toUserId").asText();
        System.out.println("Received offer for user: " + toUserId);
        WebSocketSession toSession = onlineUsers.get(toUserId);
        if (toSession != null && toSession.isOpen()) {
            toSession.sendMessage(new TextMessage(jsonNode.toString()));
            System.out.println("Forwarded offer to user: " + toUserId);
        } else {
            System.out.println("User " + toUserId + " is not online or session is closed.");
        }
    }

    private void handleAnswer(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String toUserId = jsonNode.get("toUserId").asText();
        WebSocketSession toSession = onlineUsers.get(toUserId);
        if (toSession != null && toSession.isOpen()) {
            toSession.sendMessage(new TextMessage(jsonNode.toString()));
        }
    }

    private void handleIceCandidate(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String toUserId = jsonNode.get("toUserId").asText();
        WebSocketSession toSession = onlineUsers.get(toUserId);
        if (toSession != null && toSession.isOpen()) {
            toSession.sendMessage(new TextMessage(jsonNode.toString()));
        }
    }

    public ConcurrentHashMap.KeySetView<String, WebSocketSession> getOnlineUserIds() {
        return onlineUsers.keySet();
    }
}

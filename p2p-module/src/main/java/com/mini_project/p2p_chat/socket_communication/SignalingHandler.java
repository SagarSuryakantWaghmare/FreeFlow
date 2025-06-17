package com.mini_project.p2p_chat.socket_communication;

import java.io.IOException;
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
public class SignalingHandler extends TextWebSocketHandler {    private final ConcurrentHashMap<String, WebSocketSession> onlineUsers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> sessionIdToUserId = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> userIdToName = new ConcurrentHashMap<>();
    
    // Video call room management
    private final ConcurrentHashMap<String, VideoRoomInfo> videoRooms = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> userIdToRoomId = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Inner class to store video room info
    private static class VideoRoomInfo {
        public String id;
        public String name;
        public String ownerId;
        public String ownerName;
        public ConcurrentHashMap<String, String> participants = new ConcurrentHashMap<>(); // userId -> userName
        public long createdAt;
        public boolean isActive;

        public VideoRoomInfo(String id, String name, String ownerId, String ownerName) {
            this.id = id;
            this.name = name;
            this.ownerId = ownerId;
            this.ownerName = ownerName;
            this.createdAt = System.currentTimeMillis();
            this.isActive = true;
            this.participants.put(ownerId, ownerName);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {        
        String userId = sessionIdToUserId.remove(session.getId());
        if (userId != null) {
            onlineUsers.remove(userId);
            userIdToName.remove(userId);

              // Handle video room cleanup if user was in a room
            String roomId = userIdToRoomId.remove(userId);
            if (roomId != null) {
                VideoRoomInfo room = videoRooms.get(roomId);
                if (room != null) {
                    room.participants.remove(userId);
                    
                    // Notify other participants
                    try {
                        broadcastToRoom(roomId, createMessage("user_left", 
                            objectMapper.createObjectNode()
                                .put("userId", userId)
                                .put("roomId", roomId)
                        ), userId);
                        
                        // If room owner left, close the room
                        if (userId.equals(room.ownerId)) {
                            room.isActive = false;
                            broadcastToRoom(roomId, createMessage("room_closed", 
                                objectMapper.createObjectNode().put("roomId", roomId)
                            ), null);
                            
                            // Remove all participants from room mapping
                            for (String participantId : room.participants.keySet()) {
                                userIdToRoomId.remove(participantId);
                            }
                            
                            videoRooms.remove(roomId);
                        }
                    } catch (IOException e) {
                        System.err.println("Error handling room cleanup: " + e.getMessage());
                    }
                }
            }
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
        try {
            JsonNode jsonNode = objectMapper.readTree(message.getPayload());
            String type = jsonNode.get("type").asText();
            
            System.out.println("\nReceived message type: " + type);
            System.out.println("\nMessage payload: " + message.getPayload());
            
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
                break;            case "answer":
                handleAnswer(session, jsonNode);
                break;              case "ice-candidate":  // Support both formats
            case "ice_candidate":
                handleIceCandidate(session, jsonNode);
                break;
            case "connection_rejected":
                handleConnectionRejected(session, jsonNode);
                break;
            case "logout_notification":
                handleLogoutNotification(session, jsonNode);
                break;

            // Video call related messages
            case "create_room":
                handleCreateRoom(session, jsonNode);
                break;
            case "request_join":
                handleRequestJoin(session, jsonNode);
                break;
            case "approve_join":
                handleApproveJoin(session, jsonNode);
                break;
            case "reject_join":
                handleRejectJoin(session, jsonNode);
                break;
            case "toggle_media":
                handleToggleMedia(session, jsonNode);
                break;
                case "remove_participant":
                handleRemoveParticipant(session, jsonNode);
                break;
            case "leave_room":
                handleLeaveRoom(session, jsonNode);
                break;            default:
                System.out.println("Unknown message type: " + type);
                break;
        }
        } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            e.printStackTrace();
            // Don't close the session for recoverable errors
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
        String userName = jsonNode.get("userName").asText();
        onlineUsers.put(userId, session);
        sessionIdToUserId.put(session.getId(), userId);
        userIdToName.put(userId, userName);

        // Broadcast updated list of online users to all connected clients
        broadcastOnlineUsers();
    }

    private void broadcastOnlineUsers() throws IOException {
        // Create a new message to send to all connected clients
        ObjectNode onlineUsersMessage = objectMapper.createObjectNode();
        onlineUsersMessage.put("type", "online_users");

        // Create a new ArrayNode to hold the user list as JsonNode
        ArrayNode usersArray = objectMapper.createArrayNode();

        // Add each user as a JsonNode to the array with both ID and name
        for (String userId : onlineUsers.keySet()) {
            ObjectNode userNode = objectMapper.createObjectNode();
            userNode.put("id", userId);
            userNode.put("name", userIdToName.get(userId));
            usersArray.add(userNode);
        }

        // Attach the array to the message
        onlineUsersMessage.set("users", usersArray);

        // Send the message to all users
        for (WebSocketSession webSocketSession : onlineUsers.values()) {
            try {
                webSocketSession.sendMessage(new TextMessage(onlineUsersMessage.toString()));
            } catch (IOException e) {
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
    }    private void handleOffer(WebSocketSession session, JsonNode jsonNode) throws IOException {
        try {
            String targetId = null;
            String fromId = null;
            
            // Support both message formats for compatibility
            if (jsonNode.has("data") && jsonNode.get("data") != null && !jsonNode.get("data").isNull()) {
                // Old video call format
                JsonNode dataNode = jsonNode.get("data");
                if (dataNode.has("targetId") && !dataNode.get("targetId").isNull()) {
                    targetId = dataNode.get("targetId").asText();
                }
                if (dataNode.has("fromId") && !dataNode.get("fromId").isNull()) {
                    fromId = dataNode.get("fromId").asText();
                }
            }
            
            // If not found in data, try direct fields (New P2P chat format)
            if (targetId == null && jsonNode.has("toUserId") && !jsonNode.get("toUserId").isNull()) {
                targetId = jsonNode.get("toUserId").asText();
            }
            if (fromId == null && jsonNode.has("fromUserId") && !jsonNode.get("fromUserId").isNull()) {
                fromId = jsonNode.get("fromUserId").asText();
            }
            
            if (targetId == null || fromId == null) {
                System.err.println("Invalid offer message format - missing required fields: targetId=" + targetId + ", fromId=" + fromId);
                System.err.println("Message: " + jsonNode.toString());
                return;
            }
            
            System.out.println("Received offer from " + fromId + " for user: " + targetId);
            
            WebSocketSession targetSession = onlineUsers.get(targetId);
            if (targetSession != null && targetSession.isOpen()) {
                // Forward the offer message to the target user
                targetSession.sendMessage(new TextMessage(jsonNode.toString()));
                System.out.println("Forwarded offer to user: " + targetId);
            } else {
                System.out.println("User " + targetId + " is not online or session is closed.");
            }
        } catch (Exception e) {
            System.err.println("Error handling offer: " + e.getMessage());
            e.printStackTrace();
        }
    }
      private void handleAnswer(WebSocketSession session, JsonNode jsonNode) throws IOException {
        try {
            String targetId = null;
            String fromId = null;
            
            // Support both message formats for compatibility
            if (jsonNode.has("data") && jsonNode.get("data") != null && !jsonNode.get("data").isNull()) {
                // Old video call format
                JsonNode dataNode = jsonNode.get("data");
                if (dataNode.has("targetId") && !dataNode.get("targetId").isNull()) {
                    targetId = dataNode.get("targetId").asText();
                }
                if (dataNode.has("fromId") && !dataNode.get("fromId").isNull()) {
                    fromId = dataNode.get("fromId").asText();
                }
            }
            
            // If not found in data, try direct fields (New P2P chat format)
            if (targetId == null && jsonNode.has("toUserId") && !jsonNode.get("toUserId").isNull()) {
                targetId = jsonNode.get("toUserId").asText();
            }
            if (fromId == null && jsonNode.has("fromUserId") && !jsonNode.get("fromUserId").isNull()) {
                fromId = jsonNode.get("fromUserId").asText();
            }
            
            if (targetId == null || fromId == null) {
                System.err.println("Invalid answer message format - missing required fields: targetId=" + targetId + ", fromId=" + fromId);
                System.err.println("Message: " + jsonNode.toString());
                return;
            }
            
            System.out.println("Received answer from " + fromId + " for user: " + targetId);
            
            WebSocketSession targetSession = onlineUsers.get(targetId);
            if (targetSession != null && targetSession.isOpen()) {
                targetSession.sendMessage(new TextMessage(jsonNode.toString()));
                System.out.println("Forwarded answer to user: " + targetId);
            } else {
                System.out.println("User " + targetId + " is not online or session is closed.");
            }
        } catch (Exception e) {
            System.err.println("Error handling answer: " + e.getMessage());
            e.printStackTrace();
        }
    }
      private void handleIceCandidate(WebSocketSession session, JsonNode jsonNode) throws IOException {
        try {
            String targetId = null;
            String fromId = null;
            
            // Support both message formats for compatibility
            if (jsonNode.has("data") && jsonNode.get("data") != null && !jsonNode.get("data").isNull()) {
                // Old video call format
                JsonNode dataNode = jsonNode.get("data");
                if (dataNode.has("targetId") && !dataNode.get("targetId").isNull()) {
                    targetId = dataNode.get("targetId").asText();
                }
                if (dataNode.has("fromId") && !dataNode.get("fromId").isNull()) {
                    fromId = dataNode.get("fromId").asText();
                }
            }
            
            // If not found in data, try direct fields (New P2P chat format)
            if (targetId == null && jsonNode.has("toUserId") && !jsonNode.get("toUserId").isNull()) {
                targetId = jsonNode.get("toUserId").asText();
            }
            if (fromId == null && jsonNode.has("fromUserId") && !jsonNode.get("fromUserId").isNull()) {
                fromId = jsonNode.get("fromUserId").asText();
            }
            
            if (targetId == null || fromId == null) {
                System.err.println("Invalid ICE candidate message format - missing required fields: targetId=" + targetId + ", fromId=" + fromId);
                System.err.println("Message: " + jsonNode.toString());
                return;
            }
            
            System.out.println("Received ICE candidate from " + fromId + " for user: " + targetId);
            
            WebSocketSession targetSession = onlineUsers.get(targetId);
            if (targetSession != null && targetSession.isOpen()) {
                targetSession.sendMessage(new TextMessage(jsonNode.toString()));
                System.out.println("Forwarded ICE candidate to user: " + targetId);
            } else {
                System.out.println("User " + targetId + " is not online or session is closed.");
            }
        } catch (Exception e) {
            System.err.println("Error handling ICE candidate: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public ConcurrentHashMap.KeySetView<String, WebSocketSession> getOnlineUserIds() {
        return onlineUsers.keySet();
    }

    // Video call handler methods
    private void handleCreateRoom(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String roomId = jsonNode.get("data").get("roomId").asText();
        String roomName = jsonNode.get("data").get("roomName").asText();
        String ownerId = jsonNode.get("data").get("ownerId").asText();
        String ownerName = jsonNode.get("data").get("ownerName").asText();

        VideoRoomInfo room = new VideoRoomInfo(roomId, roomName, ownerId, ownerName);
        videoRooms.put(roomId, room);
        userIdToRoomId.put(ownerId, roomId);

        System.out.println("Video room created: " + roomId + " by " + ownerName);
        
        // Send confirmation to room creator
        sendToUser(ownerId, createMessage("room_created", 
            objectMapper.createObjectNode()
                .put("roomId", roomId)
                .put("roomName", roomName)
        ));
    }

    private void handleRequestJoin(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String roomId = jsonNode.get("data").get("roomId").asText();
        String userId = jsonNode.get("data").get("userId").asText();
        String userName = jsonNode.get("data").get("userName").asText();

        VideoRoomInfo room = videoRooms.get(roomId);
        if (room == null || !room.isActive) {
            sendToUser(userId, createMessage("join_rejected", 
                objectMapper.createObjectNode()
                    .put("roomId", roomId)
                    .put("reason", "Room not found or inactive")
            ));
            return;
        }

        // Send join request to room owner
        ObjectNode requestData = objectMapper.createObjectNode();
        requestData.put("roomId", roomId);
        requestData.put("userId", userId);
        requestData.put("userName", userName);
        requestData.put("timestamp", System.currentTimeMillis());

        sendToUser(room.ownerId, createMessage("join_request", requestData));
        
        System.out.println("Join request sent from " + userName + " to room " + roomId);
    }    
    
    private void handleApproveJoin(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String roomId = jsonNode.get("data").get("roomId").asText();
        String userId = jsonNode.get("data").get("userId").asText();

        VideoRoomInfo room = videoRooms.get(roomId);
        if (room == null || !room.isActive) {
            return;
        }

        // Add user to room
        String userName = userIdToName.get(userId);
        room.participants.put(userId, userName);
        userIdToRoomId.put(userId, roomId);

        // Create existing participants array for the new user
        ArrayNode existingParticipants = objectMapper.createArrayNode();
        for (String participantId : room.participants.keySet()) {
            if (!participantId.equals(userId)) { // Don't include the new user themselves
                ObjectNode participant = objectMapper.createObjectNode();
                participant.put("userId", participantId);
                participant.put("userName", room.participants.get(participantId));
                participant.put("isOwner", participantId.equals(room.ownerId));
                existingParticipants.add(participant);
            }
        }

        // Notify the approved user with room info and existing participants
        ObjectNode joinApprovedData = objectMapper.createObjectNode();
        joinApprovedData.put("roomId", roomId);
        joinApprovedData.put("roomName", room.name);
        joinApprovedData.put("ownerId", room.ownerId);
        joinApprovedData.put("ownerName", room.ownerName);
        joinApprovedData.set("existingParticipants", existingParticipants);        sendToUser(userId, createMessage("join_approved", joinApprovedData));

        // Notify all OTHER participants about new user (exclude the new user themselves)
        broadcastToRoom(roomId, createMessage("user_joined", 
            objectMapper.createObjectNode()
                .put("userId", userId)
                .put("userName", userName)
                .put("roomId", roomId)
        ), userId); // Exclude the new user from this broadcast

        System.out.println("User " + userName + " approved to join room " + roomId + " with " + existingParticipants.size() + " existing participants");
    }

    private void handleRejectJoin(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String roomId = jsonNode.get("data").get("roomId").asText();
        String userId = jsonNode.get("data").get("userId").asText();

        sendToUser(userId, createMessage("join_rejected", 
            objectMapper.createObjectNode()
                .put("roomId", roomId)
                .put("reason", "Request rejected by room owner")
        ));

        System.out.println("Join request rejected for user " + userId + " in room " + roomId);
    }    private void handleToggleMedia(WebSocketSession session, JsonNode jsonNode) throws IOException {
        JsonNode dataNode = jsonNode.get("data");
        
        // Check if roomId is present in the data
        JsonNode roomIdNode = dataNode.get("roomId");
        if (roomIdNode == null || roomIdNode.isNull()) {
            System.out.println("handleToggleMedia: No roomId provided, skipping broadcast");
            return;
        }
        
        String roomId = roomIdNode.asText();
        
        // Create a new ObjectNode message for broadcasting
        ObjectNode mediaToggleMessage = createMessage("media_toggle", (ObjectNode) dataNode);
        
        // Broadcast media toggle to all participants in room
        broadcastToRoom(roomId, mediaToggleMessage, null);
    }

    private void handleRemoveParticipant(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String roomId = jsonNode.get("data").get("roomId").asText();
        String userId = jsonNode.get("data").get("userId").asText();

        VideoRoomInfo room = videoRooms.get(roomId);
        if (room == null || !room.isActive) {
            return;
        }

        // Remove user from room
        room.participants.remove(userId);
        userIdToRoomId.remove(userId);

        // Notify the removed user
        sendToUser(userId, createMessage("removed_from_room", 
            objectMapper.createObjectNode().put("roomId", roomId)
        ));

        // Notify other participants
        broadcastToRoom(roomId, createMessage("user_left", 
            objectMapper.createObjectNode()
                .put("userId", userId)
                .put("roomId", roomId)
        ), userId);

        System.out.println("User " + userId + " removed from room " + roomId);
    }    
      private void handleLeaveRoom(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String roomId = jsonNode.get("data").get("roomId").asText();
        String userId = jsonNode.get("data").get("userId").asText();
        
        VideoRoomInfo room = videoRooms.get(roomId);
        if (room != null && room.participants.containsKey(userId)) {
            String userName = room.participants.get(userId);
            
            // Remove user from room
            room.participants.remove(userId);
            userIdToRoomId.remove(userId);
            
            // Notify all remaining participants that user left
            broadcastToRoom(roomId, createMessage("user_left", 
                objectMapper.createObjectNode()
                    .put("userId", userId)
                    .put("userName", userName)
                    .put("roomId", roomId)
            ), userId);
            
            // If room is empty, remove it
            if (room.participants.isEmpty()) {
                videoRooms.remove(roomId);
                System.out.println("Room " + roomId + " removed (empty)");
            }
            
            System.out.println("User " + userName + " left room " + roomId);
        }
    }

    // Helper methods for video calls
    private void sendToUser(String userId, ObjectNode message) throws IOException {
        WebSocketSession session = onlineUsers.get(userId);
        System.out.println("Sending message to user " + userId + ": " + message.toString());
        System.out.println("User session found: " + (session != null));
        System.out.println("Session open: " + (session != null && session.isOpen()));
        
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message.toString()));
            System.out.println("Message sent successfully to " + userId);
        } else {
            System.out.println("Cannot send message - user not found or session closed: " + userId);
        }
    }

    private void broadcastToRoom(String roomId, ObjectNode message, String excludeUserId) throws IOException {
        VideoRoomInfo room = videoRooms.get(roomId);
        if (room == null) return;

        for (String participantId : room.participants.keySet()) {
            if (excludeUserId != null && participantId.equals(excludeUserId)) {
                continue;
            }
            sendToUser(participantId, message);
        }
    }

    private ObjectNode createMessage(String type, ObjectNode data) {
        ObjectNode message = objectMapper.createObjectNode();
        message.put("type", type);
        message.set("data", data);
        return message;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("WebSocket connection established: " + session.getId());
        System.out.println("Session URI: " + session.getUri());
        System.out.println("Session remote address: " + session.getRemoteAddress());
        super.afterConnectionEstablished(session);
    }

    private void handleConnectionRejected(WebSocketSession session, JsonNode jsonNode) throws IOException {
        try {
            String toUserId = jsonNode.get("toUserId").asText();
            String fromUserId = jsonNode.get("fromUserId").asText();
            
            System.out.println("Connection rejected from " + fromUserId + " to " + toUserId);
            
            WebSocketSession toSession = onlineUsers.get(toUserId);
            if (toSession != null && toSession.isOpen()) {
                toSession.sendMessage(new TextMessage(jsonNode.toString()));
                System.out.println("Forwarded connection rejection to user: " + toUserId);
            } else {
                System.out.println("User " + toUserId + " is not online or session is closed.");
            }
        } catch (Exception e) {
            System.err.println("Error handling connection rejection: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleLogoutNotification(WebSocketSession session, JsonNode jsonNode) throws IOException {
        try {
            String fromUserId = jsonNode.get("fromUserId").asText();
            String toUserId = jsonNode.get("toUserId").asText();
            
            System.out.println("Logout notification from " + fromUserId + " to " + toUserId);
            
            WebSocketSession toSession = onlineUsers.get(toUserId);
            if (toSession != null && toSession.isOpen()) {
                toSession.sendMessage(new TextMessage(jsonNode.toString()));
                System.out.println("Forwarded logout notification to user: " + toUserId);
            } else {
                System.out.println("User " + toUserId + " is not online or session is closed.");
            }
        } catch (Exception e) {
            System.err.println("Error handling logout notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

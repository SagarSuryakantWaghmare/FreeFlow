package com.mini_project.p2p_chat.controller;

import com.mini_project.p2p_chat.model.Group;
import com.mini_project.p2p_chat.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {
    
    @Autowired
    private GroupService groupService;
    
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createGroup(
            @RequestParam String name,
            @RequestHeader("X-User-Id") String userId) {
        
        try {
            Group group = groupService.createGroup(name, userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("groupId", group.getGroupId());
            response.put("inviteLink", group.getInviteLink());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/join/{token}")
    public ResponseEntity<Map<String, String>> joinGroup(
            @PathVariable String token,
            @RequestHeader("X-User-Id") String userId) {
        
        try {
            Group group = groupService.joinGroup(token, userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("groupId", group.getGroupId());
            response.put("groupName", group.getGroupName());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/leave/{groupId}")
    public ResponseEntity<String> leaveGroup(
            @PathVariable String groupId,
            @RequestHeader("X-User-Id") String userId) {
        
        try {
            boolean success = groupService.leaveGroup(groupId, userId);
            if (success) {
                return ResponseEntity.ok("Left");
            } else {
                return ResponseEntity.badRequest().body("Failed to leave group");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

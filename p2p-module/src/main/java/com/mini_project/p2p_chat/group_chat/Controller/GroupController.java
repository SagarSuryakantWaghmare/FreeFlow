package com.mini_project.p2p_chat.group_chat.Controller;

import com.mini_project.p2p_chat.group_chat.Service.GroupService;
import com.mini_project.p2p_chat.group_chat.model.ChatGroup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createGroup(@RequestParam String name, @RequestHeader("X-User-Id") String userId) {
        ChatGroup group = groupService.createGroup(name, userId);

        Map<String, String> response = new HashMap<>();
        response.put("groupId", String.valueOf(group.getGroupId())); // for WebSocket
        response.put("inviteLink", group.getToken());

        return ResponseEntity.ok(response);
    }


    @PostMapping("/join/{token}")
    public ResponseEntity<Map<String, String>> joinGroup(@PathVariable String token,   @RequestHeader("X-User-Id") String userId) {
        boolean success = groupService.joinGroup(token, userId);
        if (!success) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }

        Optional<ChatGroup> groupOpt = groupService.getGroupByToken(token);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Group not found"));
        }

        ChatGroup group = groupOpt.get();

        Map<String, String> response = new HashMap<>();
        response.put("groupId", String.valueOf(group.getGroupId())); // for socket
        response.put("groupName", group.getGroupName());

        return ResponseEntity.ok(response);
    }


    @PostMapping("/leave/{groupId}")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId,   @RequestHeader("X-User-Id") String userId) {
        boolean success = groupService.leaveGroupById(groupId, userId);
        return success ? ResponseEntity.ok("Left") : ResponseEntity.badRequest().body("Invalid groupId");
    }

}


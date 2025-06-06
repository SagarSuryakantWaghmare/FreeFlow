package com.mini_project.p2p_chat.group_chat.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Setter
@Getter
@Entity
public class ChatGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long groupId;

    private String groupName;

    @Column(unique = true)
    private String token; // public group token like UUID

    @ElementCollection
    private Set<String> members = new HashSet<>();

    private LocalDateTime createdAt;
}


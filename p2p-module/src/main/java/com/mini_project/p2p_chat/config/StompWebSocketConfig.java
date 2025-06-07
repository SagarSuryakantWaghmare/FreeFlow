package com.mini_project.p2p_chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class StompWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to carry the messages back to the client
        // on destinations prefixed with "/topic"
        config.enableSimpleBroker("/topic");
        
        // Designate the "/app" prefix for messages that are bound to methods
        // annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws/group" endpoint for WebSocket connections
        // Enable SockJS fallback options so that alternate transports can be used
        registry.addEndpoint("/ws/group")
                .setAllowedOriginPatterns("*") // Allow all origins for development
                .withSockJS();
    }
}

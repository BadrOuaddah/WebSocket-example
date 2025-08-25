package com.example.messaging.controller;

import com.example.messaging.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class ChatController {
    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public ChatMessage send(ChatMessage inbound) {
        String sender = (inbound.getSender() == null || inbound.getSender().isBlank())
                ? "Anonymous" : inbound.getSender();
        String content = inbound.getContent();
        String ts = Instant.now().toString();
        return new ChatMessage(sender, content, ts);
    }
}

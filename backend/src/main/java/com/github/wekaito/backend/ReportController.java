package com.github.wekaito.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/report")
public class ReportController {
    private final String discordWebhookUrl = System.getenv("DISCORD_WEBHOOK_URL");

    @PostMapping
    public ResponseEntity<String> sendReport(@RequestBody Map<String, Object> payload) {
        if (discordWebhookUrl == null || discordWebhookUrl.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook URL not configured.");
        }

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> discordResponse = restTemplate.postForEntity(discordWebhookUrl, payload, String.class);

        if (discordResponse.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.ok("Report sent successfully.");
        } else {
            return ResponseEntity.status(discordResponse.getStatusCode()).body("Failed to send report to Discord.");
        }
    }
}

package com.github.wekaito.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/report")
public class ReportController {
    @Value("${discord.webhook.url}")
    private String discordWebhookUrl;

    @PostMapping
    public ResponseEntity<String> sendReport(@RequestBody Map<String, Object> payload) {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> discordResponse = restTemplate.postForEntity(discordWebhookUrl, payload, String.class);

        if (discordResponse.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.ok("Report sent successfully.");
        } else {
            return ResponseEntity.status(discordResponse.getStatusCode()).body("Failed to send report to Discord.");
        }
    }
}

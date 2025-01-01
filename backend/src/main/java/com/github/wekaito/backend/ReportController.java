package com.github.wekaito.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/report")
public class ReportController {
    private static final String channelId = "1317425552826699806";
    private final String token = System.getenv("DISCORD_REPORT_WEBHOOK");
    private final String discordWebhookUrl = "https://discord.com/api/webhooks/" + channelId + "/" + token;

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

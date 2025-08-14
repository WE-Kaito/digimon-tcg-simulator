package com.github.wekaito.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.*;
import java.nio.file.*;
import java.time.Duration;

@Service
@Slf4j
public class ImageDownloader {

    private static final Duration DOWNLOAD_TIMEOUT = Duration.ofSeconds(30);

    private final Path imagesDir;

    public ImageDownloader(@Value("${app.images.dir:/app/data/images}") String imagesDirProp) {
        this.imagesDir = Paths.get(imagesDirProp).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.imagesDir);
            log.info("Images directory ready at: {}", this.imagesDir);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to create images directory: " + this.imagesDir, e);
        }
    }

    public boolean downloadImage(String imageUrl, String cardId) {
        String fileName = sanitize(cardId) + ".jpg";
        Path target = imagesDir.resolve(fileName);

        if (Files.exists(target)) {
            log.debug("Image already exists for card: {}", cardId);
            return true;
        }

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(imageUrl).openConnection();
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout((int) DOWNLOAD_TIMEOUT.toMillis());
            conn.setReadTimeout((int) DOWNLOAD_TIMEOUT.toMillis());
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Digimon TCG Simulator)");
            conn.setRequestProperty("Accept", "image/*");

            int code = conn.getResponseCode();
            if (code != HttpURLConnection.HTTP_OK) {
                log.warn("Failed to download (HTTP {}): {} for card {}", code, imageUrl, cardId);
                return false;
            }

            // Write to a temp file first, then move atomically
            Path tmp = Files.createTempFile(imagesDir, "img-", ".tmp");
            try (InputStream in = conn.getInputStream()) {
                Files.copy(in, tmp, StandardCopyOption.REPLACE_EXISTING);
            }
            Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);

            log.info("Image saved for card {} at {}", cardId, target);
            return true;

        } catch (IOException e) {
            log.error("Failed to download image for card: {} from {}", cardId, imageUrl, e);
            return false;
        }
    }

    public boolean imageExists(String cardId) {
        Path p = imagesDir.resolve(sanitize(cardId) + ".jpg");
        return Files.exists(p);
    }

    public String getLocalImagePath(String cardId) {
        return "/images/" + sanitize(cardId) + ".jpg";
    }

    public void downloadImagesAsync(java.util.List<String> cardIds, String baseImageUrl) {
        // Keep it simple; parallel streams can overwhelm hosts. Limit concurrency if needed.
        cardIds.stream()
                .filter(cardId -> !imageExists(cardId))
                .forEach(cardId -> {
                    String imageUrl = baseImageUrl.replace("{card-id}", cardId);
                    downloadImage(imageUrl, cardId);
                    try { Thread.sleep(100); } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("Image download interrupted for card: {}", cardId);
                    }
                });
    }

    private static String sanitize(String s) {
        // Prevent path traversal / illegal chars
        return s.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}

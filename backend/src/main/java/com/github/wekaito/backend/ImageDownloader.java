package com.github.wekaito.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.time.Duration;

@Service
@Slf4j
public class ImageDownloader {
    
    private static final String IMAGES_DIR = "images";
    private static final Duration DOWNLOAD_TIMEOUT = Duration.ofSeconds(30);
    
    public ImageDownloader() {
        try {
            Files.createDirectories(Paths.get(IMAGES_DIR));
            log.info("Images directory created: {}", IMAGES_DIR);
        } catch (IOException e) {
            log.error("Failed to create images directory", e);
        }
    }
    
    public boolean downloadImage(String imageUrl, String cardId) {
        String fileName = cardId + ".jpg";
        String savePath = IMAGES_DIR + "/" + fileName;
        
        if (imageExists(cardId)) {
            log.debug("Image already exists for card: {}", cardId);
            return true;
        }
        
        try {
            log.info("Downloading image for card: {} from {} to {}", cardId, imageUrl, savePath);
            
            URLConnection connection = new URL(imageUrl).openConnection();
            connection.setConnectTimeout((int) DOWNLOAD_TIMEOUT.toMillis());
            connection.setReadTimeout((int) DOWNLOAD_TIMEOUT.toMillis());
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Digimon TCG Simulator)");
            
            try (InputStream in = connection.getInputStream()) {
                Files.copy(in, Paths.get(savePath), StandardCopyOption.REPLACE_EXISTING);
                log.info("Image saved successfully for card: {} at {}", cardId, savePath);
                return true;
            }
        } catch (IOException e) {
            log.error("Failed to download image for card: {} from {}", cardId, imageUrl, e);
            return false;
        }
    }
    
    public boolean imageExists(String cardId) {
        String fileName = cardId + ".jpg";
        String filePath = IMAGES_DIR + "/" + fileName;
        return Files.exists(Paths.get(filePath));
    }
    
    public String getLocalImagePath(String cardId) {
        return "/images/" + cardId + ".jpg";
    }
    
    public void downloadImagesAsync(java.util.List<String> cardIds, String baseImageUrl) {
        cardIds.parallelStream()
                .filter(cardId -> !imageExists(cardId))
                .forEach(cardId -> {
                    String imageUrl = baseImageUrl.replace("{card-id}", cardId);
                    downloadImage(imageUrl, cardId);
                    
                    // Add small delay to respect rate limits
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("Image download interrupted for card: {}", cardId);
                    }
                });
    }
    
}

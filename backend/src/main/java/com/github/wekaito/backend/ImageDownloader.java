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
    
    private static final String DEV_IMAGES_DIR = "images";
    private static final Duration DOWNLOAD_TIMEOUT = Duration.ofSeconds(30);
    
    private final String prodImagesDir;
    private final boolean isProduction;
    
    public ImageDownloader() {
        // Determine the correct production path based on current working directory
        String currentDir = System.getProperty("user.dir");
        if (currentDir.endsWith("backend")) {
            // Running from backend directory (IntelliJ or direct java -jar)
            prodImagesDir = "src/main/resources/static/images";
        } else {
            // Running from project root (Docker or npm run scripts)
            prodImagesDir = "backend/src/main/resources/static/images";
        }
        
        // Auto-detect production environment
        // Production indicators: JAR execution, no dev tools, packaged environment
        isProduction = isProductionEnvironment();
        
        try {
            // Create directories to ensure they exist
            Files.createDirectories(Paths.get(DEV_IMAGES_DIR));
            if (isProduction) {
                Files.createDirectories(Paths.get(prodImagesDir));
            }
            log.info("Image environment detected - production: {}, dev dir: {}, prod dir: {}", 
                    isProduction, DEV_IMAGES_DIR, prodImagesDir);
        } catch (IOException e) {
            log.error("Failed to create images directories", e);
        }
    }
    
    private boolean isProductionEnvironment() {
        // Check multiple indicators to determine if we're in production
        try {
            // 1. Check if running from JAR (strongest production indicator)
            String classPath = System.getProperty("java.class.path");
            boolean isJar = classPath.contains(".jar") && !classPath.contains("target/classes");
            
            // 2. Check system properties for production indicators
            String javaCommand = System.getProperty("sun.java.command", "");
            boolean isJarCommand = javaCommand.endsWith(".jar");
            
            // 3. Check if we're running in a packaged environment (not IDE)
            boolean isIDE = classPath.contains("target/classes") || classPath.contains("build/classes");
            
            log.debug("Production detection - isJar: {}, isJarCommand: {}, isIDE: {}", 
                    isJar, isJarCommand, isIDE);
            
            // Only use production mode if definitely running from JAR
            // Don't use static directory existence as it can be created during development
            return isJar || isJarCommand;
            
        } catch (Exception e) {
            log.warn("Failed to detect environment, defaulting to development", e);
            return false;
        }
    }
    
    private String getImagesDirectory() {
        return isProduction ? prodImagesDir : DEV_IMAGES_DIR;
    }
    
    public boolean downloadImage(String imageUrl, String cardId) {
        String fileName = cardId + ".jpg";
        String imagesDir = getImagesDirectory();
        String savePath = imagesDir + "/" + fileName;
        
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
        String imagesDir = getImagesDirectory();
        String filePath = imagesDir + "/" + fileName;
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
    
    /**
     * Copy existing images from dev to prod directory for build preparation
     */
    public void copyImagesToProduction() {
        if (isProduction) {
            try {
                Path devDir = Paths.get(DEV_IMAGES_DIR);
                Path prodDir = Paths.get(prodImagesDir);
                
                if (Files.exists(devDir)) {
                    Files.walk(devDir)
                            .filter(Files::isRegularFile)
                            .filter(path -> path.toString().endsWith(".jpg"))
                            .forEach(source -> {
                                try {
                                    Path target = prodDir.resolve(devDir.relativize(source));
                                    Files.createDirectories(target.getParent());
                                    Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
                                    log.info("Copied image to production: {}", target);
                                } catch (IOException e) {
                                    log.error("Failed to copy image to production: {}", source, e);
                                }
                            });
                }
            } catch (IOException e) {
                log.error("Failed to copy images to production directory", e);
            }
        }
    }
}

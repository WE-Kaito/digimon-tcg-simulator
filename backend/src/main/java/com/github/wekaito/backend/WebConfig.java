package com.github.wekaito.backend;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.*;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.images.dir:/app/data/images}")
    private String imagesDirProp;

    private Path imagesDir;

    @PostConstruct
    void init() {
        this.imagesDir = Paths.get(imagesDirProp).toAbsolutePath().normalize();
        try {
            Files.createDirectories(imagesDir);
            log.info("Images directory ready at: {}", imagesDir);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to create images directory: " + imagesDir, e);
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convert to file: URI with trailing slash so Spring serves it correctly
        String location = imagesDir.toUri().toString(); // e.g. file:/app/data/images/
        registry.addResourceHandler("/images/**")
                .addResourceLocations(location);
        log.info("Image serving configured: {} -> {}", "/images/**", location);
    }
}

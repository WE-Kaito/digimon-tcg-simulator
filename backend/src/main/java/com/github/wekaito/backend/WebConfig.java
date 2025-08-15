package com.github.wekaito.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        boolean isProduction = isProductionEnvironment();
        
    // Always serve from filesystem for now - simpler and more reliable
        // Production images are downloaded to a runtime directory that needs filesystem access
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:images/");
        
        if (isProduction) {
            log.info("Image serving configured for production (file:images/)");
        } else {
            log.info("Image serving configured for development (file:images/)");
        }
    }
    
    private boolean isProductionEnvironment() {
        try {
            // Use same detection logic as ImageDownloader
            String classPath = System.getProperty("java.class.path");
            boolean isJar = classPath.contains(".jar") && !classPath.contains("target/classes");
            
            String javaCommand = System.getProperty("sun.java.command", "");
            boolean isJarCommand = javaCommand.endsWith(".jar");
            
            // Only use production mode if definitely running from JAR
            return isJar || isJarCommand;
            
        } catch (Exception e) {
            log.warn("Failed to detect environment for image serving, defaulting to development", e);
            return false;
        }
    }
}

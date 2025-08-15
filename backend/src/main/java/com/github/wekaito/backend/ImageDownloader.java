package com.github.wekaito.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ImageDownloader {
    
    public String getDirectImageUrl(String cardId) {
        return "https://images.digimoncard.io/images/cards/" + cardId + ".jpg";
    }
    
}

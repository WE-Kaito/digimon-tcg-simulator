import { useEffect, useState } from 'react';

const imageCache = new Map<string, string>();
const loadingCache = new Set<string>();

export const useImageCache = (originalUrl: string | undefined): string | undefined => {
  const [cachedUrl, setCachedUrl] = useState<string | undefined>(originalUrl);

  useEffect(() => {
    if (!originalUrl) {
      setCachedUrl(undefined);
      return;
    }

    // Return cached version if available
    if (imageCache.has(originalUrl)) {
      setCachedUrl(imageCache.get(originalUrl));
      return;
    }

    // If already loading, just wait
    if (loadingCache.has(originalUrl)) {
      return;
    }

    // Start loading image
    loadingCache.add(originalUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas to convert to blob URL for caching
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              imageCache.set(originalUrl, blobUrl);
              setCachedUrl(blobUrl);
            } else {
              setCachedUrl(originalUrl);
            }
            loadingCache.delete(originalUrl);
          }, 'image/jpeg', 0.9);
        } else {
          setCachedUrl(originalUrl);
          loadingCache.delete(originalUrl);
        }
      } catch (error) {
        // If caching fails, just use original URL
        setCachedUrl(originalUrl);
        loadingCache.delete(originalUrl);
      }
    };
    
    img.onerror = () => {
      setCachedUrl(originalUrl);
      loadingCache.delete(originalUrl);
    };
    
    img.src = originalUrl;
  }, [originalUrl]);

  return cachedUrl;
};
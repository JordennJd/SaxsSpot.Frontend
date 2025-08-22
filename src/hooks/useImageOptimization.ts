import { useState, useEffect, useRef, useCallback } from 'react';

interface UseImageOptimizationOptions {
  rootMargin?: string;
  threshold?: number;
  fallbackSrc?: string;
  placeholder?: string;
}

interface UseImageOptimizationReturn {
  src: string | null;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
  ref: React.RefObject<HTMLImageElement | null>;
}

/**
 * Hook for optimized image loading with lazy loading and error handling
 */
export function useImageOptimization(
  imageSrc: string,
  options: UseImageOptimizationOptions = {},
): UseImageOptimizationReturn {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallbackSrc,
    placeholder,
  } = options;

  const [src, setSrc] = useState<string | null>(placeholder || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialize intersection observer
  useEffect(() => {
    if (!imgRef.current || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      },
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootMargin, threshold]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !imageSrc) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setSrc(imageSrc);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (fallbackSrc) {
        setSrc(fallbackSrc);
      }
    };

    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, imageSrc, fallbackSrc]);

  const retry = useCallback(() => {
    if (!imageSrc) return;
    
    setHasError(false);
    setIsLoading(true);

    const img = new Image();
    
    img.onload = () => {
      setSrc(imageSrc);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (fallbackSrc) {
        setSrc(fallbackSrc);
      }
    };

    img.src = imageSrc;
  }, [imageSrc, fallbackSrc]);

  return {
    src,
    isLoading,
    hasError,
    retry,
    ref: imgRef,
  };
}

/**
 * Hook for preloading images
 */
export function useImagePreloader(imageSrcs: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const preloadImages = useCallback(async () => {
    if (imageSrcs.length === 0) return;

    setIsLoading(true);
    
    const promises = imageSrcs.map((src) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(src);
        img.src = src;
      });
    });

    try {
      const loaded = await Promise.allSettled(promises);
      const successful = loaded
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<string>).value);
      
      setLoadedImages(new Set(successful));
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    } finally {
      setIsLoading(false);
    }
  }, [imageSrcs]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  return {
    loadedImages,
    isLoading,
    preloadImages,
  };
} 
import React, { useState, useEffect, useRef } from 'react';
import './ImageLazyLoad.css';

/**
 * Lazy loading image component with placeholder
 * Only loads image when it enters viewport
 * Shows loading skeleton until image loads
 */
const ImageLazyLoad = ({
    src,
    alt,
    className = '',
    placeholder = null,
    width,
    height,
    onLoad
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before entering viewport
            }
        );

        observer.observe(imgRef.current);

        return () => {
            if (observer) observer.disconnect();
        };
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    return (
        <div
            ref={imgRef}
            className={`lazy-image-container ${className}`}
            style={{ width, height }}
        >
            {!isLoaded && (
                <div className="lazy-image-placeholder">
                    {placeholder || <div className="lazy-image-skeleton" />}
                </div>
            )}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
                    onLoad={handleLoad}
                    loading="lazy"
                    width={width}
                    height={height}
                />
            )}
        </div>
    );
};

export default ImageLazyLoad;

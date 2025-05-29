import { Injectable, NgZone } from '@angular/core';

export interface TouchGesture {
  type: 'swipe' | 'pull' | 'tap' | 'pinch';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  velocity?: number;
  element: HTMLElement;
}

export interface SwipeConfig {
  threshold: number; // Minimum distance for swipe
  velocityThreshold: number; // Minimum velocity
  timeThreshold: number; // Maximum time for gesture
}

@Injectable({
  providedIn: 'root'
})
export class MobileTouchService {
  private defaultSwipeConfig: SwipeConfig = {
    threshold: 50,
    velocityThreshold: 0.3,
    timeThreshold: 1000
  };

  constructor(private ngZone: NgZone) {}

  /**
   * Setup pull-to-refresh functionality for sticky sections
   */
  setupPullToRefresh(
    element: HTMLElement,
    callback: () => void,
    threshold: number = 80
  ): () => void {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.pageYOffset === 0) { // Only at top of page
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isPulling = true;
        element.style.transition = 'none';
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) { // Pulling down
        e.preventDefault();
        const pullDistance = Math.min(deltaY * 0.6, threshold * 1.5);
        element.style.transform = `translateY(${pullDistance}px)`;

        // Visual feedback when threshold is reached
        if (pullDistance >= threshold) {
          element.classList.add('pull-refresh-ready');
        } else {
          element.classList.remove('pull-refresh-ready');
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;

      const deltaY = currentY - startY;
      const deltaTime = Date.now() - startTime;

      element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.transform = 'translateY(0)';
      element.classList.remove('pull-refresh-ready');

      if (deltaY >= threshold && deltaTime < 1000) {
        this.ngZone.run(() => callback());
      }

      isPulling = false;
      startY = 0;
      currentY = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }

  /**
   * Setup swipe gestures for sticky navigation
   */
  setupSwipeNavigation(
    element: HTMLElement,
    onSwipe: (gesture: TouchGesture) => void,
    config: Partial<SwipeConfig> = {}
  ): () => void {
    const swipeConfig = { ...this.defaultSwipeConfig, ...config };

    let startTouch: Touch | null = null;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startTouch = e.touches[0];
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startTouch) return;

      const endTouch = e.changedTouches[0];
      const deltaTime = Date.now() - startTime;

      if (deltaTime > swipeConfig.timeThreshold) return;

      const deltaX = endTouch.clientX - startTouch.clientX;
      const deltaY = endTouch.clientY - startTouch.clientY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      if (distance >= swipeConfig.threshold && velocity >= swipeConfig.velocityThreshold) {
        let direction: 'up' | 'down' | 'left' | 'right';

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        const gesture: TouchGesture = {
          type: 'swipe',
          direction,
          distance,
          velocity,
          element
        };

        this.ngZone.run(() => onSwipe(gesture));
      }

      startTouch = null;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }

  /**
   * Setup haptic feedback for touch interactions
   */
  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }

  /**
   * Check if device supports touch
   */
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get optimal touch target size based on device
   */
  getOptimalTouchTargetSize(): number {
    const isPhone = window.innerWidth < 768;
    return isPhone ? 44 : 40; // iOS HIG and Material Design recommendations
  }
}

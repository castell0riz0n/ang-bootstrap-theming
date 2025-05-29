import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PerformanceMetrics {
  frameRate: number;
  scrollJank: number;
  animationDuration: number;
  memoryUsage?: number;
  renderTime: number;
}

export interface PerformanceThresholds {
  minFrameRate: number;
  maxScrollJank: number;
  maxAnimationDuration: number;
  maxRenderTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class StickyPerformanceService {
  private metricsSubject = new BehaviorSubject<PerformanceMetrics>({
    frameRate: 60,
    scrollJank: 0,
    animationDuration: 0,
    renderTime: 0
  });

  private performanceObserver?: PerformanceObserver;
  private frameCount = 0;
  private lastFrameTime = 0;
  private jankFrames = 0;

  public metrics$ = this.metricsSubject.asObservable();

  private thresholds: PerformanceThresholds = {
    minFrameRate: 45,
    maxScrollJank: 5,
    maxAnimationDuration: 300,
    maxRenderTime: 16 // 60fps = 16.67ms per frame
  };

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.measureFrameRate();
    this.measureAnimationPerformance();
    this.measureMemoryUsage();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return this.metricsSubject.value;
  }

  /**
   * Check if performance is below thresholds
   */
  isPerformancePoor(): boolean {
    const metrics = this.getCurrentMetrics();

    return (
      metrics.frameRate < this.thresholds.minFrameRate ||
      metrics.scrollJank > this.thresholds.maxScrollJank ||
      metrics.renderTime > this.thresholds.maxRenderTime
    );
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const metrics = this.getCurrentMetrics();
    const recommendations: string[] = [];

    if (metrics.frameRate < this.thresholds.minFrameRate) {
      recommendations.push('Enable performance mode to reduce animation complexity');
    }

    if (metrics.scrollJank > this.thresholds.maxScrollJank) {
      recommendations.push('Reduce scroll event frequency or enable throttling');
    }

    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      recommendations.push('Consider reducing DOM complexity or enable virtualization');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      recommendations.push('Memory usage is high, consider cleanup optimizations');
    }

    return recommendations;
  }

  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.handlePerformanceMeasure(entry);
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  private measureFrameRate(): void {
    const measureFrame = (currentTime: number) => {
      if (this.lastFrameTime > 0) {
        const deltaTime = currentTime - this.lastFrameTime;

        // Detect jank (frames taking longer than 16.67ms for 60fps)
        if (deltaTime > 20) {
          this.jankFrames++;
        }

        this.frameCount++;

        // Calculate FPS every second
        if (this.frameCount >= 60) {
          const fps = 1000 / (deltaTime);
          const jankPercentage = (this.jankFrames / this.frameCount) * 100;

          this.updateMetrics({
            frameRate: Math.round(fps),
            scrollJank: Math.round(jankPercentage)
          });

          this.frameCount = 0;
          this.jankFrames = 0;
        }
      }

      this.lastFrameTime = currentTime;
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  private measureAnimationPerformance(): void {
    // Mark animation start/end points
    const originalAnimate = Element.prototype.animate;

    Element.prototype.animate = function(keyframes: any, options: any) {
      const start = performance.now();
      const animation = originalAnimate.call(this, keyframes, options);

      animation.addEventListener('finish', () => {
        const duration = performance.now() - start;
        performance.mark('sticky-animation-end');
        performance.measure('sticky-animation', 'sticky-animation-start', 'sticky-animation-end');
      });

      performance.mark('sticky-animation-start');
      return animation;
    };
  }

  private measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;

      this.updateMetrics({
        memoryUsage: Math.round(usedMB)
      });
    }
  }

  private handlePerformanceMeasure(entry: PerformanceEntry): void {
    if (entry.name.includes('sticky-animation')) {
      this.updateMetrics({
        animationDuration: entry.duration
      });
    }
  }

  private updateMetrics(partialMetrics: Partial<PerformanceMetrics>): void {
    const currentMetrics = this.metricsSubject.value;
    const newMetrics = { ...currentMetrics, ...partialMetrics };
    this.metricsSubject.next(newMetrics);
  }

  /**
   * Create performance report
   */
  generatePerformanceReport(): any {
    const metrics = this.getCurrentMetrics();
    const recommendations = this.getPerformanceRecommendations();

    return {
      timestamp: new Date().toISOString(),
      metrics,
      performance: {
        overall: this.isPerformancePoor() ? 'Poor' : 'Good',
        score: this.calculatePerformanceScore(metrics)
      },
      recommendations,
      deviceInfo: {
        userAgent: navigator.userAgent,
        memory: (navigator as any).deviceMemory,
        cores: navigator.hardwareConcurrency,
        connection: (navigator as any).connection?.effectiveType
      }
    };
  }

  calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // Deduct points for poor performance
    if (metrics.frameRate < this.thresholds.minFrameRate) {
      score -= (this.thresholds.minFrameRate - metrics.frameRate) * 2;
    }

    if (metrics.scrollJank > this.thresholds.maxScrollJank) {
      score -= metrics.scrollJank * 3;
    }

    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      score -= (metrics.renderTime - this.thresholds.maxRenderTime) * 2;
    }

    return Math.max(0, Math.min(100, score));
  }
}

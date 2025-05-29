// src/app/_core/services/sticky-layout.service.ts
import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { throttleTime, map, distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash-es';


export interface StickyComponentConfig {
  id: string;
  enabled: boolean;
  order: number;
  className?: string;
  zIndex?: number;
  // Enhanced features
  autoHide?: boolean;
  hideThreshold?: number;
  animationDuration?: number;
  priority?: number;
}

export interface StickyLayoutConfig {
  header: StickyComponentConfig;
  breadcrumb: StickyComponentConfig;
  modifySearch: StickyComponentConfig;
  [key: string]: StickyComponentConfig;
}

export interface StickyLayoutState {
  isSticky: boolean;
  totalHeight: number;
  activeComponents: string[];
  hiddenComponents: string[];
}

export interface ScrollState {
  scrollY: number;
  scrollDirection: 'up' | 'down' | 'none';
  isScrolling: boolean;
  velocity: number;
}

@Injectable({
  providedIn: 'root'
})
export class StickyLayoutService {
  private renderer: Renderer2;

  // Configuration and state subjects
  private configSubject = new BehaviorSubject<StickyLayoutConfig>(this.getDefaultConfig());
  private stateSubject = new BehaviorSubject<StickyLayoutState>({
    isSticky: false,
    totalHeight: 0,
    activeComponents: [],
    hiddenComponents: []
  });
  private scrollStateSubject = new BehaviorSubject<ScrollState>({
    scrollY: 0,
    scrollDirection: 'none',
    isScrolling: false,
    velocity: 0
  });

  // Component height tracking
  private componentHeights = new Map<string, number>();

  // Scroll tracking
  private lastScrollY = 0;
  private scrollTimeout: any;

  // Performance mode
  private performanceMode = false;

  // Public observables
  public config$ = this.configSubject.asObservable();
  public state$ = this.stateSubject.asObservable();
  public scrollState$ = this.scrollStateSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadConfigFromStorage();
    this.initializeScrollTracking();
    this.setupPerformanceMode();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): StickyLayoutConfig {
    return {
      header: {
        id: 'header',
        enabled: true,
        order: 1,
        className: 'sticky-header',
        zIndex: 1030,
        autoHide: false,
        hideThreshold: 100,
        animationDuration: 300
      },
      breadcrumb: {
        id: 'breadcrumb',
        enabled: true,
        order: 2,
        className: 'sticky-breadcrumb',
        zIndex: 1025,
        autoHide: false,
        hideThreshold: 150,
        animationDuration: 250
      },
      modifySearch: {
        id: 'modifySearch',
        enabled: false,
        order: 3,
        className: 'sticky-modify-search',
        zIndex: 1020,
        autoHide: false,
        hideThreshold: 200,
        animationDuration: 200
      }
    };
  }

  /**
   * Update configuration for a specific component
   */
  updateComponentConfig(componentId: string, config: Partial<StickyComponentConfig>): void {
    const currentConfig = this.configSubject.value;

    if (currentConfig[componentId]) {
      currentConfig[componentId] = {
        ...currentConfig[componentId],
        ...config
      };

      this.configSubject.next(currentConfig);
      this.saveConfigToStorage();
      this.updateState();
    }
  }

  /**
   * Enable/disable a sticky component
   */
  toggleComponent(componentId: string, enabled?: boolean): void {
    const currentConfig = this.configSubject.value;

    if (currentConfig[componentId]) {
      const newEnabled = enabled !== undefined ? enabled : !currentConfig[componentId].enabled;
      this.updateComponentConfig(componentId, { enabled: newEnabled });
    }
  }

  /**
   * Enable auto-hide behavior for a component
   */
  enableAutoHide(componentId: string, threshold: number = 100): void {
    this.updateComponentConfig(componentId, {
      autoHide: true,
      hideThreshold: threshold
    });
  }

  /**
   * Disable auto-hide behavior for a component
   */
  disableAutoHide(componentId: string): void {
    this.updateComponentConfig(componentId, {
      autoHide: false
    });
  }

  /**
   * Register a component's height
   */
  registerComponentHeight(componentId: string, height: number): void {
    this.componentHeights.set(componentId, height);
    this.updateState();
  }

  /**
   * Get enabled components in order
   */
  getEnabledComponents(): StickyComponentConfig[] {
    const config = this.configSubject.value;
    return Object.values(config)
      .filter(comp => comp.enabled)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get components that should be hidden based on scroll behavior
   */
  getHiddenComponents(): string[] {
    const scrollState = this.scrollStateSubject.value;
    const config = this.configSubject.value;
    const hiddenComponents: string[] = [];

    Object.entries(config).forEach(([id, componentConfig]) => {
      if (componentConfig.enabled &&
        componentConfig.autoHide &&
        scrollState.scrollDirection === 'down' &&
        scrollState.scrollY > (componentConfig.hideThreshold || 100)) {
        hiddenComponents.push(id);
      }
    });

    return hiddenComponents;
  }

  /**
   * Get total height of all enabled sticky components (excluding hidden ones)
   */
  getTotalStickyHeight(): number {
    const enabledComponents = this.getEnabledComponents();
    const hiddenComponents = this.getHiddenComponents();

    return enabledComponents.reduce((total, comp) => {
      if (hiddenComponents.includes(comp.id)) {
        return total; // Don't count hidden components
      }
      const height = this.componentHeights.get(comp.id) || 0;
      return total + height;
    }, 0);
  }

  /**
   * Get CSS custom properties for sticky positioning
   */
  getStickyOffsets(): { [key: string]: string } {
    const enabledComponents = this.getEnabledComponents();
    const hiddenComponents = this.getHiddenComponents();
    const offsets: { [key: string]: string } = {};
    let cumulativeHeight = 0;

    enabledComponents.forEach(comp => {
      if (!hiddenComponents.includes(comp.id)) {
        offsets[`--sticky-${comp.id}-top`] = `${cumulativeHeight}px`;
        const height = this.componentHeights.get(comp.id) || 0;
        cumulativeHeight += height;
      } else {
        offsets[`--sticky-${comp.id}-top`] = `-100px`; // Hide off-screen
      }
    });

    offsets['--sticky-total-height'] = `${cumulativeHeight}px`;
    return offsets;
  }

  /**
   * Check if any sticky components are enabled
   */
  hasEnabledComponents(): boolean {
    return this.getEnabledComponents().length > 0;
  }

  /**
   * Enable all components
   */
  enableAll(): void {
    const currentConfig = this.configSubject.value;
    Object.keys(currentConfig).forEach(componentId => {
      this.toggleComponent(componentId, true);
    });
  }

  /**
   * Disable all components
   */
  disableAll(): void {
    const currentConfig = this.configSubject.value;
    Object.keys(currentConfig).forEach(componentId => {
      this.toggleComponent(componentId, false);
    });
  }

  /**
   * Toggle performance mode for better mobile performance
   */
  setPerformanceMode(enabled: boolean): void {
    this.performanceMode = enabled;

    if (enabled) {
      this.document.body.classList.add('sticky-performance-mode');
      // Reduce animation durations in performance mode
      const currentConfig = this.configSubject.value;
      Object.keys(currentConfig).forEach(componentId => {
        this.updateComponentConfig(componentId, {
          animationDuration: Math.min(currentConfig[componentId].animationDuration || 300, 150)
        });
      });
    } else {
      this.document.body.classList.remove('sticky-performance-mode');
    }
  }

  /**
   * Check if performance mode is enabled
   */
  isPerformanceModeEnabled(): boolean {
    return this.performanceMode;
  }

  /**
   * Get current scroll state
   */
  getCurrentScrollState(): ScrollState {
    return this.scrollStateSubject.value;
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): void {
    this.configSubject.next(this.getDefaultConfig());
    this.saveConfigToStorage();
    this.updateState();
  }

  /**
   * Bulk update configuration
   */
  updateConfig(config: Partial<StickyLayoutConfig>): void {
    const currentConfig = this.configSubject.value;
    const newConfig: StickyLayoutConfig = { ...currentConfig };

    for (const key of Object.keys(config)) {
      newConfig[key] = { ...currentConfig[key], ...config[key] };
    }

    // Optionally, validate before emit
    if (!isEqual(currentConfig, newConfig)) {
      this.configSubject.next(newConfig);
      this.saveConfigToStorage();
      this.updateState();
    }
  }


  /**
   * Get current configuration
   */
  getCurrentConfig(): StickyLayoutConfig {
    return this.configSubject.value;
  }

  /**
   * Initialize scroll tracking
   */
  private initializeScrollTracking(): void {
    fromEvent(window, 'scroll', { passive: true })
      .pipe(
        throttleTime(16), // ~60fps
        map(() => window.pageYOffset),
        distinctUntilChanged()
      )
      .subscribe(scrollY => {
        this.updateScrollState(scrollY);
      });
  }

  /**
   * Update scroll state and detect direction/velocity
   */
  private updateScrollState(scrollY: number): void {
    const velocity = Math.abs(scrollY - this.lastScrollY);
    const direction = scrollY > this.lastScrollY ? 'down' :
      scrollY < this.lastScrollY ? 'up' : 'none';

    this.scrollStateSubject.next({
      scrollY,
      scrollDirection: direction,
      isScrolling: true,
      velocity
    });

    // Update hidden components based on new scroll state
    this.updateState();

    // Clear scrolling state after inactivity
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      const currentState = this.scrollStateSubject.value;
      this.scrollStateSubject.next({
        ...currentState,
        isScrolling: false,
        velocity: 0
      });
    }, 150);

    this.lastScrollY = scrollY;
  }

  /**
   * Update the overall sticky state
   */
  private updateState(): void {
    const enabledComponents = this.getEnabledComponents();
    const hiddenComponents = this.getHiddenComponents();
    const totalHeight = this.getTotalStickyHeight();

    this.stateSubject.next({
      isSticky: enabledComponents.length > 0,
      totalHeight,
      activeComponents: enabledComponents.map(comp => comp.id),
      hiddenComponents
    });
  }

  /**
   * Setup performance mode based on device capabilities
   */
  private setupPerformanceMode(): void {
    // Auto-enable performance mode on mobile devices
    if (this.isMobileDevice()) {
      this.setPerformanceMode(true);
    }

    // Enable performance mode if user prefers reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.setPerformanceMode(true);
    }

    // Listen for memory pressure events (if supported)
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;

        if (usedMB > 50 && !this.performanceMode) {
          console.warn('High memory usage detected, enabling performance mode');
          this.setPerformanceMode(true);
        }
      };

      // Check memory every 30 seconds
      setInterval(checkMemory, 30000);
    }
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfigFromStorage(): void {
    try {
      const saved = localStorage.getItem('sticky-layout-config');
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        // Merge with defaults to ensure all required properties exist
        const mergedConfig = {
          ...this.getDefaultConfig(),
          ...parsedConfig
        };
        this.configSubject.next(mergedConfig);
      }
    } catch (error) {
      console.warn('Failed to load sticky layout config from storage:', error);
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfigToStorage(): void {
    try {
      localStorage.setItem('sticky-layout-config', JSON.stringify(this.configSubject.value));
    } catch (error) {
      console.warn('Failed to save sticky layout config to storage:', error);
    }
  }

  /**
   * Validate configuration and return errors
   */
  validateConfig(): string[] {
    const config = this.configSubject.value;
    const errors: string[] = [];

    // Check for duplicate orders
    const orders = Object.values(config).map(c => c.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      errors.push(`Duplicate component orders found: ${duplicateOrders.join(', ')}`);
    }

    // Check z-index conflicts
    const zIndexes = Object.values(config).map(c => c.zIndex).filter(Boolean);
    const duplicateZIndexes = zIndexes.filter((z, index) => zIndexes.indexOf(z) !== index);
    if (duplicateZIndexes.length > 0) {
      errors.push(`Duplicate z-index values found: ${duplicateZIndexes.join(', ')}`);
    }

    return errors;
  }

  /**
   * Auto-fix configuration issues
   */
  autoFixConfig(): void {
    const config = this.configSubject.value;
    const enabledComponents = Object.values(config).filter(c => c.enabled);

    // Auto-fix orders
    enabledComponents
      .sort((a, b) => a.order - b.order)
      .forEach((component, index) => {
        component.order = index + 1;
      });

    // Auto-fix z-indexes
    enabledComponents.forEach((component, index) => {
      component.zIndex = 1030 - (index * 5);
    });

    this.configSubject.next(config);
    this.saveConfigToStorage();
  }

  /**
   * Get performance recommendations based on current state
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const enabledCount = this.getEnabledComponents().length;
    const hiddenCount = this.getHiddenComponents().length;

    if (enabledCount > 3) {
      recommendations.push('Consider reducing the number of sticky components for better performance');
    }

    if (!this.performanceMode && this.isMobileDevice()) {
      recommendations.push('Enable performance mode for better mobile experience');
    }

    if (hiddenCount === 0 && enabledCount > 1) {
      recommendations.push('Consider enabling auto-hide for better user experience on mobile');
    }

    return recommendations;
  }

  /**
   * Generate debug information
   */
  getDebugInfo(): any {
    return {
      config: this.configSubject.value,
      state: this.stateSubject.value,
      scrollState: this.scrollStateSubject.value,
      componentHeights: Object.fromEntries(this.componentHeights),
      performanceMode: this.performanceMode,
      stickyOffsets: this.getStickyOffsets(),
      validationErrors: this.validateConfig(),
      recommendations: this.getPerformanceRecommendations()
    };
  }
}

import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  HostBinding
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StickyLayoutService } from '../../../_core/services/sticky-layout.service';
import { StickyAnimationsService } from '../../../_core/services/sticky-animations.service';
import { MobileTouchService, TouchGesture } from '../../../_core/services/mobile-touch.service';
import { StickyPerformanceService } from '../../../_core/services/sticky-performance.service';

@Component({
  selector: 'app-animated-sticky-container',
  standalone: false,
  template: `
    <div class="animated-sticky-container"
         #container
         [class.has-sticky]="layoutState.isSticky"
         [class.performance-mode]="performanceMode"
         [class.reduced-motion]="reducedMotion"
         [@staggeredSections]="sectionAnimationState"
         [ngStyle]="containerStyles">

      <!-- Header Section -->
      <div #headerSection
           class="sticky-section sticky-header"
           *ngIf="isComponentEnabled('header')"
           [@stickySection]="{
             value: getAnimationState('header'),
             params: getAnimationParams('header')
           }"
           [ngStyle]="getSectionStyles('header')">
        <ng-content select="[slot=header]"></ng-content>
      </div>

      <!-- Breadcrumb Section -->
      <div #breadcrumbSection
           class="sticky-section sticky-breadcrumb"
           *ngIf="isComponentEnabled('breadcrumb')"
           [@stickySection]="{
             value: getAnimationState('breadcrumb'),
             params: getAnimationParams('breadcrumb')
           }"
           [ngStyle]="getSectionStyles('breadcrumb')">
        <ng-content select="[slot=breadcrumb]"></ng-content>
      </div>

      <!-- Modify Search Section -->
      <div #modifySearchSection
           class="sticky-section sticky-modify-search"
           *ngIf="isComponentEnabled('modifySearch')"
           [@stickySection]="{
             value: getAnimationState('modifySearch'),
             params: getAnimationParams('modifySearch')
           }"
           [ngStyle]="getSectionStyles('modifySearch')">
        <ng-content select="[slot=modify-search]"></ng-content>
      </div>

      <!-- Sticky Spacer -->
      <div class="sticky-spacer"
           [@fadeInOut]
           [style.height.px]="layoutState.totalHeight"
           [class.active]="isSticky && layoutState.isSticky"></div>

      <!-- Performance Indicator (Dev Mode) -->
      <div *ngIf="showPerformanceIndicator"
           class="performance-indicator"
           [@bounceIn]
           [class.poor-performance]="isPoorPerformance">
        <div class="fps-counter">{{ currentFps }} FPS</div>
        <div class="performance-score">{{ performanceScore }}%</div>
      </div>

      <!-- Pull to Refresh Indicator -->
      <div *ngIf="enablePullToRefresh && isPullingToRefresh"
           class="pull-refresh-indicator"
           [@bounceIn]>
        <i class="bi bi-arrow-clockwise spinning"></i>
        <span>Release to refresh</span>
      </div>
    </div>
  `,
  styles: [`
    .animated-sticky-container {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .sticky-section {
      position: relative;
      width: 100%;
      background-color: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
      will-change: transform, opacity;
      backface-visibility: hidden;
    }

    .performance-mode .sticky-section {
      animation-duration: 0.15s !important;
      transition-duration: 0.15s !important;
    }

    .reduced-motion .sticky-section {
      animation: none !important;
      transition: none !important;
    }

    .performance-indicator {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .performance-indicator.poor-performance {
      background: rgba(220, 53, 69, 0.9);
    }

    .pull-refresh-indicator {
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bs-primary);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Pull to refresh ready state */
    .animated-sticky-container.pull-refresh-ready {
      background: linear-gradient(180deg,
        rgba(var(--bs-primary-rgb), 0.1) 0%,
        transparent 50%);
    }

    /* Mobile touch optimizations */
    @media (hover: none) and (pointer: coarse) {
      .sticky-section {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
    }
  `],
  animations: StickyAnimationsService.stickyAnimations
})
export class AnimatedStickyContainerComponent implements OnInit, OnDestroy {
  @Input() enableAnimations = true;
  @Input() enablePullToRefresh = false;
  @Input() showPerformanceIndicator = false;
  @Input() animationPreset = 'default';

  @ViewChild('container') container!: ElementRef;
  @ViewChild('headerSection') headerSection?: ElementRef;
  @ViewChild('breadcrumbSection') breadcrumbSection?: ElementRef;
  @ViewChild('modifySearchSection') modifySearchSection?: ElementRef;

  @HostBinding('class.touch-device') isTouchDevice = false;

  layoutState: any = { isSticky: false, totalHeight: 0, activeComponents: [] };
  containerStyles: { [key: string]: string } = {};
  sectionAnimationState = 'idle';
  performanceMode = false;
  reducedMotion = false;
  isSticky = false;

  // Performance monitoring
  currentFps = 60;
  performanceScore = 100;
  isPoorPerformance = false;

  // Pull to refresh
  isPullingToRefresh = false;

  private destroy$ = new Subject<void>();
  private touchCleanupFunctions: (() => void)[] = [];

  constructor(
    private stickyLayoutService: StickyLayoutService,
    private animationsService: StickyAnimationsService,
    private mobileTouch: MobileTouchService,
    private performanceService: StickyPerformanceService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.setupAnimations();
    this.setupTouchInteractions();
    this.setupPerformanceMonitoring();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupTouchListeners();
    this.performanceService.stopMonitoring();
  }

  private initializeComponent(): void {
    this.isTouchDevice = this.mobileTouch.isTouchDevice();
    this.reducedMotion = this.animationsService.isReducedMotionPreferred();

    // Subscribe to layout state changes
    this.stickyLayoutService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.layoutState = state;
        this.updateStickyState();
        this.updateContainerStyles();
        this.cdr.markForCheck();
      });
  }

  private setupAnimations(): void {
    if (!this.enableAnimations || this.reducedMotion) {
      return;
    }

    // Use optimal animation config based on device
    this.animationPreset = this.animationsService.getOptimalAnimationConfig();

    // Enable performance mode if needed
    if (this.animationPreset === 'mobile') {
      this.performanceMode = true;
    }
  }

  private setupTouchInteractions(): void {
    if (!this.isTouchDevice) return;

    setTimeout(() => {
      if (this.enablePullToRefresh && this.container) {
        const cleanup = this.mobileTouch.setupPullToRefresh(
          this.container.nativeElement,
          () => this.handlePullToRefresh(),
          80
        );
        this.touchCleanupFunctions.push(cleanup);
      }

      // Setup swipe navigation
      if (this.container) {
        const cleanup = this.mobileTouch.setupSwipeNavigation(
          this.container.nativeElement,
          (gesture) => this.handleSwipeGesture(gesture)
        );
        this.touchCleanupFunctions.push(cleanup);
      }
    }, 100);
  }

  private setupPerformanceMonitoring(): void {
    if (!this.showPerformanceIndicator) return;

    this.performanceService.startMonitoring();

    this.performanceService.metrics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => {
        this.currentFps = metrics.frameRate;
        this.performanceScore = this.performanceService.calculatePerformanceScore?.(metrics) || 100;
        this.isPoorPerformance = this.performanceService.isPerformancePoor();

        // Auto-enable performance mode if performance is poor
        if (this.isPoorPerformance && !this.performanceMode) {
          this.performanceMode = true;
          this.cdr.markForCheck();
        }
      });
  }

  private handlePullToRefresh(): void {
    this.isPullingToRefresh = true;
    this.mobileTouch.triggerHapticFeedback('medium');

    // Simulate refresh action
    setTimeout(() => {
      this.isPullingToRefresh = false;
      window.location.reload();
    }, 1000);
  }

  private handleSwipeGesture(gesture: TouchGesture): void {
    this.mobileTouch.triggerHapticFeedback('light');

    // Handle swipe gestures for navigation
    switch (gesture.direction) {
      case 'up':
        // Show all sticky components
        this.stickyLayoutService.enableAll?.();
        break;
      case 'down':
        // Hide non-essential sticky components
        this.stickyLayoutService.toggleComponent('breadcrumb', false);
        break;
      case 'left':
      case 'right':
        // Could trigger navigation or other actions
        break;
    }
  }

  // Animation helper methods
  isComponentEnabled(componentId: string): boolean {
    const config = this.stickyLayoutService.getEnabledComponents();
    return config.some(comp => comp.id === componentId);
  }

  getAnimationState(componentId: string): string {
    return this.layoutState.activeComponents.includes(componentId) ? 'enter' : 'leave';
  }

  getAnimationParams(componentId: string): any {
    const preset = this.animationsService.getAnimationPreset(this.animationPreset);
    if (!preset) return {};

    return {
      enterDuration: preset.enter.duration,
      enterEasing: preset.enter.easing,
      leaveDuration: preset.leave.duration,
      leaveEasing: preset.leave.easing
    };
  }

  getSectionStyles(componentId: string): { [key: string]: string } {
    const stickyOffsets = this.stickyLayoutService.getStickyOffsets();
    const config = this.stickyLayoutService.getEnabledComponents()
      .find(comp => comp.id === componentId);

    const styles: { [key: string]: string } = {};

    if (this.layoutState.isSticky && config) {
      styles['top'] = stickyOffsets[`--sticky-${componentId}-top`] || '0px';
      styles['z-index'] = (config.zIndex || 1020).toString();
    }

    return styles;
  }

  private updateStickyState(): void {
    const containerRect = this.elementRef.nativeElement.getBoundingClientRect();
    const shouldBeSticky = containerRect.top <= 0 && this.layoutState.activeComponents.length > 0;

    if (this.isSticky !== shouldBeSticky) {
      this.isSticky = shouldBeSticky;
      this.sectionAnimationState = shouldBeSticky ? 'active' : 'idle';
    }
  }

  private updateContainerStyles(): void {
    const stickyOffsets = this.stickyLayoutService.getStickyOffsets();
    this.containerStyles = { ...stickyOffsets };
  }

  private cleanupTouchListeners(): void {
    this.touchCleanupFunctions.forEach(cleanup => cleanup());
    this.touchCleanupFunctions = [];
  }
}

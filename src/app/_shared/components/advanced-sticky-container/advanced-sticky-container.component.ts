import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  Renderer2
} from '@angular/core';
import { takeUntil, debounceTime } from 'rxjs/operators';
import {
  EnhancedStickyLayoutService,
  ScrollState
} from '../../../_core/services/enhanced-sticky-layout.service';
import {StickyContainerComponent} from '../sticky-container/sticky-container.component';
import {StickyLayoutService} from '../../../_core/services/sticky-layout.service';

@Component({
  selector: 'app-advanced-sticky-container',
  standalone: false,
  template: `
    <div class="advanced-sticky-container"
         [class.has-sticky]="layoutState.isSticky"
         [class.performance-mode]="performanceMode"
         [class.auto-hide-active]="autoHideActive"
         [ngStyle]="containerStyles">

      <!-- Header Section with auto-hide support -->
      <div #headerSection
           class="sticky-section sticky-header"
           *ngIf="isComponentEnabled('header')"
           [class.hidden]="isComponentHidden('header')"
           [ngStyle]="getSectionStyles('header')"
           [@slideAnimation]="getAnimationState('header')">
        <ng-content select="[slot=header]"></ng-content>
      </div>

      <!-- Breadcrumb Section -->
      <div #breadcrumbSection
           class="sticky-section sticky-breadcrumb"
           *ngIf="isComponentEnabled('breadcrumb')"
           [class.hidden]="isComponentHidden('breadcrumb')"
           [ngStyle]="getSectionStyles('breadcrumb')"
           [@slideAnimation]="getAnimationState('breadcrumb')">
        <ng-content select="[slot=breadcrumb]"></ng-content>
      </div>

      <!-- Modify Search Section -->
      <div #modifySearchSection
           class="sticky-section sticky-modify-search"
           *ngIf="isComponentEnabled('modifySearch')"
           [class.hidden]="isComponentHidden('modifySearch')"
           [ngStyle]="getSectionStyles('modifySearch')"
           [@slideAnimation]="getAnimationState('modifySearch')">
        <ng-content select="[slot=modify-search]"></ng-content>
      </div>

      <!-- Additional Custom Sections -->
      <div *ngFor="let component of getAdditionalComponents()"
           [class]="'sticky-section sticky-' + component.id"
           [class.hidden]="isComponentHidden(component.id)"
           [ngStyle]="getSectionStyles(component.id)"
           [@slideAnimation]="getAnimationState(component.id)">
        <ng-content [select]="'[slot=' + component.id + ']'"></ng-content>
      </div>

      <!-- Sticky Spacer with smooth transitions -->
      <div class="sticky-spacer"
           [style.height.px]="getSpacerHeight()"
           [class.active]="isSticky && layoutState.isSticky"></div>

      <!-- Scroll Progress Indicator -->
      <div *ngIf="showScrollProgress"
           class="scroll-progress-bar"
           [style.width.%]="scrollProgress"></div>
    </div>
  `,
  styles: [`
    .advanced-sticky-container {
      position: relative;
      width: 100%;
    }

    .sticky-section {
      position: relative;
      width: 100%;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.3s ease,
                  box-shadow 0.3s ease;
      background-color: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .advanced-sticky-container.has-sticky .sticky-section {
      position: fixed;
      left: 0;
      right: 0;
      z-index: var(--section-z-index, 1020);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* Auto-hide animation states */
    .sticky-section.hidden {
      transform: translateY(-100%);
      opacity: 0;
    }

    .auto-hide-active .sticky-section {
      transition-duration: 0.2s;
    }

    /* Performance mode optimizations */
    .performance-mode .sticky-section {
      will-change: transform;
      backface-visibility: hidden;
      transform: translateZ(0); /* Hardware acceleration */
    }

    .performance-mode .sticky-section {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    /* Scroll progress bar */
    .scroll-progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--bs-primary), var(--bs-info));
      z-index: 9999;
      transition: width 0.1s ease;
    }

    /* Smooth spacer transitions */
    .sticky-spacer {
      height: 0;
      transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sticky-spacer.active {
      display: block;
    }

    /* Enhanced dark theme support */
    :host-context(.dark-mode) .sticky-section,
    :host-context(.theme-dark) .sticky-section,
    :host-context(.theme-green-orange-dark) .sticky-section,
    :host-context(.theme-indigo-dark) .sticky-section {
      background-color: rgba(var(--bs-body-bg-rgb), 0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .sticky-section {
        font-size: 0.9rem;
      }

      .performance-mode .sticky-section {
        transition-duration: 0.15s;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .sticky-section {
        transition: none;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .sticky-section {
        border-bottom-width: 2px;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }
  `],
  animations: [
    // Define slide animations for auto-hide behavior
    // This would need Angular Animations module imported
  ]
})
export class AdvancedStickyContainerComponent extends StickyContainerComponent
  implements OnInit, OnDestroy, AfterViewInit {

  scrollState: ScrollState = {
    scrollY: 0,
    scrollDirection: 'none',
    isScrolling: false,
    velocity: 0
  };

  performanceMode = false;
  autoHideActive = false;
  showScrollProgress = false;
  scrollProgress = 0;
  hiddenComponents: string[] = [];

  private enhancedStickyService: EnhancedStickyLayoutService;

  constructor(
    stickyLayoutService: StickyLayoutService,
    cdr: ChangeDetectorRef,
    elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    super(stickyLayoutService, cdr, elementRef);
    this.enhancedStickyService = stickyLayoutService as EnhancedStickyLayoutService;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.setupAdvancedFeatures();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  isComponentHidden(componentId: string): boolean {
    return this.hiddenComponents.includes(componentId);
  }

  getAnimationState(componentId: string): string {
    return this.isComponentHidden(componentId) ? 'hidden' : 'visible';
  }

  getSpacerHeight(): number {
    const baseHeight = this.layoutState.totalHeight;
    const hiddenHeight = this.getHiddenComponentsHeight();
    return Math.max(0, baseHeight - hiddenHeight);
  }

  private setupAdvancedFeatures(): void {
    // Subscribe to scroll state
    this.enhancedStickyService.scrollState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(scrollState => {
        this.scrollState = scrollState;
        this.updateHiddenComponents();
        this.updateScrollProgress();
        this.cdr.markForCheck();
      });

    // Setup auto-hide behavior
    this.setupAutoHide();

    // Setup performance optimizations
    this.setupPerformanceOptimizations();
  }

  private setupAutoHide(): void {
    // Enable auto-hide for header when scrolling down fast
    this.enhancedStickyService.enableAutoHide('header', 150);

    // More conservative auto-hide for breadcrumb
    this.enhancedStickyService.enableAutoHide('breadcrumb', 200);
  }

  private setupPerformanceOptimizations(): void {
    // Enable performance mode based on device capabilities
    const isLowEndDevice = this.detectLowEndDevice();
    if (isLowEndDevice) {
      this.enhancedStickyService.setPerformanceMode(true);
      this.performanceMode = true;
    }

    // Monitor frame rate and adjust performance mode
    this.monitorPerformance();
  }

  private updateHiddenComponents(): void {
    const newHiddenComponents = this.enhancedStickyService.getHiddenComponents();

    if (JSON.stringify(newHiddenComponents) !== JSON.stringify(this.hiddenComponents)) {
      this.hiddenComponents = newHiddenComponents;
      this.autoHideActive = newHiddenComponents.length > 0;
    }
  }

  private updateScrollProgress(): void {
    if (this.showScrollProgress) {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset;

      this.scrollProgress = (scrollTop / (documentHeight - windowHeight)) * 100;
    }
  }

  private getHiddenComponentsHeight(): number {
    return this.hiddenComponents.reduce((total, componentId) => {
      // Get height of hidden components
      const height = this.stickyLayoutService.registerComponentHeight(componentId, 0);
      return total + (height || 0);
    }, 0);
  }

  private detectLowEndDevice(): boolean {
    // Simple heuristics for low-end device detection
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const connection = (navigator as any).connection;

    return (
      (memory && memory < 4) ||
      (cores && cores < 4) ||
      (connection && ['slow-2g', '2g', '3g'].includes(connection.effectiveType))
    );
  }

  private monitorPerformance(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // If FPS drops below 30, enable performance mode
        if (fps < 30 && !this.performanceMode) {
          this.enhancedStickyService.setPerformanceMode(true);
          this.performanceMode = true;
        }
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }
}

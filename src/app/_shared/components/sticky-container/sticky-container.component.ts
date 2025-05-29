import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StickyLayoutService, StickyLayoutState } from '../../../_core/services/sticky-layout.service';

@Component({
  selector: 'app-sticky-container',
  standalone: false,
  template: `
    <div class="sticky-container"
         [class.has-sticky]="layoutState.isSticky"
         [ngStyle]="containerStyles">

      <!-- Header Section -->
      <div #headerSection
           class="sticky-section sticky-header"
           *ngIf="isComponentEnabled('header')"
           [ngStyle]="getSectionStyles('header')">
        <ng-content select="[slot=header]"></ng-content>
      </div>

      <!-- Breadcrumb Section -->
      <div #breadcrumbSection
           class="sticky-section sticky-breadcrumb"
           *ngIf="isComponentEnabled('breadcrumb')"
           [ngStyle]="getSectionStyles('breadcrumb')">
        <ng-content select="[slot=breadcrumb]"></ng-content>
      </div>

      <!-- Modify Search Section -->
      <div #modifySearchSection
           class="sticky-section sticky-modify-search"
           *ngIf="isComponentEnabled('modifySearch')"
           [ngStyle]="getSectionStyles('modifySearch')">
        <ng-content select="[slot=modify-search]"></ng-content>
      </div>

      <!-- Additional Sticky Sections -->
      <div *ngFor="let component of getAdditionalComponents()"
           [class]="'sticky-section sticky-' + component.id"
           [ngStyle]="getSectionStyles(component.id)">
        <ng-content [select]="'[slot=' + component.id + ']'"></ng-content>
      </div>

      <!-- Sticky Spacer - maintains layout when elements become sticky -->
      <div class="sticky-spacer"
           [style.height.px]="layoutState.totalHeight"
           [class.active]="isSticky && layoutState.isSticky"></div>
    </div>
  `,
  styles: [`
    .sticky-container {
      position: relative;
      width: 100%;
    }

    .sticky-section {
      position: relative;
      width: 100%;
      transition: all 0.3s ease;
      background-color: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
    }

    .sticky-container.has-sticky .sticky-section {
      position: fixed;
      left: 0;
      right: 0;
      z-index: var(--section-z-index, 1020);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* Dark theme adjustments */
    :host-context(.dark-mode) .sticky-section,
    :host-context(.theme-dark) .sticky-section,
    :host-context(.theme-green-orange-dark) .sticky-section,
    :host-context(.theme-indigo-dark) .sticky-section {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .sticky-spacer {
      height: 0;
      transition: height 0.3s ease;
    }

    .sticky-spacer.active {
      display: block;
    }

    /* RTL support */
    :host-context(.rtl) .sticky-container.has-sticky .sticky-section {
      left: 0;
      right: 0;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .sticky-section {
        font-size: 0.9rem;
      }
    }

    /* Animation for sticky activation */
    .sticky-section {
      transform: translateY(0);
    }

    .sticky-container.has-sticky .sticky-section {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Ensure proper layering */
    .sticky-header {
      --section-z-index: 1030;
    }

    .sticky-breadcrumb {
      --section-z-index: 1025;
    }

    .sticky-modify-search {
      --section-z-index: 1020;
    }
  `]
})
export class StickyContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('headerSection') headerSection?: ElementRef;
  @ViewChild('breadcrumbSection') breadcrumbSection?: ElementRef;
  @ViewChild('modifySearchSection') modifySearchSection?: ElementRef;

  layoutState: StickyLayoutState = {
    isSticky: false,
    totalHeight: 0,
    activeComponents: []
  };

  containerStyles: { [key: string]: string } = {};
  isSticky = false;

  protected destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;

  constructor(
    protected stickyLayoutService: StickyLayoutService,
    protected cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Subscribe to layout state changes
    this.stickyLayoutService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.layoutState = state;
        this.updateStickyState();
        this.updateContainerStyles();
        this.cdr.markForCheck();
      });

    // Subscribe to configuration changes
    this.stickyLayoutService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.measureComponents();
        this.cdr.markForCheck();
      });
  }

  ngAfterViewInit(): void {
    // Initial measurement
    setTimeout(() => {
      this.measureComponents();
      this.setupResizeObserver();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.updateStickyState();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    setTimeout(() => this.measureComponents(), 100);
  }

  isComponentEnabled(componentId: string): boolean {
    const config = this.stickyLayoutService.getEnabledComponents();
    return config.some(comp => comp.id === componentId);
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

  getAdditionalComponents() {
    return this.stickyLayoutService.getEnabledComponents()
      .filter(comp => !['header', 'breadcrumb', 'modifySearch'].includes(comp.id));
  }

  private updateStickyState(): void {
    const containerRect = this.elementRef.nativeElement.getBoundingClientRect();
    const shouldBeSticky = containerRect.top <= 0 && this.layoutState.activeComponents.length > 0;

    if (this.isSticky !== shouldBeSticky) {
      this.isSticky = shouldBeSticky;
      this.cdr.markForCheck();
    }
  }

  private updateContainerStyles(): void {
    const stickyOffsets = this.stickyLayoutService.getStickyOffsets();
    this.containerStyles = { ...stickyOffsets };
  }

  private measureComponents(): void {
    const measurements = [
      { id: 'header', element: this.headerSection },
      { id: 'breadcrumb', element: this.breadcrumbSection },
      { id: 'modifySearch', element: this.modifySearchSection }
    ];

    measurements.forEach(({ id, element }) => {
      if (element?.nativeElement) {
        const height = element.nativeElement.offsetHeight;
        this.stickyLayoutService.registerComponentHeight(id, height);
      }
    });
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.measureComponents();
      });

      // Observe all sticky sections
      const sections = [
        this.headerSection?.nativeElement,
        this.breadcrumbSection?.nativeElement,
        this.modifySearchSection?.nativeElement
      ].filter(Boolean);

      sections.forEach(section => {
        if (section) {
          this.resizeObserver!.observe(section);
        }
      });
    }
  }
}

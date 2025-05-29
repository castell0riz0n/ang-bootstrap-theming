import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  StickyLayoutService,
  StickyLayoutConfig,
  StickyLayoutState,
  StickyComponentConfig
} from '../../../_core/services/sticky-layout.service';

@Component({
  selector: 'app-sticky-config',
  standalone: false,
  template: `
    <div class="sticky-config">
      <div class="config-header">
        <h6 class="mb-2">
          <i class="bi bi-gear me-1"></i>
          Sticky Layout Config
        </h6>
        <button class="btn btn-sm btn-outline-secondary"
                (click)="togglePanel()"
                [title]="isExpanded ? 'Collapse' : 'Expand'">
          <i [class]="isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
      </div>

      <div class="config-content" [class.show]="isExpanded">

        <!-- Layout State Info -->
        <div class="state-info mb-3">
          <small class="text-muted d-block mb-1">Current State:</small>
          <div class="state-badges">
            <span class="badge"
                  [class]="layoutState.isSticky ? 'bg-success' : 'bg-secondary'">
              {{ layoutState.isSticky ? 'Sticky Active' : 'Not Sticky' }}
            </span>
            <span class="badge bg-info ms-1">
              {{ layoutState.totalHeight }}px
            </span>
          </div>
          <small class="text-muted d-block mt-1">
            Active: {{ layoutState.activeComponents.join(', ') || 'None' }}
          </small>
        </div>

        <!-- Component Controls -->
        <div class="component-controls">
          <div *ngFor="let component of getComponents(); trackBy: trackByComponentId"
               class="component-control mb-2">

            <div class="d-flex align-items-center justify-content-between mb-1">
              <label class="form-check-label fw-medium">
                {{ formatComponentName(component.id) }}
              </label>
              <div class="form-check form-switch">
                <input class="form-check-input"
                       type="checkbox"
                       [id]="'switch-' + component.id"
                       [checked]="component.enabled"
                       (change)="toggleComponent(component.id, $event)">
              </div>
            </div>

            <!-- Component Settings -->
            <div *ngIf="component.enabled" class="component-settings">
              <div class="row g-2">

                <!-- Order -->
                <div class="col-6">
                  <label class="form-label-xs">Order</label>
                  <input type="number"
                         class="form-control form-control-sm"
                         [value]="component.order"
                         min="1"
                         max="10"
                         (change)="updateComponentOrder(component.id, $event)">
                </div>

                <!-- Z-Index -->
                <div class="col-6">
                  <label class="form-label-xs">Z-Index</label>
                  <input type="number"
                         class="form-control form-control-sm"
                         [value]="component.zIndex"
                         min="1000"
                         max="2000"
                         step="5"
                         (change)="updateComponentZIndex(component.id, $event)">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Global Actions -->
        <div class="global-actions mt-3 pt-3 border-top">
          <div class="d-grid gap-2">
            <button class="btn btn-sm btn-outline-primary"
                    (click)="enableAll()">
              <i class="bi bi-check-all me-1"></i>
              Enable All
            </button>

            <button class="btn btn-sm btn-outline-secondary"
                    (click)="disableAll()">
              <i class="bi bi-x-circle me-1"></i>
              Disable All
            </button>

            <button class="btn btn-sm btn-outline-warning"
                    (click)="resetToDefaults()">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Reset Defaults
            </button>
          </div>
        </div>

        <!-- Debug Info -->
        <div class="debug-info mt-3 pt-3 border-top" *ngIf="showDebugInfo">
          <small class="text-muted d-block mb-2">Debug Info:</small>
          <div class="debug-content">
            <pre class="debug-json">{{ getDebugInfo() | json }}</pre>
          </div>
        </div>

        <!-- Debug Toggle -->
        <div class="debug-toggle mt-2">
          <div class="form-check form-check-sm">
            <input class="form-check-input"
                   type="checkbox"
                   id="debugToggle"
                   [(ngModel)]="showDebugInfo">
            <label class="form-check-label small" for="debugToggle">
              Show Debug Info
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sticky-config {
      min-width: 240px;
      max-width: 320px;
      font-size: 0.85rem;
    }

    .config-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 0.5rem;
      background-color: var(--bs-primary);
      color: white;
      border-radius: 0.375rem 0.375rem 0 0;
      margin: -1rem -1rem 0 -1rem;
    }

    .config-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }

    .config-content.show {
      max-height: 600px;
      padding-top: 1rem;
    }

    .state-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .component-control {
      border: 1px solid var(--bs-border-color);
      border-radius: 0.375rem;
      padding: 0.5rem;
      background-color: rgba(var(--bs-body-bg-rgb), 0.5);
    }

    .component-settings {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px dashed var(--bs-border-color);
    }

    .form-label-xs {
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--bs-secondary);
      margin-bottom: 0.125rem;
      display: block;
    }

    .form-control-sm {
      font-size: 0.75rem;
      padding: 0.125rem 0.25rem;
    }

    .form-check-sm .form-check-input {
      transform: scale(0.9);
    }

    .debug-content {
      background-color: var(--bs-dark);
      color: var(--bs-light);
      border-radius: 0.25rem;
      padding: 0.5rem;
      max-height: 150px;
      overflow-y: auto;
    }

    .debug-json {
      font-size: 0.7rem;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .fw-medium {
      font-weight: 500;
    }

    /* Form switches */
    .form-check-input:checked {
      background-color: var(--bs-success);
      border-color: var(--bs-success);
    }

    /* Button sizing */
    .btn-sm {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .sticky-config {
        min-width: 200px;
        max-width: 280px;
        font-size: 0.8rem;
      }

      .config-content.show {
        max-height: 500px;
      }

      .debug-content {
        max-height: 100px;
      }
    }

    /* Dark theme support */
    :host-context(.dark-mode) .component-control,
    :host-context(.theme-dark) .component-control,
    :host-context(.theme-green-orange-dark) .component-control,
    :host-context(.theme-indigo-dark) .component-control {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: var(--bs-border-color);
    }

    :host-context(.dark-mode) .debug-content,
    :host-context(.theme-dark) .debug-content,
    :host-context(.theme-green-orange-dark) .debug-content,
    :host-context(.theme-indigo-dark) .debug-content {
      background-color: rgba(0, 0, 0, 0.3);
      color: var(--bs-body-color);
    }

    /* Animation for smooth transitions */
    .component-control {
      transition: all 0.2s ease;
    }

    .component-control:hover {
      border-color: var(--bs-primary);
    }

    /* Badge styling */
    .badge {
      font-size: 0.65rem;
    }
  `]
})
export class StickyConfigComponent implements OnInit, OnDestroy {
  layoutState: StickyLayoutState = {
    isSticky: false,
    totalHeight: 0,
    activeComponents: [],
    hiddenComponents: []
  };

  config: StickyLayoutConfig = {} as StickyLayoutConfig;
  isExpanded = false;
  showDebugInfo = false;

  private destroy$ = new Subject<void>();

  constructor(private stickyLayoutService: StickyLayoutService) {}

  ngOnInit(): void {
    // Subscribe to layout state changes
    this.stickyLayoutService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.layoutState = state;
      });

    // Subscribe to config changes
    this.stickyLayoutService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.config = config;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePanel(): void {
    this.isExpanded = !this.isExpanded;
  }

  getComponents(): StickyComponentConfig[] {
    return Object.values(this.config).sort((a, b) => a.order - b.order);
  }

  formatComponentName(componentId: string): string {
    const names: { [key: string]: string } = {
      'header': 'Header',
      'breadcrumb': 'Breadcrumb',
      'modifySearch': 'Modify Search'
    };
    return names[componentId] || componentId;
  }

  toggleComponent(componentId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.stickyLayoutService.toggleComponent(componentId, target.checked);
  }

  updateComponentOrder(componentId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const order = parseInt(target.value, 10);
    if (!isNaN(order)) {
      this.stickyLayoutService.updateComponentConfig(componentId, { order });
    }
  }

  updateComponentZIndex(componentId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const zIndex = parseInt(target.value, 10);
    if (!isNaN(zIndex)) {
      this.stickyLayoutService.updateComponentConfig(componentId, { zIndex });
    }
  }

  enableAll(): void {
    Object.keys(this.config).forEach(componentId => {
      this.stickyLayoutService.toggleComponent(componentId, true);
    });
  }

  disableAll(): void {
    Object.keys(this.config).forEach(componentId => {
      this.stickyLayoutService.toggleComponent(componentId, false);
    });
  }

  resetToDefaults(): void {
    this.stickyLayoutService.resetToDefaults();
  }

  trackByComponentId(index: number, component: StickyComponentConfig): string {
    return component.id;
  }

  getDebugInfo(): any {
    return {
      layoutState: this.layoutState,
      enabledComponents: this.stickyLayoutService.getEnabledComponents(),
      totalStickyHeight: this.stickyLayoutService.getTotalStickyHeight(),
      stickyOffsets: this.stickyLayoutService.getStickyOffsets()
    };
  }
}

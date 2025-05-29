import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BreadcrumbService, BreadcrumbItem, BreadcrumbConfig } from '../../../_core/services/breadcrumb.service';
import { LanguageService } from '../../../_core/services/language.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: false,
  template: `
    <nav class="breadcrumb-container"
         [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!"
         attr.aria-label="{{ 'NAVIGATION.BREADCRUMB' | translate }}">

      <div class="container-fluid">
        <ol class="breadcrumb mb-0"
            [class.breadcrumb-custom]="customStyling">

          <!-- Breadcrumb Items -->
          <li *ngFor="let item of breadcrumbs; let i = index; let isLast = last"
              class="breadcrumb-item"
              [class.active]="item.isActive || isLast"
              [class.clickable]="item.url && !item.isActive && !isLast">

            <!-- Clickable breadcrumb -->
            <a *ngIf="item.url && !item.isActive && !isLast"
               [routerLink]="item.url"
               class="breadcrumb-link"
               [title]="getBreadcrumbTitle(item)">

              <i *ngIf="item.icon"
                 [class]="item.icon"
                 class="breadcrumb-icon me-1"></i>

              <span>{{ getBreadcrumbLabel(item) }}</span>
            </a>

            <!-- Non-clickable breadcrumb (active or no URL) -->
            <span *ngIf="!item.url || item.isActive || isLast"
                  class="breadcrumb-text"
                  [title]="getBreadcrumbTitle(item)">

              <i *ngIf="item.icon"
                 [class]="item.icon"
                 class="breadcrumb-icon me-1"></i>

              <span>{{ getBreadcrumbLabel(item) }}</span>
            </span>

            <!-- Separator -->
            <span *ngIf="!isLast"
                  class="breadcrumb-separator"
                  [innerHTML]="getSeparator()"></span>
          </li>
        </ol>

        <!-- Breadcrumb Actions (optional) -->
        <div *ngIf="showActions" class="breadcrumb-actions">
          <button class="btn btn-sm btn-outline-secondary"
                  (click)="goBack()"
                  [title]="'NAVIGATION.GO_BACK' | translate">
            <i class="bi bi-arrow-left flip-rtl"></i>
          </button>

          <div class="dropdown" *ngIf="showHistory">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle ms-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    [title]="'NAVIGATION.HISTORY' | translate">
              <i class="bi bi-clock-history"></i>
            </button>
            <ul class="dropdown-menu">
              <li *ngFor="let historyItem of breadcrumbHistory">
                <a class="dropdown-item"
                   [routerLink]="historyItem.url"
                   *ngIf="historyItem.url">
                  <i *ngIf="historyItem.icon" [class]="historyItem.icon" class="me-2"></i>
                  {{ getBreadcrumbLabel(historyItem) }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .breadcrumb-container {
      background-color: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
      padding: 0.75rem 0;
      min-height: 52px;
      display: flex;
      align-items: center;
    }

    .breadcrumb-custom {
      --bs-breadcrumb-divider: '';
      margin-bottom: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 0.9rem;

      &:not(:last-child) {
        margin-right: 0.5rem;

        :host-context(.rtl) & {
          margin-right: 0;
          margin-left: 0.5rem;
        }
      }

      &.clickable:hover .breadcrumb-link {
        color: var(--bs-primary);
        text-decoration: underline;
      }

      &.active .breadcrumb-text {
        color: var(--bs-secondary);
        font-weight: 500;
      }
    }

    .breadcrumb-link,
    .breadcrumb-text {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--bs-body-color);
      transition: color 0.2s ease;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .breadcrumb-link:hover {
      color: var(--bs-primary);
    }

    .breadcrumb-icon {
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .breadcrumb-separator {
      margin: 0 0.5rem;
      color: var(--bs-secondary);
      font-size: 0.8rem;
    }

    .breadcrumb-actions {
      margin-left: auto;
      display: flex;
      align-items: center;

      :host-context(.rtl) & {
        margin-left: 0;
        margin-right: auto;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .breadcrumb-container {
        padding: 0.5rem 0;
        min-height: 44px;
      }

      .breadcrumb-item {
        font-size: 0.8rem;
      }

      .breadcrumb-link,
      .breadcrumb-text {
        max-width: 120px;
      }

      .breadcrumb-actions {
        .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
        }
      }
    }

    @media (max-width: 576px) {
      .breadcrumb-link,
      .breadcrumb-text {
        max-width: 80px;
      }

      .breadcrumb-separator {
        margin: 0 0.25rem;
      }
    }

    /* Dark theme adjustments */
    :host-context(.dark-mode) .breadcrumb-container,
    :host-context(.theme-dark) .breadcrumb-container,
    :host-context(.theme-green-orange-dark) .breadcrumb-container,
    :host-context(.theme-indigo-dark) .breadcrumb-container {
      background-color: var(--bs-body-bg);
      border-bottom-color: var(--bs-border-color);
    }

    /* Custom separator icons */
    .separator-arrow::before {
      content: '›';
      font-weight: bold;
    }

    .separator-slash::before {
      content: '/';
    }

    .separator-dot::before {
      content: '•';
    }

    /* Animation for breadcrumb updates */
    .breadcrumb-item {
      animation: fadeInSlide 0.3s ease-out;
    }

    @keyframes fadeInSlide {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    :host-context(.rtl) .breadcrumb-item {
      animation: fadeInSlideRTL 0.3s ease-out;
    }

    @keyframes fadeInSlideRTL {
      from {
        opacity: 0;
        transform: translateX(10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* Accessibility improvements */
    .breadcrumb-link:focus,
    .btn:focus {
      outline: 2px solid var(--bs-primary);
      outline-offset: 2px;
    }

    /* Truncation with tooltip for long items */
    .breadcrumb-item[title] {
      cursor: help;
    }
  `]
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  @Input() customStyling = true;
  @Input() showActions = false;
  @Input() showHistory = false;
  @Input() maxHistoryItems = 10;

  breadcrumbs: BreadcrumbItem[] = [];
  config: BreadcrumbConfig = {
    showHome: true,
    homeIcon: 'bi-house',
    homeLabel: 'NAVIGATION.HOME',
    separator: '/',
    maxItems: 5,
    showCurrentPage: true
  };

  breadcrumbHistory: BreadcrumbItem[] = [];

  protected destroy$ = new Subject<void>();

  constructor(
    private breadcrumbService: BreadcrumbService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Subscribe to breadcrumb changes
    this.breadcrumbService.breadcrumbs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(breadcrumbs => {
        this.updateHistory(breadcrumbs);
        this.breadcrumbs = breadcrumbs;
      });

    // Subscribe to config changes
    this.breadcrumbService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.config = config;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getBreadcrumbLabel(item: BreadcrumbItem): string {
    if (item.translationKey) {
      // This would need to be handled differently in a real app
      // For now, return the translation key or fallback to label
      return item.label;
    }
    return item.label;
  }

  getBreadcrumbTitle(item: BreadcrumbItem): string {
    return this.getBreadcrumbLabel(item);
  }

  getSeparator(): string {
    switch (this.config.separator) {
      case '>':
        return '<span class="separator-arrow"></span>';
      case '/':
        return '<span class="separator-slash"></span>';
      case '•':
        return '<span class="separator-dot"></span>';
      default:
        return `<span>${this.config.separator}</span>`;
    }
  }

  goBack(): void {
    if (this.breadcrumbs.length > 1) {
      const previousItem = this.breadcrumbs[this.breadcrumbs.length - 2];
      if (previousItem.url) {
        this.breadcrumbService.navigateTo(previousItem);
      }
    } else {
      // Fallback to browser back
      window.history.back();
    }
  }

  private updateHistory(newBreadcrumbs: BreadcrumbItem[]): void {
    if (newBreadcrumbs.length > 0) {
      const currentPage = newBreadcrumbs[newBreadcrumbs.length - 1];

      // Only add to history if it has a URL and isn't already the last item
      if (currentPage.url &&
        (this.breadcrumbHistory.length === 0 ||
          this.breadcrumbHistory[this.breadcrumbHistory.length - 1].url !== currentPage.url)) {

        this.breadcrumbHistory.push(currentPage);

        // Limit history size
        if (this.breadcrumbHistory.length > this.maxHistoryItems) {
          this.breadcrumbHistory = this.breadcrumbHistory.slice(-this.maxHistoryItems);
        }
      }
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import {Subject, combineLatest, Observable} from 'rxjs';
import { takeUntil, filter, map, distinctUntilChanged } from 'rxjs/operators';
import { BreadcrumbService, BreadcrumbItem } from '../../../_core/services/breadcrumb.service';
import { LanguageService } from '../../../_core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import {BreadcrumbComponent} from '../breadcrumb/breadcrumb.component';

interface RouteData {
  breadcrumb?: string | BreadcrumbItem;
  breadcrumbIcon?: string;
  breadcrumbTranslationKey?: string;
  hideBreadcrumb?: boolean;
}

@Component({
  selector: 'app-smart-breadcrumb',
  standalone: false,
  template: `
    <nav class="smart-breadcrumb-container"
         [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!"
         attr.aria-label="{{ 'NAVIGATION.BREADCRUMB' | translate }}"
         *ngIf="!hideBreadcrumb">

      <div class="container-fluid">
        <!-- Breadcrumb with Schema.org markup -->
        <ol class="breadcrumb mb-0"
            itemscope
            itemtype="https://schema.org/BreadcrumbList">

          <li *ngFor="let item of breadcrumbs; let i = index; let isLast = last"
              class="breadcrumb-item"
              [class.active]="item.isActive || isLast"
              [class.clickable]="item.url && !item.isActive && !isLast"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem">

            <!-- Structured data -->
            <meta itemprop="position" [content]="i + 1">

            <!-- Clickable breadcrumb -->
            <a *ngIf="item.url && !item.isActive && !isLast"
               [routerLink]="item.url"
               class="breadcrumb-link"
               [title]="getBreadcrumbTitle(item)"
               itemprop="item"
               [attr.aria-label]="getBreadcrumbAriaLabel(item, i)">

              <span itemprop="name">
                <i *ngIf="item.icon"
                   [class]="item.icon"
                   class="breadcrumb-icon me-1"
                   [attr.aria-hidden]="true"></i>
                {{ getBreadcrumbLabel(item) | async }}
              </span>
            </a>

            <!-- Non-clickable breadcrumb -->
            <span *ngIf="!item.url || item.isActive || isLast"
                  class="breadcrumb-text"
                  [title]="getBreadcrumbTitle(item)"
                  itemprop="name"
                  [attr.aria-current]="isLast ? 'page' : null">

              <i *ngIf="item.icon"
                 [class]="item.icon"
                 class="breadcrumb-icon me-1"
                 [attr.aria-hidden]="true"></i>
              {{ getBreadcrumbLabel(item) | async }}
            </span>

            <!-- Separator with ARIA hidden -->
            <span *ngIf="!isLast"
                  class="breadcrumb-separator"
                  [innerHTML]="getSeparator()"
                  aria-hidden="true"></span>
          </li>
        </ol>

        <!-- Smart Actions -->
        <div class="breadcrumb-smart-actions" *ngIf="showSmartActions">

          <!-- Back Button with Smart Logic -->
          <button class="btn btn-sm btn-outline-secondary"
                  (click)="smartGoBack()"
                  [disabled]="!canGoBack()"
                  [title]="getBackButtonTitle()">
            <i class="bi bi-arrow-left flip-rtl"></i>
            <span class="d-none d-md-inline ms-1">{{ getBackButtonLabel() }}</span>
          </button>

          <!-- Quick Actions Dropdown -->
          <div class="dropdown ms-2" *ngIf="quickActions.length > 0">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    [title]="'NAVIGATION.QUICK_ACTIONS' | translate">
              <i class="bi bi-lightning"></i>
            </button>
            <ul class="dropdown-menu">
              <li *ngFor="let action of quickActions">
                <a class="dropdown-item"
                   [routerLink]="action.url"
                   *ngIf="action.url">
                  <i *ngIf="action.icon" [class]="action.icon" class="me-2"></i>
                  {{ action.label | translate }}
                </a>
                <button class="dropdown-item"
                        (click)="action.callback()"
                        *ngIf="action.callback">
                  <i *ngIf="action.icon" [class]="action.icon" class="me-2"></i>
                  {{ action.label | translate }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .smart-breadcrumb-container {
      background-color: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
      padding: 0.75rem 0;
      min-height: 52px;
      display: flex;
      align-items: center;
    }

    .breadcrumb {
      --bs-breadcrumb-divider: '';
      margin-bottom: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
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
      text-decoration: underline;
    }

    .breadcrumb-smart-actions {
      display: flex;
      align-items: center;
      margin-left: auto;

      :host-context(.rtl) & {
        margin-left: 0;
        margin-right: auto;
      }
    }

    /* Enhanced accessibility */
    .breadcrumb-link:focus,
    .btn:focus {
      outline: 2px solid var(--bs-primary);
      outline-offset: 2px;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .smart-breadcrumb-container {
        padding: 0.5rem 0;
        min-height: 44px;
      }

      .breadcrumb-link,
      .breadcrumb-text {
        max-width: 120px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class SmartBreadcrumbComponent extends BreadcrumbComponent implements OnInit, OnDestroy {
  hideBreadcrumb = false;
  showSmartActions = true;
  quickActions: Array<{
    label: string;
    icon?: string;
    url?: string;
    callback?: () => void;
  }> = [];

  private routeData: RouteData = {};
  private navigationHistory: string[] = [];

  constructor(
    breadcrumbService: BreadcrumbService,
    languageService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService
  ) {
    super(breadcrumbService, languageService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.setupSmartFeatures();
    this.setupQuickActions();
  }

  override getBreadcrumbLabel(item: BreadcrumbItem): Observable<string> {
    if (item.translationKey) {
      return this.translateService.get(item.translationKey);
    }
    return new Observable(subscriber => {
      subscriber.next(item.label);
      subscriber.complete();
    });
  }

  getBreadcrumbAriaLabel(item: BreadcrumbItem, index: number): string {
    return `Navigate to ${item.label}, breadcrumb ${index + 1}`;
  }

  canGoBack(): boolean {
    return this.breadcrumbs.length > 1 || this.navigationHistory.length > 0;
  }

  getBackButtonTitle(): string {
    if (this.breadcrumbs.length > 1) {
      const previousItem = this.breadcrumbs[this.breadcrumbs.length - 2];
      return `Go back to ${previousItem.label}`;
    }
    return 'Go back';
  }

  getBackButtonLabel(): string {
    if (this.breadcrumbs.length > 1) {
      const previousItem = this.breadcrumbs[this.breadcrumbs.length - 2];
      return previousItem.label.length > 15
        ? previousItem.label.substring(0, 15) + '...'
        : previousItem.label;
    }
    return 'Back';
  }

  smartGoBack(): void {
    if (this.breadcrumbs.length > 1) {
      const previousItem = this.breadcrumbs[this.breadcrumbs.length - 2];
      if (previousItem.url) {
        this.router.navigate([previousItem.url]);
        return;
      }
    }

    // Fallback to browser back
    if (this.navigationHistory.length > 0) {
      window.history.back();
    }
  }

  private setupSmartFeatures(): void {
    // Track navigation history
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.navigationHistory.push(event.url);
        if (this.navigationHistory.length > 20) {
          this.navigationHistory = this.navigationHistory.slice(-20);
        }

        this.analyzeRoute();
      });

    // Watch for route data changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.extractRouteData();
      });
  }

  private setupQuickActions(): void {
    // Setup context-aware quick actions based on current route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateQuickActions();
      });
  }

  private analyzeRoute(): void {
    const currentUrl = this.router.url;

    // Auto-hide breadcrumb on specific routes
    this.hideBreadcrumb = this.shouldHideBreadcrumb(currentUrl);

    // Update smart actions based on route context
    this.updateSmartActionsForRoute(currentUrl);
  }

  private shouldHideBreadcrumb(url: string): boolean {
    const hideRoutes = ['/', '/login', '/register', '/404'];
    return hideRoutes.includes(url.split('?')[0]) || this.routeData.hideBreadcrumb === true;
  }

  private extractRouteData(): void {
    let route = this.activatedRoute;
    this.routeData = {};

    // Traverse route tree to collect data
    while (route) {
      if (route.snapshot.data) {
        this.routeData = { ...this.routeData, ...route.snapshot.data };
      }
      route = route.firstChild!;
    }
  }

  private updateQuickActions(): void {
    const currentUrl = this.router.url.split('?')[0];
    this.quickActions = [];

    switch (true) {
      case currentUrl.startsWith('/flights/results'):
        this.quickActions = [
          { label: 'FLIGHT_SEARCH.NEW_SEARCH', icon: 'bi-search', url: '/flights' },
          { label: 'NAVIGATION.HOME', icon: 'bi-house', url: '/' }
        ];
        break;

      case currentUrl.startsWith('/flights/'):
        this.quickActions = [
          { label: 'FLIGHT_SEARCH.BACK_TO_RESULTS', icon: 'bi-arrow-left', callback: () => this.router.navigate(['/flights/results']) },
          { label: 'FLIGHT_SEARCH.NEW_SEARCH', icon: 'bi-search', url: '/flights' }
        ];
        break;

      default:
        this.quickActions = [
          { label: 'NAVIGATION.HOME', icon: 'bi-house', url: '/' }
        ];
        break;
    }
  }

  private updateSmartActionsForRoute(url: string): void {
    // Enable/disable smart actions based on route
    this.showSmartActions = !['/', '/login', '/register'].includes(url.split('?')[0]);
  }
}

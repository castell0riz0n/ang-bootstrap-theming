import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { StickyLayoutService } from '../../../_core/services/sticky-layout.service';
import { BreadcrumbService } from '../../../_core/services/breadcrumb.service';
import { FlightSearchCriteria } from '../../../_core/models/flight.model';

@Component({
  selector: 'app-layout',
  standalone: false,
  template: `
    <div class="app-layout">
      <!-- Sticky Container for Header, Breadcrumb, and Modify Search -->
      <app-sticky-container>

        <!-- Header Slot -->
        <div slot="header">
          <app-header></app-header>
        </div>

        <!-- Breadcrumb Slot -->
        <div slot="breadcrumb" *ngIf="showBreadcrumb">
          <app-breadcrumb
            [customStyling]="true"
            [showActions]="showBreadcrumbActions"
            [showHistory]="showBreadcrumbHistory">
          </app-breadcrumb>
        </div>

        <!-- Modify Search Slot -->
        <div slot="modify-search" *ngIf="showModifySearch">
          <app-modify-search
            [searchCriteria]="currentSearchCriteria"
            [compactMode]="true"
            [showSummary]="true"
            (searchModified)="onSearchModified($event)"
            (searchStarted)="onSearchStarted()">
          </app-modify-search>
        </div>

      </app-sticky-container>

      <!-- Main Content Area -->
      <main class="main-content" [style.padding-top.px]="contentPaddingTop">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <app-footer></app-footer>

      <!-- Sticky Configuration Panel (Dev Mode) -->
      <div *ngIf="showStickyConfig" class="sticky-config-panel">
        <app-sticky-config></app-sticky-config>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
    }

    .main-content {
      flex: 1;
      transition: padding-top 0.3s ease;
      position: relative;
    }

    .sticky-config-panel {
      position: fixed;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      z-index: 2000;
      background: var(--bs-body-bg);
      border: 1px solid var(--bs-border-color);
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 280px;

      :host-context(.rtl) & {
        right: auto;
        left: 20px;
      }
    }

    @media (max-width: 768px) {
      .sticky-config-panel {
        right: 10px;
        max-width: 250px;
        padding: 0.75rem;

        :host-context(.rtl) & {
          right: auto;
          left: 10px;
        }
      }
    }

    /* Ensure proper content spacing */
    .main-content > :first-child {
      margin-top: 0;
    }

    /* Dark theme support */
    :host-context(.dark-mode) .sticky-config-panel,
    :host-context(.theme-dark) .sticky-config-panel,
    :host-context(.theme-green-orange-dark) .sticky-config-panel,
    :host-context(.theme-indigo-dark) .sticky-config-panel {
      background-color: var(--bs-dark);
      border-color: var(--bs-border-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  @Input() showBreadcrumb = true;
  @Input() showBreadcrumbActions = false;
  @Input() showBreadcrumbHistory = false;
  @Input() showModifySearch = false;
  @Input() showStickyConfig = false; // Set to true for development

  currentSearchCriteria: FlightSearchCriteria | null = null;
  contentPaddingTop = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private stickyLayoutService: StickyLayoutService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit(): void {
    this.setupRouteBasedConfiguration();
    this.setupStickyLayoutSubscription();
    this.setupInitialConfiguration();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchModified(searchCriteria: FlightSearchCriteria): void {
    this.currentSearchCriteria = searchCriteria;

    // Update breadcrumbs based on new search
    this.breadcrumbService.buildFlightSearchBreadcrumbs(searchCriteria);
  }

  onSearchStarted(): void {
    // Optional: Show loading state or perform other actions
    console.log('Search started');
  }

  private setupRouteBasedConfiguration(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.configureComponentsForRoute(event.url);
      });
  }

  private setupStickyLayoutSubscription(): void {
    this.stickyLayoutService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        // Update content padding to account for sticky elements
        this.contentPaddingTop = state.isSticky ? state.totalHeight : 0;
      });
  }

  private setupInitialConfiguration(): void {
    // Enable header by default
    this.stickyLayoutService.updateComponentConfig('header', { enabled: true });

    // Enable breadcrumb by default
    this.stickyLayoutService.updateComponentConfig('breadcrumb', { enabled: true });

    // Configure for current route
    this.configureComponentsForRoute(this.router.url);
  }

  private configureComponentsForRoute(url: string): void {
    const urlPath = url.split('?')[0];

    // Reset modify search
    this.showModifySearch = false;
    this.stickyLayoutService.toggleComponent('modifySearch', false);

    // Configure based on route
    switch (true) {
      case urlPath === '/':
        this.configureForHome();
        break;

      case urlPath === '/flights':
        this.configureForFlightSearch();
        break;

      case urlPath === '/flights/results':
        this.configureForFlightResults();
        break;

      case urlPath.startsWith('/flights/') && urlPath !== '/flights/results':
        this.configureForFlightDetail();
        break;

      default:
        this.configureDefault();
        break;
    }
  }

  private configureForHome(): void {
    this.showBreadcrumb = false;
    this.showModifySearch = false;

    // Disable breadcrumb and modify search for home page
    this.stickyLayoutService.toggleComponent('breadcrumb', false);
    this.stickyLayoutService.toggleComponent('modifySearch', false);
  }

  private configureForFlightSearch(): void {
    this.showBreadcrumb = true;
    this.showModifySearch = false;
    this.showBreadcrumbActions = true;

    // Enable breadcrumb, disable modify search
    this.stickyLayoutService.toggleComponent('breadcrumb', true);
    this.stickyLayoutService.toggleComponent('modifySearch', false);

    // Set up breadcrumbs
    this.breadcrumbService.setBreadcrumbs([
      { label: 'NAVIGATION.HOME', translationKey: 'NAVIGATION.HOME', url: '/', icon: 'bi-house' },
      { label: 'NAVIGATION.FLIGHTS', translationKey: 'NAVIGATION.FLIGHTS', icon: 'bi-airplane' }
    ]);
  }

  private configureForFlightResults(): void {
    this.showBreadcrumb = true;
    this.showModifySearch = true;
    this.showBreadcrumbActions = true;
    this.showBreadcrumbHistory = true;

    // Enable both breadcrumb and modify search
    this.stickyLayoutService.toggleComponent('breadcrumb', true);
    this.stickyLayoutService.toggleComponent('modifySearch', true);

    // Extract search criteria from query params if available
    this.extractSearchCriteriaFromUrl();
  }

  private configureForFlightDetail(): void {
    this.showBreadcrumb = true;
    this.showModifySearch = true;
    this.showBreadcrumbActions = true;
    this.showBreadcrumbHistory = true;

    // Enable both components
    this.stickyLayoutService.toggleComponent('breadcrumb', true);
    this.stickyLayoutService.toggleComponent('modifySearch', true);

    // Flight detail breadcrumbs will be set by the component itself
  }

  private configureDefault(): void {
    this.showBreadcrumb = true;
    this.showModifySearch = false;
    this.showBreadcrumbActions = false;
    this.showBreadcrumbHistory = false;

    // Enable breadcrumb only
    this.stickyLayoutService.toggleComponent('breadcrumb', true);
    this.stickyLayoutService.toggleComponent('modifySearch', false);
  }

  private extractSearchCriteriaFromUrl(): void {
    // Extract query parameters to populate search criteria
    const urlTree = this.router.parseUrl(this.router.url);
    const queryParams = urlTree.queryParams;

    if (queryParams && Object.keys(queryParams).length > 0) {
      this.currentSearchCriteria = {
        fromAirport: queryParams['fromAirport'] || '',
        toAirport: queryParams['toAirport'] || '',
        departureDate: queryParams['departureDate'] || '',
        returnDate: queryParams['returnDate'] || undefined,
        passengers: +queryParams['passengers'] || 1,
        tripType: queryParams['tripType'] || 'oneWay',
        cabinClass: queryParams['cabinClass'] || 'economy'
      };

      // Update breadcrumbs with search info
      this.breadcrumbService.buildFlightSearchBreadcrumbs(this.currentSearchCriteria);
    }
  }
}

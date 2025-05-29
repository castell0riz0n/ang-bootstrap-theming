import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
  translationKey?: string;
  isActive?: boolean;
  data?: any;
}

export interface BreadcrumbConfig {
  showHome: boolean;
  homeIcon: string;
  homeLabel: string;
  separator: string;
  maxItems: number;
  showCurrentPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  private configSubject = new BehaviorSubject<BreadcrumbConfig>({
    showHome: true,
    homeIcon: 'bi-house',
    homeLabel: 'NAVIGATION.HOME',
    separator: '/',
    maxItems: 5,
    showCurrentPage: true
  });

  // Route-to-breadcrumb mapping
  private routeBreadcrumbMap: { [key: string]: BreadcrumbItem[] } = {
    '/': [
      { label: 'NAVIGATION.HOME', translationKey: 'NAVIGATION.HOME', url: '/', icon: 'bi-house' }
    ],
    '/flights': [
      { label: 'NAVIGATION.HOME', translationKey: 'NAVIGATION.HOME', url: '/', icon: 'bi-house' },
      { label: 'NAVIGATION.FLIGHTS', translationKey: 'NAVIGATION.FLIGHTS', url: '/flights', icon: 'bi-airplane' }
    ],
    '/flights/results': [
      { label: 'NAVIGATION.HOME', translationKey: 'NAVIGATION.HOME', url: '/', icon: 'bi-house' },
      { label: 'NAVIGATION.FLIGHTS', translationKey: 'NAVIGATION.FLIGHTS', url: '/flights', icon: 'bi-airplane' },
      { label: 'FLIGHT_SEARCH.RESULTS_FOUND', translationKey: 'FLIGHT_SEARCH.RESULTS_FOUND', icon: 'bi-list-ul' }
    ],
    '/flights/:id': [
      { label: 'NAVIGATION.HOME', translationKey: 'NAVIGATION.HOME', url: '/', icon: 'bi-house' },
      { label: 'NAVIGATION.FLIGHTS', translationKey: 'NAVIGATION.FLIGHTS', url: '/flights', icon: 'bi-airplane' },
      { label: 'FLIGHT_SEARCH.RESULTS_FOUND', translationKey: 'FLIGHT_SEARCH.RESULTS_FOUND', url: '/flights/results', icon: 'bi-list-ul' },
      { label: 'FLIGHT_DETAIL.FLIGHT_DETAILS', translationKey: 'FLIGHT_DETAIL.FLIGHT_DETAILS', icon: 'bi-info-circle' }
    ]
  };

  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();
  public config$ = this.configSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.initializeRouteBreadcrumbs();
  }

  /**
   * Set breadcrumbs manually
   */
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    const processedBreadcrumbs = this.processBreadcrumbs(breadcrumbs);
    this.breadcrumbsSubject.next(processedBreadcrumbs);
  }

  /**
   * Add a breadcrumb item
   */
  addBreadcrumb(breadcrumb: BreadcrumbItem, index?: number): void {
    const currentBreadcrumbs = this.breadcrumbsSubject.value;
    const newBreadcrumbs = [...currentBreadcrumbs];

    if (index !== undefined && index >= 0 && index <= newBreadcrumbs.length) {
      newBreadcrumbs.splice(index, 0, breadcrumb);
    } else {
      newBreadcrumbs.push(breadcrumb);
    }

    const processedBreadcrumbs = this.processBreadcrumbs(newBreadcrumbs);
    this.breadcrumbsSubject.next(processedBreadcrumbs);
  }

  /**
   * Remove a breadcrumb by index
   */
  removeBreadcrumb(index: number): void {
    const currentBreadcrumbs = this.breadcrumbsSubject.value;
    if (index >= 0 && index < currentBreadcrumbs.length) {
      const newBreadcrumbs = currentBreadcrumbs.filter((_, i) => i !== index);
      const processedBreadcrumbs = this.processBreadcrumbs(newBreadcrumbs);
      this.breadcrumbsSubject.next(processedBreadcrumbs);
    }
  }

  /**
   * Update breadcrumb configuration
   */
  updateConfig(config: Partial<BreadcrumbConfig>): void {
    const currentConfig = this.configSubject.value;
    const newConfig = { ...currentConfig, ...config };
    this.configSubject.next(newConfig);

    // Reprocess current breadcrumbs with new config
    const currentBreadcrumbs = this.breadcrumbsSubject.value;
    const processedBreadcrumbs = this.processBreadcrumbs(currentBreadcrumbs);
    this.breadcrumbsSubject.next(processedBreadcrumbs);
  }

  /**
   * Clear all breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }

  /**
   * Navigate to a breadcrumb
   */
  navigateTo(breadcrumb: BreadcrumbItem): void {
    if (breadcrumb.url) {
      this.router.navigate([breadcrumb.url]);
    }
  }

  /**
   * Get current breadcrumbs
   */
  getCurrentBreadcrumbs(): BreadcrumbItem[] {
    return this.breadcrumbsSubject.value;
  }

  /**
   * Build breadcrumbs for flight search results
   */
  buildFlightSearchBreadcrumbs(searchParams?: any): void {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'NAVIGATION.HOME', translationKey: 'NAVIGATION.HOME', url: '/', icon: 'bi-house' },
      { label: 'NAVIGATION.FLIGHTS', translationKey: 'NAVIGATION.FLIGHTS', url: '/flights', icon: 'bi-airplane' }
    ];

    if (searchParams) {
      const searchLabel = searchParams.fromAirport && searchParams.toAirport
        ? `${searchParams.fromAirport} → ${searchParams.toAirport}`
        : 'Search Results';

      breadcrumbs.push({
        label: searchLabel,
        icon: 'bi-search',
        data: searchParams
      });
    } else {
      breadcrumbs.push({
        label: 'FLIGHT_SEARCH.RESULTS_FOUND',
        translationKey: 'FLIGHT_SEARCH.RESULTS_FOUND',
        icon: 'bi-list-ul'
      });
    }

    this.setBreadcrumbs(breadcrumbs);
  }

  /**
   * Build breadcrumbs for flight details
   */
  buildFlightDetailBreadcrumbs(flightInfo?: any): void {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'NAVIGATION.HOME', translationKey: 'NAVIGATION.HOME', url: '/', icon: 'bi-house' },
      { label: 'NAVIGATION.FLIGHTS', translationKey: 'NAVIGATION.FLIGHTS', url: '/flights', icon: 'bi-airplane' },
      { label: 'FLIGHT_SEARCH.RESULTS_FOUND', translationKey: 'FLIGHT_SEARCH.RESULTS_FOUND', url: '/flights/results', icon: 'bi-list-ul' }
    ];

    if (flightInfo) {
      const flightLabel = `${flightInfo.airlineName} ${flightInfo.flightNumber}`;
      breadcrumbs.push({
        label: flightLabel,
        icon: 'bi-airplane-fill',
        data: flightInfo
      });
    } else {
      breadcrumbs.push({
        label: 'FLIGHT_DETAIL.FLIGHT_DETAILS',
        translationKey: 'FLIGHT_DETAIL.FLIGHT_DETAILS',
        icon: 'bi-info-circle'
      });
    }

    this.setBreadcrumbs(breadcrumbs);
  }

  private initializeRouteBreadcrumbs(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        startWith(this.activatedRoute)
      )
      .subscribe(() => {
        this.buildBreadcrumbsFromRoute();
      });
  }

  private buildBreadcrumbsFromRoute(): void {
    const url = this.router.url.split('?')[0]; // Remove query params

    // Check for exact match first
    if (this.routeBreadcrumbMap[url]) {
      this.setBreadcrumbs(this.routeBreadcrumbMap[url]);
      return;
    }

    // Check for parameterized routes
    for (const [pattern, breadcrumbs] of Object.entries(this.routeBreadcrumbMap)) {
      if (this.matchesPattern(url, pattern)) {
        this.setBreadcrumbs(breadcrumbs);
        return;
      }
    }

    // Default breadcrumb if no match found
    this.buildDefaultBreadcrumbs(url);
  }

  private matchesPattern(url: string, pattern: string): boolean {
    // Convert pattern like '/flights/:id' to regex
    const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  }

  private buildDefaultBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'NAVIGATION.HOME', translationKey: 'NAVIGATION.HOME', url: '/', icon: 'bi-house' }
    ];

    let cumulativeUrl = '';
    segments.forEach((segment, index) => {
      cumulativeUrl += `/${segment}`;
      const isLast = index === segments.length - 1;

      breadcrumbs.push({
        label: this.formatSegment(segment),
        url: isLast ? undefined : cumulativeUrl,
        isActive: isLast
      });
    });

    this.setBreadcrumbs(breadcrumbs);
  }

  private formatSegment(segment: string): string {
    // Convert kebab-case to Title Case
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private processBreadcrumbs(breadcrumbs: BreadcrumbItem[]): BreadcrumbItem[] {
    const config = this.configSubject.value;
    let processed = [...breadcrumbs];

    // Mark the last item as active
    if (processed.length > 0) {
      processed = processed.map((item, index) => ({
        ...item,
        isActive: index === processed.length - 1
      }));
    }

    // Remove current page if config says so
    if (!config.showCurrentPage && processed.length > 0) {
      processed.pop();
    }

    // Limit number of items
    if (config.maxItems > 0 && processed.length > config.maxItems) {
      const start = processed.slice(0, 1); // Keep home
      const end = processed.slice(-(config.maxItems - 2)); // Keep last items
      processed = [
        ...start,
        { label: '...', icon: 'bi-three-dots' },
        ...end
      ];
    }

    return processed;
  }
}

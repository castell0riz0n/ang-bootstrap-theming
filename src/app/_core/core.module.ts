import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

// Existing services
import { LanguageService } from './services/language.service';
import { ThemeService } from './services/theme.service';
import { FlightService } from './services/flight.service';
import { ThemeDirectionService } from './services/theme-direction.service';

// New services
import { StickyLayoutService } from './services/sticky-layout.service';
import { BreadcrumbService } from './services/breadcrumb.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    provideHttpClient(withFetch()),
    LanguageService,
    ThemeService,
    ThemeDirectionService,
    FlightService,
    // New services
    StickyLayoutService,
    BreadcrumbService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}

import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

// Services
import { LanguageService } from './services/language.service';
import { ThemeService } from './services/theme.service';
import { FlightService } from './services/flight.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    provideHttpClient(withFetch()),
    LanguageService,
    ThemeService,
    FlightService
  ]
})
export class CoreModule {
  // Prevent reimporting of the CoreModule
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
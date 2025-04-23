import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Core Module
import { CoreModule } from './_core/core.module';

// Shared Module
import { SharedModule } from './_shared/shared.module';

// Feature Modules
import { HomeModule } from './features/home/home.module';

// Components
import { HeaderComponent } from './_shared/components/header/header.component';
import { FooterComponent } from './_shared/components/footer/footer.component';
import { LanguageSelectorComponent } from './_shared/components/language-selector/language-selector.component';
import { ThemeToggleComponent } from './_shared/components/theme-toggle/theme-toggle.component';
import { ThemeSelectorComponent } from './_shared/components/theme-selector/theme-selector.component';

// Services
import { LanguageService } from './_core/services/language.service';
import { ThemeDirectionService } from './_core/services/theme-direction.service';

// Directives
import { RtlSupportDirective } from './_shared/directives/rtl-support.directive';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Factory function for initializing language service
export function initializeLanguageService(languageService: LanguageService) {
  return () => languageService.initializeLanguage();
}

// Factory function for initializing theme service
export function initializeThemeService(themeService: ThemeDirectionService) {
  return () => {
    // Load theme preference from local storage
    const themePreference = localStorage.getItem('theme-preference');
    if (themePreference && ['light', 'dark', 'green-orange-light', 'green-orange-dark'].includes(themePreference)) {
      themeService.setTheme(themePreference as any);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use dark theme if system prefers it
      themeService.setTheme('dark');
    }

    return Promise.resolve();
  };
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CoreModule,
    SharedModule,
    HomeModule,
    AppRoutingModule // Import last to ensure other module routes are registered
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeLanguageService,
      deps: [LanguageService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeThemeService,
      deps: [ThemeDirectionService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

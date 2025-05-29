import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Import new components
import { StickyContainerComponent } from './components/sticky-container/sticky-container.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ModifySearchComponent } from './components/modify-search/modify-search.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { StickyConfigComponent } from './components/sticky-config/sticky-config.component';

// Import existing components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { FlightCardComponent } from './components/flight-card/flight-card.component';
import { SearchFormComponent } from './components/search-form.component';
import { ThemeSelectorComponent } from './components/theme-selector/theme-selector.component';
import { RtlSupportDirective } from './directives/rtl-support.directive';
import { DurationPipe } from './pipes/duration.pipe';

@NgModule({
  declarations: [
    // Existing components
    HeaderComponent,
    FooterComponent,
    LanguageSelectorComponent,
    ThemeToggleComponent,
    FlightCardComponent,
    SearchFormComponent,
    ThemeSelectorComponent,
    RtlSupportDirective,
    DurationPipe,

    // New sticky system components
    StickyContainerComponent,
    BreadcrumbComponent,
    ModifySearchComponent,
    AppLayoutComponent,
    StickyConfigComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  exports: [
    // Modules
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    // All components
    HeaderComponent,
    FooterComponent,
    LanguageSelectorComponent,
    ThemeToggleComponent,
    FlightCardComponent,
    SearchFormComponent,
    ThemeSelectorComponent,
    StickyContainerComponent,
    BreadcrumbComponent,
    ModifySearchComponent,
    AppLayoutComponent,
    StickyConfigComponent,

    // Directives and pipes
    RtlSupportDirective,
    DurationPipe
  ]
})
export class SharedModule {}

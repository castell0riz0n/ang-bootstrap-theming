import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

// Components
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {LanguageSelectorComponent} from './components/language-selector/language-selector.component';
import {ThemeToggleComponent} from './components/theme-toggle/theme-toggle.component';
import {FlightCardComponent} from './components/flight-card/flight-card.component';

// Directives
import {RtlSupportDirective} from './directives/rtl-support.directive';

// Pipes
import {DurationPipe} from './pipes/duration.pipe';
import {SearchFormComponent} from './components/search-form.component';
import {ThemeSelectorComponent} from './components/theme-selector/theme-selector.component';
import {FormInspectorComponent} from './components/form-inspector.component';

@NgModule({
  declarations: [
    // Components
    HeaderComponent,
    FooterComponent,
    LanguageSelectorComponent,
    ThemeToggleComponent,
    FlightCardComponent,
    SearchFormComponent,
    ThemeSelectorComponent,
    FormInspectorComponent,

    // Directives
    RtlSupportDirective,

    // Pipes
    DurationPipe
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

    // Components
    HeaderComponent,
    FooterComponent,
    LanguageSelectorComponent,
    ThemeToggleComponent,
    FlightCardComponent,
    SearchFormComponent,
    ThemeSelectorComponent,
    FormInspectorComponent,

    // Directives
    RtlSupportDirective,

    // Pipes
    DurationPipe
  ]
})
export class SharedModule {
}

import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../../_core/services/language.service';
import { ThemeDirectionService } from '../../_core/services/theme-direction.service';

@Component({
  selector: 'app-form-test',
  standalone: false,
  template: `
    <div class="container my-5" [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title mb-4">Form Height Test</h2>

          <p class="mb-4">This component is designed to test form heights and ensure consistent styling.</p>

          <form [formGroup]="testForm">
            <!-- Form Control Height Test Section -->
            <div class="mb-4 p-3 border">
              <h5>Height Test: Default Form Controls</h5>
              <div class="row g-3 align-items-center">
                <div class="col">
                  <label for="textInput" class="form-label">Text input</label>
                  <input #textInput type="text" class="form-control" id="textInput" formControlName="text" placeholder="Text input">
                </div>
                <div class="col">
                  <label for="dateInput" class="form-label">Date input</label>
                  <input #dateInput type="date" class="form-control" id="dateInput" formControlName="date">
                </div>
                <div class="col">
                  <label for="selectInput" class="form-label">Select input</label>
                  <select #selectInput class="form-select" id="selectInput" formControlName="select">
                    <option value="">Select option</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                  </select>
                </div>
                <div class="col">
                  <label for="buttonTest" class="form-label">Default Button</label>
                  <div>
                    <button #buttonDefault id="buttonTest" class="btn btn-primary">Default</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Button Size Test Section -->
            <div class="mb-4 p-3 border">
              <h5>Height Test: Button Sizes</h5>
              <div class="d-flex align-items-end gap-3 flex-wrap">
                <div>
                  <label class="form-label">Small Button</label>
                  <div>
                    <button #buttonSm class="btn btn-sm btn-primary">Small</button>
                  </div>
                </div>
                <div>
                  <label class="form-label">Default Button</label>
                  <div>
                    <button class="btn btn-primary">Default</button>
                  </div>
                </div>
                <div>
                  <label class="form-label">Large Button</label>
                  <div>
                    <button #buttonLg class="btn btn-lg btn-primary">Large</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Form Elements -->
            <div class="mb-4 p-3 border">
              <h5>Additional Form Elements</h5>

              <!-- Input with help text -->
              <div class="mb-3">
                <label for="helpTextInput" class="form-label">Input with help text</label>
                <input type="text" class="form-control" id="helpTextInput" formControlName="helpText">
                <div class="form-text">This is some help text for the input above.</div>
              </div>

              <!-- Input group -->
              <div class="mb-3">
                <label for="inputGroup" class="form-label">Input group</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input #inputGroup type="number" class="form-control" id="inputGroup" formControlName="inputGroup">
                  <span class="input-group-text">.00</span>
                </div>
              </div>

              <!-- Textarea -->
              <div class="mb-3">
                <label for="textarea" class="form-label">Textarea</label>
                <textarea class="form-control" id="textarea" rows="3" formControlName="textarea"></textarea>
              </div>

              <!-- Floating label -->
              <div class="form-floating mb-3">
                <input #floatingInput type="email" class="form-control" id="floatingInput" placeholder="name@example.com" formControlName="floatingInput">
                <label for="floatingInput">Floating label</label>
              </div>
            </div>

            <!-- Theme and Direction Controls -->
            <div class="d-flex gap-3 flex-wrap">
              <button type="button" class="btn btn-outline-primary" (click)="toggleTheme()">
                {{ (themeService.theme$ | async)?.includes('dark') ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="toggleDirection()">
                {{ (languageService.currentLanguage$ | async)?.direction === 'rtl' ? 'Switch to LTR' : 'Switch to RTL' }}
              </button>
              <button type="button" class="btn btn-outline-info" (click)="showHeights()">
                Show Height Measurements
              </button>
            </div>
          </form>

          <!-- Height Measurements Display -->
          <div *ngIf="heightsVisible" class="mt-4 p-3 border bg-light">
            <h5>Height Measurements</h5>
            <div class="row g-3">
              <div class="col-md-3" *ngFor="let item of heightMeasurements">
                <div class="card card-compact">
                  <div class="card-body">
                    <h6>{{ item.name }}</h6>
                    <small class="d-block">Height: <strong>{{ item.height }}px</strong></small>
                    <small class="d-block">Line height: {{ item.lineHeight }}</small>
                    <small class="d-block">Padding-Y: {{ item.paddingY }}px</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FormTestComponent implements AfterViewInit {
  testForm: FormGroup;
  heightsVisible = false;
  heightMeasurements: any[] = [];

  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild('dateInput') dateInput!: ElementRef;
  @ViewChild('selectInput') selectInput!: ElementRef;
  @ViewChild('buttonDefault') buttonDefault!: ElementRef;
  @ViewChild('buttonSm') buttonSm!: ElementRef;
  @ViewChild('buttonLg') buttonLg!: ElementRef;
  @ViewChild('inputGroup') inputGroup!: ElementRef;
  @ViewChild('floatingInput') floatingInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    public languageService: LanguageService,
    public themeService: ThemeDirectionService
  ) {
    this.testForm = this.fb.group({
      text: [''],
      date: [''],
      select: [''],
      helpText: [''],
      inputGroup: [''],
      textarea: [''],
      floatingInput: ['']
    });
  }

  ngAfterViewInit() {
    // Initial measurement after view init
    setTimeout(() => this.measureHeights(), 500);
  }

  toggleTheme() {
    const currentTheme = this.themeService.theme;
    if (currentTheme.includes('dark')) {
      // Switch to light version of current theme family
      const newTheme = currentTheme.replace('dark', 'light');
      this.themeService.setTheme(newTheme as any);
    } else {
      // Switch to dark version of current theme family
      const newTheme = currentTheme.replace('light', 'dark');
      this.themeService.setTheme(newTheme as any);
    }

    // Re-measure after theme change
    setTimeout(() => this.measureHeights(), 500);
  }

  toggleDirection() {
    const currentLang = this.languageService.currentLanguage;
    if (currentLang.direction === 'rtl') {
      // Switch to an LTR language (English)
      const englishLang = this.languageService.getLanguageByCode('en');
      if (englishLang) {
        this.languageService.setLanguage(englishLang);
      }
    } else {
      // Switch to an RTL language (Arabic)
      const arabicLang = this.languageService.getLanguageByCode('ar');
      if (arabicLang) {
        this.languageService.setLanguage(arabicLang);
      }
    }

    // Re-measure after direction change
    setTimeout(() => this.measureHeights(), 500);
  }

  showHeights() {
    this.heightsVisible = !this.heightsVisible;

    if (this.heightsVisible) {
      this.measureHeights();
    }
  }

  measureHeights() {
    this.heightMeasurements = [];

    const elements = [
      { name: 'Text Input', el: this.textInput?.nativeElement },
      { name: 'Date Input', el: this.dateInput?.nativeElement },
      { name: 'Select Input', el: this.selectInput?.nativeElement },
      { name: 'Default Button', el: this.buttonDefault?.nativeElement },
      { name: 'Small Button', el: this.buttonSm?.nativeElement },
      { name: 'Large Button', el: this.buttonLg?.nativeElement },
      { name: 'Input Group', el: this.inputGroup?.nativeElement },
      { name: 'Floating Input', el: this.floatingInput?.nativeElement }
    ];

    elements.forEach(item => {
      if (!item.el) return;

      const styles = window.getComputedStyle(item.el);
      const paddingTop = parseFloat(styles.paddingTop);
      const paddingBottom = parseFloat(styles.paddingBottom);

      this.heightMeasurements.push({
        name: item.name,
        height: Math.round(item.el.getBoundingClientRect().height * 100) / 100,
        lineHeight: styles.lineHeight,
        paddingY: Math.round((paddingTop + paddingBottom) * 100) / 100
      });
    });
  }
}

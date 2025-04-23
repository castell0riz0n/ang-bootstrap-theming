import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LanguageService } from '../../_core/services/language.service';
import { ThemeDirectionService } from '../../_core/services/theme-direction.service';

@Component({
  selector: 'app-form-test',
  standalone: false,
  template: `
    <div class="container my-5" [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title mb-4">Form Controls Size Test</h2>

          <p class="mb-4">This component tests form control sizing and ensures consistent styling.</p>

          <form [formGroup]="testForm">
            <!-- Default Size Controls -->
            <div class="mb-4 p-3 border">
              <h5>Default Size</h5>
              <div class="row g-3 align-items-center">
                <div class="col-md-4">
                  <label for="defaultInput" class="form-label">Input</label>
                  <input #defaultInput type="text" class="form-control" id="defaultInput" formControlName="defaultInput" placeholder="Default input">
                </div>
                <div class="col-md-4">
                  <label for="defaultSelect" class="form-label">Select</label>
                  <select #defaultSelect class="form-select" id="defaultSelect" formControlName="defaultSelect">
                    <option value="">Default select</option>
                    <option value="1">Option 1</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label for="defaultBtn" class="form-label">Button</label>
                  <div>
                    <button #defaultBtn id="defaultBtn" class="btn btn-primary">Default</button>
                  </div>
                </div>
              </div>

              <div class="mt-3">
                <label for="defaultInputGroup" class="form-label">Input Group</label>
                <div #defaultInputGroup class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="text" class="form-control" placeholder="Amount">
                  <span class="input-group-text">.00</span>
                </div>
              </div>
            </div>

            <!-- Large Size Controls -->
            <div class="mb-4 p-3 border">
              <h5>Large Size</h5>
              <div class="row g-3 align-items-center">
                <div class="col-md-4">
                  <label for="lgInput" class="form-label">Input</label>
                  <input #lgInput type="text" class="form-control form-control-lg" id="lgInput" formControlName="lgInput" placeholder="Large input">
                </div>
                <div class="col-md-4">
                  <label for="lgSelect" class="form-label">Select</label>
                  <select #lgSelect class="form-select form-select-lg" id="lgSelect" formControlName="lgSelect">
                    <option value="">Large select</option>
                    <option value="1">Option 1</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label for="lgBtn" class="form-label">Button</label>
                  <div>
                    <button #lgBtn id="lgBtn" class="btn btn-lg btn-primary">Large</button>
                  </div>
                </div>
              </div>

              <div class="mt-3">
                <label for="lgInputGroup" class="form-label">Input Group (Large)</label>
                <div #lgInputGroup class="input-group input-group-lg">
                  <span class="input-group-text">$</span>
                  <input type="text" class="form-control" placeholder="Amount">
                  <span class="input-group-text">.00</span>
                </div>
              </div>
            </div>

            <!-- Small Size Controls -->
            <div class="mb-4 p-3 border">
              <h5>Small Size</h5>
              <div class="row g-3 align-items-center">
                <div class="col-md-4">
                  <label for="smInput" class="form-label">Input</label>
                  <input #smInput type="text" class="form-control form-control-sm" id="smInput" formControlName="smInput" placeholder="Small input">
                </div>
                <div class="col-md-4">
                  <label for="smSelect" class="form-label">Select</label>
                  <select #smSelect class="form-select form-select-sm" id="smSelect" formControlName="smSelect">
                    <option value="">Small select</option>
                    <option value="1">Option 1</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label for="smBtn" class="form-label">Button</label>
                  <div>
                    <button #smBtn id="smBtn" class="btn btn-sm btn-primary">Small</button>
                  </div>
                </div>
              </div>

              <div class="mt-3">
                <label for="smInputGroup" class="form-label">Input Group (Small)</label>
                <div #smInputGroup class="input-group input-group-sm">
                  <span class="input-group-text">$</span>
                  <input type="text" class="form-control" placeholder="Amount">
                  <span class="input-group-text">.00</span>
                </div>
              </div>

              <!-- Input with no addons -->
              <div class="col-md-4">
                <label class="form-label">No Addons</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="No addons">
                </div>
                <small class="text-muted">Should have rounded borders on both sides</small>
              </div>

              <!-- Input with start addon only -->
              <div class="col-md-4">
                <label class="form-label">Start Addon Only</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="text" class="form-control" placeholder="Start addon only">
                </div>
                <small class="text-muted">Should have rounded border on end side only</small>
              </div>

              <!-- Input with end addon only -->
              <div class="col-md-4">
                <label class="form-label">End Addon Only</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="End addon only">
                  <span class="input-group-text">.00</span>
                </div>
                <small class="text-muted">Should have rounded border on start side only</small>
              </div>

              <!-- Input with both addons -->
              <div class="col-md-4">
                <label class="form-label">Both Addons</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="text" class="form-control" placeholder="Both addons">
                  <span class="input-group-text">.00</span>
                </div>
                <small class="text-muted">Should have no rounded borders on input</small>
              </div>

              <!-- Large input with no addons -->
              <div class="col-md-4">
                <label class="form-label">Large - No Addons</label>
                <div class="input-group input-group-lg">
                  <input type="text" class="form-control" placeholder="Large, no addons">
                </div>
              </div>

              <!-- Small input with no addons -->
              <div class="col-md-4">
                <label class="form-label">Small - No Addons</label>
                <div class="input-group input-group-sm">
                  <input type="text" class="form-control" placeholder="Small, no addons">
                </div>
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
  styles: [
    `
      .input-group {
        margin-bottom: 0.5rem;
      }

      .card {
        overflow: visible;
      }
    `
  ]
})
export class FormTestComponent implements AfterViewInit {
  testForm: FormGroup;
  heightsVisible = false;
  heightMeasurements: any[] = [];

  // Default size elements
  @ViewChild('defaultInput') defaultInput!: ElementRef;
  @ViewChild('defaultSelect') defaultSelect!: ElementRef;
  @ViewChild('defaultBtn') defaultBtn!: ElementRef;
  @ViewChild('defaultInputGroup') defaultInputGroup!: ElementRef;

  // Large size elements
  @ViewChild('lgInput') lgInput!: ElementRef;
  @ViewChild('lgSelect') lgSelect!: ElementRef;
  @ViewChild('lgBtn') lgBtn!: ElementRef;
  @ViewChild('lgInputGroup') lgInputGroup!: ElementRef;

  // Small size elements
  @ViewChild('smInput') smInput!: ElementRef;
  @ViewChild('smSelect') smSelect!: ElementRef;
  @ViewChild('smBtn') smBtn!: ElementRef;
  @ViewChild('smInputGroup') smInputGroup!: ElementRef;

  constructor(
    private fb: FormBuilder,
    public languageService: LanguageService,
    public themeService: ThemeDirectionService
  ) {
    this.testForm = this.fb.group({
      defaultInput: [''],
      defaultSelect: [''],
      lgInput: [''],
      lgSelect: [''],
      smInput: [''],
      smSelect: ['']
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
      // Default size
      { name: 'Default Input', el: this.defaultInput?.nativeElement },
      { name: 'Default Select', el: this.defaultSelect?.nativeElement },
      { name: 'Default Button', el: this.defaultBtn?.nativeElement },
      { name: 'Default Input Group', el: this.defaultInputGroup?.nativeElement },

      // Large size
      { name: 'Large Input', el: this.lgInput?.nativeElement },
      { name: 'Large Select', el: this.lgSelect?.nativeElement },
      { name: 'Large Button', el: this.lgBtn?.nativeElement },
      { name: 'Large Input Group', el: this.lgInputGroup?.nativeElement },

      // Small size
      { name: 'Small Input', el: this.smInput?.nativeElement },
      { name: 'Small Select', el: this.smSelect?.nativeElement },
      { name: 'Small Button', el: this.smBtn?.nativeElement },
      { name: 'Small Input Group', el: this.smInputGroup?.nativeElement },
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

/**
 * Form Height Inspection Script
 * Add this to your Angular project temporarily to test form element heights
 *
 * How to use:
 * 1. Add this script to a component
 * 2. Run the inspectFormElements() function from ngAfterViewInit
 * 3. Check browser console for height information
 */

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-form-inspector',
  standalone: false,
  template: `
    <div class="container mt-5">
      <h2>Form Height Inspector</h2>
      <div class="row g-3 align-items-center">
        <div class="col">
          <input #textInput type="text" class="form-control" placeholder="Text input">
        </div>
        <div class="col">
          <input #dateInput type="date" class="form-control">
        </div>
        <div class="col">
          <select #selectInput class="form-select">
            <option>Select option</option>
          </select>
        </div>
        <div class="col">
          <button #buttonElement class="btn btn-primary">Button</button>
        </div>
      </div>
    </div>
  `
})
export class FormInspectorComponent implements AfterViewInit {
  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild('dateInput') dateInput!: ElementRef;
  @ViewChild('selectInput') selectInput!: ElementRef;
  @ViewChild('buttonElement') buttonElement!: ElementRef;

  ngAfterViewInit() {
    // Wait for rendering to complete
    setTimeout(() => {
      this.inspectFormElements();
    }, 100);
  }

  inspectFormElements() {
    const elements = [
      { name: 'Text Input', el: this.textInput.nativeElement },
      { name: 'Date Input', el: this.dateInput.nativeElement },
      { name: 'Select Input', el: this.selectInput.nativeElement },
      { name: 'Button', el: this.buttonElement.nativeElement }
    ];

    console.group('Form Element Height Inspection');

    elements.forEach(item => {
      const styles = window.getComputedStyle(item.el);
      console.group(item.name);
      console.log('offsetHeight:', item.el.offsetHeight + 'px');
      console.log('clientHeight:', item.el.clientHeight + 'px');
      console.log('getBoundingClientRect().height:', item.el.getBoundingClientRect().height + 'px');
      console.log('computed height:', styles.height);
      console.log('computed line-height:', styles.lineHeight);
      console.log('computed padding-top:', styles.paddingTop);
      console.log('computed padding-bottom:', styles.paddingBottom);
      console.log('computed border-top-width:', styles.borderTopWidth);
      console.log('computed border-bottom-width:', styles.borderBottomWidth);
      console.log('computed box-sizing:', styles.boxSizing);
      console.log('HTML:', item.el.outerHTML);
      console.groupEnd();
    });

    console.log('Environment:');
    console.log('Browser:', navigator.userAgent);
    console.log('Direction:', document.dir);
    console.log('Language:', document.documentElement.lang);

    console.groupEnd();
  }
}

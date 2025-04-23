import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * A simple directive to apply RTL/LTR direction to elements.
 * This directive sets the dir attribute and RTL/LTR classes.
 */
@Directive({
  selector: '[appRtlSupport]',
  standalone: false
})
export class RtlSupportDirective implements OnChanges {
  @Input() appRtlSupport: 'rtl' | 'ltr' = 'ltr';

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appRtlSupport']) {
      this.applyDirection();
    }
  }

  private applyDirection(): void {
    const element = this.el.nativeElement;

    // Set the direction attribute
    element.setAttribute('dir', this.appRtlSupport);

    // Add appropriate class and remove opposite
    if (this.appRtlSupport === 'rtl') {
      element.classList.add('rtl');
      element.classList.remove('ltr');
    } else {
      element.classList.add('ltr');
      element.classList.remove('rtl');
    }
  }
}

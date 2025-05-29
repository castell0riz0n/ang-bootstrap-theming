import { Injectable } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  query,
  stagger,
  keyframes,
  AnimationBuilder,
  AnimationFactory,
  AnimationPlayer
} from '@angular/animations';

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  stagger?: number;
}

export interface StickyAnimationState {
  show: AnimationConfig;
  hide: AnimationConfig;
  enter: AnimationConfig;
  leave: AnimationConfig;
}

@Injectable({
  providedIn: 'root'
})
export class StickyAnimationsService {
  private animationPlayers = new Map<string, AnimationPlayer>();

  // Predefined animation configurations
  private animationPresets: { [key: string]: StickyAnimationState } = {
    default: {
      show: { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      hide: { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      enter: { duration: 400, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' },
      leave: { duration: 250, easing: 'cubic-bezier(0.4, 0, 1, 1)' }
    },
    smooth: {
      show: { duration: 400, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' },
      hide: { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      enter: { duration: 500, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' },
      leave: { duration: 350, easing: 'cubic-bezier(0.4, 0, 1, 1)' }
    },
    snappy: {
      show: { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      hide: { duration: 150, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
      enter: { duration: 250, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' },
      leave: { duration: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)' }
    },
    mobile: {
      show: { duration: 250, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      hide: { duration: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
      enter: { duration: 300, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' },
      leave: { duration: 250, easing: 'cubic-bezier(0.4, 0, 1, 1)' }
    }
  };

  constructor(private animationBuilder: AnimationBuilder) {}

  // Main sticky animations for Angular components
  static stickyAnimations = [
    // Sticky container show/hide
    trigger('stickyContainer', [
      state('hidden', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('hidden => visible', [
        animate('{{ duration }}ms {{ easing }}')
      ]),
      transition('visible => hidden', [
        animate('{{ duration }}ms {{ easing }}')
      ])
    ]),

    // Individual section animations
    trigger('stickySection', [
      state('enter', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      state('leave', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      transition(':enter', [
        style({
          transform: 'translateY(-100%)',
          opacity: 0
        }),
        animate('{{ enterDuration }}ms {{ enterEasing }}', style({
          transform: 'translateY(0)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        animate('{{ leaveDuration }}ms {{ leaveEasing }}', style({
          transform: 'translateY(-100%)',
          opacity: 0
        }))
      ])
    ]),

    // Staggered sections animation
    trigger('staggeredSections', [
      transition('* => *', [
        query('.sticky-section:enter', [
          style({ transform: 'translateY(-100%)', opacity: 0 }),
          stagger('50ms', [
            animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
              style({ transform: 'translateY(0)', opacity: 1 })
            )
          ])
        ], { optional: true })
      ])
    ]),

    // Breadcrumb animations
    trigger('breadcrumbItems', [
      transition('* => *', [
        query('.breadcrumb-item:enter', [
          style({ transform: 'translateX(-20px)', opacity: 0 }),
          stagger('100ms', [
            animate('200ms ease-out',
              style({ transform: 'translateX(0)', opacity: 1 })
            )
          ])
        ], { optional: true }),
        query('.breadcrumb-item:leave', [
          stagger('50ms', [
            animate('150ms ease-in',
              style({ transform: 'translateX(20px)', opacity: 0 })
            )
          ])
        ], { optional: true })
      ])
    ]),

    // Slide animations for mobile
    trigger('slideFromTop', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 1, 1)',
          style({ transform: 'translateY(-100%)' })
        )
      ])
    ]),

    // Fade animations
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-out', style({ opacity: 0 }))
      ])
    ]),

    // Scale animations for interactive elements
    trigger('scaleOnHover', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.05)' })),
      transition('normal <=> hovered', [
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),

    // Progress bar animation
    trigger('progressGrow', [
      transition(':enter', [
        style({ width: '0%' }),
        animate('{{ duration }}ms ease-out', style({ width: '{{ width }}%' }))
      ])
    ]),

    // Bounce animation for notifications
    trigger('bounceIn', [
      transition(':enter', [
        animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', keyframes([
          style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
          style({ transform: 'scale(1.1)', opacity: 0.8, offset: 0.6 }),
          style({ transform: 'scale(0.95)', opacity: 0.9, offset: 0.8 }),
          style({ transform: 'scale(1)', opacity: 1, offset: 1 })
        ]))
      ])
    ])
  ];

  /**
   * Create custom animation for sticky elements
   */
  createStickyAnimation(
    element: HTMLElement,
    animationType: 'show' | 'hide' | 'enter' | 'leave',
    preset: string = 'default'
  ): AnimationPlayer {
    const config = this.animationPresets[preset]?.[animationType] || this.animationPresets['default'][animationType];

    let animationFactory: AnimationFactory;

    switch (animationType) {
      case 'show':
        animationFactory = this.animationBuilder.build([
          style({ transform: 'translateY(-100%)', opacity: 0 }),
          animate(`${config.duration}ms ${config.easing}`,
            style({ transform: 'translateY(0)', opacity: 1 })
          )
        ]);
        break;

      case 'hide':
        animationFactory = this.animationBuilder.build([
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate(`${config.duration}ms ${config.easing}`,
            style({ transform: 'translateY(-100%)', opacity: 0 })
          )
        ]);
        break;

      case 'enter':
        animationFactory = this.animationBuilder.build([
          style({ transform: 'scale(0.9) translateY(-20px)', opacity: 0 }),
          animate(`${config.duration}ms ${config.easing}`,
            style({ transform: 'scale(1) translateY(0)', opacity: 1 })
          )
        ]);
        break;

      case 'leave':
        animationFactory = this.animationBuilder.build([
          style({ transform: 'scale(1) translateY(0)', opacity: 1 }),
          animate(`${config.duration}ms ${config.easing}`,
            style({ transform: 'scale(0.9) translateY(-20px)', opacity: 0 })
          )
        ]);
        break;
    }

    const player = animationFactory.create(element);
    this.animationPlayers.set(`${element.id}-${animationType}`, player);

    return player;
  }

  /**
   * Get animation preset configuration
   */
  getAnimationPreset(name: string): StickyAnimationState | null {
    return this.animationPresets[name] || null;
  }

  /**
   * Set custom animation preset
   */
  setAnimationPreset(name: string, config: StickyAnimationState): void {
    this.animationPresets[name] = config;
  }

  /**
   * Stop all running animations
   */
  stopAllAnimations(): void {
    this.animationPlayers.forEach(player => {
      if (player.hasStarted()) {
        player.destroy();
      }
    });
    this.animationPlayers.clear();
  }

  /**
   * Check if reduced motion is preferred
   */
  isReducedMotionPreferred(): boolean {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get appropriate animation configuration based on device capabilities
   */
  getOptimalAnimationConfig(): string {
    if (this.isReducedMotionPreferred()) {
      return 'minimal'; // Would need to be defined
    }

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowPerformance = this.isLowPerformanceDevice();

    if (isMobile || isLowPerformance) {
      return 'mobile';
    }

    return 'default';
  }

  private isLowPerformanceDevice(): boolean {
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;

    return (memory && memory < 4) || (cores && cores < 4);
  }
}

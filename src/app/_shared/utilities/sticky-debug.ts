import {StickyLayoutService} from '../../_core/services/sticky-layout.service';

export class StickyDebugger {
  private static instance: StickyDebugger;
  private debugMode = false;

  static getInstance(): StickyDebugger {
    if (!StickyDebugger.instance) {
      StickyDebugger.instance = new StickyDebugger();
    }
    return StickyDebugger.instance;
  }

  enableDebugMode(): void {
    this.debugMode = true;
    document.body.classList.add('sticky-debug-mode');
    this.attachDebugInfo();
  }

  disableDebugMode(): void {
    this.debugMode = false;
    document.body.classList.remove('sticky-debug-mode');
    this.removeDebugInfo();
  }

  logStickyState(service: StickyLayoutService): void {
    if (!this.debugMode) return;

    const state = {
      enabledComponents: service.getEnabledComponents(),
      totalHeight: service.getTotalStickyHeight(),
      stickyOffsets: service.getStickyOffsets()
    };

    console.group('🔧 Sticky System Debug');
    console.table(state.enabledComponents);
    console.log('Total Height:', state.totalHeight);
    console.log('Offsets:', state.stickyOffsets);
    console.groupEnd();
  }

  private attachDebugInfo(): void {
    const sections = document.querySelectorAll('.sticky-section');
    sections.forEach((section, index) => {
      const debugInfo = document.createElement('div');
      debugInfo.className = 'sticky-debug-overlay';
      debugInfo.innerHTML = `
        <div>Section ${index + 1}</div>
        <div>Height: ${section.clientHeight}px</div>
        <div>Z-Index: ${getComputedStyle(section).zIndex}</div>
      `;
      section.appendChild(debugInfo);
    });
  }

  private removeDebugInfo(): void {
    const overlays = document.querySelectorAll('.sticky-debug-overlay');
    overlays.forEach(overlay => overlay.remove());
  }
}

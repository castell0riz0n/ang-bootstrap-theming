import {StickyLayoutConfig} from '../services/sticky-layout.service';

export class StickyConfigValidator {
  static validate(config: StickyLayoutConfig): string[] {
    const errors: string[] = [];

    // Check for duplicate orders
    const orders = Object.values(config).map(c => c.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      errors.push(`Duplicate component orders found: ${duplicateOrders.join(', ')}`);
    }

    // Check z-index conflicts
    const zIndexes = Object.values(config).map(c => c.zIndex).filter(Boolean);
    const duplicateZIndexes = zIndexes.filter((z, index) => zIndexes.indexOf(z) !== index);
    if (duplicateZIndexes.length > 0) {
      errors.push(`Duplicate z-index values found: ${duplicateZIndexes.join(', ')}`);
    }

    // Validate order sequence
    const enabledComponents = Object.values(config).filter(c => c.enabled);
    const sortedOrders = enabledComponents.map(c => c.order).sort((a, b) => a - b);
    if (sortedOrders.some((order, index) => index > 0 && order <= sortedOrders[index - 1])) {
      errors.push('Component orders should be sequential for enabled components');
    }

    return errors;
  }

  static autoFix(config: StickyLayoutConfig): StickyLayoutConfig {
    const fixedConfig = { ...config };
    const enabledComponents = Object.values(fixedConfig).filter(c => c.enabled);

    // Auto-fix orders
    enabledComponents
      .sort((a, b) => a.order - b.order)
      .forEach((component, index) => {
        component.order = index + 1;
      });

    // Auto-fix z-indexes
    enabledComponents.forEach((component, index) => {
      component.zIndex = 1030 - (index * 5);
    });

    return fixedConfig;
  }
}

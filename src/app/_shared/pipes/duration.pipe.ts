import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: false
})
export class DurationPipe implements PipeTransform {
  transform(value: string | number, format: 'long' | 'short' = 'long'): string {
    // If the value is already formatted as "Xh Ym", just return it
    if (typeof value === 'string' && /^\d+h\s\d+m$/.test(value)) {
      return value;
    }
    
    // Convert string minutes to number if needed
    let minutes: number;
    if (typeof value === 'string') {
      minutes = parseInt(value, 10);
    } else {
      minutes = value;
    }
    
    if (isNaN(minutes)) {
      return '';
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (format === 'short') {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      // Long format
      const hourText = hours === 1 ? 'hour' : 'hours';
      const minuteText = remainingMinutes === 1 ? 'minute' : 'minutes';
      
      if (hours === 0) {
        return `${remainingMinutes} ${minuteText}`;
      } else if (remainingMinutes === 0) {
        return `${hours} ${hourText}`;
      } else {
        return `${hours} ${hourText} ${remainingMinutes} ${minuteText}`;
      }
    }
  }
}
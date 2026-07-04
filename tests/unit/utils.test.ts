import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatCurrency, formatNumber, generateId, cn } from '@/utils';

describe('formatDate', () => {
  it('should format date string with default format', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('2024-01-15');
  });

  it('should format Date object with default format', () => {
    const date = new Date('2024-06-20T10:30:00');
    const result = formatDate(date);
    expect(result).toBe('2024-06-20');
  });

  it('should format with custom format string', () => {
    const result = formatDate('2024-01-15', 'YYYY/MM/DD');
    expect(result).toBe('2024/01/15');
  });

  it('should handle year-month-day format', () => {
    const result = formatDate('2024-12-31', 'YYYY年MM月DD日');
    expect(result).toBe('2024年12月31日');
  });

  it('should return Invalid Date for invalid input', () => {
    const result = formatDate('not-a-date');
    expect(result).toContain('Invalid Date');
  });
});

describe('formatDateTime', () => {
  it('should format date string with datetime format', () => {
    const result = formatDateTime('2024-01-15T14:30:45');
    expect(result).toBe('2024-01-15 14:30:45');
  });

  it('should format Date object with datetime format', () => {
    const date = new Date('2024-06-20T08:05:09');
    const result = formatDateTime(date);
    expect(result).toBe('2024-06-20 08:05:09');
  });

  it('should pad single-digit hours, minutes, seconds', () => {
    const result = formatDateTime('2024-01-01T01:02:03');
    expect(result).toBe('2024-01-01 01:02:03');
  });
});

describe('formatCurrency', () => {
  it('should format positive amount in CNY', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('¥');
    expect(result).toContain('1,234.56');
  });

  it('should format zero amount', () => {
    const result = formatCurrency(0);
    expect(result).toContain('¥');
    expect(result).toContain('0.00');
  });

  it('should format negative amount', () => {
    const result = formatCurrency(-500.5);
    expect(result).toContain('¥');
    expect(result).toContain('500.50');
    expect(result.startsWith('-') || result.includes('-')).toBe(true);
  });

  it('should format large numbers with thousand separators', () => {
    const result = formatCurrency(1234567.89);
    expect(result).toContain('1,234,567.89');
  });

  it('should round to 2 decimal places', () => {
    const result = formatCurrency(100.123);
    expect(result).toContain('100.12');
  });
});

describe('formatNumber', () => {
  it('should format integer with thousand separators', () => {
    const result = formatNumber(1234567);
    expect(result).toBe('1,234,567');
  });

  it('should format decimal number', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('1,234.56');
  });

  it('should format zero', () => {
    const result = formatNumber(0);
    expect(result).toBe('0');
  });

  it('should format negative number', () => {
    const result = formatNumber(-9999);
    expect(result).toBe('-9,999');
  });

  it('should format very large number', () => {
    const result = formatNumber(1000000000);
    expect(result).toBe('1,000,000,000');
  });
});

describe('generateId', () => {
  it('should generate a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs on each call', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it('should generate IDs of reasonable length', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1.length).toBeGreaterThanOrEqual(10);
    expect(id2.length).toBeGreaterThanOrEqual(10);
  });

  it('should not contain uppercase characters', () => {
    const id = generateId();
    expect(id).toBe(id.toLowerCase());
  });
});

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toContain('foo');
    expect(result).toContain('bar');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', { active: true, disabled: false });
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
  });

  it('should handle undefined and null', () => {
    const result = cn('foo', undefined, null, 'bar');
    expect(result).toContain('foo');
    expect(result).toContain('bar');
  });

  it('should merge conflicting tailwind classes', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});

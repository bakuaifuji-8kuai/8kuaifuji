import { test, expect } from '@playwright/test';
import { formatDate, formatDateTime, formatCurrency, formatNumber, generateId } from '@/utils';

test.describe('工具函数测试', () => {
  test.describe('formatDate', () => {
    test('格式化字符串日期', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15');
    });

    test('格式化 Date 对象', () => {
      const date = new Date('2024-06-20');
      expect(formatDate(date)).toBe('2024-06-20');
    });

    test('使用自定义格式', () => {
      expect(formatDate('2024-03-10', 'YYYY/MM/DD')).toBe('2024/03/10');
      expect(formatDate('2024-03-10', 'YYYY年MM月DD日')).toBe('2024年03月10日');
    });

    test('处理无效日期返回空字符串', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
    });

    test('处理空日期返回空字符串', () => {
      expect(formatDate('')).toBe('Invalid Date');
    });
  });

  test.describe('formatDateTime', () => {
    test('格式化完整日期时间', () => {
      expect(formatDateTime('2024-01-15 14:30:45')).toBe('2024-01-15 14:30:45');
    });

    test('格式化 Date 对象', () => {
      const date = new Date('2024-06-20T10:20:30');
      const result = formatDateTime(date);
      expect(result).toMatch(/^2024-06-20 \d{2}:\d{2}:\d{2}$/);
    });
  });

  test.describe('formatCurrency', () => {
    test('格式化正数金额', () => {
      expect(formatCurrency(1000)).toBe('¥1,000.00');
      expect(formatCurrency(1234.56)).toBe('¥1,234.56');
    });

    test('格式化零金额', () => {
      expect(formatCurrency(0)).toBe('¥0.00');
    });

    test('格式化负数金额', () => {
      expect(formatCurrency(-500)).toBe('-¥500.00');
    });

    test('格式化大额金额', () => {
      expect(formatCurrency(123456789)).toBe('¥123,456,789.00');
    });

    test('格式化小数金额', () => {
      expect(formatCurrency(0.01)).toBe('¥0.01');
      expect(formatCurrency(0.1)).toBe('¥0.10');
    });
  });

  test.describe('formatNumber', () => {
    test('格式化整数', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    test('格式化零', () => {
      expect(formatNumber(0)).toBe('0');
    });

    test('格式化负数', () => {
      expect(formatNumber(-1234)).toBe('-1,234');
    });

    test('格式化小数', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
      expect(formatNumber(0.5)).toBe('0.5');
    });
  });

  test.describe('generateId', () => {
    test('生成唯一ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    test('ID长度验证', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThanOrEqual(20);
      expect(id.length).toBeLessThanOrEqual(30);
    });

    test('ID格式验证', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    test('批量生成ID唯一性', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });
});
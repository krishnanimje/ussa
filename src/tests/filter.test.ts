import { describe, it, expect } from 'vitest';
import { getProperties } from '../lib/store';

describe('Property Filtering', () => {
  it('returns all properties when no filter is applied', async () => {
    const list = await getProperties();
    expect(list.length).toBeGreaterThanOrEqual(8);
  });

  it('filters properties by neighborhood correctly', async () => {
    const list = await getProperties({ neighborhood: 'North Park' });
    expect(list.length).toBeGreaterThan(0);
    list.forEach(p => {
      expect(p.neighborhood.toLowerCase()).toBe('north park');
    });
  });

  it('filters properties by VA eligibility', async () => {
    const list = await getProperties({ isVaEligible: true });
    expect(list.length).toBeGreaterThan(0);
    list.forEach(p => {
      expect(p.is_va_eligible).toBe(true);
    });
  });

  it('filters properties by pool amenity', async () => {
    const list = await getProperties({ hasPool: true });
    expect(list.length).toBeGreaterThan(0);
    list.forEach(p => {
      expect(p.has_pool).toBe(true);
    });
  });

  it('filters properties by fixer-upper investment status', async () => {
    const list = await getProperties({ isFixerUpper: true });
    expect(list.length).toBeGreaterThan(0);
    list.forEach(p => {
      expect(p.is_fixer_upper).toBe(true);
      expect(p.arv_estimate).toBeDefined();
    });
  });
});

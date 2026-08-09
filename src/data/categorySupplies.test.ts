import { describe, expect, it } from 'vitest';
import { CATEGORY_SUPPLIES, type SupplyOption } from './categorySupplies';

const categories = Object.keys(CATEGORY_SUPPLIES);
const allOptions: SupplyOption[] = Object.values(CATEGORY_SUPPLIES).flat();

describe('CATEGORY_SUPPLIES', () => {
  it('exposes every lesson category the config UI offers', () => {
    expect(categories).toEqual(
      expect.arrayContaining([
        'Circuitry',
        'Software',
        'Hardware',
        'Engineering',
        'Science',
        'Art',
        'Math',
      ]),
    );
  });

  it('gives every category at least one supply', () => {
    for (const [category, options] of Object.entries(CATEGORY_SUPPLIES)) {
      expect(options.length, `${category} has no supplies`).toBeGreaterThan(0);
    }
  });

  it('ends every category with an "Other" escape hatch', () => {
    // The UI relies on "Other" to reveal the free-text supply input. A category
    // missing it would trap the instructor in the preset list.
    for (const [category, options] of Object.entries(CATEGORY_SUPPLIES)) {
      expect(
        options.some(option => option.id === 'Other'),
        `${category} is missing an "Other" option`,
      ).toBe(true);
    }
  });

  it('keeps supply ids unique within a category', () => {
    // Duplicate ids would make toggleSupply select/deselect two chips at once.
    for (const [category, options] of Object.entries(CATEGORY_SUPPLIES)) {
      const ids = options.map(option => option.id);
      expect(new Set(ids).size, `${category} has duplicate supply ids`).toBe(ids.length);
    }
  });

  it('gives every supply a non-empty id, label, and icon', () => {
    for (const option of allOptions) {
      expect(option.id.trim()).not.toBe('');
      expect(option.label.trim()).not.toBe('');
      expect(option.icon.trim()).not.toBe('');
    }
  });
});

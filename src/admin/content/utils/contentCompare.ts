/**
 * Deep equality check for content values (string, number, array, object, null)
 * Returns true if draft_value is functionally identical to published_value.
 */
export const isContentEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  // Handle strings (normalize trailing whitespaces)
  if (typeof a === 'string' && typeof b === 'string') {
    return a.trim() === b.trim();
  }

  if (typeof a !== typeof b) return false;

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isContentEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Handle Objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!isContentEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
};

/**
 * Returns true if draft_value has unpublished changes compared to published_value
 */
export const hasUnpublishedChanges = (draftValue: any, publishedValue: any): boolean => {
  return !isContentEqual(draftValue, publishedValue);
};

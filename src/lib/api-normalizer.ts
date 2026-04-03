/**
 * Shared API response normalization utilities.
 *
 * Backend responses may use camelCase or PascalCase keys. These helpers
 * make it safe to extract values regardless of key casing without
 * casting to `any`.
 */

/**
 * Safely cast an unknown value to a plain record.
 * Returns an empty record when the value is not an object.
 */
export function asRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object') {
        return value as Record<string, unknown>;
    }

    return {};
}

/**
 * Read the first non-empty string value found under any of the given keys.
 */
export function pickString(source: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return '';
}

/**
 * Read the first finite number found under any of the given keys.
 * Also handles stringified numbers (e.g. `"42"`).
 * Returns `fallback` when no valid number is found.
 */
export function pickNumber(source: Record<string, unknown>, fallback: number, ...keys: string[]): number {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string' && value.trim()) {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return fallback;
}

/**
 * Locate an array within a potentially nested payload. Checks the
 * given `keys` at each level and recurses one level deep.
 */
export function findArrayInPayload(payload: unknown, keys: string[]): unknown[] {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const record = payload as Record<string, unknown>;

    for (const key of keys) {
        const value = record[key];
        if (Array.isArray(value)) {
            return value;
        }
    }

    for (const key of keys) {
        const value = record[key];
        const nested = findArrayInPayload(value, keys);
        if (nested.length > 0) {
            return nested;
        }
    }

    return [];
}

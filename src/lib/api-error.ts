/**
 * Shared utility for reading error messages from API responses.
 * Consolidates duplicate implementations from:
 * - course-content-service.ts
 * - dept-head/training-service.ts
 * - learning-quiz-service.ts
 */

/**
 * Safely extract a human-readable error message from a failed API `Response`.
 * Handles JSON bodies with `message`, `Message`, `title`, `detail`, and `errors` fields.
 *
 * @param response - The failed fetch Response
 * @param fallback - Fallback message if body cannot be parsed
 * @returns A user-friendly error string
 */
export async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body = await response.text();
        if (!body) {
            return fallback;
        }

        try {
            const json = JSON.parse(body) as {
                message?: string;
                Message?: string;
                title?: string;
                detail?: string;
                errors?: Record<string, string[] | string>;
            };

            const primary = json.message ?? json.Message ?? json.title ?? json.detail;

            // Handle validation errors object (e.g. FluentValidation / ASP.NET)
            if (json.errors && typeof json.errors === 'object') {
                const entries = Object.entries(json.errors)
                    .map(([field, value]) => {
                        if (Array.isArray(value)) {
                            return `${field}: ${value.join(', ')}`;
                        }
                        return `${field}: ${String(value)}`;
                    })
                    .filter(Boolean);

                if (entries.length > 0) {
                    return primary ? `${primary} | ${entries.join(' | ')}` : entries.join(' | ');
                }
            }

            if (primary) {
                return primary;
            }

            return body;
        } catch {
            return body;
        }
    } catch {
        return fallback;
    }
}

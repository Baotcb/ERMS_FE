export function handleApiError(
    error: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toastFn: (props: any) => any,
    defaultTitle: string = 'Lỗi',
    defaultMessage: string = 'Đã xảy ra lỗi không xác định',
    fallbackHint?: string
) {
    const rawMessage = error instanceof Error ? error.message : defaultMessage;
    
    // Attempt to extract more structured error message from API if available
    let detailedMessage = rawMessage;
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const errorObj = error as Record<string, unknown>;
        const responseData = (errorObj.response as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
        if (responseData?.message) {
            detailedMessage = String(responseData.message);
        } else if ((errorObj.response as Record<string, unknown>)?.statusText) {
            detailedMessage = `${(errorObj.response as Record<string, unknown>).statusText} (${(errorObj.response as Record<string, unknown>).status})`;
        }
    }

    const description = fallbackHint ? `${detailedMessage} ${fallbackHint}` : detailedMessage;

    toastFn({
        title: defaultTitle,
        description,
        variant: 'destructive',
    });
    
    // Re-throw if the caller wants to handle it further, 
    // but typically we just use this to show the toast.
}

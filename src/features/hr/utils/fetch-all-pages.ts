export async function fetchAllPages<T>(
    fetcher: (page: number, pageSize: number) => Promise<{ items: T[]; totalCount?: number }>
): Promise<T[]> {
    const pageSize = 50;
    const allItems: T[] = [];
    let page = 1;

    while (true) {
        try {
            const response = await fetcher(page, pageSize);
            
            // Add items from this page
            if (response.items && Array.isArray(response.items)) {
                allItems.push(...response.items);
            }

            // Stop if there are no items or we got less than requested (meaning it's the last page)
            // or if we have collected all items according to totalCount
            const hasNoItems = !response.items || response.items.length === 0;
            const hasLessThanPageSize = response.items && response.items.length < pageSize;
            const hasAllTotalCount = typeof response.totalCount === 'number' && allItems.length >= response.totalCount;

            if (hasNoItems || hasLessThanPageSize || hasAllTotalCount) {
                break;
            }

            page += 1;
        } catch (error) {
            console.error('Error in fetchAllPages for page', page, error);
            break; // Break on error to avoid infinite loops
        }
    }

    return allItems;
}

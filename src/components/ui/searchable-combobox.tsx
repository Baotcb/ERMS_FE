import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

// Custom debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export interface SearchableComboboxProps<T> {
    /** The currently selected value (e.g. ID) */
    value?: string;
    /** Triggered when an item is selected */
    onValueChange: (value: string, item?: T) => void;
    /** The function to fetch a page of items */
    fetcher: (search: string, page: number) => Promise<{ items: T[]; hasNextPage: boolean }>;
    /** How to display the item in the list and the trigger button */
    renderItem: (item: T) => React.ReactNode;
    /** How to extract the unique value (ID) from the item */
    extractValue: (item: T) => string;
    /** Initial options to show if available (avoids empty flash) */
    defaultItems?: T[];
    
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableCombobox<T>({
    value,
    onValueChange,
    fetcher,
    renderItem,
    extractValue,
    defaultItems = [],
    placeholder = 'Chọn một tùy chọn...',
    searchPlaceholder = 'Tìm kiếm...',
    emptyMessage = 'Không tìm thấy kết quả.',
    className,
    disabled = false,
}: SearchableComboboxProps<T>) {
    const [open, setOpen] = React.useState(false);
    
    // Data state
    const [items, setItems] = React.useState<T[]>(defaultItems);
    const [page, setPage] = React.useState(1);
    const [hasNextPage, setHasNextPage] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    
    // Search state
    const [searchTerm, setSearchTerm] = React.useState('');
    const debouncedSearch = useDebounceValue(searchTerm, 300);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Track selected item for the trigger display
    const selectedItem = React.useMemo(() => {
        return items.find((item) => extractValue(item) === value);
    }, [items, value, extractValue]);

    // Fetch initial/search data
    React.useEffect(() => {
        if (!open) return; // Only fetch when open to save bandwidth

        let isMounted = true;
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const res = await fetcher(debouncedSearch, 1);
                if (isMounted) {
                    setItems(res.items);
                    setHasNextPage(res.hasNextPage);
                    setPage(1);
                }
            } catch (err) {
                console.error('[Combobox] Failed to fetch:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadInitialData();
        return () => {
            isMounted = false;
        };
    }, [debouncedSearch, open, fetcher]);

    // Load more data
    const handleLoadMore = React.useCallback(async () => {
        if (isLoading || !hasNextPage) return;
        
        setIsLoading(true);
        try {
            const nextPage = page + 1;
            const res = await fetcher(debouncedSearch, nextPage);
            setItems((prev) => {
                // remove duplicates just in case
                const existingIds = new Set(prev.map(extractValue));
                const newItems = res.items.filter((item) => !existingIds.has(extractValue(item)));
                return [...prev, ...newItems];
            });
            setHasNextPage(res.hasNextPage);
            setPage(nextPage);
        } catch (err) {
            console.error('[Combobox] Failed to fetch more:', err);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, page, hasNextPage, isLoading, fetcher, extractValue]);

    // Handle Native Scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 50 && hasNextPage && !isLoading) {
            handleLoadMore();
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn('w-full justify-between font-normal bg-white', className, !value && 'text-muted-foreground')}
                >
                    <span className="truncate">
                        {value && selectedItem ? renderItem(selectedItem) : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="flex flex-col h-full max-h-[300px]">
                    <div className="flex items-center border-b px-3 sticky top-0 bg-white z-10">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                        />
                    </div>
                    <div 
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="overflow-auto flex-1 p-1"
                    >
                        {items.length === 0 && !isLoading ? (
                            <div className="py-6 text-center text-sm text-gray-500">
                                {emptyMessage}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {items.map((item) => {
                                    const itemValue = extractValue(item);
                                    const isSelected = value === itemValue;
                                    return (
                                        <div
                                            key={itemValue}
                                            onClick={() => {
                                                onValueChange(itemValue, item);
                                                setOpen(false);
                                            }}
                                            className={cn(
                                                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100/80 transition-colors',
                                                isSelected && 'bg-blue-50/50 text-[#0F4C75] font-medium'
                                            )}
                                        >
                                            <span className="flex-1 truncate pr-6">{renderItem(item)}</span>
                                            {isSelected && (
                                                <Check className="absolute right-2 flex h-4 w-4 items-center justify-center text-[#0F4C75]" />
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {/* Loading indicator */}
                                {isLoading && (
                                    <div className="py-3 flex justify-center">
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

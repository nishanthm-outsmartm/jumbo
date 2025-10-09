import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';

interface UsePaginatedDataOptions<T> {
    fetchFunction: (page: number, limit: number) => Promise<T[]>;
    initialLimit?: number;
    enabled?: boolean;
    onError?: (error: Error) => void;
}

interface UsePaginatedDataReturn<T> {
    data: T[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    limit: number;
    loadMore: () => void;
    refresh: () => void;
    setLimit: (limit: number) => void;
}

// export function usePaginatedData<T>({
//     fetchFunction,
//     initialLimit = 10,
//     enabled = true,
//     onError,
// }: UsePaginatedDataOptions<T>): UsePaginatedDataReturn<T> {
//     const [data, setData] = useState<T[]>([]);
//     const [error, setError] = useState<string | null>(null);
//     const [isInitialLoad, setIsInitialLoad] = useState(true);

//     const {
//         page,
//         limit,
//         hasMore,
//         isLoading,
//         nextPage,
//         setHasMore,
//         setIsLoading,
//         setLimit,
//         reset,
//     } = usePagination({ initialLimit });

//     const fetchData = useCallback(async (pageNum: number, limitNum: number, append = false) => {
//         if (!enabled) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             const newData = await fetchFunction(pageNum, limitNum);

//             if (append) {
//                 setData(prev => [...prev, ...newData]);
//             } else {
//                 setData(newData);
//             }

//             // If we got less data than requested, there's no more data
//             setHasMore(newData.length === limitNum);
//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
//             setError(errorMessage);
//             onError?.(err instanceof Error ? err : new Error(errorMessage));
//         } finally {
//             setIsLoading(false);
//             setIsInitialLoad(false);
//         }
//     }, [fetchFunction, enabled, limit, onError, setHasMore]);

//     const loadMore = useCallback(() => {
//         if (!isLoading && hasMore) {
//             nextPage();
//         }
//     }, [isLoading, hasMore, nextPage]);

//     const refresh = useCallback(() => {
//         setData([]);
//         setError(null);
//         reset();
//         setIsInitialLoad(true);
//     }, [reset]);

//     // Fetch data when page or limit changes
//     useEffect(() => {
//         if (page === 1) {
//             fetchData(page, limit, false);
//         } else {
//             fetchData(page, limit, true);
//         }
//     }, [page, limit, fetchData]);

//     return {
//         data,
//         isLoading: isLoading && isInitialLoad,
//         error,
//         hasMore,
//         page,
//         limit,
//         loadMore,
//         refresh,
//         setLimit,
//     };
// }
// Alternative: If you want to keep your existing hook structure but make it more optimal
export function usePaginatedData<T>({
    fetchFunction,
    initialLimit = 10,
    enabled = true,
    onError,
}: Omit<UsePaginatedDataOptions<T>, 'queryKey'>) {
    const [data, setData] = useState<T[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce rapid consecutive calls
    const [lastFetchTime, setLastFetchTime] = useState(0);

    const fetchData = useCallback(async (pageNum: number, limitNum: number, append = false) => {
        if (!enabled) return;

        // Prevent duplicate requests within 100ms
        const now = Date.now();
        if (now - lastFetchTime < 100) return;
        setLastFetchTime(now);

        setIsLoading(true);
        if (!append) setError(null);

        try {
            const newData = await fetchFunction(pageNum, limitNum);

            setData(prev => append ? [...prev, ...newData] : newData);
            setHasMore(newData.length === limitNum);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        } finally {
            setIsLoading(false);
            if (isInitialLoad) setIsInitialLoad(false);
        }
    }, [fetchFunction, enabled, onError, isInitialLoad, lastFetchTime]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchData(nextPage, initialLimit, true);
        }
    }, [isLoading, hasMore, page, initialLimit, fetchData]);

    const refresh = useCallback(() => {
        setData([]);
        setError(null);
        setPage(1);
        setHasMore(true);
        setIsInitialLoad(true);
        fetchData(1, initialLimit, false);
    }, [initialLimit, fetchData]);

    // Only fetch on mount and refresh
    useState(() => {
        if (enabled && isInitialLoad) {
            fetchData(1, initialLimit, false);
        }
    });

    return {
        data,
        isLoading: isLoading && isInitialLoad,
        isFetchingNextPage: isLoading && !isInitialLoad,
        error,
        hasMore,
        loadMore,
        refresh,
    };
}
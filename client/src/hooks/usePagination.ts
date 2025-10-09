import { useState, useCallback } from 'react';

interface UsePaginationOptions {
    initialPage?: number;
    initialLimit?: number;
    maxLimit?: number;
}

interface UsePaginationReturn {
    page: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    isLoading: boolean;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setHasMore: (hasMore: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    reset: () => void;
}

export function usePagination({
    initialPage = 1,
    initialLimit = 10,
    maxLimit = 100,
}: UsePaginationOptions = {}): UsePaginationReturn {
    const [page, setPageState] = useState(initialPage);
    const [limit, setLimitState] = useState(initialLimit);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const offset = (page - 1) * limit;

    const setPage = useCallback((newPage: number) => {
        if (newPage >= 1) {
            setPageState(newPage);
        }
    }, []);

    const setLimit = useCallback((newLimit: number) => {
        if (newLimit > 0 && newLimit <= maxLimit) {
            setLimitState(newLimit);
            setPageState(1); // Reset to first page when changing limit
        }
    }, [maxLimit]);

    const nextPage = useCallback(() => {
        if (hasMore && !isLoading) {
            setPageState(prev => prev + 1);
        }
    }, [hasMore, isLoading]);

    const prevPage = useCallback(() => {
        if (page > 1) {
            setPageState(prev => prev - 1);
        }
    }, [page]);

    const reset = useCallback(() => {
        setPageState(initialPage);
        setLimitState(initialLimit);
        setHasMore(true);
        setIsLoading(false);
    }, [initialPage, initialLimit]);

    return {
        page,
        limit,
        offset,
        hasMore,
        isLoading,
        setPage,
        setLimit,
        nextPage,
        prevPage,
        setHasMore,
        setIsLoading,
        reset,
    };
}

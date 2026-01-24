export type paging = {
    page: number;
    size: number;
    total_page: number;
    total_items: number;
}

export type PaginatedResult<T> = {
    data: T[];
    paging: paging;
}
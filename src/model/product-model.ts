import { Product } from "@prisma/client";

export type ProductResponse = {
    id: string;
    barcode? : string | null;
    name?: string | null;
    description?: string | null;
    price: number;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateProductInput = {
    barcode? : string | null;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
}

export type UpdateProductInput = {
    barcode?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    stock?: number | undefined;
}

export type ProductFilterInput = {
    barcode?: string | undefined;
    name?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minStock?: number | undefined;
    maxStock?: number | undefined;
    orderBy: string;
    sortBy: string;
    page: number ;
    size: number;
}

export function toProductResponse(product: Product): ProductResponse {
    return {
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    }
}
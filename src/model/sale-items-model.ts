import { SaleItem } from "@prisma/client";

export type SaleItemResponse = {
    saleId: string;
    productId: string;
    quantity: number;
    price: number;
    total: number;
    productName: string;
}

export type CreateSaleItemInput = {
    saleId: string;
    productId: string;
    quantity: number;
    price: number;
    total: number;
    productName: string;
}

export function toSaleItemResponse(saleItem: SaleItem): SaleItemResponse {
    return {
        saleId: saleItem.saleId,
        productId: saleItem.productId,
        quantity: saleItem.quantity,
        price: saleItem.price,
        total: saleItem.total,
        productName: saleItem.productName
    }
}
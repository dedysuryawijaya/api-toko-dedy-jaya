import { Sale } from "@prisma/client";
import { CreateSaleItemInput, SaleItemResponse } from "./sale-items-model.js";

export type SaleResponse = {
    id: string;
    orderId: string;
    quantity: number;
    totalPrice: number;
    customer? : string | null;
    saleDate: Date;
    items: Array<SaleItemResponse>;
};

export type CreateSaleRequest = {
    customer : string;
    saleDate: Date;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
}

export type CreateSaleInput = {
    orderId: string;
    quantity: number;
    totalPrice: number;
    customer: string;
    saleDate: Date;
}

export type FilterSaleInput = {
    orderId?: string | undefined;
    minTotalPrice?: number | undefined;
    maxTotalPrice?: number | undefined;
    customer?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    orderBy: string;
    sortBy: string;
    page: number ;
    size: number;
}

export function toSaleResponse(sale: Sale, items: Array<SaleItemResponse>): SaleResponse {
    return {
        id: sale.id,
        orderId: sale.orderId,
        quantity: sale.quantity,
        totalPrice: sale.totalPrice,
        customer: sale.customer,
        saleDate: sale.saleDate,
        items: items
    }
}
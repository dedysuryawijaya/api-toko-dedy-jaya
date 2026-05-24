import { z, ZodType } from "zod";
import { CreateSaleRequest, FilterSaleInput } from "../model/sale-model.js";

export class SaleValidation {

    private static readonly ORDERBY: Array<string> = ['orderId', 'totalPrice', 'customer', 'saleDate', 'createdAt', 'updatedAt'];
    private static readonly SORTBY: Array<string> = ['asc', 'desc'];
    
    static readonly CREATE_SALE: ZodType<CreateSaleRequest> = z.object({
        customer: z.string().min(1),
        cashAmount: z.number().min(0),
        saleDate: z.coerce.date(),
        items: z.array(z.object({
            productId: z.string().min(1),
            quantity: z.number().min(1),
        })).min(1),
    });

    static readonly FILTER_SALE: ZodType<FilterSaleInput> = z.object({
        orderId: z.string().min(1).optional(),
        minTotalPrice: z.number().min(0).optional(),
        maxTotalPrice: z.number().min(0).optional(),
        customer: z.string().min(1).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        orderBy: z.enum(SaleValidation.ORDERBY),
        sortBy: z.enum(SaleValidation.SORTBY),
        page: z.number().min(1).positive(),
        size: z.number().min(1).positive(),
    });
}
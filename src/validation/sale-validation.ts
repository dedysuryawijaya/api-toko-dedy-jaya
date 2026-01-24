import { z, ZodType } from "zod";
import { CreateSaleRequest } from "../model/sale-model.js";

export class SaleValidation {
    
    static readonly CREATE_SALE: ZodType<CreateSaleRequest> = z.object({
        customer: z.string().min(1),
        saleDate: z.coerce.date(),
        items: z.array(z.object({
            productId: z.string().min(1),
            quantity: z.number().min(1),
        })).min(1),
    });
}
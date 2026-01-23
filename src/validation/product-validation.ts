import { z, ZodType } from "zod";
import { CreateProduct, UpdateProduct } from "../model/product-model.js";

export class ProductValidation {
    
    static readonly CREATE_PRODUCT: ZodType<CreateProduct> = z.object({
        barcode: z.string().min(1, 'Barcode is required').nullable(),
        name: z.string().min(1, 'Name is required'),
        description: z.string().nullable(),
        price: z.number().min(0, 'Price must be a positive number'),
        stock: z.number().min(0, 'Stock must be a positive number'),
    });

    static readonly UPDATE_PRODUCT: ZodType<UpdateProduct> = z.object({
        barcode: z.string().min(1, 'Barcode is required').optional(),
        name: z.string().min(1, 'Name is required').optional(),
        description: z.string().optional(),
        price: z.number().min(0, 'Price must be a positive number').optional(),
        stock: z.number().min(0, 'Stock must be a positive number').optional(),
    })

}
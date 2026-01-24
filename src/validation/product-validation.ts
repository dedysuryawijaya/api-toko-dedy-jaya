import { z, ZodType } from "zod";
import { CreateProductInput, ProductFilterInput, UpdateProductInput } from "../model/product-model.js";

export class ProductValidation {

    private static readonly ORDERBY: Array<string> = ['name', 'price', 'stock', 'createdAt', 'updatedAt'];
    private static readonly SORTBY: Array<string> = ['asc', 'desc'];
    
    static readonly CREATE_PRODUCT: ZodType<CreateProductInput> = z.object({
        barcode: z.string().min(1, 'Barcode is required').nullable(),
        name: z.string().min(1, 'Name is required'),
        description: z.string().nullable(),
        price: z.number().min(0).positive(),
        stock: z.number().min(0).positive(),
    });

    static readonly UPDATE_PRODUCT: ZodType<UpdateProductInput> = z.object({
        barcode: z.string().min(1, 'Barcode is required').optional(),
        name: z.string().min(1, 'Name is required').optional(),
        description: z.string().optional(),
        price: z.number().min(0).positive().optional(),
        stock: z.number().min(0).positive().optional(),
    })

    static readonly PRODUCT_FILTER: ZodType<ProductFilterInput> = z.object({
        barcode: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        minPrice: z.number().min(1).positive().optional(),
        maxPrice: z.number().min(1).positive().optional(),
        minStock: z.number().min(1).positive().optional(),
        maxStock: z.number().min(1).positive().optional(),
        orderBy: z.enum(this.ORDERBY),
        sortBy: z.enum(this.SORTBY),
        page: z.number().min(1).positive(),
        size: z.number().min(1).positive(),
    });

}
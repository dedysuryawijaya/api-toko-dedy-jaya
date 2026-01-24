import { prismaClient } from "../application/database.js";
import { Product } from "@prisma/client";
import { CreateProductInput, ProductFilterInput, ProductResponse, toProductResponse, UpdateProductInput } from "../model/product-model.js";
import { Validation } from "../validation/validation.js";
import { ProductValidation } from "../validation/product-validation.js";
import { ResponseError } from "../error/response-error.js";
import { PaginatedResult } from "../model/pagination.js";
import moment from "moment";


export class ProductService {

    static async create(input: CreateProductInput): Promise<ProductResponse> {
        const productRequest = Validation.validate<CreateProductInput>(ProductValidation.CREATE_PRODUCT, input);

        if (!productRequest.barcode) {
            productRequest.barcode! = `PRD-${moment().format('YYYYMMDDHHmmss')}`;
        }

        const barcodeExists = await prismaClient.product.count({
            where: { barcode: productRequest.barcode },
        });

        if (barcodeExists > 0) {
            throw new ResponseError('Barcode already in use', 400);
        }
        const product = await prismaClient.product.create({
            data: productRequest!,
        });

        return toProductResponse(product);
    }

    static async getBy(by: string, id: string): Promise<Product> {
        const product =  await prismaClient.product.findFirst({
            where: { 
                [by]: id,
             },
        });
        if (!product) {
            throw new ResponseError('Product not found', 404);
        }
        return product;
    }

    static async getProductById(id: string): Promise<ProductResponse> {
        const product = await this.getBy('id', id);
        return toProductResponse(product);
    }

    static async getProductByBarcode(barcode: string): Promise<ProductResponse> {
        const product = await this.getBy('barcode', barcode);
        return toProductResponse(product);
    }

    static async update(id: string, input: UpdateProductInput): Promise<ProductResponse> {
        const updateRequest = Validation.validate<UpdateProductInput>(ProductValidation.UPDATE_PRODUCT, input);
        const product: Product = await this.getBy('id', id);

        if (updateRequest.barcode) {
            const barcodeExists = await prismaClient.product.count({
                where: { 
                    barcode: updateRequest.barcode,
                    id: { not: id },
                },
            });
            if (barcodeExists > 0) {
                throw new ResponseError('Barcode already in use', 400);
            }
            product.barcode = updateRequest.barcode;
        }

        Object.assign(product, {
            ...(updateRequest.name && { name: updateRequest.name }),
            ...(updateRequest.description && { description: updateRequest.description }),
            ...(updateRequest.price !== undefined && { price: updateRequest.price }),
            ...(updateRequest.stock !== undefined && { stock: updateRequest.stock }),
        });

        const updatedProduct =  await prismaClient.product.update({
            where: { id: product.id },
            data: product,
        });

        return toProductResponse(updatedProduct);
    }

    static async search(input: ProductFilterInput): Promise<PaginatedResult<ProductResponse>> {
        const filterRequest = Validation.validate<ProductFilterInput>(ProductValidation.PRODUCT_FILTER, input);

        const filter: object = {
            ...(filterRequest.barcode && { barcode: filterRequest.barcode }),
            ...(filterRequest.name && { name: { 
                        contains: filterRequest.name ,
                        mode: 'insensitive'
                    } 
                }),
            ...(filterRequest.minPrice !== undefined && { price: { gte: filterRequest.minPrice } }),
            ...(filterRequest.maxPrice !== undefined && { price: { lte: filterRequest.maxPrice } }),
            ...(filterRequest.minStock !== undefined && { stock: { gte: filterRequest.minStock } }),
            ...(filterRequest.maxStock !== undefined && { stock: { lte: filterRequest.maxStock } }),
        };

        const products =await prismaClient.product.findMany({
            where: filter,
            skip: (filterRequest.page - 1) * filterRequest.size,
            take: filterRequest.size,
            orderBy: { [filterRequest.orderBy]: filterRequest.sortBy },
        });

        const totalItems = await prismaClient.product.count({
            where: filter,
        });

        const totalPages = Math.ceil(totalItems / filterRequest.size);

        return {
            data: products.map(product => toProductResponse(product)),
            paging: {
                page: filterRequest.page,
                size: filterRequest.size,
                total_page: totalPages,
                total_items: totalItems,
            },
        };
    }

    static async delete(id: string): Promise<void> {
        const product = await this.getBy('id', id);
        await prismaClient.product.delete({
            where: { id: product.id },
        });
    }
}
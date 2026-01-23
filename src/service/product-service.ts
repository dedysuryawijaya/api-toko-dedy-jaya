import { prismaClient } from "../application/database.js";
import { Product } from "@prisma/client";
import { CreateProductInput, ProductResponse, toProductResponse, UpdateProductInput } from "../model/product-model.js";
import { Validation } from "../validation/validation.js";
import { ProductValidation } from "../validation/product-validation.js";
import { ResponseError } from "../error/response-error.js";
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

    static async getById(id: string): Promise<Product> {
        const product =  await prismaClient.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new ResponseError('Product not found', 404);
        }
        return product;
    }

    static async getProductById(id: string): Promise<ProductResponse> {
        const product = await this.getById(id);
        return toProductResponse(product);
    }

    static async getProductByBarcode(barcode: string): Promise<ProductResponse> {
        const product = await prismaClient.product.findFirst({
            where: { 
                barcode: barcode,
             },
        });

        if (!product) {
            throw new ResponseError('Product not found', 404);
        }

        return toProductResponse(product);
    }

    static async update(id: string, input: UpdateProductInput): Promise<ProductResponse> {
        const updateRequest = Validation.validate<UpdateProductInput>(ProductValidation.UPDATE_PRODUCT, input);
        const product: Product = await this.getById(id);

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
}
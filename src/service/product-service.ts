import { prismaClient } from "../application/database.js";
import { Product } from "@prisma/client";
import { CreateProductInput, ProductFilterInput, ProductResponse, toProductResponse, UpdateProductInput } from "../model/product-model.js";
import { Validation } from "../validation/validation.js";
import { ProductValidation } from "../validation/product-validation.js";
import { ResponseError } from "../error/response-error.js";
import { PaginatedResult } from "../model/pagination.js";
import moment from "moment";
import { logger } from "../application/logging.js";

interface ProductFromAPI {
    brands?: string;
    code?: string;
    product_name?: string;
    product_name_id?: string;
    quantity?: string;
}

interface APIResponse {
    count: number;
    page: number;
    page_count: number;
    page_size: number;
    products: ProductFromAPI[];
}

export interface ImportResult {
    page: number;
    imported: number;
    skipped: number;
    total_in_page: number;
    message: string;
}


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

    static async importFromAPI(page: number): Promise<ImportResult> {
        const url = `https://world.openfoodfacts.org/api/v2/search?countries_tags_en=indonesia&page_size=100&page=${page}&fields=product_name,brands,code,product_name_id,quantity`;
        
        const username = 'wydesu';
        const password = 'Wijaya372000';
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': "Basic " + btoa(`${username}:${password}`),
                    'User-Agent': 'TokoDelyJaya/1.0'
                }
            });

            if (!response.ok) {
                throw new ResponseError(`Failed to fetch from API: ${response.status} ${response.statusText}`, 500);
            }

            const data = await response.json() as APIResponse;
            
            if (!data.products || data.products.length === 0) {
                return {
                    page,
                    imported: 0,
                    skipped: 0,
                    total_in_page: 0,
                    message: 'No products found on this page'
                };
            }

            let imported = 0;
            let skipped = 0;

            for (const product of data.products) {
                // Skip jika code tidak ada
                if (!product.code) {
                    skipped++;
                    continue;
                }
                
                // Gunakan product_name atau product_name_id
                const name = product.product_name || product.product_name_id || "Belum ada nama product";
                if (!name) {
                    logger.warn(`Product with code ${product.code} has no name, skipping...`);
                    skipped++;
                    continue;
                }
                
                // Buat deskripsi dari kombinasi brands + product_name/product_name_id + quantity
                const descriptionParts = [];
                if (product.brands) descriptionParts.push(product.brands);
                if (name) descriptionParts.push(name);
                if (product.quantity) descriptionParts.push(product.quantity);
                const description = descriptionParts.join(' - ');
                
                try {
                    // Check apakah barcode sudah ada
                    const existing = await prismaClient.product.findUnique({
                        where: { barcode: product.code }
                    });
                    
                    if (existing) {
                        skipped++;
                        continue;
                    }
                    
                    // Insert product baru
                    await prismaClient.product.create({
                        data: {
                            barcode: product.code,
                            name: name,
                            description: description || null,
                            price: 0,
                            stock: 10,
                        }
                    });
                    
                    imported++;
                    
                } catch (error) {
                    logger.error(`Error importing product ${product.code}:`, error);
                    skipped++;
                }
            }

            return {
                page,
                imported,
                skipped,
                total_in_page: data.products.length,
                message: `Successfully processed page ${page}`
            };
            
        } catch (error) {
            logger.error(`Error fetching from API:`, error);
            if (error instanceof ResponseError) {
                throw error;
            }
            throw new ResponseError('Failed to import products from API', 500);
        }
    }
}
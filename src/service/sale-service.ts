import { prismaClient } from "../application/database.js";
import { Sale, SaleItem } from "@prisma/client";
import { CreateSaleInput, CreateSaleRequest, SaleResponse, FilterSaleInput, toSaleResponse } from "../model/sale-model.js";
import { CreateSaleItemInput, SaleItemResponse,toSaleItemResponse } from "../model/sale-items-model.js";
import { Validation } from "../validation/validation.js";
import { SaleValidation } from "../validation/sale-validation.js";
import { ResponseError } from "../error/response-error.js";
import { ProductService } from "./product-service.js";
import moment from "moment";
import { PaginatedResult } from "../model/pagination.js";

export class SaleService {

    static async create(input: CreateSaleRequest): Promise<SaleResponse> {
        const saleRequest = Validation.validate<CreateSaleRequest>(SaleValidation.CREATE_SALE, input);
        const sale: CreateSaleInput = {
            orderId: `ORD-${moment().format('YYYYMMDDHHmmss')}`,
            quantity: saleRequest.items.length,
            totalPrice: 0,
            cashAmount: saleRequest.cashAmount,
            changeAmount: 0,
            customer: saleRequest.customer,
            saleDate: saleRequest.saleDate,
        };

        const response = await prismaClient.$transaction(async (tx) => {

            const newSale = await tx.sale.create({
                data: sale,
            });

            let totalPrice = 0;

            const productIds = saleRequest.items.map(item => item.productId);
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
            });

            const productMap = new Map(
                products.map(p => [p.id, p])
            );

            const saleItems: CreateSaleItemInput[] = saleRequest.items.map(item => {
                const product = productMap.get(item.productId);

                if (!product) {
                    throw new ResponseError(`Product ${item.productId} not found`, 404);
                }

                const amount = product.price * item.quantity;

                totalPrice += amount;

                return {
                    saleId: newSale.id,
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price,
                    total: amount,
                    productName: product.name ?? 'Belum Diset'
                };
            });

            await tx.saleItem.createMany({
                data: saleItems,
            });

            const changeAmount = saleRequest.cashAmount - totalPrice;
            
            const updatedSale = await tx.sale.update({
                where: { id: newSale.id },
                data: { 
                    totalPrice: totalPrice,
                    changeAmount: changeAmount
                },
            });

            return toSaleResponse(updatedSale, saleItems.map(item => toSaleItemResponse(item as SaleItem)));
        })

        return response;
    }

    static async getById(saleId: string): Promise<SaleResponse> {
        const sale = await prismaClient.sale.findUnique({
            where: { id: saleId },
        });
        if (!sale) {
            throw new ResponseError('Sale not found', 404);
        }
        const saleItems = await prismaClient.saleItem.findMany({
            where: { saleId: sale.id },
        });
        const saleItemResponses: SaleItemResponse[] = saleItems.map(item => toSaleItemResponse(item));
        return toSaleResponse(sale, saleItemResponses);
    }

    static async getByOrderId(orderId: string): Promise<SaleResponse> {
        const sale = await prismaClient.sale.findUnique({
            where: { orderId: orderId },
        });
        if (!sale) {
            throw new ResponseError('Sale not found', 404);
        }
        const saleItems = await prismaClient.saleItem.findMany({
            where: { saleId: sale.id },
        });
        const saleItemResponses: SaleItemResponse[] = saleItems.map(item => toSaleItemResponse(item));
        return toSaleResponse(sale, saleItemResponses);
    }

    static async search(filter: FilterSaleInput): Promise<PaginatedResult<SaleResponse>> {
        const filterRequest = Validation.validate<FilterSaleInput>(SaleValidation.FILTER_SALE, filter);

        const where: object = {
            ...(filterRequest.orderId && { orderId: filterRequest.orderId }),
            ...(filterRequest.minTotalPrice !== undefined && { totalPrice: { gte: filterRequest.minTotalPrice } }),
            ...(filterRequest.maxTotalPrice !== undefined && { totalPrice: { lte: filterRequest.maxTotalPrice } }),
            ...(filterRequest.customer && { customer: {
                contains: filterRequest.customer,
                mode: 'insensitive'
            } }),
            ...(filterRequest.startDate && { saleDate: { gte: filterRequest.startDate } }),
            ...(filterRequest.endDate && { saleDate: { lte: filterRequest.endDate } }),
        };

        const sales = await prismaClient.sale.findMany({
            where: where,
            include:{
                saleItems: true,
            },
            orderBy: {
                [filterRequest.orderBy]: filterRequest.sortBy.toLowerCase() === 'asc' ? 'asc' : 'desc',
            },
            skip: (filterRequest.page - 1) * filterRequest.size,
            take: filterRequest.size,
        });

        const totalSales = await prismaClient.sale.count({
            where: where,
        });

        const totalPages = Math.ceil(totalSales / filterRequest.size);

        const saleResponses: SaleResponse[] = sales.map(sale => {
            const saleItemResponses: SaleItemResponse[] = sale.saleItems.map(item => toSaleItemResponse(item));
            return toSaleResponse(sale as Sale, saleItemResponses);
        });

        return {
            data: saleResponses,
            paging: {
                page: filterRequest.page,
                size: filterRequest.size,
                total_page: totalPages,
                total_items: totalSales,
            }
        };
    }

    static async delete(saleId: string): Promise<void> {
        const sale = await prismaClient.sale.findUnique({
            where: { id: saleId },
        });

        if (!sale) {
            throw new ResponseError('Sale not found', 404);
        }
        await prismaClient.$transaction(async (tx) => {
            await tx.saleItem.deleteMany({
                where: { saleId: sale.id },
            });
            await tx.sale.delete({
                where: { id: sale.id },
            });
        });
    }
}
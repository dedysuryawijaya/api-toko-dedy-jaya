import { prismaClient } from "../application/database.js";
import { Sale, SaleItem } from "@prisma/client";
import { CreateSaleInput, CreateSaleRequest, SaleResponse, toSaleResponse } from "../model/sale-model.js";
import { CreateSaleItemInput, SaleItemResponse, toSaleItemResponse } from "../model/sale-items-model.js";
import { Validation } from "../validation/validation.js";
import { SaleValidation } from "../validation/sale-validation.js";
import { ResponseError } from "../error/response-error.js";
import { ProductService } from "./product-service.js";
import moment from "moment";
import { map } from "zod";

export class SaleService {

    static async create(input: CreateSaleRequest): Promise<SaleResponse> {
        const saleRequest = Validation.validate<CreateSaleRequest>(SaleValidation.CREATE_SALE, input);
        const sale: CreateSaleInput = {
            orderId: `ORD-${moment().format('YYYYMMDDHHmmss')}`,
            quantity: saleRequest.items.length,
            totalPrice: 0,
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

            const updatedSale = await tx.sale.update({
                where: { id: newSale.id },
                data: { totalPrice: totalPrice },
            });

            return toSaleResponse(updatedSale, saleItems.map(item => toSaleItemResponse(item as SaleItem)));
        })

        return response;
    }
}
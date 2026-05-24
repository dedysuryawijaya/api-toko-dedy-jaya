import { Response, NextFunction } from "express";
import { UserRequest } from "../utils/user-request.js";
import { SaleService } from "../service/sale-service.js";
import { CreateSaleRequest, FilterSaleInput } from "../model/sale-model.js";
import moment from "moment";
import { logger } from "../application/logging.js";

export class SaleController {

    static async createSale(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const request: CreateSaleRequest = {
                customer: req.body.customer ?? 'Umum',
                cashAmount: req.body.cashAmount,
                saleDate: req.body.saleDate ?? moment().toDate(),
                items: req.body.items,
            }
            const saleResponse = await SaleService.create(request);
            res.status(201).json({ data: saleResponse });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }

    static async getById(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const saleId: string = req.params.id as string;
            const saleResponse = await SaleService.getById(saleId);
            res.status(200).json({ data: saleResponse });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }

    static async getByOrderId(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const orderId: string = req.params.orderId as string;
            const saleResponse = await SaleService.getByOrderId(orderId);
            res.status(200).json({ data: saleResponse });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }

    static async search(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const filter: FilterSaleInput = {
                ...req.query,
                orderBy: (req.query.orderBy as string) || 'createdAt',
                sortBy: (req.query.sortBy as string) || 'desc',
                page: req.query.page ? Number(req.query.page) : 1,
                size: req.query.size ? Number(req.query.size) : 10,
            };
            const result = await SaleService.search(filter);
            res.status(200).json(result);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }

    static async delete(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const saleId: string = req.params.id as string;
            await SaleService.delete(saleId);
            res.status(204).json({ message: 'Berhasil dihapus' });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }
}
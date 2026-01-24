import { Response, NextFunction } from "express";
import { UserRequest } from "../utils/user-request.js";
import { SaleService } from "../service/sale-service.js";
import { CreateSaleRequest } from "../model/sale-model.js";
import moment from "moment";
import { logger } from "../application/logging.js";

export class SaleController {

    static async createSale(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const request: CreateSaleRequest = {
                customer: req.body.customer ?? 'Umum',
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
}
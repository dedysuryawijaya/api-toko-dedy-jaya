import { Request, Response, NextFunction} from 'express';
import { UserRequest } from '../utils/user-request.js';
import { ProductService } from '../service/product-service.js';
import { CreateProductInput, UpdateProductInput } from '../model/product-model.js';
import { logger } from '../application/logging.js';

export class ProductController {

    static async create(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const input: CreateProductInput = req.body as CreateProductInput;
            const response = await ProductService.create(input);
            res.status(201).json({ data: response });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }

    static async update(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const productId: string = String(req.params.id);
            const input: UpdateProductInput = req.body as UpdateProductInput;
            const response = await ProductService.update(productId, input);
            res.status(200).json({ data: response });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }

    static async getById(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const productId: string = String(req.params.id);
            const response = await ProductService.getProductById(productId);
            res.status(200).json({ data: response });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }

    static async getByBarcode(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const barcode: string = String(req.params.barcode);
            const response = await ProductService.getProductByBarcode(barcode);
            res.status(200).json({ data: response });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }
}
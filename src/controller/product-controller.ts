import { Request, Response, NextFunction} from 'express';
import { UserRequest } from '../utils/user-request.js';
import { ProductService } from '../service/product-service.js';
import { CreateProductInput, ProductFilterInput, UpdateProductInput } from '../model/product-model.js';
import { logger } from '../application/logging.js';
import { ResponseError } from '../error/response-error.js';

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

    static async importFromAPI(req: Request, res: Response, next: NextFunction) {
        try {
            const { page } = req.body;
            
            if (!page || typeof page !== 'number' || page < 1) {
                throw new ResponseError('Page must be a positive number', 400);
            }
            
            const response = await ProductService.importFromAPI(page);
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

    static async search(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const request: ProductFilterInput = {
                ...req.query,
                page: req.query.page ? parseInt(String(req.query.page)) : 1,
                size: req.query.size ? parseInt(String(req.query.size)) : 10,
                orderBy: req.query.orderBy ? String(req.query.orderBy) : 'createdAt',
                sortBy: req.query.sortBy ? String(req.query.sortBy) : 'desc',
            }
            const response = await ProductService.search(request);
            res.status(200).json(response);
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }

    static async delete(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const productId: string = String(req.params.id);
            await ProductService.delete(productId);
            res.status(204).json({ message: 'OK' });
        } catch (e) {
            logger.error(e);
            next(e);
        }
    }
}
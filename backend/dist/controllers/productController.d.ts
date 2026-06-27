import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProductStats: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map
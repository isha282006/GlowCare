import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const generateRecommendation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRecommendedProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMatchedProducts: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=recommendationController.d.ts.map
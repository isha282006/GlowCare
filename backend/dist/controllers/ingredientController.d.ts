import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getIngredients: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createIngredient: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateIngredient: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteIngredient: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=ingredientController.d.ts.map
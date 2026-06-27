import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getRules: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createRule: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateRule: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteRule: (req: AuthRequest, res: Response) => Promise<void>;
export declare const checkCompatibility: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=compatibilityController.d.ts.map
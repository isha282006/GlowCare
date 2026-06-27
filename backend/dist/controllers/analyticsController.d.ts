import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRoutineCompletion: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProductStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getJournalStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getWeeklyActivity: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=analyticsController.d.ts.map
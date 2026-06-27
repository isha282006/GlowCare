import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getRoutines: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRoutine: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createRoutine: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateRoutine: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteRoutine: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleStep: (req: AuthRequest, res: Response) => Promise<void>;
export declare const checkCompatibility: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRoutineHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const resetRoutine: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=routineController.d.ts.map
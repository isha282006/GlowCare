import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getPhotos: (req: AuthRequest, res: Response) => Promise<void>;
export declare const uploadPhoto: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deletePhoto: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMonthlyPhotos: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=photoController.d.ts.map
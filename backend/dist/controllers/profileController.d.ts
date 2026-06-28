import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const uploadOrUpdateProfilePhoto: (req: AuthRequest, res: Response) => Promise<void>;
export declare const removeProfilePhoto: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProfileMe: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=profileController.d.ts.map
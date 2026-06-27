import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addToWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateWishlistItem: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteWishlistItem: (req: AuthRequest, res: Response) => Promise<void>;
export declare const moveToInventory: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=wishlistController.d.ts.map
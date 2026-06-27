import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getJournalEntries: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getJournalEntry: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createJournalEntry: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateJournalEntry: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteJournalEntry: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=journalController.d.ts.map
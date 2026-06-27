"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const journalController_1 = require("../controllers/journalController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.route('/').get(journalController_1.getJournalEntries).post(upload_1.upload.single('progressPhoto'), journalController_1.createJournalEntry);
router.route('/:id').get(journalController_1.getJournalEntry).put(upload_1.upload.single('progressPhoto'), journalController_1.updateJournalEntry).delete(journalController_1.deleteJournalEntry);
exports.default = router;
//# sourceMappingURL=journalRoutes.js.map
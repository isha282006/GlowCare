"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataController_1 = require("../controllers/dataController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/export', dataController_1.exportData);
router.post('/import', dataController_1.importData);
exports.default = router;
//# sourceMappingURL=dataRoutes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routineController_1 = require("../controllers/routineController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/history', routineController_1.getRoutineHistory);
router.post('/check-compatibility', routineController_1.checkCompatibility);
router.route('/').get(routineController_1.getRoutines).post(routineController_1.createRoutine);
router.route('/:id').get(routineController_1.getRoutine).put(routineController_1.updateRoutine).delete(routineController_1.deleteRoutine);
router.put('/:id/steps/:stepId/toggle', routineController_1.toggleStep);
router.put('/:id/reset', routineController_1.resetRoutine);
exports.default = router;
//# sourceMappingURL=routineRoutes.js.map
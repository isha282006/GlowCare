"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchedProducts = exports.getRecommendedProducts = exports.generateRecommendation = void 0;
const RecommendedProduct_1 = __importDefault(require("../models/RecommendedProduct"));
const User_1 = __importDefault(require("../models/User"));
// ═══════════════════════════════════════════════════
// Concern → Ingredient Mapping
// ═══════════════════════════════════════════════════
const CONCERN_INGREDIENT_MAP = {
    'Acne': ['Salicylic Acid', 'Niacinamide', 'Zinc PCA', 'Tea Tree'],
    'Pigmentation': ['Alpha Arbutin', 'Niacinamide', 'Vitamin C', 'Kojic Acid'],
    'Dark Spots': ['Alpha Arbutin', 'Vitamin C', 'Tranexamic Acid', 'Glycolic Acid'],
    'Dry Lips': ['Ceramides', 'Shea Butter', 'Squalane', 'Vitamin E'],
    'Blackheads': ['Salicylic Acid', 'BHA', 'Clay'],
    'Whiteheads': ['Salicylic Acid', 'Niacinamide', 'BHA'],
    'Large Pores': ['Niacinamide', 'Salicylic Acid', 'AHA'],
    'Redness': ['Centella Asiatica', 'Panthenol', 'Ceramides', 'Cica'],
    'Fine Lines': ['Retinol', 'Peptides', 'Hyaluronic Acid'],
    'Wrinkles': ['Retinol', 'Peptides', 'Collagen'],
    'Dullness': ['Vitamin C', 'Glycolic Acid', 'Niacinamide', 'AHA'],
    'Under-eye Dark Circles': ['Caffeine', 'Vitamin K', 'Retinol', 'Peptides'],
};
// ═══════════════════════════════════════════════════
// Lifestyle Tips Generator
// ═══════════════════════════════════════════════════
function generateLifestyleTips(skinType, concerns, lifestyle) {
    const tips = [];
    // Skin type tips
    if (skinType === 'Oily') {
        tips.push("Don't over-wash your face — twice a day is enough. Over-cleansing triggers more oil production.");
        tips.push("Choose non-comedogenic, oil-free gel products to avoid clogging pores.");
    }
    else if (skinType === 'Dry') {
        tips.push("Avoid harsh foaming cleansers that strip natural oils. Use cream or milk-based cleansers.");
        tips.push("Apply products on slightly damp skin to lock in maximum hydration.");
        tips.push("Moisturize twice daily — after cleansing in the morning and before bed.");
    }
    else if (skinType === 'Sensitive') {
        tips.push("Always patch test new products behind your ear for 24 hours before applying to your face.");
        tips.push("Avoid harsh physical scrubs and artificial fragrances that can trigger reactions.");
        tips.push("Look for products labeled 'fragrance-free' and 'hypoallergenic'.");
    }
    else if (skinType === 'Combination') {
        tips.push("Use lightweight gel moisturizers that hydrate without adding excess oil to your T-zone.");
        tips.push("Consider multi-masking: clay mask on oily zones, hydrating mask on dry areas.");
    }
    else {
        tips.push("Maintain a consistent morning and night skincare routine for best results.");
        tips.push("Keep your skin hydrated by drinking 2-3L of water daily.");
    }
    // Concern tips
    if (concerns.includes('Acne')) {
        tips.push("Avoid picking or popping pimples — this causes scarring and spreads bacteria.");
        tips.push("Introduce active ingredients (like Salicylic Acid) gradually to avoid purging.");
        tips.push("Wash your pillowcases once a week to prevent bacterial buildup.");
    }
    if (concerns.includes('Pigmentation') || concerns.includes('Dark Spots')) {
        tips.push("Apply SPF 50+ sunscreen every day, even when indoors — UV rays penetrate windows.");
        tips.push("Skincare active results take 6-12 weeks of consistent use. Be patient!");
    }
    if (concerns.includes('Fine Lines') || concerns.includes('Wrinkles')) {
        tips.push("Use Retinol at night — it makes skin photosensitive. Always pair with sunscreen the next day.");
        tips.push("Sleep on a silk pillowcase to reduce friction-related creasing.");
    }
    if (concerns.includes('Under-eye Dark Circles')) {
        tips.push("Maintain a consistent sleep cycle of 7-8 hours for visible under-eye improvement.");
        tips.push("Stay hydrated and limit salt intake at night to reduce puffiness.");
    }
    if (concerns.includes('Dry Lips')) {
        tips.push("Stay hydrated and avoid licking or biting your lips — saliva dries them out further.");
        tips.push("Protect lips from sun exposure with SPF lip balms during the day.");
    }
    if (concerns.includes('Redness')) {
        tips.push("Avoid hot water on your face — use lukewarm water to prevent triggering redness.");
        tips.push("Minimize alcohol-based toners and products with synthetic fragrance.");
    }
    // Lifestyle tips
    if (lifestyle?.waterIntake?.includes('< 1L')) {
        tips.push("💧 Critical: Increase your daily water intake to at least 2L for better skin hydration from within.");
    }
    if (lifestyle?.sleepDuration?.includes('<') || lifestyle?.sleepDuration?.includes('5')) {
        tips.push("😴 Your sleep duration may be affecting your skin. Aim for 7-9 hours for optimal skin repair.");
    }
    if (lifestyle?.smoking === 'Yes') {
        tips.push("🚬 Smoking accelerates skin aging and reduces blood flow. Consider reducing for healthier skin.");
    }
    if (lifestyle?.stressLevel === 'High') {
        tips.push("🧘 High stress triggers cortisol production, which can cause breakouts. Try meditation or exercise.");
    }
    if (lifestyle?.sunscreenUsage === 'Rarely' || lifestyle?.sunscreenUsage === 'Never') {
        tips.push("☀️ Sunscreen is the single most effective anti-aging product. Start applying SPF 30+ daily.");
    }
    return [...new Set(tips)];
}
// ═══════════════════════════════════════════════════
// Score Calculator
// ═══════════════════════════════════════════════════
function calculateSkinScore(concerns, lifestyle) {
    let score = 95 - (concerns.length * 4);
    if (lifestyle?.smoking === 'Yes')
        score -= 5;
    if (lifestyle?.stressLevel === 'High')
        score -= 5;
    if (lifestyle?.sleepDuration?.includes('<') || lifestyle?.sleepDuration?.includes('5-7'))
        score -= 4;
    if (lifestyle?.waterIntake?.includes('< 1L'))
        score -= 3;
    if (lifestyle?.sunscreenUsage === 'Rarely' || lifestyle?.sunscreenUsage === 'Never')
        score -= 4;
    return Math.max(45, Math.min(100, score));
}
// ═══════════════════════════════════════════════════
// Routine Builder
// ═══════════════════════════════════════════════════
function buildRoutine(products, skinType, concerns, timeOfDay) {
    const routine = [];
    // Filter products compatible with this time and skin type
    const timeFilter = timeOfDay === 'morning' ? ['Morning', 'Both'] : ['Night', 'Both'];
    const pool = products.filter(p => p.skinTypes.includes(skinType) &&
        timeFilter.includes(p.timeOfDay));
    // Helper: find best product for a category
    const findBest = (category) => {
        // Prefer products that match the most concerns
        const categoryProducts = pool.filter(p => p.category === category);
        if (categoryProducts.length === 0)
            return undefined;
        return categoryProducts.sort((a, b) => {
            const aMatch = a.skinConcerns.filter(c => concerns.includes(c)).length;
            const bMatch = b.skinConcerns.filter(c => concerns.includes(c)).length;
            return bMatch - aMatch;
        })[0];
    };
    // Step 1: Cleanser
    const cleanser = findBest('Cleanser');
    if (cleanser) {
        routine.push({
            order: routine.length + 1,
            name: cleanser.name,
            brand: cleanser.brand,
            category: 'Cleanser',
            ingredients: cleanser.ingredients,
            whyRecommended: cleanser.whyRecommended,
            howToUse: cleanser.howToUse,
            timeOfDay: timeOfDay === 'morning' ? 'Morning' : 'Night',
        });
    }
    // Step 2: Toner (if available and relevant)
    if (concerns.some(c => ['Redness', 'Dullness', 'Fine Lines', 'Wrinkles'].includes(c))) {
        const toner = findBest('Toner');
        if (toner) {
            routine.push({
                order: routine.length + 1,
                name: toner.name,
                brand: toner.brand,
                category: 'Toner',
                ingredients: toner.ingredients,
                whyRecommended: toner.whyRecommended,
                howToUse: toner.howToUse,
                timeOfDay: timeOfDay === 'morning' ? 'Morning' : 'Night',
            });
        }
    }
    // Step 3: Serum (primary treatment)
    const serum = findBest('Serum');
    if (serum) {
        routine.push({
            order: routine.length + 1,
            name: serum.name,
            brand: serum.brand,
            category: 'Serum',
            ingredients: serum.ingredients,
            whyRecommended: serum.whyRecommended,
            howToUse: serum.howToUse,
            timeOfDay: timeOfDay === 'morning' ? 'Morning' : 'Night',
        });
    }
    // Step 3b: Second serum if multiple high-priority concerns
    if (concerns.length >= 2) {
        const secondSerum = pool
            .filter(p => p.category === 'Serum' && p.name !== serum?.name)
            .sort((a, b) => {
            const aMatch = a.skinConcerns.filter(c => concerns.includes(c)).length;
            const bMatch = b.skinConcerns.filter(c => concerns.includes(c)).length;
            return bMatch - aMatch;
        })[0];
        if (secondSerum && secondSerum.skinConcerns.some(c => concerns.includes(c))) {
            routine.push({
                order: routine.length + 1,
                name: secondSerum.name,
                brand: secondSerum.brand,
                category: 'Serum',
                ingredients: secondSerum.ingredients,
                whyRecommended: secondSerum.whyRecommended,
                howToUse: secondSerum.howToUse,
                timeOfDay: timeOfDay === 'morning' ? 'Morning' : 'Night',
            });
        }
    }
    // Step 4: Eye Care (if under-eye concern)
    if (concerns.includes('Under-eye Dark Circles')) {
        const eyeCare = findBest('Eye Care');
        if (eyeCare) {
            routine.push({
                order: routine.length + 1,
                name: eyeCare.name,
                brand: eyeCare.brand,
                category: 'Eye Care',
                ingredients: eyeCare.ingredients,
                whyRecommended: eyeCare.whyRecommended,
                howToUse: eyeCare.howToUse,
                timeOfDay: timeOfDay === 'morning' ? 'Morning' : 'Night',
            });
        }
    }
    // Step 5: Moisturizer
    const moisturizer = findBest('Moisturizer');
    if (moisturizer) {
        routine.push({
            order: routine.length + 1,
            name: moisturizer.name,
            brand: moisturizer.brand,
            category: 'Moisturizer',
            ingredients: moisturizer.ingredients,
            whyRecommended: moisturizer.whyRecommended,
            howToUse: moisturizer.howToUse,
            timeOfDay: timeOfDay === 'morning' ? 'Morning' : 'Night',
        });
    }
    // Step 6: Sunscreen (morning only)
    if (timeOfDay === 'morning') {
        const sunscreen = findBest('Sunscreen');
        if (sunscreen) {
            routine.push({
                order: routine.length + 1,
                name: sunscreen.name,
                brand: sunscreen.brand,
                category: 'Sunscreen',
                ingredients: sunscreen.ingredients,
                whyRecommended: sunscreen.whyRecommended,
                howToUse: sunscreen.howToUse,
                timeOfDay: 'Morning',
            });
        }
    }
    // Step 7: Lip Care (if dry lips concern)
    if (concerns.includes('Dry Lips')) {
        const lipCare = pool.find(p => p.category === 'Lip Care');
        if (lipCare) {
            routine.push({
                order: routine.length + 1,
                name: lipCare.name,
                brand: lipCare.brand,
                category: 'Lip Care',
                ingredients: lipCare.ingredients,
                whyRecommended: lipCare.whyRecommended,
                howToUse: lipCare.howToUse,
                timeOfDay: timeOfDay === 'morning' ? 'Morning' : 'Night',
            });
        }
    }
    return routine;
}
// ═══════════════════════════════════════════════════
// Weekly Care Generator
// ═══════════════════════════════════════════════════
function generateWeeklyCare(products, skinType, concerns) {
    const weeklyCare = [];
    // Exfoliator recommendation
    const exfoliators = products.filter(p => p.category === 'Exfoliator' && p.skinTypes.includes(skinType));
    if (exfoliators.length > 0) {
        const best = exfoliators[0];
        weeklyCare.push(`${best.brand} ${best.name} (1-2x/week): ${best.whyRecommended}`);
    }
    // Mask recommendation
    const masks = products.filter(p => p.category === 'Mask' && p.skinTypes.includes(skinType));
    if (masks.length > 0) {
        const best = masks.sort((a, b) => {
            const aM = a.skinConcerns.filter(c => concerns.includes(c)).length;
            const bM = b.skinConcerns.filter(c => concerns.includes(c)).length;
            return bM - aM;
        })[0];
        weeklyCare.push(`${best.brand} ${best.name} (1-2x/week): ${best.whyRecommended}`);
    }
    // Generic weekly tips
    if (skinType === 'Oily' || concerns.includes('Acne')) {
        weeklyCare.push("Change pillowcases at least once a week to prevent bacterial transfer.");
        weeklyCare.push("Do a 10-minute steam session before masking to open pores (optional).");
    }
    if (skinType === 'Dry' || concerns.includes('Dullness')) {
        weeklyCare.push("Apply a hydrating sheet mask 1-2 times per week for an extra moisture boost.");
    }
    if (concerns.includes('Fine Lines') || concerns.includes('Wrinkles')) {
        weeklyCare.push("Consider a gentle AHA exfoliant once a week to promote cell turnover.");
    }
    return weeklyCare;
}
// ═══════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════
// @desc    Generate personalized skincare recommendation
// @route   POST /api/recommendations/generate
const generateRecommendation = async (req, res) => {
    try {
        const { skinType, concerns, lifestyle } = req.body;
        if (!skinType || !concerns || !Array.isArray(concerns)) {
            res.status(400).json({
                success: false,
                message: 'skinType and concerns[] are required',
            });
            return;
        }
        // 1. Fetch all products from database
        const allProducts = await RecommendedProduct_1.default.find({});
        if (allProducts.length === 0) {
            res.status(500).json({
                success: false,
                message: 'Product database is empty. Please run the seed script first.',
            });
            return;
        }
        // 2. Map concerns to recommended ingredients
        const ingredients = [];
        concerns.forEach((concern) => {
            const mapped = CONCERN_INGREDIENT_MAP[concern];
            if (mapped) {
                ingredients.push(...mapped);
            }
        });
        const uniqueIngredients = [...new Set(ingredients)];
        if (uniqueIngredients.length === 0) {
            uniqueIngredients.push('Niacinamide', 'Ceramides', 'Hyaluronic Acid');
        }
        // 3. Calculate skin score
        const skinScore = calculateSkinScore(concerns, lifestyle);
        // 4. Build routines
        const morningRoutine = buildRoutine(allProducts, skinType, concerns, 'morning');
        const nightRoutine = buildRoutine(allProducts, skinType, concerns, 'night');
        // 5. Weekly care
        const weeklyCare = generateWeeklyCare(allProducts, skinType, concerns);
        // 6. Get all matching products for the product recommendation list
        const matchedProducts = allProducts
            .filter(p => p.skinTypes.includes(skinType) &&
            p.skinConcerns.some((c) => concerns.includes(c)))
            .map(p => ({
            name: p.name,
            brand: p.brand,
            category: p.category,
            ingredients: p.ingredients,
            whyRecommended: p.whyRecommended,
            howToUse: p.howToUse,
            timeOfDay: p.timeOfDay,
            description: p.description,
        }));
        // 7. Hydration, Oil, Sensitivity levels
        let hydration = 'Medium';
        if (lifestyle?.waterIntake?.includes('2-3L') || lifestyle?.waterIntake?.includes('> 3L')) {
            hydration = 'High';
        }
        else if (lifestyle?.waterIntake?.includes('< 1L')) {
            hydration = 'Low';
        }
        let oilLevel = 'Moderate';
        if (skinType === 'Oily')
            oilLevel = 'High';
        else if (skinType === 'Dry')
            oilLevel = 'Low';
        let sensitivity = 'Low';
        if (skinType === 'Sensitive')
            sensitivity = 'High';
        else if (skinType === 'Combination')
            sensitivity = 'Medium';
        // 8. Generate lifestyle tips
        const tips = generateLifestyleTips(skinType, concerns, lifestyle);
        // 9. Healthy habits
        const healthyHabits = [
            '💧 Drink 2-3L water daily for internal hydration',
            '😴 Maintain consistent 7-8 hour sleep cycle',
            '☀️ Wear sunscreen daily, even indoors near windows',
            '🧼 Wash pillowcases at least once a week',
            '🥗 Consume antioxidant-rich whole foods (berries, leafy greens)',
            '🧘 Practice stress management through meditation or exercise',
        ];
        // 10. Build the full report
        const report = {
            assessment: {
                skinType,
                primaryConcerns: concerns,
                hydration,
                oilLevel,
                skinSensitivity: sensitivity,
                skinScore,
                confidence: 'Questionnaire-based assessment',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            },
            routine: {
                morning: morningRoutine,
                night: nightRoutine,
            },
            recommendations: {
                products: matchedProducts,
                ingredients: uniqueIngredients,
                tips,
                weeklyCare,
                healthyHabits,
            },
            weeklyGoals: {
                morningRoutine: '0/7',
                nightRoutine: '0/7',
                drinkWater: '0/7',
                sleepHours: '0/7',
            },
            warnings: generateWarnings(skinType, concerns),
            waterGoal: 2.5,
            sleepGoal: 8,
            progressNotes: '',
            disclaimer: 'These recommendations are for skincare guidance only. They are not a medical diagnosis. Consult a dermatologist for persistent or severe skin concerns.',
        };
        // 11. Save to user profile
        const userId = req.user._id;
        await User_1.default.findByIdAndUpdate(userId, {
            skinType,
            skinConcerns: concerns,
            skinScore,
            skinReport: report,
        });
        res.status(200).json({
            success: true,
            data: report,
        });
    }
    catch (error) {
        console.error('Recommendation generation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.generateRecommendation = generateRecommendation;
function generateWarnings(skinType, concerns) {
    const warnings = [];
    if (skinType === 'Sensitive') {
        warnings.push('Patch test all new exfoliating actives before full facial application.');
        warnings.push('Avoid using more than one strong active ingredient at a time.');
    }
    if (concerns.includes('Acne')) {
        warnings.push('For severe inflammatory breakouts, consulting a board-certified dermatologist is advised.');
    }
    if (concerns.some(c => ['Fine Lines', 'Wrinkles'].includes(c))) {
        warnings.push('Retinol should not be used during pregnancy or breastfeeding.');
        warnings.push('Start retinol 2-3x/week and gradually increase. Always use sunscreen the next day.');
    }
    return warnings;
}
// @desc    Get all recommended products
// @route   GET /api/recommendations/products
const getRecommendedProducts = async (req, res) => {
    try {
        const products = await RecommendedProduct_1.default.find({}).sort({ category: 1, brand: 1 });
        res.status(200).json({
            success: true,
            data: products,
            count: products.length,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRecommendedProducts = getRecommendedProducts;
// @desc    Get products filtered by skin type and concerns
// @route   GET /api/recommendations/match
const getMatchedProducts = async (req, res) => {
    try {
        const { skinType, concerns } = req.query;
        const filter = {};
        if (skinType) {
            filter.skinTypes = skinType;
        }
        if (concerns) {
            const concernList = concerns.split(',');
            filter.skinConcerns = { $in: concernList };
        }
        const products = await RecommendedProduct_1.default.find(filter).sort({ category: 1 });
        res.status(200).json({
            success: true,
            data: products,
            count: products.length,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMatchedProducts = getMatchedProducts;
//# sourceMappingURL=recommendationController.js.map
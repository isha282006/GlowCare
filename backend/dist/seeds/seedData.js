"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabaseInline = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const Category_1 = __importDefault(require("../models/Category"));
const Ingredient_1 = __importDefault(require("../models/Ingredient"));
const CompatibilityRule_1 = __importDefault(require("../models/CompatibilityRule"));
const User_1 = __importDefault(require("../models/User"));
const RecommendedProduct_1 = __importDefault(require("../models/RecommendedProduct"));
const seedProducts_1 = require("./seedProducts");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const categories = [
    { name: 'Cleanser', icon: '🧼', description: 'Facial cleansers and wash products' },
    { name: 'Toner', icon: '💧', description: 'Toners and balancing waters' },
    { name: 'Serum', icon: '✨', description: 'Treatment serums and essences' },
    { name: 'Moisturizer', icon: '🧴', description: 'Face moisturizers and creams' },
    { name: 'Sunscreen', icon: '☀️', description: 'Sun protection products' },
    { name: 'Eye Cream', icon: '👁️', description: 'Eye area treatments' },
    { name: 'Lip Care', icon: '💋', description: 'Lip balms and treatments' },
    { name: 'Face Mask', icon: '🎭', description: 'Sheet masks and wash-off masks' },
    { name: 'Exfoliator', icon: '🌟', description: 'Chemical and physical exfoliants' },
    { name: 'Treatment', icon: '💊', description: 'Spot treatments and special care' },
    { name: 'Oil', icon: '🫧', description: 'Face oils and oil cleansers' },
    { name: 'Mist', icon: '💨', description: 'Face mists and sprays' },
    { name: 'Other', icon: '📦', description: 'Other skincare products' },
];
const ingredients = [
    { name: 'Retinol', description: 'Vitamin A derivative for anti-aging', category: 'Active' },
    { name: 'Vitamin C', description: 'Antioxidant for brightening', category: 'Active' },
    { name: 'Niacinamide', description: 'Vitamin B3 for pore minimizing', category: 'Active' },
    { name: 'Hyaluronic Acid', description: 'Hydrating humectant', category: 'Hydrator' },
    { name: 'Salicylic Acid', description: 'BHA for acne treatment', category: 'Exfoliant' },
    { name: 'Glycolic Acid', description: 'AHA for exfoliation', category: 'Exfoliant' },
    { name: 'Lactic Acid', description: 'Gentle AHA exfoliant', category: 'Exfoliant' },
    { name: 'Benzoyl Peroxide', description: 'Acne-fighting ingredient', category: 'Active' },
    { name: 'AHA', description: 'Alpha Hydroxy Acid', category: 'Exfoliant' },
    { name: 'BHA', description: 'Beta Hydroxy Acid', category: 'Exfoliant' },
    { name: 'Ceramides', description: 'Skin barrier repair', category: 'Moisturizer' },
    { name: 'Peptides', description: 'Collagen boosting proteins', category: 'Active' },
    { name: 'Squalane', description: 'Lightweight moisturizing oil', category: 'Moisturizer' },
    { name: 'Tea Tree Oil', description: 'Natural antibacterial', category: 'Natural' },
    { name: 'Aloe Vera', description: 'Soothing and hydrating', category: 'Natural' },
    { name: 'Zinc Oxide', description: 'Physical sunscreen filter', category: 'Sunscreen' },
    { name: 'Titanium Dioxide', description: 'Physical sunscreen filter', category: 'Sunscreen' },
    { name: 'Centella Asiatica', description: 'Soothing and healing', category: 'Natural' },
    { name: 'Azelaic Acid', description: 'For rosacea and hyperpigmentation', category: 'Active' },
    { name: 'Kojic Acid', description: 'Skin brightening agent', category: 'Active' },
];
const compatibilityRules = [
    {
        ingredientA: 'Retinol',
        ingredientB: 'Vitamin C',
        status: 'warning',
        warningMessage: 'Retinol and Vitamin C can cause irritation when used together. Use Vitamin C in the morning and Retinol at night.',
    },
    {
        ingredientA: 'Retinol',
        ingredientB: 'AHA',
        status: 'avoid',
        warningMessage: 'Retinol and AHA together can cause excessive irritation and sensitivity. Alternate days or use at different times.',
    },
    {
        ingredientA: 'Retinol',
        ingredientB: 'BHA',
        status: 'warning',
        warningMessage: 'Using Retinol with BHA can increase dryness and irritation. Start slowly and monitor skin.',
    },
    {
        ingredientA: 'Retinol',
        ingredientB: 'Benzoyl Peroxide',
        status: 'avoid',
        warningMessage: 'Benzoyl Peroxide can deactivate Retinol. Use at different times of day.',
    },
    {
        ingredientA: 'AHA',
        ingredientB: 'BHA',
        status: 'warning',
        warningMessage: 'Using AHA and BHA together can over-exfoliate. Use on alternate days.',
    },
    {
        ingredientA: 'Vitamin C',
        ingredientB: 'AHA',
        status: 'warning',
        warningMessage: 'Vitamin C at low pH with AHA may cause irritation. Layer carefully.',
    },
    {
        ingredientA: 'Vitamin C',
        ingredientB: 'Niacinamide',
        status: 'safe',
        warningMessage: 'Vitamin C and Niacinamide can be used together safely despite old myths.',
    },
    {
        ingredientA: 'Niacinamide',
        ingredientB: 'Hyaluronic Acid',
        status: 'safe',
        warningMessage: 'Niacinamide and Hyaluronic Acid work great together for hydration and pore care.',
    },
    {
        ingredientA: 'Vitamin C',
        ingredientB: 'Benzoyl Peroxide',
        status: 'avoid',
        warningMessage: 'Benzoyl Peroxide can oxidize Vitamin C, making it ineffective.',
    },
    {
        ingredientA: 'Retinol',
        ingredientB: 'Glycolic Acid',
        status: 'avoid',
        warningMessage: 'Glycolic Acid and Retinol together increase the risk of irritation and sun sensitivity.',
    },
    {
        ingredientA: 'Niacinamide',
        ingredientB: 'Retinol',
        status: 'safe',
        warningMessage: 'Niacinamide can help reduce irritation from Retinol. Good combination.',
    },
    {
        ingredientA: 'Hyaluronic Acid',
        ingredientB: 'Vitamin C',
        status: 'safe',
        warningMessage: 'Hyaluronic Acid and Vitamin C work well together for hydration and brightening.',
    },
    {
        ingredientA: 'Salicylic Acid',
        ingredientB: 'Glycolic Acid',
        status: 'warning',
        warningMessage: 'Combining BHA and AHA can over-exfoliate sensitive skin. Use on alternate days.',
    },
    {
        ingredientA: 'Peptides',
        ingredientB: 'AHA',
        status: 'warning',
        warningMessage: 'AHA can reduce the effectiveness of Peptides. Apply Peptides first and wait.',
    },
    {
        ingredientA: 'Ceramides',
        ingredientB: 'Hyaluronic Acid',
        status: 'safe',
        warningMessage: 'Ceramides and Hyaluronic Acid complement each other perfectly for barrier repair.',
    },
];
const seedDatabaseInline = async () => {
    try {
        // Clear existing data
        await Category_1.default.deleteMany({});
        await Ingredient_1.default.deleteMany({});
        await CompatibilityRule_1.default.deleteMany({});
        // Seed data
        await Category_1.default.insertMany(categories);
        console.log('Categories seeded');
        await Ingredient_1.default.insertMany(ingredients);
        console.log('Ingredients seeded');
        await CompatibilityRule_1.default.insertMany(compatibilityRules);
        console.log('Compatibility rules seeded');
        // Seed recommended products
        await RecommendedProduct_1.default.deleteMany({});
        await RecommendedProduct_1.default.insertMany(seedProducts_1.recommendedProducts);
        console.log(`Recommended products seeded (${seedProducts_1.recommendedProducts.length} products)`);
        // Create admin user if not exists
        const adminExists = await User_1.default.findOne({ role: 'admin' });
        if (!adminExists) {
            await User_1.default.create({
                name: 'Admin',
                email: 'admin@glowcare.com',
                password: 'admin123456',
                role: 'admin',
            });
            console.log('Admin user created (email: admin@glowcare.com, password: admin123456)');
        }
        console.log('Database seeded successfully!');
    }
    catch (error) {
        console.error('Seed error:', error);
    }
};
exports.seedDatabaseInline = seedDatabaseInline;
//# sourceMappingURL=seedData.js.map
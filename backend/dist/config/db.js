"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const seedData_1 = require("../seeds/seedData");
let mongod = null;
const connectDB = async () => {
    try {
        // Try connecting to the user's MONGODB_URI (e.g. Atlas or local)
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected to external DB: ${conn.connection.host}`);
    }
    catch (error) {
        console.warn(`MongoDB Connection to ${process.env.MONGODB_URI} failed: ${error.message}`);
        console.log('Spawning an in-memory MongoDB database fallback for GlowCare...');
        try {
            mongod = await mongodb_memory_server_1.MongoMemoryServer.create();
            const uri = mongod.getUri();
            const conn = await mongoose_1.default.connect(uri);
            console.log(`Fallback MongoDB Connected to Memory: ${conn.connection.host}`);
            // Auto seed database since it starts completely empty!
            console.log('Auto-seeding in-memory database with default GlowCare data...');
            await (0, seedData_1.seedDatabaseInline)();
        }
        catch (fallbackError) {
            console.error(`Fallback MongoDB Memory Connection Error: ${fallbackError.message}`);
            process.exit(1);
        }
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map
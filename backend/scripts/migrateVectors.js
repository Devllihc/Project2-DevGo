import mongoose from "mongoose";
import dotenv from "dotenv";
import OpenAI from "openai";
import { KlookModel, TripadvisorModel } from "../models/crawlModel.js";

dotenv.config({ path: './.env' }); 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Đã kết nối MongoDB!");
    } catch (error) {
        console.error("Lỗi kết nối DB:", error);
        process.exit(1);
    }
};

const generateEmbedding = async (text) => {
    if (!text || text.trim().length === 0) return null;
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small", 
            input: text.replace(/\n/g, " "),
        });
        return response.data[0].embedding;
    } catch (e) {
        console.error("Lỗi OpenAI:", e.message);
        return null;
    }
};

const runMigration = async () => {
    await connectDB();

    console.log("--- BẮT ĐẦU MIGRATE KLOOK ---");
    const klookDocs = await KlookModel.find({ embedding: { $exists: false } });
    console.log(`Tìm thấy ${klookDocs.length} documents Klook cần xử lý.`);

    for (let i = 0; i < klookDocs.length; i++) {
        const doc = klookDocs[i];
        const content = `Tour: ${doc["Tên Tour"]} - Địa điểm: ${doc["Hoạt động"]} - Mô tả: ${doc["Chi tiết"]}`;
        
        const vector = await generateEmbedding(content);
        if (vector) {
            doc.embedding = vector;
            await doc.save();
            if (i % 10 === 0) console.log(`Klook Progress: ${i}/${klookDocs.length}`);
        }
    }

    console.log("--- BẮT ĐẦU MIGRATE TRIPADVISOR ---");
    const tripDocs = await TripadvisorModel.find({ embedding: { $exists: false } });
    console.log(`Tìm thấy ${tripDocs.length} documents Tripadvisor cần xử lý.`);

    for (let i = 0; i < tripDocs.length; i++) {
        const doc = tripDocs[i];
        const content = `Địa điểm: ${doc["Địa điểm"]} - Loại hình: ${doc["Loại"]} - Tour: ${doc["Tour Name"]}`;
        
        const vector = await generateEmbedding(content);
        if (vector) {
            doc.embedding = vector;
            await doc.save();
            if (i % 10 === 0) console.log(`Tripadvisor Progress: ${i}/${tripDocs.length}`);
        }
    }

    console.log("--- HOÀN TẤT TOÀN BỘ ---");
    process.exit();
};

runMigration();
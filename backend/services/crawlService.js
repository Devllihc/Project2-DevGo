import { KlookModel, TripadvisorModel } from "../models/crawlModel.js";
import OpenAI from "openai";
import logger from "../utils/logger.js";

let openaiClient = null;
const getOpenAIClient = () => {
    if (!openaiClient && process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
};

export const getCrawledContext = async (destination) => {
    try {
        if (!destination) return "";

        const openai = getOpenAIClient();
        if (!openai) {
            logger.warn("OpenAI API key not configured, skipping vector search context");
            return "";
        }

        console.log(`Đang Vector Search cho: ${destination}...`);

        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: destination,
        });
        const queryVector = embeddingResponse.data[0].embedding;

        // 2. Tìm kiếm trên Klook
        const klookResults = await KlookModel.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index", 
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 100,
                    "limit": 5 
                }
            },
            {
                "$project": {
                    "Hoạt động": 1,
                    "Chi tiết": 1,
                    "score": { "$meta": "vectorSearchScore" } 
                }
            }
        ]);

        const tripResults = await TripadvisorModel.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index", 
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 100,
                    "limit": 5
                }
            },
            {
                "$project": {
                    "Địa điểm": 1,
                    "Loại": 1,
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ]);

        let contextString = "";

        if (klookResults.length > 0) {
            contextString += "\n[DỮ LIỆU TỪ KLOOK - CÁC TOUR & VÉ]:\n";
            klookResults.forEach(item => {
                const name = item["Hoạt động"] || "Hoạt động";
                let desc = item["Chi tiết"] || "";
                if (desc.length > 150) desc = desc.substring(0, 150) + "...";
                
                contextString += `- ${name}: ${desc}\n`;
            });
        }

        if (tripResults.length > 0) {
            contextString += "\n[DỮ LIỆU TỪ TRIPADVISOR - ĐIỂM ĐẾN]:\n";
            tripResults.forEach(item => {
                const name = item["Địa điểm"];
                const type = item["Loại"] ? `(${item["Loại"]})` : "";
                if (name) contextString += `- ${name} ${type}\n`;
            });
        }

        return contextString;

    } catch (error) {
        logger.error({ err: error }, "Vector Search error");
        return ""; 
    }
};
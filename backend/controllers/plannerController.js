import itineraryModel from "../models/planModel.js";
import fetch from "node-fetch";
import { jsonrepair } from "jsonrepair";
import { getDestinationContext } from "../services/googlePlaceService.js";
import { getCrawledContext } from "../services/crawlService.js";

const AI_URL = process.env.AI_SERVICE_URL;

const cleanAIResponse = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "");
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned.trim();
};

const createItinerary = async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); 

    try {
        const userId = req.user?.id;
        const { destination, duration, budget, requirements } = req.body;
        const parsedDuration = parseInt(duration) || 1; 

        if (!AI_URL) return res.status(503).json({ success: false, message: "Server AI chưa cấu hình" });
        if (!destination) return res.status(400).json({ success: false, message: "Thiếu điểm đến" });

        console.log(`[${userId}] Bắt đầu tạo lịch trình đi: ${destination} (${parsedDuration} ngày)`);

        const [googleContext, vectorContext] = await Promise.all([
            getDestinationContext(destination),
            getCrawledContext(destination)
        ]);

        const finalContext = (googleContext || "") + "\n" + (vectorContext || "");

        if(!finalContext.trim()){
          console.log("Khong lay duoc du lieu tham khao nao")
        } else {
          console.log("Tim thay")
        }

        // console.log(finalContext);

        const instruction = `
            Hãy đóng vai hướng dẫn viên du lịch chuyên nghiệp, am hiểu sâu sắc về ${destination}.
            Nhiệm vụ: Lên lịch trình chi tiết đi ${destination}.
            
            THÔNG TIN CHUYẾN ĐI:
            - Tổng số ngày: ${parsedDuration} ngày (BẮT BUỘC PHẢI VIẾT ĐỦ ${parsedDuration} NGÀY)
            - Ngân sách: ${budget}
            - Ghi chú khách hàng: ${requirements}

            DỮ LIỆU ĐỊA ĐIỂM THAM KHẢO (Ưu tiên dùng):
            ${finalContext}

            YÊU CẦU OUTPUT (JSON FORMAT ONLY):
            1. Trả về đúng 1 JSON Object. Không giải thích thêm.
            2. Database không có trường "notes", hãy viết mô tả hoạt động gộp vào "activity_name".
            3. "description": Mô tả ngắn gọn (1-2 câu) về trải nghiệm tại đó (trích từ dữ liệu tham khảo nếu có).
            4. Tách rõ giờ bắt đầu và kết thúc.
            
            CẤU TRÚC JSON BẮT BUỘC:
            {
              "trip_name": "Tên chuyến đi hấp dẫn",
              "total_days": ${parsedDuration},
              "itinerary_details": [
                {
                  "day": 1,
                  "activities": [
                    {
                      "start_time": "08:00",
                      "end_time": "10:00",
                      "activity_name": "Tên địa điểm - Mô tả ngắn gọn hoạt động tại đây",
                      "address": "Địa chỉ cụ thể",
                      "transport": "Taxi/Xe máy/Đi bộ",
                      "cost_vnd": 50000,
                      "distance_km": 5
                    }
                  ]
                }
                // ... BẮT BUỘC PHẢI CÓ ĐỦ ${parsedDuration} OBJECT NGÀY Ở ĐÂY
              ]
            }
        `;

        console.log("Đang gửi yêu cầu sang AI Service...");

        const aiResponse = await fetch(`${AI_URL}/generate-itinerary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                context: "", 
                requirement: instruction, 
                max_tokens: 4096 
            }),
            signal: controller.signal
        });

        if (!aiResponse.ok) {
            throw new Error(`AI Server Error: ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        let rawResult = aiData.result; 

        if (!rawResult) throw new Error("AI trả về rỗng.");

        // Xử lý JSON
        const cleanedJson = cleanAIResponse(rawResult);
        let itineraryJson;
        
        try {
            const repaired = jsonrepair(cleanedJson);
            itineraryJson = JSON.parse(repaired);
        } catch (e) {
            console.error("JSON Parse Error. Raw text:", rawResult);
            return res.status(500).json({ 
                success: false, 
                message: "AI bị lỗi định dạng JSON.",
                raw: rawResult 
            });
        }

        const rawDetails = itineraryJson.itinerary_details || [];
        
        const processedDetails = rawDetails.map(dayItem => ({
            day: dayItem.day,
            activities: dayItem.activities.map(act => {
                let sTime = act.start_time || "";
                let eTime = act.end_time || "";
                
                if (!sTime && act.time) {
                    const parts = act.time.split("-").map(t => t.trim());
                    sTime = parts[0];
                    if (parts.length > 1) eTime = parts[1];
                }

                let finalName = act.activity_name;
                if (act.notes) {
                    finalName = `${finalName} (${act.notes})`;
                }
                if (act.description) {
                    finalName = `${finalName} - ${act.description}`;
                }

                return {
                    start_time: sTime,
                    end_time: eTime,
                    activity_name: finalName, 
                    address: act.address || "",
                    transport: act.transport || "Tự túc",
                    distance_km: act.distance_km || 0,
                    cost_vnd: act.cost_vnd || 0
                };
            })
        }));

        const calculatedTotalCost = processedDetails.reduce((sumDay, day) => {
            return sumDay + (day.activities?.reduce((sumAct, act) => sumAct + (act.cost_vnd || 0), 0) || 0);
        }, 0);

        const newPlan = new itineraryModel({
            userId: userId,
            prompt: `Đi ${destination} (${duration})`,
            trip_name: itineraryJson.trip_name || `Chuyến đi ${destination}`,
            total_days: itineraryJson.total_days || parsedDuration,
            total_cost: calculatedTotalCost,
            itinerary_details: processedDetails, 
            raw_response: rawResult
        });

        await newPlan.save();
        
        console.log("Lưu lịch trình thành công!");
        return res.status(201).json({ success: true, data: newPlan });

    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).json({ success: false, message: "AI xử lý quá lâu (Timeout)" });
        }
        console.error("Controller Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        clearTimeout(timeoutId);
    }
};

const getUserItineraries = async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search; // <--- 1. Lấy từ khóa search từ URL
    const skip = (page - 1) * limit;

    let query = { userId: userId };

    if (search) {
        query.$or = [
            { trip_name: { $regex: search, $options: "i" } },
            { prompt: { $regex: search, $options: "i" } }
        ];
    }

    const itineraries = await itineraryModel
      .find(query) 
      .select("trip_name total_days total_cost prompt createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await itineraryModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: itineraries,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTripDetail = async (req, res) => {
  try {
    const tripId = req.params.id;
    const userId = req.user?.id;
    const trip = await itineraryModel.findOne({ _id: tripId, userId: userId });

    if (!trip) return res.status(404).json({ success: false, message: "Không tìm thấy chuyến đi" });

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createItinerary, getUserItineraries, getTripDetail };
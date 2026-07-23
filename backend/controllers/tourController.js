// controllers/tourController.js
import Tour from "../models/tour.js";
import bookingModel from "../models/bookingModel.js";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const attachRemainingSlots = async (toursArray) => {
  const tourIds = toursArray.map((t) => t._id);
  const bookings = await bookingModel.find({
    tourId: { $in: tourIds },
    status: { $ne: "cancelled" },
  }).lean();

  const bookedSlotsMap = {};
  bookings.forEach((b) => {
    const key = `${b.tourId}_${b.startDate}`;
    if (!bookedSlotsMap[key]) bookedSlotsMap[key] = 0;
    bookedSlotsMap[key] += b.travelers;
  });

  return toursArray.map((tour) => {
    if (tour.availableDates && tour.availableDates.length > 0) {
      tour.availableDates = tour.availableDates.map((d) => {
        // Handle old string format if any sneak in
        const dateStr = typeof d === "string" ? d : d.date;
        const maxSlots = typeof d === "string" ? tour.maxGroupSize : d.maxSlots;
        
        const key = `${tour._id}_${dateStr}`;
        const booked = bookedSlotsMap[key] || 0;
        return {
          date: dateStr,
          maxSlots: maxSlots,
          bookedSlots: booked,
          remainingSlots: Math.max(0, maxSlots - booked),
        };
      });
    }
    return tour;
  });
};

// [GET] /api/tours
// Tours are an admin-curated catalog (bounded in practice, unlike user/booking
// data), so a generous cap is enough to remove the unbounded-fetch risk
// without breaking the existing (unpaginated) frontend catalog UI.
const MAX_TOURS_RETURNED = 500;

export const getAllTours = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, city, minRating } = req.query;
    
    let query = {};
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }
    
    if (minRating) {
      query.avgRating = { $gte: Number(minRating) };
    }

    let tours = await Tour.find(query).sort({ createdAt: -1 }).limit(MAX_TOURS_RETURNED).lean();
    tours = await attachRemainingSlots(tours);
    res.status(200).json(tours);
  } catch (err) {
    next(err);
  }
};

// [GET] /api/tours/:id
export const getTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id).lean();
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    const [updatedTour] = await attachRemainingSlots([tour]);
    res.status(200).json(updatedTour);
  } catch (err) {
    next(err);
  }
};

// Parses the multipart-form "availableDates" JSON string, returning a 400 for
// malformed input instead of letting JSON.parse crash the request.
const parseAvailableDates = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error("Invalid availableDates: must be valid JSON");
    err.status = 400;
    throw err;
  }
};

// [POST] /api/tours
export const createTour = async (req, res, next) => {
  try {
    const {
      title,
      desc,
      price,
      city,
      distance,
      maxGroupSize,
      availableDates,
      featured,
    } = req.body;

    const photo = req.file ? `/uploads/${req.file.filename}` : "";

    const newTour = new Tour({
      title,
      desc,
      price,
      city,
      distance,
      maxGroupSize,
      photo,
      availableDates: availableDates ? parseAvailableDates(availableDates) : [],
      featured: featured === "true" || featured === true, // handle string or boolean
    });

    await newTour.save();
    res.status(201).json(newTour);
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/tours/:id
export const updateTour = async (req, res, next) => {
  try {
    const {
      title,
      desc,
      price,
      city,
      distance,
      maxGroupSize,
      availableDates,
      featured,
    } = req.body;

    const updateData = {
      title,
      desc,
      price,
      city,
      distance,
      maxGroupSize,
      featured: featured === "true" || featured === true,
    };

    if (availableDates) {
      updateData.availableDates = parseAvailableDates(availableDates);
    }

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
      const oldTour = await Tour.findById(req.params.id);
      if (oldTour && oldTour.photo) {
        const oldPhotoPath = path.join(process.cwd(), oldTour.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    if (!updatedTour)
      return res.status(404).json({ message: "Tour not found" });

    res.status(200).json(updatedTour);
  } catch (err) {
    next(err);
  }
};

// [DELETE] /api/tours/:id
export const deleteTour = async (req, res, next) => {
  try {
    const deleted = await Tour.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Tour not found" });

    if (deleted.photo) {
      const photoPath = path.join(process.cwd(), deleted.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    res.status(200).json({ message: "Tour deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// [GET] /api/tours/related/:id
export const getRelatedTours = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentTour = await Tour.findById(id);
    if (!currentTour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    // Find tours in the same city or similar price range, excluding the current tour
    let relatedTours = await Tour.find({
      _id: { $ne: id },
      $or: [
        { city: currentTour.city },
        { price: { $gte: currentTour.price * 0.8, $lte: currentTour.price * 1.2 } }
      ]
    })
    .sort({ avgRating: -1 }) // Prefer higher rated tours
    .limit(3)
    .lean();

    relatedTours = await attachRemainingSlots(relatedTours);
    res.status(200).json(relatedTours);
  } catch (err) {
    next(err);
  }
};

// [POST] /api/tours/:id/itinerary/upload
// [POST] /api/tours/:id/itinerary/upload
// Admin uploads an Excel/CSV file to set the itinerary for a tour.
// Expected columns: Day, DayTitle, Time, EndTime, ActivityName, Description, Transport, DistanceKm, CostVnd, Notes
export const uploadItinerary = async (req, res, next) => {
  const filePath = req.file?.path;
  try {
    console.log("[uploadItinerary] req.file:", req.file);

    if (!req.file || !filePath) {
      return res.status(400).json({ success: false, message: "No file uploaded (field name must be 'itinerary')" });
    }

    console.log("[uploadItinerary] Reading file:", filePath, "size:", req.file.size);

    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (xlsxErr) {
      console.error("[uploadItinerary] XLSX.readFile failed:", xlsxErr.message);
      return res.status(400).json({ success: false, message: `Cannot read Excel file: ${xlsxErr.message}` });
    }

    const sheetName = workbook.SheetNames[0];
    console.log("[uploadItinerary] Sheets:", workbook.SheetNames, "→ using:", sheetName);

    const worksheet = workbook.Sheets[sheetName];

    // Auto-detect the real header row (the row containing 'Day' and 'ActivityName').
    // Some files have 1-2 extra title rows at the top before the column header row.
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, rawRows.length); i++) {
      const rowStr = rawRows[i].map(String).join("|").toLowerCase();
      if (rowStr.includes("day") && (rowStr.includes("activityname") || rowStr.includes("activity_name"))) {
        headerRowIndex = i;
        console.log(`[uploadItinerary] Header row detected at index ${i}:`, rawRows[i]);
        break;
      }
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", range: headerRowIndex });

    console.log("[uploadItinerary] Parsed rows:", rows.length);
    if (rows.length > 0) console.log("[uploadItinerary] First row keys:", Object.keys(rows[0]));

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: "File is empty or has no data rows" });
    }

    // Group rows by day number
    const dayMap = new Map();
    for (const row of rows) {
      const rawDay = row["Day"] || row["day"] || row["NGÀ Y"] || row["Ngày"] || "";
      // Support both numeric (1) and text forms ("Ngày 1", "Day 1", "D1")
      const dayMatch = String(rawDay).match(/(\d+)/);
      const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : 0;
      if (!dayNum || dayNum < 1) {
        console.log("[uploadItinerary] Skipping row (no valid Day):", JSON.stringify(row).slice(0, 120));
        continue;
      }

      if (!dayMap.has(dayNum)) {
        dayMap.set(dayNum, {
          day: dayNum,
          title: String(row["DayTitle"] || row["day_title"] || row["Tiêu đề ngày"] || `Day ${dayNum}`).trim(),
          activities: [],
        });
      }

      const activityName = String(
        row["ActivityName"] || row["activity_name"] || row["Hoạt động"] || row["Tên hoạt động"] || ""
      ).trim();
      if (!activityName) {
        console.log("[uploadItinerary] Skipping row (no ActivityName), day:", dayNum);
        continue;
      }

      dayMap.get(dayNum).activities.push({
        time: String(row["Time"] || row["time"] || row["Giờ bắt đầu"] || "").trim(),
        endTime: String(row["EndTime"] || row["end_time"] || row["Giờ kết thúc"] || "").trim(),
        name: activityName,
        description: String(row["Description"] || row["description"] || row["Mô tả"] || "").trim(),
        transport: String(row["Transport"] || row["transport"] || row["Phương tiện"] || "").trim(),
        distanceKm: parseFloat(row["DistanceKm"] || row["distance_km"] || row["Khoảng cách (km)"] || 0) || 0,
        costVnd: parseFloat(row["CostVnd"] || row["cost_vnd"] || row["Chi phí (VNĐ)"] || 0) || 0,
        notes: String(row["Notes"] || row["notes"] || row["Ghi chú"] || "").trim(),
      });
    }

    const itinerary = Array.from(dayMap.values()).sort((a, b) => a.day - b.day);
    console.log("[uploadItinerary] Itinerary days built:", itinerary.length);

    if (itinerary.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Could not parse itinerary. Check that the file has 'Day' and 'ActivityName' columns.",
      });
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      { itinerary },
      { new: true }
    );

    if (!updatedTour) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }

    res.status(200).json({
      success: true,
      message: `Itinerary updated successfully: ${itinerary.length} days, ${rows.length} rows`,
      itinerary: updatedTour.itinerary,
    });
  } catch (err) {
    console.error("[uploadItinerary] Unexpected error:", err);
    next(err);
  } finally {
    // Always clean up temp file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

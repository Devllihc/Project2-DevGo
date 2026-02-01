import mongoose from "mongoose";

const klookSchema = new mongoose.Schema({
    "Tên Tour": String,
    "Hoạt động": String, 
    "Chi tiết": String,

    embedding: {
        type: [Number], 
        index: true   
    }
}, { collection: 'crawlPlace_Klook' });

const tripadvisorSchema = new mongoose.Schema({
    "Tour Name": String,
    "Địa điểm": String,
    "Loại": String,
    "Thời gian": String,
    
    embedding: {
        type: [Number],
        index: true
    }
}, { collection: 'crawlPlace_Tripadvisor' });

const KlookModel = mongoose.model("Klook", klookSchema);
const TripadvisorModel = mongoose.model("Tripadvisor", tripadvisorSchema);

export { KlookModel, TripadvisorModel };
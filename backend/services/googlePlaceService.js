import axios from "axios";

const formatPlaces = (places, title) => {
    if (!places || places.length === 0) return "";
    
    const formattedList = places.slice(0, 10).map((place, index) => {
        return `${index + 1}. ${place.name} - ${place.formatted_address} (${place.rating || "4.0"} sao)`;
    }).join("\n");

    return `${title}:\n${formattedList}`;
};

export const getDestinationContext = async (destination) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        console.error("Missing Google Places API Key");
        return "";
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
    const config = { params: { key: apiKey, language: "vi" } };

    try {
        const fetchAttractions = axios.get(url, {
            ...config,
            params: { ...config.params, query: `Địa điểm du lịch nổi tiếng ${destination}` }
        }).catch(err => ({ data: { results: [] } })); 

        const fetchRestaurants = axios.get(url, {
            ...config,
            params: { ...config.params, query: `Quán ăn ngon đặc sản ${destination}` }
        }).catch(err => ({ data: { results: [] } }));

        const [attractionsRes, restaurantsRes] = await Promise.all([fetchAttractions, fetchRestaurants]);

        const attractionsText = formatPlaces(
            attractionsRes.data?.results || [], 
            "--- ĐỊA ĐIỂM THAM QUAN ---"
        );
        
        const restaurantsText = formatPlaces(
            restaurantsRes.data?.results || [], 
            "--- NHÀ HÀNG QUÁN ĂN ---"
        );

        // Ghép chuỗi
        const fullContext = [attractionsText, restaurantsText].filter(Boolean).join("\n\n");
        return fullContext || "";

    } catch (error) {
        console.error("Google Place API Error (Critical):", error.message);
        return "";
    }
};
import express from "express";
import cors from "cors";
import { getWeather, searchLocations } from "./services/openMeteoService";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({status: "ok" });
});

app.get("/api/locations/search", async(req, res)=> {
    try {
        const query = String(req.query.q || "");

        if(!query.trim()){
            return res.status(400).json({error: "Search query is required"});
        }

        const locations = await searchLocations(query);
        res.json(locations);
    } catch (error){
        res.status(500).json({error:"Failed to search locations"});
    }
});

app.get("/api/weather", async(req,res)=> {
    try {
        const latitude = Number(req.query.lat);
        const longitude = Number(req.query.lon);

        if(Number.isNaN(latitude) || Number.isNaN(longitude)){
            return res.status(400).json({error:"Valid lat and lon are required"});
        }

        const weather = await getWeather(latitude, longitude);
        res.json(weather);
    } catch(error) {
        res.status(500).json({error: "Failed to fetch weather"});
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

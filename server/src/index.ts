import express from "express";
import cors from "cors";
import { getWeather, searchLocations } from "./services/openMeteoService";
import { buildWeatherDecision } from "./services/decisionEngine";
import { compareCities } from "./services/comparisonService";
import { compareCoordinates } from "./services/comparisonService";
import rateLimit from "express-rate-limit";
import { error } from "node:console";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

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

app.get("/api/decision", async(req, res)=> {
    try {
        const latitude = Number(req.query.lat);
        const longitude = Number(req. query.lon);

        if (Number.isNaN(latitude) || Number.isNaN(longitude)){
            return res.status(400).json({error: "Valid lat and lon are required"});
        }

        const weather = await getWeather(latitude, longitude);
        const decision = buildWeatherDecision(weather);

        res.json(decision);
    } catch (error){
        console.log(error);
        res.status(500).json({ error: "Failed to build weather decision" });
    }
});

app.get("/api/compare", async (req, res) => {
    try{
        const left = String(req.query.left || "");
        const right = String(req.query.right || "");

        if(!left.trim() || !right.trim()){
            return res.status(400).json({
                error: "Both left and right city names are required"
            });
        }

        const comparison = await compareCities(left, right);
        res.json(comparison);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Failed to compare cities"});
    }
});

app.get("/api/compare/coordinates", async (req, res) => {
  try {
    const leftName = String(req.query.leftName || "");
    const rightName = String(req.query.rightName || "");

    const leftLat = Number(req.query.leftLat);
    const leftLon = Number(req.query.leftLon);
    const rightLat = Number(req.query.rightLat);
    const rightLon = Number(req.query.rightLon);

    if (
      !leftName.trim() ||
      !rightName.trim() ||
      Number.isNaN(leftLat) ||
      Number.isNaN(leftLon) ||
      Number.isNaN(rightLat) ||
      Number.isNaN(rightLon)
    ) {
      return res.status(400).json({
        error: "leftName, rightName, leftLat, leftLon, rightLat, and rightLon are required"
      });
    }

    const comparison = await compareCoordinates({
      left: {
        name: leftName,
        latitude: leftLat,
        longitude: leftLon
      },
      right: {
        name: rightName,
        latitude: rightLat,
        longitude: rightLon
      }
    });

    res.json(comparison);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to compare coordinates" });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
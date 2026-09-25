import axios from "axios";
import { cache } from "./cacheService";

export type ForecastModel = 
| "best_match"
| "ecmwf_ifs"
| "ncep_gfs_global"
| "cmc_gem_seamless"
| "icon_seamless";

export const MODEL_LABELS: Record<ForecastModel, string> = {
    best_match: "Best Match",
    ecmwf_ifs: "ECMWF IFS",
    ncep_gfs_global: "NOAA GFS",
    cmc_gem_seamless: "Canadian GEM",
    icon_seamless:"DWD ICON"
};

export async function getModelForecast(
    latitude: number,
    longitude: number,
    model: ForecastModel
) {
    const cacheKey = `model:${model}:${latitude.toFixed(4)}:${longitude.toFixed(4)}`

    const cachedForcast = cache.get(cacheKey);

    if(cachedForcast) {
        return cachedForcast;
    }

    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
            latitude,
            longitude,
            models: model,
            hourly: [
                "temperature_2m",
                "precipitation_probability",
                "wind_speed_10m"
            ].join(","),
            timezone: "auto",
            forecast_days: 2
        }
    });

    const forecast = {
        model,
        label: MODEL_LABELS[model],
        timezone: response.data.timezone,
        hourly: {
            time: response.data.hourly.time.slice(0,24),
            temperature: response.data.hourly.temperature_2m.slice(0,24),
            precipitationProbability:response.data.hourly.precipitation_probability.slice(0, 24),
            windSpeed: response.data.hourly.wind_speed_10m.slice(0,24)
        }
    };

    cache.set(cacheKey, forecast, 10*60);

    return forecast;
}

export async function searchLocations(query: string){
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `locations:${normalizedQuery}`;

    const cachedLocations = cache.get(cacheKey);

    if (cachedLocations) {
        return cachedLocations;
    }

    const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: {
            name: query,
            count:5,
            language:"en",
            format:"json"
        }
    });
    
    const results = response.data.results ?? [];

    const locations = results.map((location: any) => ({
        id: location.id,
        name: location.name,
        country: location.country,
        admin1: location.admin1,
        latitude:location.latitude,
        longitude:location.longitude
    }));

    cache.set(cacheKey, locations, 24*60*60);

    return locations;
}

export async function getWeather(latitude:number, longitude:number){
    const cacheKey = `weather:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

    const cacheWeather = cache.get(cacheKey);

    if (cacheWeather) {
        return cacheWeather;
    }

    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
            latitude,
            longitude,
            current: [
                "temperature_2m",
                "apparent_temperature",
                "weather_code",
                "wind_speed_10m"
            ].join(","),
            hourly:[
                "temperature_2m",
                "precipitation_probability",
                "weather_code"
            ].join(","),
            daily:[
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_probability_max",
                "weather_code"
            ].join(","),
            timezone: "auto"
        }
    });

    cache.set(cacheKey, response.data, 10*60);

    return response.data;
}

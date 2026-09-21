import axios from "axios";

export async function searchLocations(query: string){
    const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: {
            name: query,
            count:5,
            language:"en",
            format:"json"
        }
    });
    
    const results = response.data.results ?? [];

    return results.map((location: any) => ({
        id: location.id,
        name: location.name,
        country: location.country,
        admin1: location.admin1,
        latitude:location.latitude,
        longitude:location.longitude
    }));
}

export async function getWeather(latitude:number, longitude:number){
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
    return response.data;
}

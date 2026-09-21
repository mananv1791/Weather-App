type WeatherData = {
    current: {
        temperature_2m: number;
        apparent_temperature: number;
        wind_speed_10m:number;
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation_probability:number[];
    };
};

export function shouldBringUmbrella(rainProbability: number){
    return rainProbability >= 40;
}

export function getClothingSuggestion(feelsLike: number){
    if(feelsLike <= 0){
        return "Heavy winter coat, gloves, and warm layers recommended.";
    }
    if(feelsLike <= 10){
        return "Warm jacket recommended.";
    }
    if(feelsLike <= 16){
        return "Light jacket or hoodie recommended.";
    }
    if (feelsLike >= 28){
        return "Light brethable clothing recommended.";
    }
    return "Comfortable weather. No extra layers needed.";
}

export function getOutdoorScore (
    feelsLike: number,
    rainProbability: number,
    windSpeed:number
) {
    let score = 100;

    if(feelsLike <0 || feelsLike >32) score -=30;
    else if(feelsLike <8||feelsLike>28) score -=20;
    else if (feelsLike<14 || feelsLike>25) score -= 10;

    if (rainProbability >= 70) score -= 35;
    else if (rainProbability >= 40) score -= 20;
    else if (rainProbability >= 20) score -= 10;

    if(windSpeed >= 40) score -= 25;
    else if(windSpeed>=25) score -= 15;
    else if(windSpeed>=15) score -= 5;

    return Math.max(0, Math.min(100, score));
}


export function getBestOutdoorWindow(weather: WeatherData) {
    const now = new Date();
    const candidates = weather.hourly.time.map((time,index) => {
        const date = new Date(time);
        const hour = date.getHours();

        const isFuture = date >= now;
        const isDaytime = hour >= 7 && hour <= 21;

        if(!isFuture || !isDaytime){
            return null;
        }

        const temperature = weather.hourly.temperature_2m[index];
        const rainProbability = weather.hourly.precipitation_probability[index]

        const score = getOutdoorScore(
            temperature,
            rainProbability,
            weather.current.wind_speed_10m
        );

        return {
            time,
            hour,
            score,
            temperature,
            rainProbability
        };
    }).filter((item):item is NonNullable<typeof item> => item !== null);

    if(candidates.length==0){
        return {
            label:"No clear outdoor window found",
            score: 0
        };
    }

    const best = candidates.reduce((bestSoFar, current) => {
        return current.score > bestSoFar.score ? current : bestSoFar;
    });

    const startHour = best.hour;
    const endHour = Math.min(best.hour + 2, 23)

    return {
        label: `${formatHour(startHour)} - ${formatHour(endHour)})`,
        score: best.score
    };
}

function formatHour(hour:number) {
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${displayHour} ${suffix}`;
}


export function buildWeatherDecision(weather: WeatherData){
    const feelsLike = weather.current.apparent_temperature;
    const windSpeed = weather.current.wind_speed_10m;
    const nextRainProbability = weather.hourly.precipitation_probability[0] ?? 0;

    const umbrellaNeeded = shouldBringUmbrella(nextRainProbability);
    const clothing = getClothingSuggestion(feelsLike);
    const outdoorScore = getOutdoorScore(feelsLike, nextRainProbability, windSpeed);
    const bestOutdoorWindow = getBestOutdoorWindow(weather)

    return {
        summary: getSummary(outdoorScore, umbrellaNeeded),
        umbrella: {
            needed: umbrellaNeeded,
            message: umbrellaNeeded
                ? "Bring an umbrella. Rain risk is meaningful."
                : "Umbrella is not needed right now."
        },
        clothing: {
            message: clothing
        },
        outdoor: {
            score: outdoorScore,
            bestWindow: bestOutdoorWindow.label
        },
        conditions: {
            feelsLike,
            windSpeed,
            rainProbability: nextRainProbability
        }
    };
}

function getSummary(outdoorScore: number, umbrellaNeeded: boolean){
    if(outdoorScore >= 80 && !umbrellaNeeded){
        return "Great conditions for outdoor plans.";
    }

    else if(outdoorScore >= 60){
        return "Decent outdoor conditions with a few things to watch.";
    }

    else if(outdoorScore >= 40){
        return "Outdoor plans are possible, but conditions are not ideal.";
    }

    return "Consider indoor plans or prepare carefully before going out."
}
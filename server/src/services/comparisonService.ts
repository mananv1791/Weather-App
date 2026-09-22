import { buildWeatherDecision } from "./decisionEngine";
import { getWeather, searchLocations } from "./openMeteoService";

type ComparedCity = {
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    outdoorScore: number;
    rainProbability: number;
    feelsLike: number;
    windSpeed: number;
    summary: string;
    bestWindow: string;
};

export async function compareCities(leftQuery: string, rightQuery: string) {
    const leftLocation = await getFirstLocation(leftQuery);
    const rightLocation = await getFirstLocation(rightQuery);

    const [leftWeather, rightWeather] = await Promise.all([
        getWeather(leftLocation.latitude, leftLocation.longitude),
        getWeather(rightLocation.latitude, rightLocation.longitude)
    ]);

    const leftDecision = buildWeatherDecision(leftWeather);
    const rightDecision = buildWeatherDecision(rightWeather);

    const left: ComparedCity = {
        name: leftLocation.name,
        country: leftLocation.country,
        admin1: leftLocation.admin1,
        latitude: leftLocation.latitude,
        longitude: leftLocation.longitude,
        outdoorScore: leftDecision.outdoor.score,
        rainProbability: leftDecision.conditions.rainProbability,
        feelsLike: leftDecision.conditions.feelsLike,
        windSpeed: leftDecision.conditions.windSpeed,
        summary: leftDecision.summary,
        bestWindow: leftDecision.outdoor.bestWindow
    };

    const right: ComparedCity = {
        name: rightLocation.name,
        country: rightLocation.country,
        admin1: rightLocation.admin1,
        latitude: rightLocation.latitude,
        longitude: rightLocation.longitude,
        outdoorScore: rightDecision.outdoor.score,
        rainProbability: rightDecision.conditions.rainProbability,
        feelsLike: rightDecision.conditions.feelsLike,
        windSpeed: rightDecision.conditions.windSpeed,
        summary: rightDecision.summary,
        bestWindow: rightDecision.outdoor.bestWindow
    };

    const winner = pickWinner(left, right);

    return {
        left,
        right,
        winner
    };
}

async function getFirstLocation(query: string){
    const locations = await searchLocations(query);

    if(locations.length === 0){
        throw new Error(`No location found for "${query}`);
    }

    return locations[0];
}

function pickWinner(left: ComparedCity, right: ComparedCity){
    const scoreDifference = left.outdoorScore - right.outdoorScore;

    if(Math.abs(scoreDifference) <= 5){
        return {
            name: "Tie",
            reason: `${left.name} and ${right.name} have similar outdoor conditions.`
        };
    }

    const better = scoreDifference > 0 ? left : right;
    const other = scoreDifference > 0 ? right : left;

    const reasons = buildReasons(better, other);

    return {
        name: better.name,
        reason: reasons.join(" ")
    };
}

function buildReasons(better: ComparedCity, other:ComparedCity){
    const reasons: string[] = [];

    if(better. outdoorScore > other.outdoorScore){
        reasons.push(
            `${better.name} has a hight outdoor score (${better.outdoorScore} vs ${other.outdoorScore}).`
        );
    }

    if(better.rainProbability < other.rainProbability){
        reasons.push(
            `${better.name} has lower rain risk (${better.rainProbability}% vs ${other.rainProbability}%).`
        );
    }

    if(better.windSpeed < other.windSpeed){
        reasons.push(
            `${better.name} is less windy (${better.windSpeed} km/h vs ${other.windSpeed} km/h).`
        );
    }

    if (reasons.length===0){
        reasons.push(`${better.name} has slightly better overall conditions.`);
    }

    return reasons;

}


type CoordinateLocation = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export async function compareCoordinates(input: {
  left: CoordinateLocation;
  right: CoordinateLocation;
}) {
  const [leftWeather, rightWeather] = await Promise.all([
    getWeather(input.left.latitude, input.left.longitude),
    getWeather(input.right.latitude, input.right.longitude)
  ]);

  const leftDecision = buildWeatherDecision(leftWeather);
  const rightDecision = buildWeatherDecision(rightWeather);

  const left: ComparedCity = {
    name: input.left.name,
    country: input.left.country,
    admin1: input.left.admin1,
    latitude: input.left.latitude,
    longitude: input.left.longitude,
    outdoorScore: leftDecision.outdoor.score,
    rainProbability: leftDecision.conditions.rainProbability,
    feelsLike: leftDecision.conditions.feelsLike,
    windSpeed: leftDecision.conditions.windSpeed,
    summary: leftDecision.summary,
    bestWindow: leftDecision.outdoor.bestWindow
  };

  const right: ComparedCity = {
    name: input.right.name,
    country: input.right.country,
    admin1: input.right.admin1,
    latitude: input.right.latitude,
    longitude: input.right.longitude,
    outdoorScore: rightDecision.outdoor.score,
    rainProbability: rightDecision.conditions.rainProbability,
    feelsLike: rightDecision.conditions.feelsLike,
    windSpeed: rightDecision.conditions.windSpeed,
    summary: rightDecision.summary,
    bestWindow: rightDecision.outdoor.bestWindow
  };

  return {
    left,
    right,
    winner: pickWinner(left, right)
  };
}
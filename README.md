# Weather Decision Assistant

A full-stack weather application designed to go beyond a basic forecast dashboard. The goal of this project is to turn raw weather data into useful daily decisions, such as whether to bring an umbrella, when to go outside, and how two locations compare for outdoor plans.

This project is being built as an SDE portfolio project with a focus on API integration, backend architecture, data transformation, and practical user-focused features.

## Current Status

The project currently includes:

- React + TypeScript frontend built with Vite
- Express + TypeScript backend
- Backend API proxy for Open-Meteo
- Location search using the Open-Meteo Geocoding API
- Weather forecast retrieval using the Open-Meteo Forecast API
- Decision engine for umbrella, clothing, outdoor score, and best outdoor time window
- Smart location comparison using exact latitude/longitude selection
- Frontend UI for searching locations, selecting exact results, viewing advice, and comparing two places
- API rate limiting
- In-memory response caching for weather and geocoding requests
- Basic health check endpoint
- Separate `client` and `server` project structure

## Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- TypeScript
- Axios
- CORS
- Express Rate Limit
- Node Cache

### External APIs

- Open-Meteo Geocoding API
- Open-Meteo Forecast API

Open-Meteo is used because it provides free weather and geocoding APIs without requiring an API key.

## Project Structure

```txt
WEATHER-APP/
  client/
    public/
    src/
    package.json
    vite.config.ts

  server/
    src/
      index.ts
      services/
        cacheService.ts
        comparisonService.ts
        decisionEngine.ts
        openMeteoService.ts
    package.json
    tsconfig.json
```

## Getting Started

Clone the repository:

```bash
git clone <repo-url>
cd WEATHER-APP
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

## Running The App Locally

Run the backend in one terminal:

```bash
cd server
npm run dev
```

The backend runs on:

```txt
http://localhost:4000
```

Run the frontend in a second terminal:

```bash
cd client
npm run dev
```

The frontend runs on:

```txt
http://localhost:5173
```

## API Endpoints

### Health Check

```http
GET /health
```

Example:

```txt
http://localhost:4000/health
```

Response:

```json
{
  "status": "ok"
}
```

### Search Locations

```http
GET /api/locations/search?q=toronto
```

Example:

```txt
http://localhost:4000/api/locations/search?q=toronto
```

Returns a simplified list of matching locations:

```json
[
  {
    "id": 6167865,
    "name": "Toronto",
    "country": "Canada",
    "admin1": "Ontario",
    "latitude": 43.70011,
    "longitude": -79.4163
  }
]
```

### Get Weather Forecast

```http
GET /api/weather?lat=43.70011&lon=-79.4163
```

Example:

```txt
http://localhost:4000/api/weather?lat=43.70011&lon=-79.4163
```

Returns weather data from Open-Meteo, including:

- Current temperature
- Feels-like temperature
- Weather code
- Wind speed
- Hourly temperature
- Hourly precipitation probability
- Daily high and low temperature
- Daily precipitation probability

### Get Weather Decision

```http
GET /api/decision?lat=43.70011&lon=-79.4163
```

Example:

```txt
http://localhost:4000/api/decision?lat=43.70011&lon=-79.4163
```

Returns decision-focused weather advice:

```json
{
  "summary": "Decent outdoor conditions with a few things to watch.",
  "umbrella": {
    "needed": false,
    "message": "Umbrella is not needed right now."
  },
  "clothing": {
    "message": "Light jacket or hoodie recommended."
  },
  "outdoor": {
    "score": 75,
    "bestWindow": "2 PM - 4 PM"
  },
  "conditions": {
    "feelsLike": 12.4,
    "windSpeed": 18.2,
    "rainProbability": 10
  }
}
```

### Compare Locations By Coordinates

```http
GET /api/compare/coordinates
```

Example:

```txt
http://localhost:4000/api/compare/coordinates?leftName=Kingston%2C%20Ontario%2C%20Canada&leftLat=44.2312&leftLon=-76.4860&rightName=Morrisburg%2C%20Ontario%2C%20Canada&rightLat=44.8992&rightLon=-75.1854
```

This endpoint compares exact selected locations instead of guessing from city names. This avoids ambiguity for places such as Kingston, Ontario vs Kingston, Jamaica.

Returns:

- Left location weather decision summary
- Right location weather decision summary
- Outdoor score comparison
- Rain, wind, and feels-like comparison
- Recommended winner with explanation

## Why This Project Is Different

Most weather apps only display temperature and weather icons. This project is being designed as a decision-focused weather assistant.

Built features include:

- Umbrella recommendation
- Clothing recommendation
- Best time to go outside
- Outdoor activity score
- City-to-city weather comparison
- Rate limiting
- Caching

Planned features include:

- Air quality insights
- Favorite locations
- Search history
- Scheduled daily weather summary

## Planned Roadmap

### Phase 1: Core Weather App

- [x] Search for a city
- [x] Select the exact matching location
- [x] Fetch weather by latitude and longitude
- [x] Add loading and error states

### Phase 2: Decision Engine

- [x] Generate umbrella recommendations
- [x] Generate clothing suggestions
- [x] Calculate outdoor comfort score
- [x] Find the best outdoor time window
- [x] Convert raw weather data into human-friendly advice
- [x] Display decision cards in the frontend

### Phase 3: Smart Comparisons

- [x] Compare two selected locations
- [x] Compare by coordinates to avoid ambiguous city names
- [x] Recommend the better location for outdoor plans
- [x] Compare rain risk, temperature, wind, and comfort score
- [x] Display a clear winner with a reason

### Phase 4: Multiple Free APIs

- [ ] Add Open-Meteo Air Quality API
- [ ] Add historical weather comparison
- [ ] Show "today vs yesterday" insights
- [ ] Use multiple data sources through the backend

### Phase 5: Backend

- [x] Add API rate limiting
- [x] Add response caching
- [ ] Add database persistence
- [ ] Add favorite locations
- [ ] Add search history
- [ ] Add scheduled daily summaries

## Frontend Workflow

The current frontend supports:

1. Search for a location.
2. Choose the exact result from Open-Meteo geocoding.
3. Click `Advice` to use that location for weather recommendations.
4. Click `A` and `B` to choose two locations for comparison.
5. Compare selected locations and view the winner with supporting weather metrics.

## Author

Built by Manan as a portfolio project.

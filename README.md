# Weather Decision Assistant

A full-stack weather application designed to go beyond a basic forecast dashboard. The goal of this project is to turn raw weather data into useful daily decisions, such as whether to bring an umbrella, when to go outside, and how two locations compare for outdoor plans.

This project is being built as an SDE portfolio project with a focus on API integration, backend architecture, data transformation, and practical user-focused features.

## Current Status

The project currently includes:

- React + TypeScript frontend scaffolded with Vite
- Express + TypeScript backend
- Backend API proxy for Open-Meteo
- City search using the Open-Meteo Geocoding API
- Weather forecast retrieval using the Open-Meteo Forecast API
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
        openMeteoService.ts
    package.json
    tsconfig.json
```

## Getting Started

Clone the repository:

```bash
git clone <your-repo-url>
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

## Why This Project Is Different

Most beginner weather apps only display temperature and weather icons. This project is being designed as a decision-focused weather assistant.

Planned features include:

- Umbrella recommendation
- Clothing recommendation
- Best time to go outside
- Outdoor activity score
- City-to-city weather comparison
- Air quality insights
- Favorite locations
- Search history
- Rate limiting
- Caching
- Scheduled daily weather summary

## Planned Roadmap

### Phase 1: Core Weather App

- Search for a city
- Fetch weather by latitude and longitude
- Display current weather
- Display hourly forecast
- Display daily forecast
- Add loading and error states

### Phase 2: Decision Engine

- Generate umbrella recommendations
- Generate clothing suggestions
- Calculate outdoor comfort score
- Find the best outdoor time window
- Convert raw weather data into human-friendly advice

### Phase 3: Smart Comparisons

- Compare two cities
- Recommend the better city for outdoor plans
- Compare rain risk, temperature, wind, and comfort score
- Display a clear winner with a reason

### Phase 4: Multiple Free APIs

- Add Open-Meteo Air Quality API
- Add historical weather comparison
- Show "today vs yesterday" insights
- Use multiple data sources through the backend

### Phase 5: Backend Engineering

- Add API rate limiting
- Add response caching
- Add favorite locations
- Add search history
- Add database persistence
- Add scheduled daily summaries

### Phase 6: Testing And Polish

- Add unit tests for decision logic
- Add backend route tests
- Add API error handling tests
- Improve README with screenshots
- Add deployment instructions

## Development Notes

The frontend should call the Express backend instead of calling Open-Meteo directly.

```txt
React frontend -> Express backend -> Open-Meteo API
```

This keeps API logic in one place and makes it easier to add caching, rate limiting, logging, and future API integrations.

## Author

Built by Manan as a full-stack SDE portfolio project.


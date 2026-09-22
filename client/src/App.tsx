import { useState } from "react";
import "./App.css";

type Location = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

type WeatherDecision = {
  summary: string;
  umbrella: {
    needed: boolean;
    message: string;
  };
  clothing: {
    message: string;
  };
  outdoor: {
    score: number;
    bestWindow: string;
  };
  conditions: {
    feelsLike: number;
    windSpeed: number;
    rainProbability: number;
  };
};

function App() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<WeatherDecision | null>(null);
  const [isLoadingDecision, setIsLoadingDecision] = useState(false);

  async function searchLocations() {
    if (!query.trim()) {
      setError("Please enter a city name.");
      return;
    }

    try {
      setIsSearching(true);
      setError("");

      const response = await fetch(
        `http://localhost:4000/api/locations/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Failed to search locations.");
      }

      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError("Could not search locations. Make sure the backend is running.");
    } finally {
      setIsSearching(false);
    }
  }

  async function getWeatherAdvice() {
    if (!selectedLocation) {
      setError("Please select a location first.");
      return;
    }

    try {
      setIsLoadingDecision(true);
      setError("");

      const response = await fetch(
        `http://localhost:4000/api/decision?lat=${selectedLocation.latitude}&lon=${selectedLocation.longitude}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather advice.");
      }

      const data = await response.json();
      setDecision(data);
    } catch (err) {
      setError("Could not load weather advice. Make sure the backend is running.");
    } finally {
      setIsLoadingDecision(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <p className="eyebrow">Weather Decision Assistant</p>
        <h1>Plan your day with weather that makes decisions easier.</h1>
        <p className="hero-copy">
          Search a location, choose the exact city, and get practical weather advice.
        </p>
      </section>

      <section className="panel">
        <h2>Search Location</h2>

        <div className="search-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city, e.g. Kingston"
          />
          <button onClick={searchLocations} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="results-list">
          {locations.map((location) => (
            <button
              key={location.id}
              className="location-result"
              onClick={() => {
                setSelectedLocation(location);
                setDecision(null);
              }}
            >
              <span>{location.name}</span>
              <small>
                {location.admin1 ? `${location.admin1}, ` : ""}
                {location.country}
              </small>
            </button>
          ))}
        </div>

        {selectedLocation && (
          <div className="selected-location">
            <div>
              Selected:{" "}
              <strong>
                {selectedLocation.name}
                {selectedLocation.admin1 ? `, ${selectedLocation.admin1}` : ""},{" "}
                {selectedLocation.country}
              </strong>
            </div>

            <button
              className="secondary-button"
              onClick={getWeatherAdvice}
              disabled={isLoadingDecision}
            >
              {isLoadingDecision ? "Loading advice..." : "Get Weather Advice"}
            </button>
          </div>
        )}

              {decision && (
        <div className="decision-grid">
          <article className="decision-card decision-card-wide">
            <span className="card-label">Summary</span>
            <h3>{decision.summary}</h3>
          </article>

          <article className="decision-card">
            <span className="card-label">Umbrella</span>
            <h3>{decision.umbrella.needed ? "Bring one" : "Not needed"}</h3>
            <p>{decision.umbrella.message}</p>
          </article>

          <article className="decision-card">
            <span className="card-label">Clothing</span>
            <h3>What to wear</h3>
            <p>{decision.clothing.message}</p>
          </article>

          <article className="decision-card">
            <span className="card-label">Outdoor Score</span>
            <h3>{decision.outdoor.score}/100</h3>
            <p>Best window: {decision.outdoor.bestWindow}</p>
          </article>

          <article className="decision-card">
            <span className="card-label">Current Conditions</span>
            <h3>{decision.conditions.feelsLike}°C feels like</h3>
            <p>
              Rain risk: {decision.conditions.rainProbability}% · Wind:{" "}
              {decision.conditions.windSpeed} km/h
            </p>
          </article>
        </div>
      )}

      </section>
    </main>
  );
}

export default App;
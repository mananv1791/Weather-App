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

type ComparedCity = {
  name:string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  outdoorScore: number;
  rainProbability: number;
  feelsLike:number;
  windSpeed: number;
  summary:string;
  bestWindow: string;
};

type ComparisonResult = {
  left: ComparedCity;
  rght: ComparedCity;
  winner: {
    name: string;
    reason: string;
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
  const [leftCompare, setLeftCompare] = useState<Location | null>(null);
  const [rightCompare, setRightCompare] = useState<Location | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  function getLocationLabel(location: Location){
    return `${location.name}${location.admin1 ? `, ${location.admin1}` : ""}, ${
      location.country
    }`;
  }

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

  async function compareSelectedLocations() {
    if(!leftCompare || !rightCompare){
      setError("Please choose both comparison locatons.");
      return;
    }

    try {
      setIsComparing(true);
      setError("");

      const params = new URLSearchParams({
        leftName: getLocationLabel(leftCompare),
        leftLat: String(leftCompare.latitude),
        leftLon: String(leftCompare.longitude),
        rightName: getLocationLabel(rightCompare),
        rightLat: String(rightCompare.latitude),
        rightLon: String(rightCompare.longitude)
      });

      const response = await fetch(
        `http://localhost:4000/api/compare/coordinates?${params.toString()}`
      );

      if(!response.ok){
        throw new Error("Failed to compare locations.");
      }

      const data = await response.json();
      setComparison(data);
    } catch(err){
      setError("Could not compare locations. Make sure the backedn is running.");
    } finally {
      setIsComparing(false);
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
            <div key={location.id} className="location.id">
              <div>
                <span>{location.name}</span>
                <small>
                  {location.admin1 ? `${location.admin1}, `: ""}
                  {location.country}
                </small>
              </div>

              <div className="location-actions">
                <button
                  onClick={() => {
                    setSelectedLocation(location);
                    setDecision(null);
                  }}
                >
                  Advice
                </button>

                <button
                  onClick={() => {
                    setLeftCompare(location);
                    setComparison(null);
                  }}
                >
                  A
                </button>

                <button
                  onClick={() => {
                    setRightCompare(location);
                    setComparison(null);
                  }}
                >
                  B
                </button>
              </div>
            </div>
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
      <section className="panel compare-panel">
        <h2>Compare Locations</h2>

        <div className="compare-selected">
          <div>
            <span className="card-label">
              Location A
            </span>
            <strong>
              {leftCompare ? getLocationLabel(leftCompare) : "Not selected"}
            </strong>
          </div>

          <div>
            <span className="card-label">Location B</span>
            <strong>{rightCompare ? getLocationLabel(rightCompare) : "Not selected"}</strong>
          </div>
        </div>

        <button
          className="secondary-button compare-button"
          onClick={compareSelectedLocations}
          disabled={isComparing}
        >
          {isComparing ? "Comparng..." : "Compare Selected Locatons"}
        </button>

        {comparison && (
          <div className="comparison-result">
            <article className="decision-card decision-card-wide">
              <span className="card-label">Winner</span>
              <h3>{comparison.winner.name}</h3>
              <p>{comparison.winner.reason}</p>
            </article>

            <div className="comparison-cards">
              {[comparison.left, comparison.right].map((city) => (
                <article key={city.name} className="decision-card">
                  <span className="card-label">
                    {city.admin1 ? `${city.admin1}, `: ""}
                    {city.country}
                  </span>
                  <h3>{city.name}</h3>
                  <p>{city.summary}</p>

                  <dl className="stat-list">
                    <div>
                      <dt>Outdoor Score</dt>
                      <dd>{city.outdoorScore}/100</dd>
                    </div>
                    <div>
                      <dt>Rain Risk</dt>
                      <dd>{city.rainProbability}%</dd>
                    </div>
                    <div>
                      <dt>Feels Like</dt>
                      <dd>{city.feelsLike}°C</dd>
                    </div>
                    <div>
                      <dt>Wind</dt>
                      <dd>{city.windSpeed} km/h</dd>
                    </div>
                    <div>
                      <dt>Best Window</dt>
                      <dd>{city.bestWindow}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
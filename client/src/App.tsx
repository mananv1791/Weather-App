import { type FormEvent, type KeyboardEvent, useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV
    ? "http://localhost:4000"
    : "https://weather-app-zzn1.onrender.com");

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
  right: ComparedCity;
  winner: {
    name: string;
    reason: string;
  };
};

type ModelForecast = {
  model: string;
  label: string;
  hourly: {
    time: string[];
    temperature: number[];
    precipitationProbability: number[];
    windSpeed: number[];
  };
};

type ModelComparison = {
  latitude: number;
  longitude: number;
  models: ModelForecast[];
};

type ActivePage = "weather" | "compare";

function App() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [highlightedLocationIndex, setHighlightedLocationIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<WeatherDecision | null>(null);
  const [isLoadingDecision, setIsLoadingDecision] = useState(false);
  const [leftCompare, setLeftCompare] = useState<Location | null>(null);
  const [rightCompare, setRightCompare] = useState<Location | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [modelComparison, setModelComparison] = useState<ModelComparison | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>("weather");

  function getLocationLabel(location: Location){
    return `${location.name}${location.admin1 ? `, ${location.admin1}` : ""}, ${
      location.country
    }`;
  }

  function getRegionLabel(location: Location) {
    return location.admin1
      ? `${location.admin1}, ${location.country}`
      : location.country || "Region unavailable";
  }

  function getCountryCode(location: Location) {
    if (!location.country) {
      return "—";
    }

    return location.country.slice(0, 2).toUpperCase();
  }

  function formatCoordinate(value: number, positiveDirection: string, negativeDirection: string) {
    const direction = value >= 0 ? positiveDirection : negativeDirection;
    return `${Math.abs(value).toFixed(2)}° ${direction}`;
  }

  function formatHour(time: string) {
    return new Date(time).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function getSelectedModelForecast() {
    if (!modelComparison || !selectedModel) {
      return null;
    }

    return modelComparison.models.find((model) => model.model === selectedModel) ?? null;
  }

  function getWeatherSymbol(rainProbability: number, windSpeed: number, temperature: number) {
    if (rainProbability >= 50) return "◌";
    if (windSpeed >= 25) return "∿";
    if (temperature <= 0) return "◇";
    return "○";
  }

  async function searchLocations(searchTerm = query) {
    const trimmedQuery = searchTerm.trim();

    if (!trimmedQuery) {
      setLocations([]);
      return;
    }

    try {
      setIsSearching(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/locations/search?q=${encodeURIComponent(trimmedQuery)}`
      );

      if (!response.ok) {
        throw new Error("Failed to search locations.");
      }

      const data = await response.json();
      setLocations(data);
      setShowSuggestions(true);
      setHighlightedLocationIndex(0);
    } catch (err) {
      setError("Could not search locations. Make sure the backend is running.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (showSuggestions && locations.length > 0) {
      handleLocationSelect(locations[highlightedLocationIndex] ?? locations[0]);
      return;
    }

    setShowSuggestions(false);
    setIsSearchActive(false);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || locations.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedLocationIndex((currentIndex) =>
        currentIndex >= locations.length - 1 ? 0 : currentIndex + 1
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedLocationIndex((currentIndex) =>
        currentIndex <= 0 ? locations.length - 1 : currentIndex - 1
      );
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!isSearchActive) {
      return;
    }

    if (trimmedQuery.length < 2) {
      setLocations([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      searchLocations(trimmedQuery);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [query, isSearchActive]);

  async function loadWeatherAdviceForLocation(location: Location) {
    try {
      setIsLoadingDecision(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/decision?lat=${location.latitude}&lon=${location.longitude}`
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

  async function getWeatherAdvice() {
    if (!selectedLocation) {
      setError("Please select a location first.");
      return;
    }

    loadWeatherAdviceForLocation(selectedLocation);
  }

  async function compareForecastModelsForLocation(location: Location) {
    try {
      setIsLoadingModels(true);
      setError("");

      const models = [
        "best_match",
        "ecmwf_ifs",
        "ncep_gfs_global"
      ].join(",");

      const response = await fetch(`${API_BASE_URL}/api/models/compare?lat=${location.latitude}&lon=${location.longitude}&models=${models}`);

      if (!response.ok) {
        throw new Error("Failed to compare forecast models.");
      }

      const data = await response.json();
      setModelComparison(data);
      setSelectedModel(null);
    } catch (err) {
      setError("Could not compare forecast models.");
    } finally {
      setIsLoadingModels(false);
    }
  }

  async function compareForecastModels(){
    if(!selectedLocation){
      setError("Please select a location first.");
      return;
    }

    compareForecastModelsForLocation(selectedLocation);
  }

  async function compareLocations(left: Location, right: Location) {
    try {
      setIsComparing(true);
      setError("");

      const params = new URLSearchParams({
        leftName: getLocationLabel(left),
        leftLat: String(left.latitude),
        leftLon: String(left.longitude),
        rightName: getLocationLabel(right),
        rightLat: String(right.latitude),
        rightLon: String(right.longitude)
      });

      const response = await fetch(
        `${API_BASE_URL}/api/compare/coordinates?${params.toString()}`
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

  async function compareSelectedLocations() {
    if(!leftCompare || !rightCompare){
      setError("Please choose both comparison locations.");
      return;
    }

    compareLocations(leftCompare, rightCompare);
  }

  function selectWeatherLocation(location: Location) {
    setSelectedLocation(location);
    setDecision(null);
    setModelComparison(null);
    setSelectedModel(null);
    setLocations([]);
    setShowSuggestions(false);
    setIsSearchActive(false);
    setQuery(getLocationLabel(location));
    loadWeatherAdviceForLocation(location);
    compareForecastModelsForLocation(location);
  }

  function selectComparisonLocation(location: Location) {
    setComparison(null);
    setLocations([]);
    setShowSuggestions(false);
    setIsSearchActive(false);
    setQuery(getLocationLabel(location));

    if (!leftCompare) {
      setLeftCompare(location);
      return;
    }

    if (!rightCompare) {
      setRightCompare(location);
      compareLocations(leftCompare, location);
      return;
    }

    setRightCompare(location);
    compareLocations(leftCompare, location);
  }

  function handleLocationSelect(location: Location) {
    if (activePage === "weather") {
      selectWeatherLocation(location);
      return;
    }

    selectComparisonLocation(location);
  }

  function removeCompareLocation(slot: "left" | "right") {
    if (slot === "left") {
      setLeftCompare(null);
    } else {
      setRightCompare(null);
    }

    setComparison(null);
  }

  const selectedForecast = getSelectedModelForecast();

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">
          <span className="brand-mark">☼</span>
          <strong>Clarity</strong>
        </div>

        <nav className="nav-links" aria-label="Primary">
          <button
            className={activePage === "weather" ? "is-active" : ""}
            onClick={() => setActivePage("weather")}
          >
            <span className="nav-icon">☁</span>
            Weather
          </button>
          <button
            className={activePage === "compare" ? "is-active" : ""}
            onClick={() => setActivePage("compare")}
          >
            <span className="nav-icon">⌖</span>
            Cities
          </button>
          <span className="nav-muted">
            <span className="nav-icon">▱</span>
            Sources
          </span>
        </nav>

        <div className="model-nav">
          <span className="nav-section-title">Models</span>
          {modelComparison ? (
            modelComparison.models.map((model, index) => (
              <button
                key={model.model}
                className={selectedModel === model.model ? "is-active" : ""}
                onClick={() => setSelectedModel(model.model)}
              >
                <span className={`model-dot model-dot-${index}`} />
                {model.label}
              </button>
            ))
          ) : (
            <>
              <button disabled><span className="model-dot model-dot-0" />Best Match</button>
              <button disabled><span className="model-dot model-dot-1" />ECMWF IFS</button>
              <button disabled><span className="model-dot model-dot-2" />NOAA GFS</button>
            </>
          )}
        </div>

        <div className="status-card">
          <span>System Status</span>
          <strong><i />Models updated 4m ago</strong>
        </div>
      </aside>

      <div className={selectedLocation ? "main-content has-weather" : "main-content"}>
      <section className="hero-section">
        <p className="eyebrow"><span />Weather Decision Assistant</p>
        <h1>Weather model intelligence for daily decisions.</h1>
        {!selectedLocation && (
          <p className="hero-copy">
            Search a location, choose the exact city, and get practical weather advice — compared across forecast models.
          </p>
        )}
      </section>

      <section id="weather" className="panel">
        <h2>{activePage === "weather" ? "Search Weather Location" : "Search Cities To Compare"}</h2>

        <form className="search-row" onSubmit={handleSearchSubmit}>
          <span className="search-icon">⌕</span>
          <input
            value={query}
            onChange={(event) => {
              setIsSearchActive(true);
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setIsSearchActive(true);
                setShowSuggestions(locations.length > 0);
              }
            }}
            onBlur={() => {
              window.setTimeout(() => {
                setShowSuggestions(false);
                setIsSearchActive(false);
              }, 150);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search city, e.g. Kingston"
          />
          <span className="shortcut">⌘K</span>
          <button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {showSuggestions && (
        <div className="results-list">
          <div className="results-header">
            <span>{locations.length} locations match “{query}”</span>
            <span>Select the exact place</span>
          </div>
          {locations.map((location, index) => (
            <div
              key={location.id}
              className={`location-result ${
                index === highlightedLocationIndex ? "is-highlighted" : ""
              }`}
            >
              <span className="result-badge">{getCountryCode(location)}</span>
              <div className="result-main">
                <span>{location.name}</span>
                <small>{getRegionLabel(location)}</small>
              </div>
              <span className="result-coordinates">
                {formatCoordinate(location.latitude, "N", "S")} ·{" "}
                {formatCoordinate(location.longitude, "E", "W")}
              </span>

              <div className="location-actions">
                <button
                  onClick={() => handleLocationSelect(location)}
                >
                  {activePage === "weather"
                    ? "Show weather →"
                    : !leftCompare
                      ? "Set A"
                      : !rightCompare
                        ? "Set B"
                        : "Replace B"}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {activePage === "weather" && selectedLocation && (
          <div className="selected-location">
            <div>
              <span>Selected Location</span>
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
            <button className="secondary-button"
              onClick={compareForecastModels}
              disabled={isLoadingModels}
            >
              {isLoadingModels ? "Loading sources..." : "Refresh Sources"}
            </button>
          </div>
        )}

              {activePage === "weather" && decision && (
        <div className="decision-grid">
          <article className="decision-card decision-card-wide">
            <span className="pill-label">● Summary</span>
            <h3>{decision.summary}</h3>
            <dl className="metric-row">
              <div>
                <dt>Feels like</dt>
                <dd>{decision.conditions.feelsLike}°C</dd>
              </div>
              <div>
                <dt>Rain risk</dt>
                <dd>{decision.conditions.rainProbability}%</dd>
              </div>
              <div>
                <dt>Wind</dt>
                <dd>{decision.conditions.windSpeed} km/h</dd>
              </div>
              <div>
                <dt>Best window</dt>
                <dd>{decision.outdoor.bestWindow}</dd>
              </div>
            </dl>
          </article>

          <article className="decision-card score-card">
            <span className="card-label">Outdoor Score</span>
            <div className="score-ring">
              <strong>{decision.outdoor.score}</strong>
              <small>/100</small>
            </div>
            <p>Ideal from {decision.outdoor.bestWindow}</p>
          </article>

          <article className="decision-card">
            <span className="card-icon">☂</span>
            <span className="card-label">Umbrella</span>
            <h3>{decision.umbrella.needed ? "Bring one" : "Not needed"}</h3>
            <p>{decision.umbrella.message}</p>
          </article>

          <article className="decision-card">
            <span className="card-icon">♙</span>
            <span className="card-label">Clothing</span>
            <h3>Light layers</h3>
            <p>{decision.clothing.message}</p>
          </article>

          <article className="decision-card">
            <span className="card-icon">♧</span>
            <span className="card-label">Current Conditions</span>
            <h3>{decision.conditions.feelsLike}°C feels like</h3>
            <p>
              Rain risk: {decision.conditions.rainProbability}% · Wind:{" "}
              {decision.conditions.windSpeed} km/h
            </p>
          </article>
        </div>
      )}

      {activePage === "weather" && modelComparison && (
        <div className="model-panel">
          <div className="model-panel-header">
            <div>
              <h2>Choose Forecast Source</h2>
              <p>
                Select the model that feels closest to your current conditions. The hourly view will use only that source for{" "}
                {selectedLocation ? getLocationLabel(selectedLocation) : "this location"}.
              </p>
            </div>
          </div>

          <div className="model-summary-grid source-picker">
            {modelComparison.models.map((model) => (
              <button
              key={model.model}
                className={`source-card ${selectedModel === model.model ? "is-active" : ""}`}
                onClick={() => setSelectedModel(model.model)}
              >
                <span className="source-card-top">
                  <span>
                    <i />
                    <strong>{model.label}</strong>
                    <small>
                      {model.model === "best_match"
                        ? "Blended · auto-selected"
                        : model.model.includes("ecmwf")
                          ? "European model"
                          : "US global model"}
                    </small>
                  </span>
                  <em />
                </span>
                <h3>{model.hourly.temperature[0]}° <small>now</small></h3>
                <p>
                  Rain {model.hourly.precipitationProbability[0]}% <span /> Wind{" "}
                  {model.hourly.windSpeed[0]} km/h
                </p>
              </button>
            ))}
          </div>
          
          {selectedForecast ? (
            <div className="hourly-strip-wrapper">
              <div className="hourly-strip-heading">
                <span>
                  <i /> {selectedForecast.label} · Hourly forecast
                </span>
                <div className="forecast-tabs">
                  <button className="is-active">Temperature</button>
                  <button>Rain</button>
                  <button>Wind</button>
                </div>
              </div>

              <div className="hourly-strip">
                {selectedForecast.hourly.time.slice(0, 12).map((time, index) => {
                  const rainProbability = selectedForecast.hourly.precipitationProbability[index];
                  const windSpeed = selectedForecast.hourly.windSpeed[index];
                  const temperature = selectedForecast.hourly.temperature[index];

                  return (
                    <article key={time} className={index === 0 ? "hourly-pill is-current" : "hourly-pill"}>
                      <span>{formatHour(time)}</span>
                      <strong>
                        {getWeatherSymbol(rainProbability, windSpeed, temperature)}
                      </strong>
                      <b>{temperature}°</b>
                      <small>Rain {rainProbability}%</small>
                      <small>Wind {windSpeed} km/h</small>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="source-empty">Choose a forecast source to show the hourly forecast.</p>
          )}
        </div>
      )}

      </section>
      {activePage === "compare" && (
      <section id="compare" className="panel compare-panel">
        <h2>Compare Locations</h2>

        <div className="compare-selected">
          <div>
            <span className="card-label">
              Location A
            </span>
            <strong>
              {leftCompare ? getLocationLabel(leftCompare) : "Not selected"}
            </strong>
            {leftCompare && (
              <button className="remove-button" onClick={() => removeCompareLocation("left")}>
                ×
              </button>
            )}
          </div>

          <div>
            <span className="card-label">Location B</span>
            <strong>{rightCompare ? getLocationLabel(rightCompare) : "Not selected"}</strong>
            {rightCompare && (
              <button className="remove-button" onClick={() => removeCompareLocation("right")}>
                ×
              </button>
            )}
          </div>
        </div>

        <button
          className="secondary-button compare-button"
          onClick={compareSelectedLocations}
          disabled={isComparing}
        >
          {isComparing ? "Comparing..." : "Compare Selected Locations"}
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
      )}
      </div>
    </main>
  );
}

export default App;

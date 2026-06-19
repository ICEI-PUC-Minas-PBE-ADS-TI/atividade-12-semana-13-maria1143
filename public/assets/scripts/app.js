const BRASIL_API  = "https://brasilapi.com.br/api";
const METEO_GEO   = "https://geocoding-api.open-meteo.com/v1/search";
const METEO_FC    = "https://api.open-meteo.com/v1/forecast";

const cityInput       = document.getElementById("cityInput");
const searchBtn       = document.getElementById("searchBtn");
const suggestions     = document.getElementById("suggestions");
const forecastSection = document.getElementById("forecastSection");
const cardsContainer  = document.getElementById("cardsContainer");
const cityNameEl      = document.getElementById("cityName");
const cityStateEl     = document.getElementById("cityState");
const daysSelect      = document.getElementById("daysSelect");
const errorMsg        = document.getElementById("errorMsg");
const loading         = document.getElementById("loading");
const infoCard        = document.getElementById("infoCard");

let selectedCity       = null;
let selectedCoords     = null; // { lat, lon }
let searchTimeout      = null;
let forecastController = null;

// ── Mapa WMO (Open-Meteo) ────────────────────────────────────────
const WMO = {
  0:  { label: "Céu limpo",              icon: "☀️" },
  1:  { label: "Predomina sol",          icon: "🌤️" },
  2:  { label: "Parcialmente nublado",   icon: "⛅" },
  3:  { label: "Encoberto",              icon: "☁️" },
  45: { label: "Nevoeiro",              icon: "🌫️" },
  48: { label: "Nevoeiro com geada",    icon: "🌫️" },
  51: { label: "Chuvisco leve",         icon: "🌦️" },
  53: { label: "Chuvisco moderado",     icon: "🌦️" },
  55: { label: "Chuvisco intenso",      icon: "🌧️" },
  61: { label: "Chuva fraca",           icon: "🌧️" },
  63: { label: "Chuva moderada",        icon: "🌧️" },
  65: { label: "Chuva forte",           icon: "🌧️" },
  71: { label: "Neve fraca",            icon: "🌨️" },
  73: { label: "Neve moderada",         icon: "🌨️" },
  75: { label: "Neve intensa",          icon: "❄️" },
  77: { label: "Grãos de neve",         icon: "🌨️" },
  80: { label: "Pancadas fracas",       icon: "🌦️" },
  81: { label: "Pancadas moderadas",    icon: "🌦️" },
  82: { label: "Pancadas fortes",       icon: "⛈️" },
  85: { label: "Pancadas de neve",      icon: "🌨️" },
  86: { label: "Pancadas de neve forte",icon: "❄️" },
  95: { label: "Tempestade",            icon: "⛈️" },
  96: { label: "Tempestade c/ granizo", icon: "⛈️" },
  99: { label: "Tempestade intensa",    icon: "⛈️" },
};

function getWMO(code) {
  return WMO[code] || { label: "—", icon: "🌡️" };
}

function normalizeQuery(q) {
  return q.split(/\s+[–—-]\s+/)[0].trim();
}

// ── Eventos ──────────────────────────────────────────────────────
cityInput.addEventListener("input", () => {
  const q = cityInput.value.trim();
  clearTimeout(searchTimeout);
  if (q.length < 3) { hideSuggestions(); return; }
  searchTimeout = setTimeout(() => fetchCities(q), 400);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); handleSearch(); }
});

searchBtn.addEventListener("click", handleSearch);

daysSelect.addEventListener("change", () => {
  if (selectedCoords) {
    fetchForecast(selectedCoords.lat, selectedCoords.lon,
                  selectedCity.nome, selectedCity.estado);
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-section")) hideSuggestions();
});

showInfoCard();

// ── Busca cidades (BrasilAPI CPTEC) ──────────────────────────────
async function fetchCities(query) {
  try {
    const res = await fetch(
      `${BRASIL_API}/cptec/v1/cidade/${encodeURIComponent(normalizeQuery(query))}`
    );
    if (!res.ok) throw new Error();
    renderSuggestions(await res.json());
  } catch { hideSuggestions(); }
}

function renderSuggestions(cities) {
  suggestions.innerHTML = "";
  if (!cities || cities.length === 0) { hideSuggestions(); return; }

  cities.slice(0, 8).forEach((city) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = `${city.nome} — ${city.estado}`;
    item.addEventListener("click", () => {
      cityInput.value = `${city.nome} — ${city.estado}`;
      hideSuggestions();
      selectedCity = city;
      geocodeAndFetch(city.nome, city.estado);
    });
    suggestions.appendChild(item);
  });

  suggestions.classList.remove("hidden");
}

// ── Busca via botão ──────────────────────────────────────────────
async function handleSearch() {
  const rawQuery = cityInput.value.trim();
  if (!rawQuery) return;
  const query = normalizeQuery(rawQuery);

  selectedCity   = null;
  selectedCoords = null;
  hideSuggestions();
  showLoading();
  hideError();
  hideForecast();

  try {
    const res = await fetch(
      `${BRASIL_API}/cptec/v1/cidade/${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error("Cidade não encontrada.");
    const cities = await res.json();
    if (!cities || cities.length === 0) throw new Error("Nenhuma cidade encontrada.");

    const city = cities[0];
    selectedCity = city;
    cityInput.value = `${city.nome} — ${city.estado}`;
    geocodeAndFetch(city.nome, city.estado);
  } catch (err) {
    hideLoading();
    showError(err.message || "Erro ao buscar cidade.");
    showInfoCard();
  }
}

// ── Geocodifica pelo nome (Open-Meteo Geocoding) ─────────────────
async function geocodeAndFetch(cityName, estado) {
  showLoading();
  hideError();
  hideForecast();

  try {
    // Busca com nome + estado para maior precisão
    const query = `${cityName}, ${estado}, Brasil`;
    const res = await fetch(
      `${METEO_GEO}?name=${encodeURIComponent(cityName)}&count=10&language=pt&countryCode=BR`
    );
    if (!res.ok) throw new Error("Erro ao localizar coordenadas.");
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("Coordenadas não encontradas para essa cidade.");
    }

    // Filtra pelo estado se possível
    let match = data.results.find(
      (r) => r.admin1 && r.admin1.includes(estado)
    ) || data.results[0];

    selectedCoords = { lat: match.latitude, lon: match.longitude };
    fetchForecast(match.latitude, match.longitude, cityName, estado);
  } catch (err) {
    hideLoading();
    showError(err.message || "Erro ao obter localização.");
  }
}

// ── Busca previsão (Open-Meteo Forecast) ─────────────────────────
async function fetchForecast(lat, lon, cityName, cityState) {
  const days = daysSelect.value;

  if (forecastController) forecastController.abort();
  forecastController = new AbortController();
  const { signal } = forecastController;

  showLoading();
  hideError();
  hideForecast();

  const params = new URLSearchParams({
    latitude:              lat,
    longitude:             lon,
    daily:                 [
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "uv_index_max",
      "windspeed_10m_max",
    ].join(","),
    timezone:              "America/Sao_Paulo",
    forecast_days:         days,
  });

  try {
    const res = await fetch(`${METEO_FC}?${params}`, { signal });
    if (!res.ok) throw new Error("Não foi possível obter a previsão.");
    const data = await res.json();

    if (!data.daily || !data.daily.time.length) {
      throw new Error("Previsão não disponível para esta cidade.");
    }

    renderForecast(data.daily, cityName, cityState);
  } catch (err) {
    if (err.name === "AbortError") return;
    showError(err.message || "Erro ao buscar previsão.");
  } finally {
    if (!signal.aborted) hideLoading();
  }
}

// ── Renderiza os cards ───────────────────────────────────────────
function renderForecast(daily, cityName, cityState) {
  cityNameEl.textContent = cityName;
  cityStateEl.textContent = cityState;
  cardsContainer.innerHTML = "";

  daily.time.forEach((date, i) => {
    const day = {
      data:          date,
      weathercode:   daily.weathercode[i],
      maxima:        daily.temperature_2m_max[i],
      minima:        daily.temperature_2m_min[i],
      probabilidade: daily.precipitation_probability_max[i],
      precipitacao:  daily.precipitation_sum[i],
      iuv:           daily.uv_index_max[i],
      vento:         daily.windspeed_10m_max[i],
    };
    cardsContainer.appendChild(createCard(day));
  });

  forecastSection.classList.remove("hidden");
  infoCard.classList.add("hidden");
}

function createCard(day) {
  const condition = getWMO(day.weathercode);
  const card = document.createElement("div");
  card.className = "forecast-card";

  let dateLabel = "—";
  if (day.data) {
    const [year, month, d] = day.data.split("-");
    const dateObj = new Date(Number(year), Number(month) - 1, Number(d));
    if (!isNaN(dateObj)) {
      dateLabel = dateObj.toLocaleDateString("pt-BR", {
        weekday: "short",
        day:     "2-digit",
        month:   "2-digit",
      });
    }
  }

  const fmt = (v, dec = 0, unit = "") =>
    v != null ? `${Number(v).toFixed(dec)}${unit}` : "—";

  card.innerHTML = `
    <div class="card-date">${dateLabel}</div>
    <span class="card-icon">${condition.icon}</span>
    <div class="card-desc">${condition.label}</div>
    <div class="card-temps">
      <span class="temp-max">${fmt(day.maxima, 0, "°C")}</span>
      <span class="temp-min">${fmt(day.minima, 0, "°C")}</span>
    </div>
    <div class="card-extra">
      <span title="Probabilidade de chuva">🌧 ${fmt(day.probabilidade, 0, "%")}</span>
      <span title="Precipitação acumulada">💧 ${fmt(day.precipitacao, 1, "mm")}</span>
    </div>
    <div class="card-extra">
      <span title="Índice UV">☀️ UV ${fmt(day.iuv, 1)}</span>
      <span title="Vento máximo">💨 ${fmt(day.vento, 0, "km/h")}</span>
    </div>
  `;

  return card;
}

// ── Helpers UI ───────────────────────────────────────────────────
function showLoading()  { loading.classList.remove("hidden"); }
function hideLoading()  { loading.classList.add("hidden"); }
function hideForecast() { forecastSection.classList.add("hidden"); }
function hideError()    { errorMsg.classList.add("hidden"); errorMsg.textContent = ""; }
function showInfoCard() { infoCard.classList.remove("hidden"); }

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function hideSuggestions() {
  suggestions.classList.add("hidden");
  suggestions.innerHTML = "";
}
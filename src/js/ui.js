import { FLAG_BASE, isSaved } from "./api.js";
let timerInterval = null;
export function toggleLoading(show) {
  const loader = document.getElementById("loading-overlay");
  if (loader) {
    show ? loader.classList.remove("hidden") : loader.classList.add("hidden");
  }
}
export function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");

  toast.className = `toast ${type}`;

  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
    <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);

  toast.querySelector(".toast-close").onclick = () => toast.remove();
}

export function updateLiveDateTime() {
  const dateTimeEl = document.getElementById("current-datetime");
  if (!dateTimeEl) return;

  function update() {
    const now = new Date();
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    dateTimeEl.textContent = now.toLocaleString("en-US", options);
  }

  update();
  setInterval(update, 60000);
}

export function countrySelector(countries) {
  const selectElement = document.getElementById("global-country");
  if (!selectElement) return;

  selectElement.innerHTML = '<option value="">Select Country</option>';

  const myOption = countries
    .map((country) => {
      return `<option value="${country.countryCode}">${country.name}</option>`;
    })
    .join("");

  selectElement.innerHTML += myOption;
}
export function updateCitySelector(capital) {
  const citySelect = document.getElementById("global-city");
  if (citySelect) {
    citySelect.innerHTML = `<option value="${capital}" selected>${capital}</option>`;
  }
}
export function renderCountryCard(countryData) {
  const card = document.getElementById("selected-destination");
  if (card) card.style.display = "flex";
  const code = countryData.cca2.toLowerCase();
  const name = countryData.name.common;
  const capital = countryData.capital ? countryData.capital[0] : "No Capital";

  const flagImg = document.getElementById("selected-country-flag");
  const nameEl = document.getElementById("selected-country-name");
  const cityEl = document.getElementById("selected-city-name");

  if (flagImg) {
    flagImg.src = `${FLAG_BASE}/${code}.png`;
    flagImg.alt = name;
  }

  if (nameEl) nameEl.textContent = name;
  if (cityEl) cityEl.textContent = `• ${capital}`;
}

export function clearSelect() {
  const smallCard = document.getElementById("selected-destination");
  if (smallCard) smallCard.style.display = "none";

  const infoContent = document.getElementById("dashboard-country-info");
  if (infoContent) infoContent.style.display = "none";

  const countrySelect = document.getElementById("global-country");
  const citySelect = document.getElementById("global-city");

  if (countrySelect) countrySelect.value = "";
  if (citySelect)
    citySelect.innerHTML = '<option value="">Select City</option>';

  const values = document.querySelectorAll(".dashboard-country-detail .value");
  values.forEach((val) => (val.textContent = "-"));

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (document.getElementById("country-local-time")) {
    document.getElementById("country-local-time").textContent = "00:00:00 --";
  }
  const mapsBtn = document.querySelector(".dashboard-map-btn");
  if (mapsBtn) mapsBtn.href = "#";
}

export function renderDetailedInfo(countryData) {
  const infoContent = document.getElementById("dashboard-country-info");
  if (infoContent) infoContent.style.display = "block";
  if (timerInterval) clearInterval(timerInterval);

  const bigFlag = document.querySelector(".dashboard-country-flag");
  const title = document.querySelector(".dashboard-country-title h3");
  const officialName = document.querySelector(".official-name");
  const regionEl = document.querySelector(".region");

  if (bigFlag) {
    bigFlag.src = countryData.flags.png;
    bigFlag.alt = countryData.name.common;
  }
  if (title) title.textContent = countryData.name.common;
  if (officialName) officialName.textContent = countryData.name.official;
  if (regionEl)
    regionEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${countryData.region || ""} • ${countryData.subregion || ""}`;

  const countryTimezone = countryData.timezones
    ? countryData.timezones[0]
    : "UTC+00:00";
  countryTimer(countryTimezone);

  const details = document.querySelectorAll(".dashboard-country-detail");

  details[0].querySelector(".value").textContent =
    countryData.capital?.[0] || "N/A";

  details[1].querySelector(".value").textContent =
    countryData.population?.toLocaleString() || "0";

  details[2].querySelector(".value").textContent = countryData.area
    ? `${countryData.area.toLocaleString()} km²`
    : "N/A";

  details[3].querySelector(".value").textContent =
    countryData.continents?.[0] || "N/A";

  const root = countryData.idd?.root || "";
  const suffix = countryData.idd?.suffixes?.[0] || "";
  details[4].querySelector(".value").textContent = root + suffix || "N/A";

  const side = countryData.car?.side || "N/A";
  details[5].querySelector(".value").textContent =
    side.charAt(0).toUpperCase() + side.slice(1);

  const startDay = countryData.startOfWeek || "N/A";
  details[6].querySelector(".value").textContent =
    startDay.charAt(0).toUpperCase() + startDay.slice(1);

  const currencyTags = document
    .querySelectorAll(".dashboard-country-extra")[0]
    .querySelector(".extra-tags");
  if (countryData.currencies) {
    const currencyList = Object.values(countryData.currencies)
      .map((curr) => `${curr.name} (${curr.symbol || ""})`)
      .join(", ");
    currencyTags.innerHTML = `<span class="extra-tag">${currencyList}</span>`;
  } else {
    currencyTags.innerHTML = `<span class="extra-tag">N/A</span>`;
  }

  const languageTags = document
    .querySelectorAll(".dashboard-country-extra")[1]
    .querySelector(".extra-tags");
  if (countryData.languages) {
    const langList = Object.values(countryData.languages).join(", ");
    languageTags.innerHTML = `<span class="extra-tag">${langList}</span>`;
  } else {
    languageTags.innerHTML = `<span class="extra-tag">N/A</span>`;
  }

  const neighborTags = document
    .querySelectorAll(".dashboard-country-extra")[2]
    .querySelector(".extra-tags");
  if (countryData.borders && countryData.borders.length > 0) {
    neighborTags.innerHTML = countryData.borders
      .map((border) => `<span class="extra-tag border-tag">${border}</span>`)
      .join("");
  } else {
    neighborTags.innerHTML = `<span class="extra-tag">No land borders</span>`;
  }
  const mapsBtn = document.querySelector(".btn-map-link");

  if (mapsBtn && countryData.maps && countryData.maps.googleMaps) {
    mapsBtn.href = countryData.maps.googleMaps;
  } else if (mapsBtn) {
    mapsBtn.href = "#";
  }
}

export function countryTimer(timezoneStr) {
  if (timerInterval) clearInterval(timerInterval);

  const timeDisplay = document.getElementById("country-local-time");
  const zoneDisplay = document.querySelector(".local-time-zone");

  if (zoneDisplay) zoneDisplay.textContent = timezoneStr;

  function update() {
    const now = new Date();

    const offsetParts = timezoneStr.replace("UTC", "").split(":");
    const offsetHours = parseInt(offsetParts[0]) || 0;
    const offsetMinutes = parseInt(offsetParts[1]) || 0;

    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const countryTime = new Date(
      utc + 3600000 * offsetHours + 60000 * offsetMinutes,
    );

    if (timeDisplay) {
      timeDisplay.textContent = countryTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    }
  }

  update(); // تشغيل فوري
  timerInterval = setInterval(update, 1000); // تحديث كل ثانية
}

////////////////////////////////holiday/////////////////////////////

export function renderHolidays(holidays, countryName, countryCode) {
  const container = document.getElementById("holidays-content");
  const selectionHeader = document.getElementById("holidays-selection");

  if (selectionHeader) {
    selectionHeader.style.setProperty("display", "block", "important");
    selectionHeader.innerHTML = `
            <div class="current-selection-badge">
                <img src="https://flagcdn.com/w40/${countryCode.toLowerCase()}.png" class="selection-flag" alt="flag">
                <span>${countryName}</span>
                <span class="">2026</span>
            </div>
        `;
  }

  if (!holidays || holidays.length === 0) {
    container.innerHTML = `<p style="padding: 20px; color: white;">No holidays found for 2026.</p>`;
    return;
  }
  const savedPlans = JSON.parse(localStorage.getItem("myPlans")) || [];

  container.innerHTML = holidays
    .map((holiday) => {
      const date = new Date(holiday.date);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      const dayName = date.toLocaleString("en-US", { weekday: "long" });


      const isFav = savedPlans.some(p => p.date === holiday.date && p.localName === holiday.localName);


      const holidayObj = {
        ...holiday,
        type: 'holiday',
        id: (holiday.localName + holiday.date).replace(/\s+/g, '-')
      };
      const safeData = JSON.stringify(holidayObj).replace(/'/g, "&apos;");

      return `
            <div class="holiday-card">
              <div class="holiday-card-header">
                <div class="holiday-date-box">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <button class="holiday-action-btn" 
                        data-holiday='${safeData}'
                        onclick="handleFavClick(this)">
                  <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart" 
                     style="${isFav ? "color: red;" : ""}"></i>
                </button>
              </div>
              <h3>${holiday.localName}</h3>
              <p class="holiday-name">${holiday.name}</p>
              <div class="holiday-card-footer">
                <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i> ${dayName}</span>
                <span class="holiday-type-badge">${holiday.types[0]}</span>
              </div>
            </div>
        `;
    })
    .join("");
}

export function Plans() {
  const container = document.getElementById("plans-content");
  const plans = JSON.parse(localStorage.getItem("myPlans")) || [];

  if (plans.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-heart-crack"></i></div>
                <h3>No Saved Plans Yet</h3>
            </div>`;
    return;
  }
  container.innerHTML = plans.map((item) => {
    const date = new Date(item.date);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const imageTag = item.image
      ? `<img src="${item.image}" class="plan-card-img">`
      : "";
    return `
        <div class="holiday-card">
          ${imageTag}
          <div class="holiday-card-header">
            <div class="holiday-date-box"><span class="day">${day}</span><span class="month">${month}</span></div>
            <button class="holiday-action-btn" onclick='saveTogle(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
                <i class="fa-solid fa-heart" style="color: red;"></i>
            </button>
          </div>
          <h3>${item.localName}</h3>
          <p class="holiday-name">${item.name}</p>
        </div>`;
  })
    .join("");
}
/////////////////////////events////////////////////////////////////
export function renderEvents(events, countryName, countryCode, cityName = "") {
  const container = document.getElementById("events-content");
  const liveHeader = document.querySelector(".view-header-selection");
  const headerText = document.querySelector(".view-header-content p");

  if (!container) return;


  if (liveHeader) {
    liveHeader.innerHTML = `
        <div class="current-selection-badge">
            <img src="https://flagcdn.com/w40/${countryCode.toLowerCase()}.png" class="selection-flag">
            <span>${countryName}</span>
            <span class="selection-city">${cityName}</span>
        </div>
    `;
    liveHeader.style.setProperty("display", "block", "important");
  }

  if (headerText) {
    headerText.textContent = `Discover concerts, sports, theatre and more in ${cityName || countryName}`;
  }
  if (!events || events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa fa-heart-broken"></i></div>
        <h3>No Events Found</h3>
        <p>No Events Found for this location</p>
      </div>`;
    return;
  }


  const savedPlans = JSON.parse(localStorage.getItem("myPlans")) || [];

  container.innerHTML = events
    .map((event) => {
      const image = event.images?.find((img) => img.ratio === "16_9")?.url || event.images?.[0]?.url;
      const category = event.classifications?.[0]?.segment?.name || "Event";
      const venue = event._embedded?.venues?.[0]?.name || "Venue TBD";
      const date = event.dates?.start?.localDate || "TBD";
      const time = event.dates?.start?.localTime ? ` at ${event.dates.start.localTime.substring(0, 5)}` : "";


      const isFav = savedPlans.some(p => p.id === event.id);


      const eventObj = {
        id: event.id,
        localName: event.name,
        name: category,
        date: date,
        type: 'event'
      };
      const safeData = JSON.stringify(eventObj).replace(/'/g, "&apos;");

      return `
            <div class="event-card">
              <div class="event-card-image">
                <img src="${image}" alt="${event.name}">
                <span class="event-card-category">${category}</span>
                <button class="event-card-save" data-holiday='${safeData}' onclick="handleFavClick(this)">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isFav ? 'color: red;' : ''}"></i>
                </button>
              </div>
              <div class="event-card-body">
                <h3>${event.name}</h3>
                <div class="event-card-info">
                  <div><i class="fa-regular fa-calendar"></i> ${date}${time}</div>
                  <div><i class="fa-solid fa-location-dot"></i> ${venue}, ${cityName || countryName}</div>
                </div>
                <div class="event-card-footer">
                  <button class="btn-event" data-holiday='${safeData}' onclick="handleFavClick(this)">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isFav ? 'color: red;' : ''}"></i> 
                    Save
                  </button>
                  <a href="${event.url}" target="_blank" class="btn-buy-ticket">
                    <i class="fa-solid fa-ticket"></i> Buy Tickets
                  </a>
                </div>
              </div>
            </div>
        `;
    })
    .join("");
}

///////////weatherrr///////
export function updateWeatherUI(country, weather) {

  if (!weather || !weather.hourly || !weather.daily) {
    console.error("Missing weather data parts");
    return;
  }

  const weatherView = document.getElementById("weather-view");

  if (!weatherView) return;

  const current = weather.current;
  const daily = weather.daily;
  const hourly = weather.hourly;
  const capital = country.capital ? country.capital[0] : country.name.common;
  let weatherClass = 'weather-default';

  if (current.is_day === 0) {
    weatherClass = 'weather-night';
  } else {

    const code = current.weather_code;

    if (code === 0) {
      weatherClass = 'weather-sunny';
    } else if (code <= 3) {
      weatherClass = 'weather-cloudy';
    } else if (code >= 51 && code <= 67) {
      weatherClass = 'weather-rainy';
    } else if (code >= 71 && code <= 77) {
      weatherClass = 'weather-snowy';
    } else if (code >= 95) {
      weatherClass = 'weather-stormy';
    } else if (code >= 45 && code <= 48) {
      weatherClass = 'weather-foggy';
    }
  }

  weatherView.innerHTML = `
        <div class="view-header-card gradient-blue">
            <div class="view-header-icon"><i class="fa-solid fa-cloud-sun"></i></div>
            <div class="view-header-content">
                <h2>Weather Forecast</h2>
                <p>Check 7-day weather forecasts for <strong>${capital}</strong></p>
            </div>
            <div class="view-header-selection">
                <div class="current-selection-badge">
                    <img src="${country.flags.png}" alt="${country.name.common}" class="selection-flag">
                    <span>${country.name.common}</span>
                    <span class="selection-city">${capital}</span>
                </div>
            </div>
        </div>
        
        <div id="weather-content" class="weather-layout">
            <div class="weather-hero-card ${weatherClass}">
                <div class="weather-location">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${capital}</span>
                    <span class="weather-time">${new Date().toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
                <div class="weather-hero-main">
                    <div class="weather-hero-left">
                        <div class="weather-hero-icon">${getWeatherIcon(current.weather_code)}</div>
                        <div class="weather-hero-temp">
                            <span class="temp-value">${Math.round(current.temperature_2m)}</span>
                            <span class="temp-unit">°C</span>
                        </div>
                    </div>
                    <div class="weather-hero-right">
                        <div class="weather-condition">${getWeatherDesc(current.weather_code)}</div>
                        <div class="weather-feels">Feels like ${Math.round(current.apparent_temperature)}°C</div>
                        <div class="weather-high-low">
                            <span class="high"><i class="fa-solid fa-arrow-up"></i> ${Math.round(daily.temperature_2m_max[0])}°</span>
                            <span class="low"><i class="fa-solid fa-arrow-down"></i> ${Math.round(daily.temperature_2m_min[0])}°</span>
                        </div>
                    </div>
                </div>
            </div>
            
            
<div class="weather-details-grid">
    <div class="weather-detail-card">
       <div class="detail-icon humidity"><i class="fa-solid fa-droplet"></i></div>
                <div class="detail-info">
                  <span class="detail-label">Humidity</span>
                  <span class="detail-value">${current.relative_humidity_2m || 0}%</span>
                </div>
    </div>
    <div class="weather-detail-card">
                <div class="detail-icon wind"><i class="fa-solid fa-wind"></i></div>
                <div class="detail-info">
                  <span class="detail-label">Wind</span>
                  <span class="detail-value">${current.wind_speed_10m || 0}  km/h</span>
                </div>
              </div>
    <div class="weather-detail-card">
                <div class="detail-icon uv"><i class="fa-solid fa-sun"></i></div>
                <div class="detail-info">
                  <span class="detail-label">UV Index</span>
                  <span class="detail-value">${(daily.uv_index_max[0] || 0).toFixed(1)}</span>
                </div>
              </div>
    <div class="weather-detail-card">
        <div class="detail-icon precip"><i class="fa-solid fa-cloud-rain"></i></div>
        <div class="detail-info">
            <span class="detail-label">Rain Chance</span>
            <span class="detail-value">${daily.precipitation_probability_max[0] || 0}%</span>
        </div>
    </div>
</div>
            
            <div class="weather-section">
                <h3 class="weather-section-title"><i class="fa-solid fa-clock"></i> Hourly Forecast</h3>
                <div class="hourly-scroll">
                    ${hourly.time
      .slice(0, 24)
      .map(
        (time, i) => `
                        <div class="hourly-item ${i === 0 ? "now" : ""}">
                            <span class="hourly-time">${i === 0 ? "Now" : new Date(time).getHours() + ":00"}</span>
                            <div class="hourly-icon">${getWeatherIcon(hourly.weather_code[i])}</div>
                            <span class="hourly-temp">${Math.round(hourly.temperature_2m[i])}°</span>
                        </div>
                    `,
      )
      .join("")}
                </div>
            </div>
            
            <div class="weather-section">
                <h3 class="weather-section-title"><i class="fa-solid fa-calendar-week"></i> 7-Day Forecast</h3>
                <div class="forecast-list">
                    ${daily.time
      .map(
        (date, i) => `
                        <div class="forecast-day ${i === 0 ? "today" : ""}">
                            <div class="forecast-day-name">
                                <span class="day-label">${i === 0 ? "Today" : new Date(date).toLocaleDateString("en", { weekday: "short" })}</span>
                                <span class="day-date">${new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                            </div>
                            <div class="forecast-icon">${getWeatherIcon(daily.weather_code[i])}</div>
                            <div class="forecast-temps">
                                <span class="temp-max">${Math.round(daily.temperature_2m_max[i])}°</span>
                                <span class="temp-min">${Math.round(daily.temperature_2m_min[i])}°</span>
                            </div>
                            <div class="forecast-precip">
                                ${daily.precipitation_probability_max[i] > 0 ? `<i class="fa-solid fa-droplet"></i><span>${daily.precipitation_probability_max[i]}%</span>` : ""}
                            </div>
                        </div>
                    `,
      )
      .join("")}
                </div>
            </div>
        </div>`;
}

function getWeatherIcon(code) {
  if (code === 0) return '<i class="fa-solid fa-sun"></i>';
  if (code <= 3) return '<i class="fa-solid fa-cloud-sun"></i>';
  if (code >= 51 && code <= 67)
    return '<i class="fa-solid fa-cloud-showers-heavy"></i>';
  if (code >= 71 && code <= 77) return '<i class="fa-solid fa-snowflake"></i>';
  return '<i class="fa-solid fa-cloud"></i>';
}

function getWeatherDesc(code) {
  const map = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    61: "Slight Rain",
  };
  return map[code] || "Cloudy";
}
export function updateLongWeekendsUI(weekends) {

  const lwContent = document.getElementById("lw-content");
  if (!lwContent) return;
  const savedPlans = JSON.parse(localStorage.getItem("myPlans")) || [];
  lwContent.innerHTML = weekends.map((lw, index) => {

    const holidayObj = {
      id: `lw-${lw.startDate}-${index}`,
      localName: `Long Weekend (${lw.dayCount} Days)`,
      name: "Planned Trip Opportunity",
      date: lw.startDate,
      type: 'long-weekend'
    };
    const isFav = savedPlans.some(p => p.id === holidayObj.id);
    const heartClass = isFav ? 'fa-solid' : 'fa-regular';
    const heartColor = isFav ? 'style="color: red;"' : '';


    const holidayString = JSON.stringify(holidayObj).replace(/'/g, "&apos;");
    return `
            <div class="lw-card">
              <div class="lw-card-header">
                <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${lw.dayCount} Days</span>
                <button class="holiday-action-btn" onclick='saveTogle(${holidayString})'>
                    <i class="${heartClass} fa-heart" ${heartColor}></i>
                </button>
              </div>
              <h3>Long Weekend #${index + 1}</h3>
              <div class="lw-dates"><i class="fa-regular fa-calendar"></i> ${lw.startDate}</div>
              <div class="lw-info-box ${lw.needBridgeDay ? 'warning' : 'success'}">
                <i class="fa-solid ${lw.needBridgeDay ? 'fa-info-circle' : 'fa-check-circle'}"></i> 
                ${lw.needBridgeDay ? 'Bridge day needed' : 'Perfect timing!'}
              </div>
            </div>
        `;
  }).join('');
}


export function updateGlobalSelectionBadges(data) {
  // data = { countryCode, countryName, cityName }


  const selectionContainers = document.querySelectorAll(".view-header-selection");

  selectionContainers.forEach(container => {
    container.style.setProperty("display", "block", "important");


    container.innerHTML = `
            <div class="current-selection-badge">
                <img src="https://flagcdn.com/w40/${data.countryCode.toLowerCase()}.png" class="selection-flag" alt="flag">
                <span>${data.countryName}</span>
                ${data.cityName ? `<span class="selection-city">${data.cityName}</span>` : '<span class="selection-year">2026</span>'}
            </div>
        `;
  });
}


export function renderSunTimes(sunData, cityName) {
  const container = document.getElementById("sun-times-content");
  if (!container || !sunData) return;

  const formatTime = (isoStr) => {
    return new Date(isoStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dayLengthSeconds = sunData.day_length;
  const totalSecondsInDay = 24 * 60 * 60;
  const daylightPercent = ((dayLengthSeconds / totalSecondsInDay) * 100).toFixed(1);
  const darknessSeconds = totalSecondsInDay - dayLengthSeconds;

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  container.innerHTML = `
    <div class="sun-main-card">
      <div class="sun-main-header">
        <div class="sun-location">
          <h2><i class="fa-solid fa-location-dot"></i> ${cityName}</h2>
          <p>Sun times for your selected location</p>
        </div>
        <div class="sun-date-display">
          <div class="date">${dateStr}</div>
          <div class="day">${dayName}</div>
        </div>
      </div>
      
      <div class="sun-times-grid">
        <div class="sun-time-card dawn">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dawn</div>
          <div class="time">${formatTime(sunData.civil_twilight_begin)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>
        <div class="sun-time-card sunrise">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunrise</div>
          <div class="time">${formatTime(sunData.sunrise)}</div>
          <div class="sub-label">Golden Hour Start</div>
        </div>
        <div class="sun-time-card noon">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Solar Noon</div>
          <div class="time">${formatTime(sunData.solar_noon)}</div>
          <div class="sub-label">Sun at Highest</div>
        </div>
        <div class="sun-time-card sunset">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunset</div>
          <div class="time">${formatTime(sunData.sunset)}</div>
          <div class="sub-label">Golden Hour End</div>
        </div>
        <div class="sun-time-card dusk">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dusk</div>
          <div class="time">${formatTime(sunData.civil_twilight_end)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>
        <div class="sun-time-card daylight">
          <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
          <div class="label">Day Length</div>
          <div class="time">${formatDuration(dayLengthSeconds)}</div>
          <div class="sub-label">Total Daylight</div>
        </div>
      </div>
    </div>
    
    <div class="day-length-card">
      <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
      <div class="day-progress">
        <div class="day-progress-bar">
          <div class="day-progress-fill" style="width: ${daylightPercent}%"></div>
        </div>
      </div>
      <div class="day-length-stats">
        <div class="day-stat">
          <div class="value">${formatDuration(dayLengthSeconds)}</div>
          <div class="label">Daylight</div>
        </div>
        <div class="day-stat">
          <div class="value">${daylightPercent}%</div>
          <div class="label">of 24 Hours</div>
        </div>
        <div class="day-stat">
          <div class="value">${formatDuration(darknessSeconds)}</div>
          <div class="label">Darkness</div>
        </div>
      </div>
    </div>
  `;
}
import {
  getAllCountries,
  getCountryData,
  getHolidays,
  togglePl,
  getEvents,
  getWeatherData,
  getLongWeekends,
  getSunTimes
} from "./api.js";
import {
  countrySelector,
  updateCitySelector,
  clearSelect,
  renderCountryCard,
  renderDetailedInfo,
  updateLiveDateTime,
  toggleLoading,
  showToast,
  renderHolidays,
  Plans,
  renderEvents,
  updateWeatherUI,
  updateLongWeekendsUI,
  updateGlobalSelectionBadges,
  renderSunTimes
} from "./ui.js";

//holi
let lastHolidays = [];
let lastCountryName = "";
let lastCountryCode = "";
let lastWeekends = [];

// =====OOP = sidebar=====
class App {
  constructor() {
    this.allSections = document.querySelectorAll(".view");
    this.navLinks = document.querySelectorAll(".nav-item");

    this.init();
  }

  init() {
    this.nav();
  }

  nav() {
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const viewName = link.getAttribute("data-view");

        this.navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        this.showData(`${viewName}-view`);

        if (viewName === "my-plans") {
          Plans();
        }
      });
    });
  }

  showData(viewId) {
    this.allSections.forEach((view) => view.classList.remove("active"));
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add("active");
    }
  }
}
new App();

updateLiveDateTime();

async function initApp() {
  const countries = await getAllCountries();
  if (countries) {
    countrySelector(countries);
  }
}


document.getElementById("clear-selection-btn").addEventListener("click", () => {
  clearSelect();
  console.log("deletedddddd");
});

let currentCountry = null;

//main for everything
document
  .getElementById("global-country")
  .addEventListener("change", async (e) => {
    const selectedCode = e.target.value;
    const selectedName = e.target.options[e.target.selectedIndex].text;
    const countryCode = e.target.value;

    if (selectedCode) {
      toggleLoading(true);

      try {
        const data = await getCountryData(selectedCode);
        const holidays = await getHolidays(selectedCode);

        if (data && data.length > 0) {
          currentCountry = data[0];
          const capital = currentCountry.capital
            ? currentCountry.capital[0]
            : "No Capital";
          const [lat, lon] = currentCountry.latlng;
          const weatherData = await getWeatherData(lat, lon);

          updateCitySelector(capital);
          renderCountryCard(currentCountry);
          renderHolidays(holidays, selectedName, currentCountry.cca2);
          updateWeatherUI(currentCountry, weatherData);
          updateGlobalSelectionBadges({
            countryCode: selectedCode,
            countryName: selectedName,
            cityName: capital
          });

          try {
            const weekendsData = await getLongWeekends(2026, countryCode);
            lastWeekends = weekendsData;
            const sunData = await getSunTimes(lat, lon);
             renderSunTimes(sunData, capital);

            updateLongWeekendsUI(weekendsData);

            console.log("done get for:", countryCode);
          } catch (error) {
            console.error("Error :", error);
          }

          let events = [];
          try {
            events = await getEvents(selectedCode, capital);
          } catch (e) {
            console.warn(
              "Ticketmaster API blocked or failed, skipping events.",
            );
          }
          lastHolidays = holidays;
          lastCountryName = selectedName;
          lastCountryCode = currentCountry.cca2;

          renderEvents(events, selectedName, lastCountryCode, capital);
        }
      } catch (error) {
        console.error("Critical error in country change flow:", error);
      } finally {
        toggleLoading(false);
      }
    }
  });
//search///
document.getElementById("global-search-btn").addEventListener("click", () => {
  if (currentCountry) {
    toggleLoading(true);
    renderDetailedInfo(currentCountry);

    setTimeout(() => toggleLoading(false), 800);
    showToast(`Showing details for ${currentCountry.name.common}`, "success");
  } else {
    showToast("Please select a country from the list first!", "error");
  }
});

//sidebar
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  console.log("Elements Check:", { mobileMenuBtn, sidebar, overlay });
  const closeBtn = document.getElementById("sidebar-close-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }
  if (mobileMenuBtn) {
    mobileMenuBtn.onclick = (e) => {
      console.log("Button Clicked!");
      e.preventDefault();
      sidebar?.classList.toggle("active");
      overlay?.classList.toggle("active");
    };
  }

  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("active");
    overlay?.classList.remove("active");
  });
});

//plans
function updateDashboardStats() {
  const plans = JSON.parse(localStorage.getItem("myPlans")) || [];

  const holidayCount = plans.filter((p) => p.type === "holiday").length;
  const lwCount = plans.filter((p) => p.type === "long-weekend").length;

  const hElem = document.getElementById("filter-holiday-count");
  const lwElem = document.getElementById("filter-long-weekend-count");
  const allElem = document.getElementById("filter-all-count");

  if (hElem) hElem.innerText = holidayCount;
  if (lwElem) lwElem.innerText = lwCount;
  if (allElem) allElem.innerText = plans.length;
}
//active $$&&
window.saveTogle = function (holiday) {
  togglePl(holiday);
  updateDashboardStats();

  if (typeof lastWeekends !== "undefined" && lastWeekends.length > 0) {
    updateLongWeekendsUI(lastWeekends);
  }

  if (typeof lastHolidays !== "undefined" && lastHolidays.length > 0) {
    renderHolidays(lastHolidays, lastCountryName, lastCountryCode);
  }

  if (document.getElementById("my-plans-view").classList.contains("active")) {
    Plans();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  updateDashboardStats();
  updateLiveDateTime();
  initApp();
});

document.getElementById("clear-all-plans-btn").addEventListener("click", () => {
  if (confirm) {
    localStorage.removeItem("myPlans");
    updateDashboardStats();
    Plans();
    showToast("All plans have been cleared", "success");
    if (lastHolidays.length > 0) {
      renderHolidays(lastHolidays, lastCountryName, lastCountryCode);
    }
  }
});
window.handleFavClick = function(btn) {
    
    const holidayData = JSON.parse(btn.dataset.holiday);
    const icon = btn.querySelector('i');

   
    const isNowSolid = icon.classList.toggle('fa-regular'); 
    icon.classList.toggle('fa-solid');
    
   
    icon.style.color = icon.classList.contains('fa-solid') ? 'red' : '';

   
    if (typeof saveTogle === 'function') {
        saveTogle(holidayData);
    }
};
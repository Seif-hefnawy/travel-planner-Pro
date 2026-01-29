# 🌍 Global Travel & Event Planner 2026

An interactive, responsive web application designed to help users plan their journeys by providing real-time weather data, public holidays, local events, and solar timing for any country and its capital.

## ✨ Key Features

* **Smart Country Selector:** Fetches data for 250+ countries with dynamic flag badges and capital city integration.
* **Holiday & Long Weekend Tracker:** Automated 2026 holiday fetching with a "Favorite" system to save plans to local storage.
* **Ticketmaster Events Integration:** Discover concerts, sports, and theatre events in your selected city with direct booking links.
* **Live Weather Dashboard:** Real-time temperature and weather conditions for the capital of each selected country.
* **Sun Times Monitor:** Accurate Sunrise, Sunset, and Day-length distribution using geographic coordinates.
* **Personal Dashboard:** A statistics-driven view to manage saved holidays, long weekends, and events.

## 🚀 Tech Stack

* **Frontend:** HTML5, CSS3 (Modern Grid/Flexbox), JavaScript (ES6+ / OOP Principles).
* **Icons & Fonts:** FontAwesome 6.x.
* **APIs Used:**
    * [Rest Countries API](https://restcountries.com/) - Global country data.
    * [Nager.Date API](https://date.nager.at/) - Worldwide public holidays.
    * [Ticketmaster Discovery API](https://developer.ticketmaster.com/) - Global events and tickets.
    * [OpenWeatherMap API](https://openweathermap.org/) - Real-time weather data.
    * [Sunrise-Sunset API](https://sunrise-sunset.org/api) - Solar timing and daylight info.

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/travel-planner-pro.git](https://github.com/Seif-hefnawy/travel-planner-pro.git)
    ```
2.  **Navigate to the project folder:**
    ```bash
    cd travel-planner-pro
    ```
3.  **Open with Live Server:**
    Right-click `index.html` and select **"Open with Live Server"** in VS Code.

## 📂 Project Structure

- `index.html`: Main application entry point.
- `assets/css/`: Modular stylesheets (Layout, Dashboard, Widgets).
- `assets/js/`:
    - `api.js`: All fetch operations and data handling.
    - `ui.js`: DOM manipulation and rendering logic.
    - `main.js`: App initialization and event listeners.

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Developed with ❤️ by [Saiufa]

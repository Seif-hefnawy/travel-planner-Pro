export const NAGER_BASE = "https://date.nager.at/api/v3";
export const REST_COUNTRIES_BASE = "https://restcountries.com/v3.1";

export const FLAG_BASE = "https://flagcdn.com/w160/";

export const WEATHER_BASE = "https://api.open-meteo.com/v1";

export const SUNRISE_BASE = "https://api.sunrise-sunset.org/json";


export const EXCHANGE_BASE = "https://v6.exchangerate-api.com/v6";


export const TICKETS_BASE = "https://app.ticketmaster.com/discovery/v2";

export async function getAllCountries() {
    const response = await fetch(`${NAGER_BASE}/AvailableCountries`);
    const data = await response.json();
    return data;
}

export async function getCountryData(countryCode) {
    try {
        const response = await fetch(`${REST_COUNTRIES_BASE}/alpha/${countryCode}`)
        const data = await response.json()
        return data
    } catch (error) {
        console.log("eror to get data country", error);
    }

}

export async function getHolidays(countryCode, year = 2026) {
    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        if (!response.ok) throw new Error('Holidays not found');
        return await response.ok ? response.json() : [];
    } catch (error) {
        console.error("Holiday API Error:", error);
        return [];
    }
}

export function getSavedPlans() {
    return JSON.parse(localStorage.getItem('myPlans')) || [];
}

export function togglePl(holiday) {
    let plans = getSavedPlans();
    const existsIndex = plans.findIndex(p => p.name === holiday.name && p.date === holiday.date);
    if (existsIndex === -1) {
        plans.push(holiday);
    } else {
        plans.splice(existsIndex, 1);
    }
    localStorage.setItem('myPlans', JSON.stringify(plans));
    return plans;
}

export function isSaved(holiday) {
    const plans = getSavedPlans();
    return plans.some(p => p.name === holiday.name && p.date === holiday.date);
}

export async function getEvents(countryCode, city) {
    const apiKey = "1XbAfdyT40unPSc2tMlVgQAVachrMsvx";

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&countryCode=${countryCode}&city=${encodeURIComponent(city)}&size=20`;

    const response = await fetch(url);
    const data = await response.json();
    return data._embedded ? data._embedded.events : [];
}

export async function getWeatherData(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Weather API Error:", error);
        return null;
    }
}

export async function getLongWeekends(year, countryCode) {
    try {
        const response = await fetch(`https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Long Weekend API Error:", error);
        return [];
    }
}

export async function getSunTimes(lat, lng) {
    try {
        const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching sun times:", error);
        return null;
    }
}
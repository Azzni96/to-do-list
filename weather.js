// API configuration
const apikey = "52e497241272a80243c2a0c0332b906d";
const apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

// DOM elements
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const loader = document.querySelector(".loader");
const locationBtn = document.querySelector(".location-btn");
const unitToggle = document.querySelector(".unit-toggle");
const themeSwitcher = document.querySelector(".theme-switch");
const favBtn = document.querySelector(".fav-btn");
const languageSelector = document.getElementById('language-selector');

// Stored preferences
let tempUnit = localStorage.getItem('tempUnit') || 'celsius';
let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
let favorites = JSON.parse(localStorage.getItem('favoritesCities') || '[]');
let currentLang = localStorage.getItem('weatherAppLang') || 'en';

// Language support
const languages = {
    en: {
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dateLabel: "Date",
        dayLabel: "Day",
        timeLabel: "Time",
        humidityLabel: "Humidity",
        windLabel: "Wind Speed",
        cityNotFound: "City not found",
        networkError: "Network error. Please check your connection.",
        enterCity: "Enter city name",
        feelsLike: "Feels like",
        pressure: "Pressure",
        visibility: "Visibility",
        Sunrise: "Sunrise",
        Sunset: "Sunset",
        forecast: "Forecast",
        geolocationError: "Geolocation is not supported or permission denied",
        yourLocation: "Your location",
        addToFavorites: "Add to favorites",
        removeFromFavorites: "Remove from favorites",
        favorites: "Favorites",
        darkMode: "Dark mode",
        lightMode: "Light mode",
        today: "Today",
        tomorrow: "Tomorrow",
        hPa: "hPa",
        km: "km",
        noFavorites: "No favorite cities yet"
    },
    fi: {
        dayNames: ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"],
        dateLabel: "Päivämäärä",
        dayLabel: "Päivä",
        timeLabel: "Aika",
        humidityLabel: "Kosteus",
        windLabel: "Tuulen nopeus",
        cityNotFound: "Kaupunkia ei löydy",
        networkError: "Verkkovirhe. Tarkista yhteytesi.",
        enterCity: "Syötä kaupungin nimi",
        feelsLike: "Tuntuu kuin",
        pressure: "Ilmanpaine",
        visibility: "Näkyvyys",
        Sunrise: "Auringonnousu",
        Sunset: "Auringonlasku",
        forecast: "Ennuste",
        geolocationError: "Paikannus ei ole tuettu tai lupa kielletty",
        yourLocation: "Sijaintisi",
        addToFavorites: "Lisää suosikkeihin",
        removeFromFavorites: "Poista suosikeista",
        favorites: "Suosikit",
        darkMode: "Tumma tila",
        lightMode: "Vaalea tila",
        today: "Tänään",
        tomorrow: "Huomenna",
        hPa: "hPa",
        km: "km",
        noFavorites: "Ei vielä suosikkikaupunkeja"
    },
    ar: {
        dayNames: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
        dateLabel: "التاريخ",
        dayLabel: "اليوم",
        timeLabel: "الوقت",
        humidityLabel: "الرطوبة",
        windLabel: "سرعة الرياح",
        cityNotFound: "المدينة غير موجودة",
        networkError: "خطأ في الشبكة. يرجى التحقق من اتصالك.",
        enterCity: "أدخل اسم المدينة",
        feelsLike: "يشعر وكأنه",
        pressure: "الضغط الجوي",
        visibility: "الرؤية",
        Sunrise: "شروق الشمس",
        Sunset: "غروب الشمس",
        forecast: "توقعات",
        geolocationError: "تحديد الموقع الجغرافي غير مدعوم أو تم رفض الإذن",
        yourLocation: "موقعك",
        addToFavorites: "أضف إلى المفضلة",
        removeFromFavorites: "إزالة من المفضلة",
        favorites: "المفضلة",
        darkMode: "الوضع الداكن",
        lightMode: "وضع الإضاءة",
        today: "اليوم",
        tomorrow: "غدا",
        hPa: "هكتوباسكال",
        km: "كم",
        noFavorites: "لا توجد مدن مفضلة حتى الآن"
    }
};

// Initialize language selector
languageSelector.value = currentLang;

// Language update function
function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('weatherAppLang', lang);
    
    // Update placeholder text
    searchBox.placeholder = languages[lang].enterCity;
    
    // Update UI elements with proper language
    document.querySelector(".humidity-label").textContent = languages[lang].humidityLabel;
    document.querySelector(".wind-label").textContent = languages[lang].windLabel;
    
    // Force update date/time with new language
    updateDateTime();
    
    // Update error message if it exists
    const errorEl = document.querySelector(".error p");
    if (errorEl) {
        errorEl.textContent = languages[lang].cityNotFound;
    }
    
    // Set text direction based on language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Adjust alignment for Arabic
    if (lang === 'ar') {
        document.querySelector(".error").style.textAlign = "right";
    } else {
        document.querySelector(".error").style.textAlign = "left";
    }
    
    // Update additional elements
    document.querySelector(".feels-like-label").textContent = languages[lang].feelsLike;
    document.querySelector(".pressure-label").textContent = languages[lang].pressure;
    document.querySelector(".visibility-label").textContent = languages[lang].visibility;
    document.querySelector(".forecast-title").textContent = languages[lang].forecast;
    
    // Update button texts
    locationBtn.textContent = languages[lang].yourLocation;
    themeSwitcher.textContent = isDarkTheme ? languages[lang].lightMode : languages[lang].darkMode;
    updateFavButtonText();
    
    // Update forecast day labels
    updateForecastLabels();
    
    applyTheme();
}

// Event listener for language change
languageSelector.addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

// Date and time update
function updateDateTime() {
    const now = new Date();
    const days = languages[currentLang].dayNames;
    const date = now.toLocaleDateString();
    const day = days[now.getDay()];
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    document.querySelector(".date").innerText = `${languages[currentLang].dateLabel}: ${date}`;
    document.querySelector(".day").innerText = `${languages[currentLang].dayLabel}: ${day}`;
    document.querySelector(".time").innerText = `${languages[currentLang].timeLabel}: ${time}`;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// Load last searched city
window.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
        searchBox.value = lastCity;
        checkWeather(lastCity);
    }
    updateLanguage(currentLang);
    applyTheme();
    unitToggle.checked = tempUnit === 'fahrenheit';
    updateFavoritesDropdown();
    updateForecastLabels();
});

// Fetch weather data
async function checkWeather(city) {
    // Show loader, hide weather and error message
    loader.style.display = "block";
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".error").style.display = "none";
    document.querySelector(".forecast").style.display = "none";
    
    try {
        // Save the searched city to localStorage
        localStorage.setItem('lastSearchedCity', city);
        
        // Fetch current weather
        const response = await fetch(`${apiurl}${city}&appid=${apikey}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(languages[currentLang].cityNotFound);
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        }

        const data = await response.json();
        const lat = data.coord.lat;
        const lon = data.coord.lon;

        // Update map
        if (!window.myMap) {
            window.myMap = L.map('leafletMap').setView([lat, lon], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(window.myMap);
        } else {
            window.myMap.setView([lat, lon], 10);
        }
        L.marker([lat, lon]).addTo(window.myMap).bindPopup(`${data.name}`).openPopup();

        // إشعارات الطقس (لو متاحة)
        if (data.alerts && data.alerts.length > 0) {
            showAlerts(data.alerts);
            document.querySelector(".alerts-container").style.display = "block";
        } else {
            document.querySelector(".alerts-list").innerHTML = `<div class="no-alerts">${languages[currentLang].noAlerts || "No alerts"}</div>`;
            document.querySelector(".alerts-container").style.display = "block";
        }
        
        // Display current weather with Math.round applied to all values
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = formatTemp(data.main.temp);
        document.querySelector(".humidity").innerHTML = Math.round(data.main.humidity) + "%";
        document.querySelector(".wind").innerHTML = Math.round(data.wind.speed) + "km/h";
        document.querySelector(".feels-like").innerHTML = formatTemp(data.main.feels_like);
        document.querySelector(".pressure").innerHTML = `${Math.round(data.main.pressure)} ${languages[currentLang].hPa}`;
        document.querySelector(".visibility").innerHTML = `${Math.round(data.visibility/1000)} ${languages[currentLang].km}`;
        
        // Format sunrise and sunset times
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.querySelector(".sunrise").innerHTML = sunrise;
        document.querySelector(".sunset").innerHTML = sunset;

        // Set weather icon and update background gradient based on weather
        const weatherCondition = data.weather[0].main;
        const iconMap = {
            "Clouds": "images/clouds.png",
            "Clear": "images/clear.png",
            "Rain": "images/rain.png",
            "Mist": "images/mist.png",
            "Drizzle": "images/drizzle.png",
            "Snow": "images/snow.png",
            "Thunderstorm": "images/storm.png"
        };
        
        weatherIcon.src = iconMap[weatherCondition] || "images/clear.png";
        
        // Update card background based on weather and time
        updateCardBackground(weatherCondition, data.dt, data.sys.sunrise, data.sys.sunset);
        
        // Fetch and display forecast data
        const forecastResponse = await fetch(`${forecastUrl}${city}&appid=${apikey}`);
        if (forecastResponse.ok) {
            const forecastData = await forecastResponse.json();
            displayForecast(forecastData);
            document.querySelector(".forecast").style.display = "block";
        }
        
        // Update favorite button
        updateFavButtonText();

        // Show weather data
        document.querySelector(".weather").style.display = "block";
    } catch (error) {
        console.error(error.message);
        document.querySelector(".error p").textContent = 
            error.message.includes("fetch") ? languages[currentLang].networkError : error.message;
        document.querySelector(".error").style.display = "block";
    } finally {
        loader.style.display = "none";
    }
}

// Event listeners for search
searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && searchBox.value.trim() !== "") {
        checkWeather(searchBox.value);
    }
});
searchBtn.addEventListener("click", () => {
    if (searchBox.value.trim() !== "") {
        checkWeather(searchBox.value);
    }
});

// Language buttons
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    // Set active class on current language button
    function updateActiveButton() {
        langButtons.forEach(btn => {
            if (btn.dataset.lang === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Add click event to each language button
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const newLang = btn.dataset.lang;
            updateLanguage(newLang);
            updateActiveButton();
        });
    });
    
    // Set initial active button
    updateActiveButton();
});

// Theme application
function applyTheme() {
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeSwitcher.textContent = languages[currentLang].lightMode;
    } else {
        document.body.classList.remove('dark-theme');
        themeSwitcher.textContent = languages[currentLang].darkMode;
    }
}

// Temperature conversion
function convertTemp(celsius) {
    return tempUnit === 'celsius' ? celsius : Math.round((celsius * 9/5) + 32);
}
function formatTemp(celsius) {
    const temp = Math.round(convertTemp(celsius));
    return `${temp}°${tempUnit === 'celsius' ? 'C' : 'F'}`;
}

// Favorites management
function updateFavButtonText() {
    const currentCity = document.querySelector(".city").textContent;
    const isFavorite = favorites.includes(currentCity);
    favBtn.textContent = isFavorite ? 
        languages[currentLang].removeFromFavorites : 
        languages[currentLang].addToFavorites;
}
function updateFavoritesDropdown() {
    const dropdown = document.querySelector(".favorites-dropdown");
    dropdown.innerHTML = '';
    
    if (favorites.length === 0) {
        const noFavs = document.createElement('div');
        noFavs.className = 'no-favorites';
        noFavs.textContent = languages[currentLang].noFavorites;
        dropdown.appendChild(noFavs);
        return;
    }
    
    favorites.forEach(city => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.textContent = city;
        item.addEventListener('click', () => {
            searchBox.value = city;
            checkWeather(city);
            document.querySelector(".favorites-dropdown").classList.remove('show');
        });
        dropdown.appendChild(item);
    });
}

// Forecast display
function displayForecast(data) {
    const forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.innerHTML = '';
    
    // Group forecast by day (each day has 8 data points - every 3 hours)
    const days = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!days[date]) {
            days[date] = [];
        }
        days[date].push(item);
    });
    
    // Display next 3 days forecast
    let count = 0;
    for (const date in days) {
        if (count >= 3) break;
        
        const dayData = days[date];
        // Round the average temperature
        const dayTemp = Math.round(dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length);
        const mainWeather = dayData[Math.floor(dayData.length / 2)].weather[0].main;
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        
        const dayLabel = count === 0 ? languages[currentLang].today : 
                        (count === 1 ? languages[currentLang].tomorrow : 
                        new Date(dayData[0].dt * 1000).toLocaleDateString());
        
        forecastDay.innerHTML = 
            `<div class="forecast-date">${dayLabel}</div>
            <img src="images/${mainWeather.toLowerCase()}.png" alt="${mainWeather}" class="forecast-icon">
            <div class="forecast-temp">${formatTemp(dayTemp)}</div>`;
        
        forecastContainer.appendChild(forecastDay);
        count++;
    }
    const labels = [];
const temps = [];

data.list.slice(0, 8).forEach(item => {
    const time = new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    labels.push(time);
    temps.push(Math.round(item.main.temp));
});

// Ensure tempChart is a Chart instance before calling destroy
if (window.tempChart instanceof Chart) {
    window.tempChart.destroy();
}

const ctx = document.getElementById('tempChart').getContext('2d');
window.tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Temp (°C)',
            data: temps,
            borderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true
    }
});

}
function updateForecastLabels() {
    const labels = document.querySelectorAll(".forecast-date");
    if (labels.length > 0) {
        labels[0].textContent = languages[currentLang].today;
        if (labels.length > 1) {
            labels[1].textContent = languages[currentLang].tomorrow;
        }
    }
}

// Card background update
function updateCardBackground(weather, currentTime, sunrise, sunset) {
    const card = document.querySelector(".card");
    const isDay = currentTime > sunrise && currentTime < sunset;
    
    let gradient;
    
    if (isDay) {
        switch(weather) {
            case "Clear":
                gradient = "linear-gradient(135deg, #00feba, #5b548a)";
                break;
            case "Clouds":
                gradient = "linear-gradient(135deg, #626c80, #2c3e50)";
                break;
            case "Rain":
            case "Drizzle":
                gradient = "linear-gradient(135deg, #3494e6, #1e3c72)";
                break;
            case "Snow":
                gradient = "linear-gradient(135deg, #a1c4fd, #c2e9fb)";
                break;
            case "Thunderstorm":
                gradient = "linear-gradient(135deg, #41295a, #2F0743)";
                break;
            case "Mist":
                gradient = "linear-gradient(135deg, #757f9a, #d7dde8)";
                break;
            default:
                gradient = "linear-gradient(135deg, #00feba, #5b548a)";
        }
    } else {
        // Night gradients
        switch(weather) {
            case "Clear":
                gradient = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
                break;
            case "Clouds":
                gradient = "linear-gradient(135deg, #232526, #414345)";
                break;
            case "Rain":
            case "Drizzle":
                gradient = "linear-gradient(135deg, #000428, #004e92)";
                break;
            case "Snow":
                gradient = "linear-gradient(135deg, #2c3e50, #4ca1af)";
                break;
            case "Thunderstorm":
                gradient = "linear-gradient(135deg, #16222a, #3a6073)";
                break;
            case "Mist":
                gradient = "linear-gradient(135deg, #2c3e50, #4c4c4c)";
                break;
            default:
                gradient = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
        }
    }
    
    card.style.background = gradient;
}

// Geolocation weather
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Show loader
                loader.style.display = "block";
                document.querySelector(".weather").style.display = "none";
                document.querySelector(".error").style.display = "none";
                
                try {
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apikey}`);
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    searchBox.value = data.name; // Update the search box with city name
                    checkWeather(data.name);
                } catch (error) {
                    console.error(error.message);
                    document.querySelector(".error p").textContent = error.message;
                    document.querySelector(".error").style.display = "block";
                    loader.style.display = "none";
                }
            },
            (error) => {
                console.error(error);
                document.querySelector(".error p").textContent = languages[currentLang].geolocationError;
                document.querySelector(".error").style.display = "block";
            }
        );
    } else {
        document.querySelector(".error p").textContent = languages[currentLang].geolocationError;
        document.querySelector(".error").style.display = "block";
    }
});

// Unit toggle
unitToggle.addEventListener("change", () => {
    tempUnit = unitToggle.checked ? 'fahrenheit' : 'celsius';
    localStorage.setItem('tempUnit', tempUnit);
    
    // Update displayed temperatures
    const cityName = document.querySelector(".city").textContent;
    if (cityName) {
        checkWeather(cityName);
    }
});

// Theme toggle
themeSwitcher.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('darkTheme', isDarkTheme);
    applyTheme();
});

// Favorites dropdown toggle
document.querySelector(".favorites-btn").addEventListener("click", () => {
    document.querySelector(".favorites-dropdown").classList.toggle('show');
});

// Add/Remove from favorites
favBtn.addEventListener("click", () => {
    const currentCity = document.querySelector(".city").textContent;
    const index = favorites.indexOf(currentCity);
    
    if (index === -1) {
        // Add to favorites
        favorites.push(currentCity);
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
    }
    
    // Update localStorage and button text
    localStorage.setItem('favoritesCities', JSON.stringify(favorites));
    updateFavButtonText();
    updateFavoritesDropdown();
});

// Close dropdowns when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.matches('.favorites-btn') && !e.target.closest('.favorites-dropdown')) {
        const dropdown = document.querySelector(".favorites-dropdown");
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});

// Weather alerts
function showAlerts(alerts) {
    const list = document.querySelector(".alerts-list");
    list.innerHTML = '';

    alerts.forEach(alert => {
        const alertItem = document.createElement("div");
        alertItem.className = "alert-item";

        alertItem.innerHTML = `
            <div class="alert-header">
                <span class="alert-title">${alert.event}</span>
                <span class="alert-badge">${alert.sender_name}</span>
            </div>
            <div class="alert-body">
                <p>${alert.description}</p>
                <div class="alert-timing">
                    <span>From: ${new Date(alert.start * 1000).toLocaleString()}</span>
                    <span>To: ${new Date(alert.end * 1000).toLocaleString()}</span>
                </div>
            </div>
        ;`

        list.appendChild(alertItem);
    });
}

// Share weather on Twitter
document.getElementById("shareWeather").addEventListener("click", () => {
    const city = document.querySelector(".city").textContent;
    const temp = document.querySelector(".temp").textContent;
    const url = `https://twitter.com/intent/tweet?text=Current weather in ${city} is ${temp}!`;
    window.open(url, "_blank");
});
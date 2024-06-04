function select(elem){
    return document.querySelector(elem)
}

const searchbtn = select(".search-btn");
const locationBtn = select(".location-btn");
const cityinput = select("#cityinput");
const currentweather = select(".current-weather");
const weatherCards = select(".weather-cards");

const apiKey = "eec5f6d9dbd897d8b9bad2d045507916"  //Api key for openweather api

const createWeatherCard = (cityName ,weatherItem, index)=>{
    if(index === 0){  //HTML for main weather card
        return `<div class="details">
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h4>Temperature: ${(weatherItem.main.temp -273.15).toFixed(2)}°c</h4>
            <h4>Wind:${weatherItem.wind.speed} M/s</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="">
             <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } else{ // HTML for other six days forecast card weather card
        return `<li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
        <h4>Temp: ${(weatherItem.main.temp -273.15).toFixed(2)}°c</h4>
        <h4>Wind:${weatherItem.wind.speed} M/s</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
        </li>`
    }

}

const getWeatherDeltails = (cityName,lat,lon)=>{
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`

    fetch(weatherApiUrl).then(res => res.json()).then(data =>{
       
        //filter forecast to get only one forecast per day
        const uniqueForecastDays = [];
       const fourDaysForecast =  data.list.filter(forecast =>{
            const forecastData = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastData)){
                return uniqueForecastDays.push(forecastData)
            }
        });


        //clearing previous weather data
        cityinput.value = ""
        weatherCards.innerHTML = "";
        currentweather.innerHTML = "";


        // creating weather cards and adding them to the dom


        fourDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentweather.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index));

            } else {
                
                weatherCards.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index));
            }
           
        });

    }).catch(()=>{
        alert("An Error Occured While Fetching The Weather Forecast")
    });

}

const getCityCordinates = ()=>{
    const cityName = cityinput.value.trim(); //get user enter city and remove extra spaces
    if(!cityName) return; // Return if city name is empty
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

    //get entered city cordinates(latitiude, longitude, and name) from the api responed
    fetch(apiUrl).then(res => res.json()).then(data=>{
        if(!data.length) return alert(`NO Cordinates Found for ${cityName}`);
        const {name,lat,lon} = data[0];
        getWeatherDeltails(name,lat,lon)
    }).catch(()=>{
        alert("An Error Occured While Fetching The Cordinates")
    });
};


const getUserCordinates= ()=>{
    navigator.geolocation.getCurrentPosition(
        position => {
            const{latitude,longitude} = position.coords;
            const Reverse_geocoding_url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

            //get city names from cordinates using reverse getcoding api
            fetch(Reverse_geocoding_url).then(res => res.json()).then(data=>{
                const {name,} = data[0];
                getWeatherDeltails(name,latitude,longitude)
            }).catch(()=>{
                alert("An Error Occured While Fetching The city")
            });
        },
        error=>{
            if(error.code=== error.PERMISSION_DENIED){
                alert("Goelocation request denied. Please reset location permission to grant access again.")
            }
        }
    )
}

searchbtn.addEventListener("click",getCityCordinates);

locationBtn.addEventListener("click",getUserCordinates);

cityinput.addEventListener("keyup",e => e.key === "Enter" && getCityCordinates())



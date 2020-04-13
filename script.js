$(document).ready(function () {
    console.log("ready!");
    repopulateCities();

    let APIKey = "f9593615380abd6eb91cc2a19a4938f5";
    let currentCity = "";
    $("#searchbtn").on("click", function (e) {
        e.preventDefault();
        currentCity = $("#search").val();
        saveHistory(currentCity);
        console.log("History: ", history);
        searchHandling();

    })

    $("#saved-search").on("click", function (e) {
        let element = e.target;
        currentCity = element.textContent;
        searchHandling();
    })

    //Handles the localStorage and previous city search history
    function saveHistory(city) {
        console.log("Save History", city);
        var history = getHistory();
        if(!history.includes(currentCity)) {
            history.push(currentCity);
        }
        localStorage.setItem("cityHistory", JSON.stringify(history));
        repopulateCities();
    }

    function getHistory() {
        var history = localStorage.getItem("cityHistory");
        if (!history) {
            history = [];
        }
        else {
            history = JSON.parse(history);
        }
        return history;
    }

    //Handles the rendering of the previous city searches, including make sure the last city searched for is put at the top
    function repopulateCities() {
        var history = getHistory();
        $("#saved-search").empty();
        for (let i = 0; i < history.length; i++) {
            let newLi = $("<li>");
            newLi.text(history[i]);
            newLi.attr("class", "list-group-item");
            $("#saved-search").prepend(newLi);
        }

    }

    //Functions to help with getting the right data - need to use 2 separate APIs because not all the data is included on one.
    function createLonAndLatQueryURL(currentCity) {
        return `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${APIKey}&units=imperial`;
    }

    function fetchLatAndLong(queryURL) {
        return $.ajax({
            url: queryURL,
            method: "GET"
        });
    }

    function fetchWeatherData(coord) {
        let queryURL2 = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&appid=${APIKey}&units=imperial`;

        return $.ajax({
            url: queryURL2,
            method: "GET"
        })
    }

    function extractForecastData(weatherArray) {

        let array = [];
        for (let i = 1; i < 6; i++) {
            var currentDay = weatherArray[i];
            var data = {
                temp: currentDay.temp.day,
                humidity: currentDay.humidity,
                icon: "http://openweathermap.org/img/wn/" + currentDay.weather[0].icon + "@2x.png",
                date: currentDay.dt
            }
            array.push(data);
        }
        return array;
    }

    //The following functions help with rendering the current city weather
    function updateCurrentWeather(currentWeather) {
        let $results = $("#results");
        $results.empty();
        let divCity = $("#city");
        let title = $("<h4>");
        title.text(currentCity + " - " + moment().format("dddd, MMMM Do YYYY"));
        divCity.empty();
        divCity.append(title);
        var weatherCard = weatherFactory(currentWeather);
        $results.append(weatherCard);
    }

    function generateForecastCard(data) {
        let div1 = $("<div>");
        div1.attr("class", "col-4");
        let card = $("<div>");
        card.attr("class", "card");
        card.attr("style", "width: 15rem; margin: 5px;");
        div1.append(card);
        let cardBody = $("<div>");
        cardBody.attr("class", "card-body");
        card.append(cardBody);
        let heading = $("<h5>");
        heading.attr("class", "card-title");
        heading.text("Date: " + moment.unix(data.date).format("M/D/YYYY"));
        let icon = $("<img>");
        icon.attr("src", data.icon);
        let temp = $("<div>").text("Temp: " + Math.round(data.temp) + "°");
        let humidity = $("<div>").text("Humidity: " + data.humidity + "%");
        cardBody.append(heading, icon, temp, humidity);

        return div1;
        
    }

    function forecastWeatherFactory(forecastWeather) {
        return forecastWeather.map((weatherData)=> generateForecastCard(weatherData));
    }

    function updateForecastWeather(forecastWeather) {
        var forecastElements = forecastWeatherFactory(forecastWeather);
        console.log(forecastElements);
        $("#forecast-weather").empty();
        $("#forecast-weather").append(forecastElements);
    }

    function weatherFactory(currentWeather) {
        let iconURL = "http://openweathermap.org/img/wn/" + currentWeather.weather[0].icon + "@2x.png";
        let iconEl = $("<img>").attr("src", iconURL);
        iconEl.attr("style", "height: 75px; width: 75px;");
        let div = $("<div>");
        //Update the main card with the necessary information for the current city

        let tempEl = $("<h5>");
        tempEl.text("Temperature: " + Math.round(currentWeather.temp) + "°");
        let humidityEl = $("<h5>");
        humidityEl.text("Humidity: " + currentWeather.humidity + "%")
        let windSpeedEl = $("<h5>");
        windSpeedEl.text("Wind Speed: " + currentWeather.wind_speed + " mph");
        let uvIndexEl = $("<h5>");
        uvIndexEl.text("UV Index: " + currentWeather.uvi);
        //Handle UV index coloring
        setUVColoring(currentWeather.uvi, uvIndexEl);
        div.append(iconEl);
        div.append(tempEl);
        div.append(humidityEl);
        div.append(windSpeedEl);
        div.append(uvIndexEl);
        return div;
    }

    function searchHandling() {

        //Setting up the first API Key

        let queryURL = createLonAndLatQueryURL(currentCity);

        //Populating all previous searches under the search input and button
        // populatePreviousSearches(currentCity);
        fetchLatAndLong(queryURL)
            //Get's just the coordinates instead of all the unnecessary data - called object destructuring, 
            //adds a layer of security, you don't have to remember what order, etc.
            .then(function ({ city: { coord } }) {
                fetchWeatherData(coord)
                    .then(function (res2) {
                        console.log(res2);
                        let currentWeather = res2.current;
                        let forecastWeather = extractForecastData(res2.daily);
                        updateCurrentWeather(currentWeather);
                        updateForecastWeather(forecastWeather);
                    });

            });

    }

    function setUVColoring(currentUVI, uvIndexEl) {
        if (currentUVI > 7) {
            uvIndexEl.attr("class", "severe");
        }
        else if (currentUVI > 4) {
            uvIndexEl.attr("class", "moderate");
        }
        else {
            uvIndexEl.attr("class", "favorable");
        }
    }

    //NOTE TO HOLD ONTO ABOUT OBJECT DESTRUCTURING
    //Has to be the same name that comes from the API object
    // {city: {
    //     coord: {
    //         lon:
    //         lat:
    //     }
    // }}
});
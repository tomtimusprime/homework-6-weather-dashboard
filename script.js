$(document).ready(function () {
    console.log("ready!");
    repopulateCities();

    let APIKey = "f9593615380abd6eb91cc2a19a4938f5";
    let currentCity = "";
    $("#searchbtn").on("click", function (e) {
        e.preventDefault();
        currentCity = $("#search").val();
        var history = localStorage.getItem("cityHistory");
        if(!history) {
            history = [];
        }
        else {
            history = JSON.parse(history);
            //
        }
        history.push(currentCity);
        localStorage.setItem("cityHistory", JSON.stringify(history));
        searchHandling();

    })

    $(".list-group-item").on("click", function(e) {
        let element = e.target;
        currentCity = element.textContent;
        console.log(currentCity);
        searchHandling();
    })

    function repopulateCities() {
        let history = localStorage.getItem("cityHistory");
        if(!history) {
            history = [];
            return;
        }
        else {
            history = JSON.parse(history);
            for(let i = 0; i < history.length; i++) {
                let newLi = $("<li>");
                newLi.text(history[i]);
                newLi.attr("class", "list-group-item");
                $("#saved-search").append(newLi);
            }
        }
        
    }

    //get city name from the class of that dom element
    //update the value of the current city variable
    //call search handling again on that button click.
    //create another function to create the other cards
    //on click add city name to your local storage 
    //Get data from local storage and repopulate it on the page upon refresh

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
        for (let i = 0; i < 5; i++) {
            var currentDay = weatherArray[i];
            var data = {
                temp: currentDay.temp.day,
                humidity: currentDay.humidity,
                icon: "http://openweathermap.org/img/wn/" + currentDay.weather[0].icon + "@2x.png"
            }
            array.push(data);
        }
        return array;
    }

    function updateCurrentWeather(currentWeather) {
        let $results = $("#results");
        $results.empty();
        let divCity = $("#city");
        divCity.text(currentCity + " - " + moment().format("dddd, MMMM Do YYYY"));
        var weatherCard = weatherFactory(currentWeather);
        $results.append(weatherCard);
    }

    function weatherFactory(currentWeather) {
        let iconURL = "http://openweathermap.org/img/wn/" + currentWeather.weather[0].icon + "@2x.png";
        let iconEl = $("<img>").attr("src", iconURL);
        iconEl.attr("style", "height: 75px; width: 75px;");
        let div = $("<div>");
        //Update the main card with the necessary information for the current city
        
        let tempEl = $("<h5>");
        tempEl.text("Temperature: " + currentWeather.temp);
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

    function populatePreviousSearches(currentCity) {
        let newLi = $("<li>");
        newLi.text(currentCity);
        newLi.attr("class", "list-group-item");
        $("#saved-search").prepend(newLi);
    }

    function searchHandling() {

        //Setting up the first API Key

        let queryURL = createLonAndLatQueryURL(currentCity);

        //Populating all previous searches under the search input and button
        populatePreviousSearches(currentCity);
        fetchLatAndLong(queryURL)
            //Get's just the coordinates instead of all the unnecessary data - called object destructuring, adds a layer of security, you don't have to remember what order, etc.
            .then(function ({ city: { coord } }) {
                fetchWeatherData(coord)
                    .then(function (res2) {
                        console.log(res2);
                        let currentWeather = res2.current;
                        let forecastWeather = extractForecastData(res2.daily);
                        updateCurrentWeather(currentWeather);
                        updateForecastWeather(forecastWeather);
                        //Adding the ICON
                        let icon = (res2.current.weather["0"].icon);
                        let iconURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
                        $results.append(iconEl, tempEl, humidityEl, windSpeedEl, uvIndexEl);
                        //localStorage.setItem("weather Results", );
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


});
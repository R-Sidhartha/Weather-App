//Declare a variable to store the searched city
let city = "";
// variable declaration
let searchCity = $("#search-city");
let searchButton = $("#search-button");
let clearButton = $("#clear-history");
let currentCity = $("#current-city");
let currentTemperature = $("#temperature");
let currentHumidty = $("#humidity");
let currentWSpeed = $("#wind-speed");
let currentUvindex = $("#uv-index");
let sCity = [];
// searches the city to see if it exists in the entries from the storage
function find(c) {
  for (let i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}
//Set up the API key
let APIKey = "a0aca8a89948154a4182dcecc780b513";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
    $("#future-weather").css("display", "block");
  } else {
    $("#current-weather").text("Please enter a city to view weather.");
    $("#future-weather").css("display", "none");
  }
}
// Here we create the AJAX call
function currentWeather(city) {
  // Here we build the URL so we can get a data from server side.
  let queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&APPID=" +
    APIKey;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    //Dta object from server side Api for icon property.
      let weathericon = response.weather[0].icon;
      let iconurl =
        "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

      // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
      let date = new Date(response.dt * 1000).toLocaleDateString();
      //parse the response for name of city and concanatig the date and icon.
      $(currentCity).html(
        response.name + "(" + date + ")" + "<img src=" + iconurl + ">"
      );
     
      // parse the response to display the current temperature.
      // Convert the temp to fahrenheit

      let tempC = response.main.temp - 273.15;
      $(currentTemperature).html(tempC.toFixed(2) + "&#8451;");
      // Display the Humidity
      $(currentHumidty).html(response.main.humidity + "%");
      //Display Wind speed and convert to MPH
      let ws = response.wind.speed;
      let windsmph = (ws * 2.237).toFixed(1);
      $(currentWSpeed).html(windsmph + "MPH");
      // Display UVIndex.
      //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
      UVIndex(response.coord.lon, response.coord.lat);
      forecast(response.id);
      if (response.cod == 200) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        if (sCity == null) {
          sCity = [];
          sCity.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(sCity));
          addToList(city);
        } else {
          if (find(city) > 0) {
            sCity.push(city.toUpperCase());
            localStorage.setItem("cityname", JSON.stringify(sCity));
            addToList(city);
          }
        }
      }
  });
}
// This function returns the UVIindex response.
function UVIndex(ln, lt) {
  //lets build the url for uvindex.
  let uvqURL =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    APIKey +
    "&lat=" +
    lt +
    "&lon=" +
    ln;
  $.ajax({
    url: uvqURL,
    method: "GET",
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}

// Here we display the 5 days forecast for the current city.
function forecast(cityid) {
  let dayover = false;
  let queryforcastURL =
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityid +
    "&appid=" +
    APIKey;
  $.ajax({
    url: queryforcastURL,
    method: "GET",
  }).then(function (response) {
    for (i = 0; i < 5; i++) {
      let date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      let iconcode = response.list[(i + 1) * 8 - 1].weather[0].icon;
      let iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      let tempK = response.list[(i + 1) * 8 - 1].main.temp;
      let tempC = (tempK - 273.15).toFixed(2);
      let humidity = response.list[(i + 1) * 8 - 1].main.humidity;

      $("#fDate" + i).html(date);
      $("#fImg" + i).html("<img src=" + iconurl + ">");
      $("#fTemp" + i).html(tempC + "&#8451;");
      $("#fHumidity" + i).html(humidity + "%");
    }
  });
}

//Daynamically add the passed city on the search history
function addToList(c) {
  let listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event) {
  let liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

// render function
function loadlastCity() {
  $("ul").empty();
  let sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    sCity = JSON.parse(localStorage.getItem("cityname"));
    for (i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i - 1];
    currentWeather(city);
    $("#future-weather").css("display", "block");
  }
}
//Clear the search history from the page
function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);

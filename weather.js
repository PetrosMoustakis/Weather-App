$(document).ready(function () {
  let debounceTimeout = null;
  //   $("#searchInput").on("input", function () {
  //     clearTimeout(debounceTimeout);
  //     debounceTimeout = setTimeout(() => getCity(this.value.trim()), 1500);
  //   });

  $("#submit").on("click", function (e) {
    e.preventDefault();
    const title = $("#searchInput").val().trim();
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => getCity(title, 1500));
  });
});

function getCity(title) {
  if (!title) {
    return;
  }

  onBeforeSend();
  fetchCityFromApi(title);
}

function fetchCityFromApi(title) {
  let ajaxRequest = new XMLHttpRequest();
  ajaxRequest.open(
    "GET",
    `https://api.openweathermap.org/data/2.5/weather?q=${title}&appid=b8c87215a3998d983c6a0ab6c1f689c8`,
    true
  );
  ajaxRequest.timeout = 5000;
  ajaxRequest.ontimeout = (e) => onApiError();
  ajaxRequest.onreadystatechange = function () {
    if (ajaxRequest.readyState === 4) {
      if (ajaxRequest.status === 200) {
        handleResults(JSON.parse(ajaxRequest.responseText));
      } else {
        onApiError();
      }
    }
  };
  ajaxRequest.send();
}

function handleResults(response) {
  if (response.cod === 200) {
    console.log(response);
    let transformed = transformResponse(response);
    buildCityMetaData(transformed);
    $("#searchInput").val("");
  } else {
    showNotFound();
  }
}

function buildCityMetaData(apiResponse) {
  handleLiterals(apiResponse);
  return $(".weather").removeClass("hidden");
}

function onApiError() {
  $(".error").clone().removeClass("hidden").appendTo($(".center"));
}

function onBeforeSend() {
  $(".weather").addClass("hidden");
  $(".center").find(".not-found").remove();
  $(".center").find(".error").remove();
}

function handleLiterals(apiResponse) {
  let name = $("#name");
  let descrption = $("#description");
  let temp = $("#temp");
  let humidity = $("#humidity");
  let clouds = $("#clouds");
  let timezome = $("#timezone");

  let nameValue = apiResponse["name"];
  let descValue = apiResponse["weather"][0]["description"];
  let tempValue = (apiResponse["main"]["temp"] - 273.15).toFixed(2);
  let humidityValue = apiResponse["main"]["humidity"];
  let cloudsValue = apiResponse["clouds"]["all"];
  let timezomeValue = apiResponse["timezone"];

  name.html(nameValue);
  descrption.html(descValue);
  temp.html(tempValue);
  humidity.html(humidityValue);
  clouds.html(cloudsValue);
  timezome.html(timezomeValue);
}

function transformResponse(apiResponse) {
  let camelCaseKeysResponse = camelCaseKeys(apiResponse);
  clearNotAvailableInformation(camelCaseKeysResponse);
  return camelCaseKeysResponse;
}

function camelCaseKeys(apiResponse) {
  return _.mapKeys(apiResponse, (v, k) => _.camelCase(k));
}

function clearNotAvailableInformation(apiResponse) {
  for (var key in apiResponse) {
    if (apiResponse.hasOwnProperty(key) && apiResponse[key] === null) {
      apiResponse[key] = "";
    }
  }
}

function showNotFound() {
  $(".not-found").clone().removeClass("hidden").appendTo(".center");
}

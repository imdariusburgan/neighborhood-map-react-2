import React, { Component } from "react";
import "./App.css";

// This function will load the Google Maps API script in the DOM
// This code was inspired from https://stackoverflow.com/questions/42847126/script-load-in-react
function loadScriptUrl(url) {
  let scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.async = true;
  scriptTag.defer = true;
  document.body.appendChild(scriptTag);
}

class App extends Component {
  // This function initializes a new Google Maps
  initMap = () => {
    let map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8
    });
  };

  render() {
    return (
      <div className="App">
        <h1>Hello World</h1>
        <div id="map" />
      </div>
    );
  }
}

export default App;

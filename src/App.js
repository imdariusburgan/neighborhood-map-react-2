import React, { Component } from "react";
import "./App.css";

// This function will load the Google Maps API script in the DOM
// This code was inspired from https://stackoverflow.com/questions/42847126/script-load-in-react
function loadScriptTag(url) {
  let scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.async = true;
  scriptTag.defer = true;
  document.body.appendChild(scriptTag);
}

class App extends Component {
  // This function loads the Google Maps API script tag
  loadMap = () => {
    loadScriptTag(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDwmWMef1tFyoOOz8DiWqZdVwetRP6TemQ&callback=initMap"
    );
    // The script tag url above was searching for the 'initMap' callback function in the window object.
    // This line sets the window object's 'initMap' function to match our 'initMap' function
    window.initMap = this.initMap;
  };

  // This function initializes a new Google Maps
  initMap = () => {
    const cleveland = { lat: 41.505493, lng: -81.68129 };
    new window.google.maps.Map(document.getElementById("map"), {
      center: cleveland,
      zoom: 12
    });
  };

  componentDidMount() {
    this.loadMap();
  }

  render() {
    return (
      <div className="App">
        <div id="map" />
      </div>
    );
  }
}

export default App;

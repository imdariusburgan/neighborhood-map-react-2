import React, { Component } from "react";
import "./App.css";

class App extends Component {
  // This function initializes a new Google Maps
  initMap = () => {
    map = new google.maps.Map(document.getElementById("map"), {
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

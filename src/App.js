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
  state = {
    allLocations: []
  };

  // This function loads the Google Maps API script tag
  loadMap = () => {
    loadScriptTag(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDwmWMef1tFyoOOz8DiWqZdVwetRP6TemQ&callback=initMap"
    );
    // The script tag url above was searching for the 'initMap' callback function in the window object.
    // This line sets the window object's 'initMap' function to match our 'initMap' function
    window.initMap = this.initMap;
  };

  // This function initializes a new Google Maps and sets markers
  initMap = () => {
    // This part of the initMap function sets the map
    const cleveland = { lat: 41.505493, lng: -81.68129 };
    let map = new window.google.maps.Map(document.getElementById("map"), {
      center: cleveland,
      zoom: 12
    });

    // This part of the initMap function sets the markers
    this.state.allLocations.map(location => {
      new window.google.maps.Marker({
        map: map,
        position: {
          lat: location.venue.location.lat,
          lng: location.venue.location.lng
        },
        title: location.venue.name
      });
    });
  };

  getFoursquareLocations = () => {
    const parameters = {
      clientID: "EPYY3NEHXV02O5I1VVCTDKHCN2B3BYSVVKYIPGKGZUAEFXHL",
      clientSecret: "PM0DGZ2THHKNODWVNABPG0AJMMARWVU1CVCPGLJSMMORLIFY",
      near: "cleveland",
      query: "food",
      version: "20180921",
      limit: "10"
    };
    // GET the API
    fetch(
      `https://api.foursquare.com/v2/venues/explore?client_id=${
        parameters.clientID
      }&client_secret=${parameters.clientSecret}&near=${
        parameters.near
      }&query=${parameters.query}&v=${parameters.version}&limit=${
        parameters.limit
      }`
    )
      // Turn the response into JSON
      .then(response => {
        return response.json();
      })
      // Take the location data from the JSON and store it in the state
      .then(data => {
        this.setState({ allLocations: data.response.groups[0].items });
      })
      // Once locations are stored in the state, load the map
      .then(() => {
        this.loadMap();
      })
      // Log errors if any
      .catch(error => {
        console.log(`There was an error: ${error}`);
      });
  };

  componentDidMount() {
    this.getFoursquareLocations();
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

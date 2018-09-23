import React, { Component } from "react";
import "./App.css";

// This function will load scripts in the DOM
// This code was inspired from https://stackoverflow.com/questions/42847126/script-load-in-react
function loadScriptTag(url) {
  let scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.async = true;
  scriptTag.defer = true;
  document.body.appendChild(scriptTag);
}

// This function will load css in the DOM
function loadCssTag(url) {
  let cssTag = document.createElement("link");
  cssTag.rel = "stylesheet";
  cssTag.href = url;
  let styleTags = document.getElementsByTagName("style");
  styleTags[0].parentNode.insertBefore(cssTag, styleTags[0]);
}

class App extends Component {
  state = {
    allLocations: []
  };

  // This function loads the Google Maps API script tag
  loadTags = () => {
    loadCssTag(
      "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
    );
    loadScriptTag(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDwmWMef1tFyoOOz8DiWqZdVwetRP6TemQ&callback=initMap"
    );
    // The script tag url above was searching for the 'initMap' callback function in the window object.
    // This line sets the window object's 'initMap' function to match our 'initMap' function
    window.initMap = this.initMap;
  };
  /************************************************
   * THIS FUNCTION INITIALIZES THE GOOGLE MAP
   ************************************************/
  initMap = () => {
    // This part of the initMap function sets the map.
    // Parameters:
    // - Center: This should be an object with a lat variable (latitude) and lng variable (longitude)
    // - Zoom: This should be a number. Number 1 is a view of the world, number 20 is a close view of streets and buildings
    const cleveland = { lat: 41.505493, lng: -81.68129 };
    let map = new window.google.maps.Map(document.getElementById("map"), {
      center: cleveland,
      zoom: 12
    });

    // This part of the initMap function sets the markers
    this.state.allLocations.map(location => {
      // This part creates the markers
      let marker = new window.google.maps.Marker({
        map: map,
        position: {
          lat: location.venue.location.lat,
          lng: location.venue.location.lng
        },
        title: location.venue.name,
        animation: null
      });

      // This part adds a click event listener to marker
      marker.addListener("click", () => {
        this.markerAnimationTrigger(marker);
        infowindow.open(map, marker);
      });

      // This part adds functionality for an info-window
      let contentString = `${location.venue.name}`;
      let infowindow = new window.google.maps.InfoWindow({
        content: contentString
      });

      // I'm going to have to pass each location to another function in order to generate the list of markers, as well as trigger map marker animations when the corresponding list item is clicked

      return null;
    });
  };

  // This function sets a marker's animation if there is none.
  markerAnimationTrigger = marker => {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
    }
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
        this.loadTags();
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
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              <h1>Neighborhood Map</h1>
              <li>Marker 1</li>
              <li>Marker 2</li>
              <li>Marker 3</li>
              <li>Marker 4</li>
            </div>
            <div id="map" className="col-md-8" />
          </div>
        </div>
      </div>
    );
  }
}

export default App;

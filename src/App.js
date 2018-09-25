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
    allLocations: [],
    map: {},
    allMapMarkers: [],
    activeMarker: {},
    clickedListItem: ""
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
    const cleveland = { lat: 41.505493, lng: -81.68129 };
    let createMap = new window.google.maps.Map(document.getElementById("map"), {
      center: cleveland,
      zoom: 12
    });
    createMap.addListener("click", () => {
      console.log("map was clicked");
    });
    this.setState({ map: createMap });
    this.createMarkers(createMap);
  };

  /************************************************
   * THIS FUNCTION ADDS THE MARKERS TO THE MAP
   ************************************************/
  createMarkers = map => {
    let allCurrentMarkers = [];
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

      allCurrentMarkers.push(marker);

      // This part adds a click event listener to marker
      marker.addListener("click", () => {
        this.markerAnimationTrigger(marker);
        infowindow.setContent(location.venue.name);
        infowindow.open(map, marker);
      });

      return null;
    });

    this.setState({ allMapMarkers: allCurrentMarkers });
    let infowindow = new window.google.maps.InfoWindow();
  };

  // This function sets a marker's animation if there is none.
  markerAnimationTrigger = marker => {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        marker.setAnimation(null);
      }, 500);
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

  checkClickedListItem = () => {
    new Promise(resolve => {
      if (
        this.state.clickedListItem !== "" &&
        this.state.allMapMarkers.length > 0
      ) {
        resolve();
      }
    }).then(() => {
      this.state.allMapMarkers.map(marker => {
        if (this.state.clickedListItem === marker.title) {
          this.markerAnimationTrigger(marker);
        }
        return null;
      });
    });
  };

  storeClickedListItem = item => {
    new Promise(resolve => {
      this.setState({ clickedListItem: item });
      resolve();
    }).then(() => {
      this.checkClickedListItem();
    });
  };

  render() {
    // This funcion displays a list of locations
    const renderLocations = this.state.allLocations.map((location, index) => {
      return (
        <li
          key={index}
          onClick={() => {
            this.storeClickedListItem(location.venue.name);
          }}
        >
          {location.venue.name}
        </li>
      );
    });
    return (
      <div className="App">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 col-md-8 order-md-12" id="map" />
            <div className="col-xs-12 col-md-4 order-md-1">
              <h1>Neighborhood Map</h1>
              <div className="input-group mb-3">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Filter the locations"
                  // value={this.state.inputText}
                  // onChange={this.onInputChange}
                />
              </div>
              {renderLocations}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

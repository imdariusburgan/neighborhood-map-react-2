import React, { Component } from "react";
import "./App.css";
import GoogleMaps from "./components/GoogleMaps";

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
    locationsReference: [],
    allLocations: [],
    map: {},
    allMapMarkers: [],
    activeMarker: {},
    infoWindowVisibile: false,
    clickedListItem: "",
    inputText: ""
  };

  componentDidMount() {
    this.getFoursquareLocations();
  }

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
        this.setState({ locationsReference: data.response.groups[0].items });
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
      this.onMapClick();
    });
    // Sets the alt tag of Google Map's images and tabindex of Google Map
    createMap.addListener("tilesloaded", function() {
      let images = document.querySelectorAll("#map img");

      images.forEach(image => {
        image.alt = "Google Maps Image";
      });

      document.querySelector("#map .gm-style").setAttribute("tabindex", "-1");
    });
    this.setState({ map: createMap });
    this.createMarkers(createMap);
  };

  /************************************************
   * THIS FUNCTION ADDS THE MARKERS TO THE MAP
   ************************************************/
  createMarkers = map => {
    if (this.state.map !== {}) {
      let allCurrentMarkers = [];
      // This part of the initMap function sets the markers
      this.state.allLocations.map(location => {
        // This part creates the markers
        let marker = new window.google.maps.Marker({
          //  map: map,
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
          infowindow.setContent(
            `<div><h2>${
              location.venue.name
            }</h2></div><div><p class="info-description">This place is a ${
              location.venue.categories[0].name
            }</p></div>`
          );
          infowindow.open(map, marker);
          this.setState({ infoWindowVisibile: true, activeMarker: marker });
        });

        return null;
      });

      let infowindow = new window.google.maps.InfoWindow();
      // If this state info window is visible
      // set info window tab index to 0
      // else set tab index to -1
      this.setState({ allMapMarkers: allCurrentMarkers });
      this.setState({ infoWindow: infowindow });
    }
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

  onMapClick = () => {
    this.state.infoWindow.close();
  };

  storeClickedListItem = item => {
    new Promise(resolve => {
      this.setState({ clickedListItem: item });
      resolve();
    }).then(() => {
      this.checkClickedListItem();
    });
  };

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
          this.state.allLocations.map(location => {
            if (marker.title === location.venue.name) {
              this.markerAnimationTrigger(marker);
              this.state.infoWindow.open(this.state.map, marker);
              this.state.infoWindow.setContent(
                `<div><h2>${
                  location.venue.name
                }</h2></div><div><p class="info-description">This place is a ${
                  location.venue.categories[0].name
                }</p></div>`
              );
              this.setState({ infoWindowVisibile: true });
            }
            return null;
          });
        }
        return null;
      });
    });
  };

  // This function takes the query of the the input field,
  // changes the state's 'inputText' variable to match the input's query,
  // and then passes the query to the passFilterText function
  onInputChange = e => {
    let inputQuery = e.target.value;
    this.setState({ inputText: inputQuery });
    this.filterList(inputQuery);
  };

  filterList = filterText => {
    if (filterText.length > 0) {
      this.state.infoWindow.close();
      this.setState({
        allLocations: this.state.locationsReference.filter(location => {
          return location.venue.name
            .toLowerCase()
            .includes(filterText.trim().toLowerCase());
        })
      });
      this.state.allMapMarkers.map(marker => {
        if (
          marker.title
            .toLowerCase()
            .includes(filterText.trim().toLowerCase()) === false
        ) {
          marker.setMap(null);
        } else {
          marker.setMap(this.state.map);
        }
        return null;
      });
    } else {
      this.setState({ allLocations: this.state.locationsReference });
      this.state.allMapMarkers.map(marker => {
        marker.setMap(this.state.map);
        return null;
      });
    }
  };

  render() {
    // This funcion displays a list of locations
    const renderLocations = this.state.allLocations.map((location, index) => {
      return (
        <li
          key={index}
          tabIndex="0"
          onKeyPress={() => {
            this.storeClickedListItem(location.venue.name);
          }}
          onClick={() => {
            this.storeClickedListItem(location.venue.name);
          }}
          role="button"
        >
          {location.venue.name}
        </li>
      );
    });
    return (
      <div role="main" className="App">
        <div className="container-fluid">
          <div className="row">
            <GoogleMaps
              map={this.state.map}
              markers={this.state.allMapMarkers}
            />
            <div className="col-xs-12 col-md-4 order-md-1">
              <h1>Neighborhood Map</h1>
              <div role="search" className="input-group mb-3">
                <label className="filterLabel" htmlFor="filter">
                  Filter the locations
                </label>
                <input
                  id="filter"
                  className="form-control"
                  type="text"
                  placeholder="Filter the locations"
                  value={this.state.inputText}
                  onChange={this.onInputChange}
                />
              </div>
              {renderLocations}
              <div className="mt-4">
                <p className="pt-4 foursqaureAttribution">
                  All location data was provided via:{" "}
                  <a href="https://foursquare.com/">
                    <span className="redText">Foursquare</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

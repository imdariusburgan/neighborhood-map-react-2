import React, { Component } from "react";
import "./App.css";
import GoogleMaps from "./components/GoogleMaps";

// This code was inspired from https://stackoverflow.com/questions/42847126/script-load-in-react
// This function will load scripts in the DOM
function loadScriptTag(url) {
  let scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.async = true;
  scriptTag.defer = true;
  scriptTag.onerror = function() {
    window.alert("Error! Google Maps API failed to load!");
  };
  document.body.appendChild(scriptTag);
}

// This function will load css tags in the DOM
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
    infoWindowVisible: false,
    //infoWindowCloseButton: null,
    clickedListItem: "",
    inputText: ""
  };

  // This alerts an error if there's a problem with Google Map's authentication
  gm_authFailure = () => {
    window.alert("Google Maps Error!");
  };

  // Once the component mounts, trigger
  componentDidMount() {
    this.getFoursquareLocations();
    window.gm_authFailure = this.gm_authFailure;
  }

  // Fetch the location data from Foursquare
  // Store the data in the state
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
        window.alert(`There was an error: ${error}`);
      });
  };

  // Load the bootstrap css and Google Maps script tag
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

  // Initialize the map
  // Then call the createMarkers function
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

  // Turn the location data from from the state into markers
  createMarkers = map => {
    if (this.state.map !== {}) {
      let allCurrentMarkers = [];
      let infowindow = new window.google.maps.InfoWindow();
      this.setState({ infoWindow: infowindow });
      infowindow.addListener("closeclick", () => {
        this.setState({ infoWindowVisible: false });
      });
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
          this.setState({ infoWindowVisible: true, activeMarker: marker });
          infowindow.setContent(
            `<div><h2 tabindex='${
              this.state.infoWindowVisible === true ? "0" : "-1"
            }'>${location.venue.name}</h2></div><div><p tabindex='${
              this.state.infoWindowVisible === true ? "0" : "-1"
            }' class="info-description">This place is a ${
              location.venue.categories[0].name
            }</p></div>`
          );
          infowindow.open(map, marker);

          // this.setState({
          //   infoWindowCloseButton: document.querySelector("#map .gm-style-iw")
          //     .parentNode.children[2]
          // });
          // this.state.infoWindowCloseButton.setAttribute("tabindex", "0");
        });

        return null;
      });

      // If this state info window is visible
      // set info window tab index to 0
      // else set tab index to -1
      this.setState({ allMapMarkers: allCurrentMarkers });
    }
  };

  // Close the info window
  // Then update the infoWindowVisible state
  closeInfoWindow = () => {
    this.state.infoWindow.close();
    this.setState({ infoWindowVisible: false });
    //this.state.infoWindowCloseButton.setAttribute("tabindex", "-1");
  };

  // Remove a marker's animation if it has an animation
  // Add a marker animation if it doesn't have any
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

  // Trigger the closeInfoWindow function
  onMapClick = () => {
    this.closeInfoWindow();
  };

  // Store the clicked list item in the state
  // Then trigger the checkClickedListItem function
  storeClickedListItem = item => {
    new Promise(resolve => {
      this.setState({ clickedListItem: item });
      resolve();
    }).then(() => {
      this.checkClickedListItem();
    });
  };

  // Map over the current map markers
  // If the clicked list item's title equals a marker's title,
  // add animation to marker, open info window, and set the info window's content
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
              this.setState({ infoWindowVisible: true });
              // this.setState({
              //   infoWindowCloseButton: document.querySelector(
              //     "#map .gm-style-iw"
              //   )
              // });
              // document
              //   .querySelector("#map .gm-style-iw")
              //   .setAttribute("tabindex", "0");
              this.state.infoWindow.setContent(
                `<div><h2 tabindex='${
                  this.state.infoWindowVisible === true ? "0" : "-1"
                }'>${location.venue.name}</h2></div><div><p tabindex='${
                  this.state.infoWindowVisible === true ? "0" : "-1"
                }' class="info-description">This place is a ${
                  location.venue.categories[0].name
                }</p></div>`
              );
            }
            return null;
          });
        }
        return null;
      });
    });
  };

  // Take the query of the the input field,
  // change the state's 'inputText' variable to match the input's query,
  // and then pass the query to the filterList function
  onInputChange = e => {
    let inputQuery = e.target.value;
    this.setState({ inputText: inputQuery });
    this.filterList(inputQuery);
  };

  // If the filterText string length is more than 0,
  // close the info window,
  // store locations that include text from the filterText string into the state.
  //
  // Then map over all of the map's markers,
  // If a map's marker title  does not include text from the filterText string, remove it from the map
  //
  // if the filterText string length is not more than 0,
  // Load all markers to the map.
  filterList = filterText => {
    if (filterText.length > 0) {
      this.closeInfoWindow();
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

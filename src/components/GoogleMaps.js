import React, { Component } from "react";

export default class GoogleMaps extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.markers !== this.props.markers) {
      nextProps.markers.map(marker => {
        marker.setMap(nextProps.map);
        return null;
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <div
          tabIndex="-1"
          className="col-xs-12 col-md-8 order-md-12"
          role="application"
          id="map"
        />
      </React.Fragment>
    );
  }
}

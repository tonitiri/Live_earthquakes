var baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Use d3 to pull data
d3.json(baseURL, function (data) {
  /* Push data.features object to the createFeatures function
  and log activity in the console */
  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

  /*  Create a popup describing the place and time of the earthquake
      for each event and bind a pop-up window */
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create circle based on the magnitude for each event
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Set color of circle based on event magnitude
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#666699"
    }
    else if (magnitude < 2) {
      return "#9966ff"
    }
    else if (magnitude < 3) {
      return "#0099ff"
    }
    else if (magnitude < 4) {
      return "#32cd32"
    }
    else if (magnitude < 5) {
      return "#ff9900"
    }
    else {
      return "#ff3333"
    }
  }

  /*  Create a GeoJSON layer containing the features array on the earthquakeData object
      Run the onEachFeature function once for each piece of data in the array */

  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  // Use createMap to push earthquakes to map layer
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define Outdoor, Satellite, and Grayscale map layers
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create the faultline layer
  var faultLine = new L.LayerGroup();

  // Define baseMaps object to hold the base layers
  var baseMaps = {
    "Greyscale Map": grayscale,
    "Outdoor Map": outdoor,
    "Satellite Map": satellite
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine


  };

  // Creating map object
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [grayscale, earthquakes]
  });

  // Create a control for the map layers and add the overlay layers
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Query to retrieve the faultline data
  var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

  // Create the faultlines and add them to the faultline layer
  d3.json(tectonicURL, function (data) {
    L.geoJSON(data, {
      style: function () {
        return { color: "blue", fillOpacity: 0 }
      }
    }).addTo(faultLine)
  })

  // color function to be used when creating the legend
  function getColor(d) {
    return d > 5 ? '#ff3333' :
      d > 4 ? '#ff9900' :
        d > 3 ? '#32cd32' :
          d > 2 ? '#0099ff' :
            d > 1 ? '#9966ff' :
              '#666699';
  }

  // Add legend to the map
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      mags = [0, 1, 2, 3, 4, 5],
      labels = [];

    // Loop through density intervals to create a label with a box for each event
    for (var i = 0; i < mags.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
        mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
    }

    return div;
  };
  // Add legend to map layer
  legend.addTo(myMap);
}

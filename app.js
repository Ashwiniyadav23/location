mapboxgl.accessToken = 'pk.eyJ1IjoiZ2F1cmF2bmciLCJhIjoiY20xdGx3ODhuMDNzNTJ0cHI2YWphY2p1ZCJ9.DCncOYgA91GXOkejz0CilQ'; // Replace with your Mapbox access token

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [83.8908, 22.8898], // Center near Jashpur, India
  zoom: 14 // Zoom in closer to cover nearby locations
});

// Search for Location
function searchLocation() {
  const location = document.getElementById('location').value;
  
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?proximity=83.8908,22.8898&access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
      const coordinates = data.features[0].geometry.coordinates;
      map.flyTo({ center: coordinates, zoom: 14 });

      // Add marker at the searched location
      new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);
    })
    .catch(error => console.error('Error:', error));
}

// Filter Places (Bank, School, etc.)
function filterPlaces() {
  const placeType = document.getElementById('place-type').value;
  const bounds = map.getBounds();

  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${placeType}.json?bbox=${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}&proximity=83.8908,22.8898&access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
      data.features.forEach(place => {
        const coordinates = place.geometry.coordinates;
        new mapboxgl.Marker({ color: 'blue' })
          .setLngLat(coordinates)
          .addTo(map);
      });
    })
    .catch(error => console.error('Error:', error));
}

// Calculate Distance and Duration for Different Transport Modes
function calculateDistance() {
    const locationA = document.getElementById('locationA').value;
    const locationB = document.getElementById('locationB').value;
    const transportMode = document.getElementById('transport-mode').value;

    // Step 1: Get coordinates of Location A (Bias search to Jashpur)
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationA}.json?proximity=83.8908,22.8898&access_token=${mapboxgl.accessToken}`)
      .then(response => response.json())
      .then(dataA => {
        const coordinatesA = dataA.features[0].geometry.coordinates;
  
        // Step 2: Get coordinates of Location B (Bias search to Jashpur)
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationB}.json?proximity=83.8908,22.8898&access_token=${mapboxgl.accessToken}`)
          .then(response => response.json())
          .then(dataB => {
            const coordinatesB = dataB.features[0].geometry.coordinates;

            // Step 3: Call the Directions API using the coordinates and selected transport mode
            fetch(`https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${coordinatesA[0]},${coordinatesA[1]};${coordinatesB[0]},${coordinatesB[1]}?access_token=${mapboxgl.accessToken}`)
              .then(response => response.json())
              .then(data => {
                const distance = data.routes[0].distance / 1000; // Distance in kilometers
                const duration = data.routes[0].duration / 60;   // Duration in minutes
                document.getElementById('distance-result').innerHTML = `Mode: ${transportMode}, Distance: ${distance.toFixed(2)} km, Duration: ${duration.toFixed(2)} min`;

                // Highlight the path on the map
                const route = data.routes[0].geometry.coordinates;
                const geojson = {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: route
                  }
                };

                // Add route layer to the map
                if (map.getSource('route')) {
                  map.getSource('route').setData(geojson);
                } else {
                  map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: {
                      type: 'geojson',
                      data: geojson
                    },
                    layout: {
                      'line-join': 'round',
                      'line-cap': 'round'
                    },
                    paint: {
                      'line-color': '#ff8c00',
                      'line-width': 4
                    }
                  });
                }
              })
              .catch(error => console.error('Error calculating distance:', error));
          })
          .catch(error => console.error('Error fetching location B:', error));
      })
      .catch(error => console.error('Error fetching location A:', error));
  }







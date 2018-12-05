var mapboxAccessToken = "pk.eyJ1Ijoiemhhb3lpbiIsImEiOiJjanA4OWp5MXgxajNoM3BxZmVqaGJ0Y2U5In0.Io8tZLNDfd62IQy50yvQNQ";
var map = L.map('map').setView([34.1, -118.25], 10);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: "DV"
}).addTo(map);

// L.geoJson(la).addTo(map);

// for (var i = 400; i < 500; i++) {
//     for (var j = 0; j < la.features.length; j++) {
//         if (turf.inside(crime2015.features[i], la.features[j])) {
//             alert(la.features[j].properties.CITY_NAME);
//             break;
//         }
//     }
// }

var crimePoints = crime2014.features.map(feature =>
    feature.geometry.coordinates.slice().concat([0.1])); // intensity

var crimesHeatLayer = L.heatLayer(crimePoints, {
    minOpacity: 0.5,
    maxZoom: 18,
    max: 1.0,
    radius: 7,
    blur: 7,
    gradient: null
}).addTo(map);

var markers = L.markerClusterGroup({});

var crimesLayer = L.geoJson(crime2014, {
    onEachFeature: function (feature, layer) {
      const crime = feature.properties;
      const html = `<div class="popup">`;
      layer.bindPopup(html);
      layer.bindTooltip(`id`, {sticky: true});
    }
});  

markers.addLayer(crimesLayer);
map.addLayer(markers);


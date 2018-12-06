// function filter (age, gender, distric, time) {
//     crime2014.forEach(feature => {
//         if (withinAge(age, feature) 
//             && isGender(gender, feature) 
//             && withinDistrict(district, feature))
//     });
// }

// function withinAge (age, feature) {
//     age.forEach(element => {
//         if (feature.properties['Victim Age'] >= element[0] && feature.properies['Victim Age'] <= element[1]) {
//             return true;
//         }
//     }); 
//     return false;
// }

// function isGender (gender, feature) {
//     if (gender.length == 2) return true;
//     if (gender[0] == feature.properties['Victim Sex']) return true;
//     return false;
// }

// function withinDistrict (district, feature) {
//     district.foreach(element => {
//         if (feature.properties['Area ID'] == element) return true;
//     })
//     return false;
// }

// function filterAge(age) {
//     for ()
// }

// function filterGender(gender) {

// }

// function filerDistrict(district) {

// }

function displayHeatMap () {
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
}
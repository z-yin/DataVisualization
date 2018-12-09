var mapboxAccessToken = "pk.eyJ1Ijoiemhhb3lpbiIsImEiOiJjanA4OWp5MXgxajNoM3BxZmVqaGJ0Y2U5In0.Io8tZLNDfd62IQy50yvQNQ";
var map = L.map('map').setView([34.1, -118.25], 10);
var layers;

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: '&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>',
    maxZoom: 18,
    minZoom: 10,
    noWrap: false,
}).addTo(map);

L.geoJson(la).addTo(map);

var crime2014 = (function() {
    // var crime2014 = null;
    $.ajax({
        'async': true,
        'global': true,
        'url': "../data/crime2014.geojson",
        'dataType': "json",
        'success': function (data) {
            crime2014 = data;
            layers = displayHeatMap(data);
        }
    });
    return crime2014;
})();

$("#click").click(function() {
    var data = filter(age2, gender2, district2, timePeriod2);
    if (layers[2]){
        map.removeLayer(layers[0]);
        map.removeLayer(layers[1]);
    }
    layers = displayHeatMap(data);
})

var gender = $("input[name='gender']:checked").val();

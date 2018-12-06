var mapboxAccessToken = "pk.eyJ1Ijoiemhhb3lpbiIsImEiOiJjanA4OWp5MXgxajNoM3BxZmVqaGJ0Y2U5In0.Io8tZLNDfd62IQy50yvQNQ";
var map = L.map('map').setView([34.1, -118.25], 10);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: "DV"
}).addTo(map);

// L.geoJson(la).addTo(map);

var crime2014 = (function() {
    // var crime2014 = null;
    $.ajax({
        'async': true,
        'global': true,
        'url': "../data/crime2014.json",
        'dataType': "json",
        'success': function (data) {
            crime2014 = data;
            displayHeatMap();
        }
    });
    return crime2014;
})();




// 在这里改条件！
var age2 = [[30, 30], [50, 60]];                               // 例：[[10, 30], [50, 60]]
var gender2 = 'M';                                 // 例：'F'和'M'
var district2 = ['12', '15'];                         // 例：['2', '4']
var timePeriod2 = [["04/01/2014", '04/30/2014'], ["03/01/2014", "03/29/2014"]];   // 这里是'月/日/年'!

function filter (age, gender, district, timePeriod) {
    var data = {"type": "FeatureCollection", "name": "crime2014", "features": []};
    for (var i = 0; i < crime2014.features.length; i++) {
        var feature = crime2014.features[i];
        if (withinAge(age, feature) 
            && isGender(gender, feature) 
            && withinDistrict(district, feature)
            && withinTime(timePeriod, feature)) {
                // console.log("There's a record");
                data.features.push(feature);
            }
    }
    // console.log(data);
    return data;
}

function withinAge (age, feature) {
    for (var i = 0; i < age.length; i++) {
        var thisAge = feature.properties['Victim Age'];
        if (Number(thisAge) && Number(thisAge) <= age[i][1]) {
            // console.log("Age");
            return true;
        }
    }
    return false;
}

function isGender (gender, feature) {
    if (gender == 'MF') return true;
    if (gender == feature.properties['Victim Sex']) {
        // console.log("Gender");
        return true;
    }
    return false;
}

function withinDistrict (district, feature) {
    if (district.length == 0) return true;
    for (var i = 0; i < district.length; i++) {
        if (district[i] == feature.properties['Area ID']) {
            // console.log("District");
            return true;
        }
    }
    return false;
}

function withinTime (timePeriod, feature) {
    // console.log("-----------");
    // console.log(feature.properties['Date Occurred']);
    for (var i = 0; i < timePeriod.length; i++) {
        // console.log(Date.parse(timePeriod[i][0]));
        // console.log(Date.parse(timePeriod[i][1]));
        if (Date.parse(feature.properties['Date Occurred']) >= Date.parse(timePeriod[i][0])
            && Date.parse(feature.properties['Date Occurred']) <= Date.parse(timePeriod[i][1])) {
                // console.log("Time");
                return true;
        }
    }
    return false;
}

function displayHeatMap (data) {
    if (data) {
        var hasLayer = true; // for layer clearing
        var crimePoints = data.features.map(feature =>
            feature.geometry.coordinates.slice().reverse().concat([0.1])); // intensity
        
        var crimesHeatLayer = L.heatLayer(crimePoints, {
            minOpacity: 0.5,
            maxZoom: 18,
            max: 1.0,
            radius: 6,
            blur: 6,
            gradient: null
        }).addTo(map);
        
        var markers = L.markerClusterGroup({});
        
        var crimesLayer = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                const crime = feature.properties;
                const html = `<div class="popup"><h2>${crime["Date Occurred"]}</h2></div>` + 
                    `<p>${crime["Area ID"]} District</p><p>Victim age: ${crime["Victim Age"]}</p><p>Victim sex: ${crime["Victim Sex"]}</p><p>Date occured: ${crime["Date Occurred"]}</p></div>`;
                layer.bindPopup(html);
                layer.bindTooltip(`${crime["Date Occurred"]}, ${crime["Area ID"]}`, {sticky: true});
            }
        });  
        
        markers.addLayer(crimesLayer);
        map.addLayer(markers);

        return [crimesHeatLayer, markers, hasLayer]; // for layer clearing
    } else {
        var hasLayer = false; // for layer clearing
        return [null, null, hasLayer]; // for layer clearing
    }
}

function histogramAge () {
    var xAge = [];
    var yAge = [];
    for (var key in sumAge) {
        xAge.push(parseInt(key));
        yAge.push(sumAge[key]);
    }

    var traceAge = {
        x: xAge,
        y: yAge,
        mode: 'markers',
        type: 'scatter'
    };

    var dataAge = [traceAge];

    var layoutAge = {
        title: 'Crime Count',
        dragmode: 'lasso'
    };

    Plotly.newPlot('age-histogram', dataAge, layoutAge, {displayModeBar: false});
}
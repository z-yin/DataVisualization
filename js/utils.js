/**
 * Get a linear color scale.
 * @param {Number} min minimum of the data
 * @param {Number} max maximum of the data
 */
function getColorRange(min, max) {
    var scale = []
    for (var i = 0; i < 9; i++) {
        scale.push(min + i * (max - min) / 8);
    }
    return d3.scaleLinear()
        .domain(scale) // Multiple color scale.
        .interpolate(d3.interpolateLab)
        .range(
            [
                d3.rgb("#4575b4"),
                d3.rgb("#74add1"),
                d3.rgb("#abd9e9"),
                d3.rgb("#e0f3f8"),
                d3.rgb("#ffffbf"),
                d3.rgb("#fee090"),
                d3.rgb("#fdae61"),
                d3.rgb("#f46d43"),
                d3.rgb("#d73027")
            ]
        );
}

/**
 * Rotate the map.
 * @param {string} name country name
 */
function rotateEarth(name) {
    var element = d3.select(`[data-country-name="${name}"]`);

    d3.selectAll(".map-clicked")
        .classed("map-clicked", false)
    element
        .classed("map-clicked", true);

    // center to the country clicked on the map or histogram
    d3.select(".map-clicked").transition()
        .duration(1250)
        .tween("rotate", function () {
            var p = d3.geoCentroid(countries[d3.select(`[data-country-name="${name}"]`).attr("data-country-id")]),
                r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
            return function (t) {
                projection.rotate(r(t));
                map.selectAll("path").attr("d", geoPath);
            }
        });
}

/**
 * Set formatted data for stream graph.
 * @param {Array[String]} ctyNames array of country names
 */
function streamData(ctyNames) {
    var keys;
    var tmpDict = {}
    var flag = true;
    wdiTopic.forEach(function (row) {
        if (flag) {
            keys = Object.keys(row); // Find the headers.
            keys.forEach(function (k) {
                if (k.length == 4) {
                    tmpDict[k] = {
                        "year": new Date(k)
                    };
                }
            })
            flag = false;
        }
        if (ctyNames.has(row["Country Name"])) {
            keys.forEach(function (e) {
                if (e.length == 4) {
                    tmpDict[e][row["Country Name"]] = +row[e];
                }
            })
        }
    })
    wdiFormatted = Object.values(tmpDict);
}

/**
 * Set the formatted data for parallel coordinates.
 * @param {Array} topics array of topics
 * @param {Strign} year selected year to show
 */
function attributeData(topics, year) {
    var rowsOfIndictors = wdiData.filter(function (row) {
        return topics.has(row["Indicator Name"]);
    });

    var tmp = {};

    countryNames.forEach(function (c) {
        tmp[c] = {
            "Country Name": c
        };
    });

    rowsOfIndictors.forEach(function (row) {
        tmp[row["Country Name"]][row["Indicator Name"]] = +row[year];
    });
    // generate formatted data
    wdiByIndicators = Object.values(tmp);
}

$(document).ready(function () {
    var select = $(".1960-2016");
    // automatically add <option> to the year selector
    select.append($('<option selected></option>').val(2016).html(2016));
    for (i = 2015; i >= 1960; i--) {
        select.append($('<option></option>').val(String(i)).html(i));
    }
    // set up the topic seletor
    $('#topic-selector').select2({
        maximumSelectionLength: 7,
        placeholder: 'Select topics. (min. 2, max. 7)',
        allowClear: true
    });

    // if the year changes, generate new graphs.
    $(".1960-2016").on('change', function (e) {
        var optionSelected = $("option:selected", this);
        year = this.value;
        generateMap(); // show new choropleth

        var order = $(".order option:selected").val();
        makeUpdateHist(order);  // show new histogram
        var values = $('#topic-selector').val();
        if (values.length >= 2) {
            attributeData(new Set(values), year);
            parallel(true);     // show new parallel coordinates
        }
    });

    $(".mode").on('change', function (e) {
        var optionSelected = $("option:selected", this);
        projection.clipAngle(this.value);   // change the map mode. (hollow or solid)
    })

    $(".order").on("change", function (e) {
        var order = $(".order option:selected").val();
        // change the position of the country based on the mode (name ascending and value descending)
        makeUpdateHist(order);      
    })

    // refresh the parallel coordinates if the topic selector changes
    $("#topic-selector").on('change', function (e) {
        var values = $('#topic-selector').val();
        if (values.length >= 2) {
            attributeData(new Set(values), year);
            parallel();
        }
    })

    // refresh the stream graph if the country selector changes
    $("#country-selector").on('change', function (e) {
        var values = $('#country-selector').val();
        if (values.length >= 2) {   // there should be at least 2 compared countries
            streamData(new Set(values));
            makeStreamGraph(false, values);
        } else if (values.length == 0) {    // if no countries are selected, use all countries.
            streamData(new Set(countryNames));
            makeStreamGraph(false, countryNames);
        }
    })
});
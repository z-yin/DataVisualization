/**
 * 
 * @param {Number} min 
 * @param {Number} max 
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
 * 
 * @param {string} name 
 */
function rotateEarth(name) {
    var element = d3.select(`[data-country-name="${name}"]`);

    d3.selectAll(".map-clicked")
        .classed("map-clicked", false)
    element
        .classed("map-clicked", true);

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

function attributeData(topics, year) {
    // console.log(wdiData);
    var rowsOfIndictors = wdiData.filter(function (row) {
        return topics.has(row["Indicator Name"]);
    });
    // console.log(rowsOfIndictors);

    var tmp = {};

    countryNames.forEach(function (c) {
        tmp[c] = {
            "Country Name": c
        };
    });

    rowsOfIndictors.forEach(function (row) {
        tmp[row["Country Name"]][row["Indicator Name"]] = +row[year];
    });

    wdiByIndicators = Object.values(tmp);
}

var t = new Set(["Agricultural methane emissions (thousand metric tons of CO2 equivalent)",
    "Access to electricity (% of population)",
    "Unemployment, total (% of total labor force) (modeled ILO estimate)",
    "Electric power consumption (kWh per capita)",
    "Real interest rate (%)",
    "Exports as a capacity to import (constant LCU)",
    "Final consumption expenditure (% of GDP)"
]);

$(document).ready(function () {
    var select = $(".1960-2016");
    select.append($('<option selected></option>').val(2016).html(2016));
    for (i = 2015; i >= 1960; i--) {
        select.append($('<option></option>').val(String(i)).html(i));
    }

    var topicSelect = $("#topic-selector");
    t.forEach(function (d) {
        topicSelect.append($('<option selected></option>').val(d).html(d));
    });
    Promise.all([d3.json("../data/topics.json")]).then(function (value) {
        var tps = value[0]["topics"];
        tps.forEach(function (d) {
            if (!t.has(d)) {
                topicSelect.append($('<option></option>').val(d).html(d));
            }
        });
    });

    $('#topic-selector').select2({
        maximumSelectionLength: 7,
        placeholder: 'Select topics. (min. 2, max. 7)',
        allowClear: true
    });

    $(".1960-2016").on('change', function (e) {
        var optionSelected = $("option:selected", this);
        year = this.value;
        displayColor();

        var order = $(".order option:selected").val();
        makeUpdateHist(order);
        var values = $('#topic-selector').val();
        if (values.length >= 2) {
            attributeData(new Set(values), year);
            parallel(true);
        }
    });

    $(".mode").on('change', function (e) {
        var optionSelected = $("option:selected", this);
        projection.clipAngle(this.value);
    })

    $(".order").on("change", function (e) {
        var order = $(".order option:selected").val();
        console.log(order)
        makeUpdateHist(order);
    })

    $("#topic-selector").on('change', function (e) {
        var values = $('#topic-selector').val();
        if (values.length >= 2) {
            // console.log(values)
            attributeData(new Set(values), year);
            parallel();
        }
    })

    $("#country-selector").on('change', function (e) {
        var values = $('#country-selector').val();
        if (values.length >= 2) {
            streamData(new Set(values));
            makeStreamGraph(false, values);
        } else if (values.length == 0) {
            streamData(new Set(countryNames));
            makeStreamGraph(false, countryNames);
        }
    })
});
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

function yearData() {
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
        keys.forEach(function (e) {
            if (e.length == 4) {
                tmpDict[e][row["Country Name"]] = +row[e];
            }
        })
    })
    wdiFormatted = Object.values(tmpDict);
}

function attributeData(topics, year) {
    var rowsOfIndictors = wdiData.filter(function (row) {
        return topics.has(row["Indicator Name"]);
    });

    var tmp = {};
    countryNames.forEach(function (c) {
        tmp["c"] = {"Country Name": c};
    });

    rowsOfIndictors.forEach(function (row) {
        var indicator = row["Country Name"];
        tmp[row["Country Name"]][row["Indicator Name"]] = +row[year];
    });

    wdiByIndicators = Object.values(tmp);
}
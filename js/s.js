var stackStr, series, widthStr, heightStr, xStr, yStr, xAxisStr, colorStr, areaStr, svgStr, chartTop, chartBottom, tooltipStr, vertical;
var strg = false;


function isOutOfWindow(x) {
    var svgWidth = $(".cc > svg").width();
    var tipWidth = $(".tip").width();
    return x + tipWidth + 15 > svgWidth ? x - 30 - tipWidth : x + 15;
}

function initialStream() {
    stackStr = d3.stack()
        .keys(countryNames)
        .order(d3.stackOrderAscending)
        .offset(d3.stackOffsetSilhouette);

    series = stackStr(wdiFormatted);

    widthStr = 500;
    heightStr = 500;

    xStr = d3.scaleTime()
        .domain(d3.extent(wdiFormatted, function (d) {
            return d.year;
        }))
        .range([100, widthStr]);

    // setup axis
    xAxisStr = d3.axisBottom(xStr)
    // .ticks(5);

    yStr = d3.scaleLinear()
        .domain([0, d3.max(series, function (layer) {
            return d3.max(layer, function (d) {
                return d[0] + d[1];
            });
        })])
        .range([heightStr / 2, -200]);

    var colorDomain = [];
    for (var i = 0; i < 9; i++) {
        colorDomain.push(i / 8);
    }

    colorStr = d3.scaleLinear()
        .interpolate(d3.interpolateLab)
        .domain(colorDomain)
        .range([
            d3.rgb("#e41a1c"),
            d3.rgb("#377eb8"),
            d3.rgb("#4daf4a"),
            d3.rgb("#984ea3"),
            d3.rgb("#ff7f00"),
            d3.rgb("#ffff33"),
            d3.rgb("#a65628"),
            d3.rgb("#f781bf"),
            d3.rgb("#999999")
        ]);

    areaStr = d3.area()
        .x(function (d) {
            return x(d.data.year);
        })
        .y0(function (d) {
            return y(d[0]);
        })
        .y1(function (d) {
            return y(d[1]);
        })
        .curve(d3.curveBasis);

    svgStr = d3.select("body").append("div")
        .attr("class", "cc")
        .attr("width", widthStr)
        .attr("height", heightStr)
        .append("svg")
        .attr("width", widthStr)
        .attr("height", heightStr);

    chartTop = $('.cc').offset().top;
    chartBottom = $('.cc').offset().bottom;

    tooltipStr = d3.select(".cc")
        .append("div")
        .attr("class", "tip")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", chartTop + 40 + "px");

    // vertical line to help orient the user while exploring the streams
    vertical = d3.select(".cc")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "0")
        .style("width", "1px")
        .style("height", heightStr + "px")
        .style("top", chartTop + "px")
        .style("bottom", chartBottom + "px")
        .style("background", "#fcfcfc");
}

function streamGraph() {
    if (!strg) {
        makeStreamGraph();
        strg = true;
    } else {
        // updateStreamGraph();
    }
}

function makeStreamGraph() {
    svgStr.selectAll("path")
        .data(series)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", function (d) {
            console.log(d);
            return areaStr;
        })
        .style("fill", function (d) {
            return colorStr(Math.random());
        })
        .on("mouseover", function (d, i) {
            svgStr.selectAll(".layer")
                .attr("opacity", function (d, j) {
                    return j != i ? 0.3 : 1;
                });
        })
        .on("mousemove", function (d, i) {
            var color = d3.select(this).style('fill');
            mouse = d3.mouse(this);
            mousex = mouse[0];
            vertical.style("left", mousex + "px");
            var invertedx = x.invert(mousex);
            var xDate = invertedx.toString().split(' ')[3];
            d.forEach(function (f) {
                var year = (f.data.year.toString()).split(' ')[3];
                if (xDate == year) {
                    tooltipStr
                        .style("left", isOutOfWindow(mousex) + "px")
                        .html("<div class='year'>" +
                            year + "</div><div class='key'><div style='background:" + color +
                            "' class='swatch'>&nbsp;</div>" + d.key + "</div><div class='value'>" +
                            d3.format(",.3f")(f["data"][d.key]) + "</div>")
                        .style("visibility", "visible");
                }
            });
        })
        .on("mouseout", function (d, i) {
            svgStr.selectAll(".layer")
                .attr("opacity", '1');
            tooltipStr.style("visibility", "hidden");
        });

    svgStr.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (heightStr) + ")")
        .call(xAxisStr);

    var xAxisGroup = svgStr.append("g").call(xAxisStr);
}

function updateStreamGraph() {
    svgStr.selectAll("path")
        .data(series)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", areaStr)
        .style("fill", function (d) {
            return colorStr(Math.random());
        })
        .on("mouseover", function (d, i) {
            svgStr.selectAll(".layer")
                .attr("opacity", function (d, j) {
                    return j != i ? 0.3 : 1;
                });
        })
        .on("mousemove", function (d, i) {
            var color = d3.select(this).style('fill');
            mouse = d3.mouse(this);
            mousex = mouse[0];
            vertical.style("left", mousex + "px");
            var invertedx = xStr.invert(mousex);
            var xDate = invertedx.toString().split(' ')[3];
            d.forEach(function (f) {
                var year = (f.data.year.toString()).split(' ')[3];
                if (xDate == year) {
                    tooltipStr
                        .style("left", isOutOfWindow(mousex) + "px")
                        .html("<div class='year'>" +
                            year + "</div><div class='key'><div style='background:" + color +
                            "' class='swatch'>&nbsp;</div>" + d.key + "</div><div class='value'>" +
                            d3.format(",.3f")(f["data"][d.key]) + "</div>")
                        .style("visibility", "visible");
                }
            });
        })
        .on("mouseout", function (d, i) {
            svgStr.selectAll(".layer")
                .attr("opacity", '1');
            tooltipStr.style("visibility", "hidden");
        });

    svgStr.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (heightStr) + ")")
        .call(xAxisStr);

    var xAxisGroup = svgStr.append("g").call(xAxisStr);
}
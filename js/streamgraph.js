/**
 * Reference: https://blockbuilder.org/denisemauldin/8c2be5003ce705f156bc0ed1732d2694
 * We will mention it when we use copied code.
 */

/**
 * make a stream graph
 * @param {boolean} isUpdating make stream graph or update stream graph
 * @param {Set} ctryNames selected country names to compare
 */
function makeStreamGraph(isUpdating, ctryNames) {
    // copied code
    var stack = d3.stack()
        .keys(ctryNames)
        .order(d3.stackOrderAscending)
        .offset(d3.stackOffsetSilhouette);

    var series = stack(wdiFormatted);

    // set the width and heigh
    var width = +d3.select("#div-stream").style("width").slice(0, -2);
        height = +d3.select("#div-stream").style("height").slice(0, -2);
    // set the x axis scale
    var x = d3.scaleTime()
        .domain(d3.extent(wdiFormatted, function (d) {
            return d.year;
        }))
        .range([100, width]);

    // setup axis
    var xAxis = d3.axisBottom(x);
    // set the y scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(series, function (layer) {
            return d3.max(layer, function (d) {
                return d[0] + d[1];
            });
        })])
        .range([height / 2, -200]);

    var colorDomain = [];
    for (var i = 0; i < 9; i++) {
        colorDomain.push(i / 8);
    }
    // multiple colors to select to distinguish adjacent countries 
    var color = d3.scaleLinear()
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
    // copied code
    var area = d3.area()
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
    // set the d3-tip position, if it is out of the parent svg, move it into the parent svg
    function isOutOfWindow(x) {
        var svgWidth = $("#div-stream > svg").width();
        var tipWidth = $(".tip").width();
        return x + tipWidth + 15 > svgWidth ? x - 30 - tipWidth : x + 15;
    }

    if (!isUpdating) { // if the stream graph already exists
        d3.select("#div-stream").selectAll("*").remove();
        // set the svg
        var svg = d3.select("#div-stream")
            .attr("width", width)
            .attr("height", height)
            .append("svg")
            .attr("id", "streamsvg")
            .attr("width", width)
            .attr("height", height);
        // get the bottom position of div "div-stream"
        var chartBottom = $('#div-stream').offset().bottom;
        // d3-tip to display the country name, year and value
        var tooltip = d3.select("#div-stream")
            .append("div")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "20")
            .style("visibility", "hidden")
            .style("top", "10px")
            .style("left", "200px");

        // vertical line to help orient the user while exploring the streams
        // copied code
        var vertical = d3.select("#div-stream")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "0")
            .style("width", "1px")
            .style("height", height + "px")
            .style("top",  "0px")
            .style("bottom", chartBottom + "px")
            .style("left", "200px")
            .style("background", "#fcfcfc");

        svg.selectAll("path")
            .data(series)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", area)
            .style("fill", function (d) {
                return color(Math.random());
            })
            .on("mouseover", function (d, i) {  // when mouseover, set the color of other countries 
                svg.selectAll(".layer")
                    .attr("opacity", function (d, j) {
                        return j != i ? 0.3 : 1;
                    });
            })
            .on("mousemove", function (d, i) {  
                var color = d3.select(this).style('fill');
                mouse = d3.mouse(this);
                mousex = mouse[0];  // get the mouse x position
                vertical.style("left", mousex + 5 + "px");  // set position of the vertical line 
                var invertedx = x.invert(mousex);
                var xDate = invertedx.toString().split(' ')[3];
                d.forEach(function (f) {
                    var year = (f.data.year.toString()).split(' ')[3];
                    if (xDate == year) {
                        tooltip
                            .style("left", isOutOfWindow(mousex) + "px")
                            .html("<div class='year'>" +
                                year + "</div><div class='key'><div style='background:" + color +
                                "' class='swatch'>&nbsp;</div>" + d.key + "</div><div class='value'>" +
                                d3.format(",.3f")(f["data"][d.key]) + "</div>")
                            .style("visibility", "visible");
                    }
                });
            })
            .on("mouseout", function (d, i) { // when mouseout, restore the original color and hide the tip
                svg.selectAll(".layer")
                    .attr("opacity", '1');
                tooltip.style("visibility", "hidden");
            });
        // add the x axis
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);

        var xAxisGroup = svg.append("g").call(xAxis);
    } else { // same as the above 

        var svg = d3.select("#streamsvg");

        var chartTop = $('#div-stream').offset().top;
        var chartBottom = $('#div-stream').offset().bottom;

        var tooltip = d3.select(".tip")

        // vertical line to help orient the user while exploring the streams
        var vertical = d3.select(".remove")

        svg.selectAll("path")
            .data(series)
            .transition()
            .duration(1000)
            .attr("class", "layer")
            .attr("d", area)
            .style("fill", function (d) {
                return color(Math.random());
            });

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);

        var xAxisGroup = svg.append("g").call(xAxis);
    }
}
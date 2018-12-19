/**
 * Reference: https://bl.ocks.org/austinczarnecki/fe80afa64724c9630930
 * We will mention it when we use copied code.
 */

 /**
 * Global variables.
 */
var graph, x, y, xAxis, yAxis, histogram, bar, color;

var height = +d3.select(".row1").style("height").slice(0, -2);
var width = 4000;

margin = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 60
};

var range;      // data range (min to max or 0 to max if no negative numbers)

function makeUpdateHist(order) {
    color = getColorRange(minData, maxData);    // get the color range
    if (minData < 0) {  // if there are negative value
        range = [minData, maxData];
    }
    else { // if there is no negative value
        range = [0, maxData];
    }
    // copied code, set the sorting mode
    switch (order) {
        case "name-ascending": wdiTopic.sort((a, b) => a["Country Name"].localeCompare(b["Country Name"])); break;
        case "value-descending": wdiTopic.sort((a, b) => Number(b[year] - Number(a[year]))); break;
    }

    var commaFormat = d3.format(",.3f");    // set the format for displaying the number
    // d3-tip, used for showing the country name and the corresponding value
    var tip = d3.tip()
        .attr('class', 'histogram-tip')
        .offset([-10, 0])
        .html(function (d) {
            var number = d[year];
            if (number != "") {
                return `<strong>${d["Country Name"]}:</strong> ${commaFormat(Number(number))}`;
            }
            return `<strong>${d["Country Name"]}:</strong> <i>Unknown</i>`;
        });

    if (graph) { // if the histogram doesn't exist
        updateHist(tip);
    } else {    // if the histogram already exist
        makeHist(tip);
    }
}

function makeHist(tip) {
    x = d3.scaleBand()
        .domain(wdiTopic.map(d => d["Country Name"]))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    y = d3.scaleLinear()
        .domain(range).nice()
        .range([height - margin.bottom, margin.top]);

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickSizeOuter(0));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    histogram = d3.select("#div-histogram").append("svg")
        .attr("width", width)
        .attr("height", height);

    histogram.call(tip);

    var bar = histogram.append("g")
        .selectAll("rect")
        .data(wdiTopic)
        .enter()
        .append("rect")
        .attr("hist-country-name", d => d["Country Name"])  // set the hist-country-name attribute used by map
        .attr("fill", d => color(Number(d[year])))          // set the color of countries based on their value
        .attr("original-color", d => color(Number(d[year])))    // store the original color for restoring color
        .style("mix-blend-mode", "multiply")
        .attr("x", d => x(d["Country Name"]))
        .attr("y", function(d) {    
            if (+d[year] >= 0) {    // if the value is not negative
                return y(Number(d[year] - range[0]));
            } else {    // if the value is negative, set it below 0
                return y(Number(d[year] - range[0])) + y(range[0]) - y(Number(d[year]));
            }
        })
        .attr("height", function(d){   
            if (d[year] == "") return 0;
            return y(range[0]) - y(Number(d[year]));
        })
        .attr("width", 18)
        .attr("stroke", "#e0780f")
        .attr("stroke-width", "1px")
        .on("mouseover", function (d) {
            tip.show(d);    // show country name and responding value
            // when mouseover, add stroke to the country in the histogram
            d3.select(`[data-country-name="${d["Country Name"]}"]`)
                .attr("stroke", "#ce3f46")
                .attr("stroke-width", 2);

        })
        .on("mouseout", function (d) {
            tip.hide(d);    // hide country name and responding value
            // when mouseout, hide stroke
            d3.select(`[data-country-name="${d["Country Name"]}"]`)
                .attr("stroke-width", 0);
        })
        .on("click", function (d) {
            // restore the original color
            d3.select(".histogram-hover").attr("fill", d => d3.select(".histogram-hover").attr("original-color"));
            d3.select(".histogram-clicked").attr("fill", d => d3.select(".histogram-clicked").attr("original-color"));
            
            d3.select(this).attr("fill", "#7fbc41");

            d3.selectAll(".histogram-hover")
                .classed("histogram-hover", false);
            d3.selectAll(".histogram-clicked")
                .classed("histogram-clicked", false);
            d3.select(this)
                .classed("histogram-clicked", true);
            // center to the clicked country
            var offset = d3.select(this).attr("x") +
                d3.select(this).attr("width") / 2 -
                Number($("#div-histogram").css("width").slice(0, -2)) / 2;
            $("#div-histogram").stop(true, false).animate({
                scrollLeft: offset
            }, 500);

            rotateEarth(d["Country Name"]);
        });
    // add x axis
    var gx = histogram.append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "0")
        .attr("dy", ".15em")
        .attr("transform", "rotate(45)");   // rotate for better visualization
    // add y axis
    var gy = histogram.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");  // rotate for better visualization
    // copied code
    svg.node().update = () => {
        const t = histogram.transition()
            .duration(750);

        bar.data(wdiTopic, d => d["Country Name"])
            .order()
            .transition(t)
            .delay((d, i) => i * 20)
            .attr("x", d => x(d["Country Name"]));

        gx.transition(t)
            .call(xAxis)
            .selectAll(".tick")
            .delay((d, i) => i * 20);
    }
    graph = true;
}

// update the histogram with transition, same as the makeHist()
function updateHist(tip) {
    x = d3.scaleBand()
        .domain(wdiTopic.map(d => d["Country Name"]))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    y = d3.scaleLinear()
        .domain(range).nice()
        .range([height - margin.bottom, margin.top]);

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickSizeOuter(0));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    // console.log(wdiTopic);
    bar = histogram.selectAll("rect")
        .data(wdiTopic)
        .transition()
        .duration(1000)
        .attr("hist-country-name", d => d["Country Name"])
        .attr("fill", d => color(Number(d[year])))
        .attr("original-color", d => color(Number(d[year])))
        .style("mix-blend-mode", "multiply")
        .attr("x", d => x(d["Country Name"]))
        .attr("y", function (d) {
            // console.log(d[year])
            if (+d[year] >= 0) {
                return y(Number(d[year] - range[0]));
            } else {
                return y(Number(d[year] - range[0])) + y(range[0]) - y(Number(d[year]));
            }
        })
        .attr("height", function(d){
            if (d[year] == "") return 0;
            return y(range[0]) - y(Number(d[year]));
        })
        .attr("width", 18)
        .attr("stroke", "#e0780f")
        .attr("stroke-width", "1px")

    var gx = histogram
        .selectAll(".x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "0")
        .attr("dy", ".15em")
        .attr("transform", "rotate(45)");;

    var gy = histogram
        .selectAll(".y-axis")
        .call(yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    svg.node().update = () => {
        const t = histogram.transition()
            .duration(750);

        bar.data(data, d => d["Country Name"])
            .order()
            .transition(t)
            .delay((d, i) => i * 20)
            .attr("x", d => x(d["Country Name"]));

        gx.transition(t)
            .call(xAxis)
            .selectAll(".tick")
            .delay((d, i) => i * 20);
    }
}
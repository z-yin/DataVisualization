/**
 * Global variables.
 */

{
    var height = 600;
    var width = 4000;

    margin = {
        top: 0,
        right: 40,
        bottom: 40,
        left: 60
    };

    var count = 0;

    var graph, x, y, xAxis, yAxis, histogram, bar;

    var maxData;

    function makeUpdateHist() {
        maxData = d3.max(wdiTopic, d => Number(d[year]));
        wdiTopic.sort((a, b) => Number(b[year] - Number(a[year])));
        // if (graph) {
            // updateHist();
        // } else {
            makeHist();
        // }

        if (count === 2) {
            count = 0;
        } else {
            count += 1;
        }
    }

    function makeHist() {
        x = d3.scaleBand()
            .domain(wdiTopic.map(d => d["Country Name"]))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        y = d3.scaleLinear()
            .domain([0, maxData]).nice()
            .range([height - margin.bottom, margin.top]);

        xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .tickSizeOuter(0));

        yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove());

        var histogram = d3.select("#div-histogram").append("svg")
            .attr("width", width)
            .attr("height", height);

        var bar = histogram.append("g")
            // .attr("fill", "steelblue")
            .selectAll("rect")
            .data(wdiTopic)
            .enter()
            .append("rect")
            .attr("fill", function (d) { 
                var country = $(`[data-country-name="${d["Country Name"]}"]`);
                if (country.length == 1) {
                    return country.attr("fill");
                } else {
                    return "lightgrey";
                }
            })
            .style("mix-blend-mode", "multiply")
            .attr("x", d => x(d["Country Name"]))
            .attr("y", d => y(Number(d[year])))
            .attr("height", d => y(0) - y(Number(d[year])))
            .attr("width", 18)
            .attr("stroke", "#e0780f")
            .attr("stroke-width", "1px");

        var gx = histogram.append("g")
            .call(xAxis)
            .selectAll("text")	
            .style("text-anchor", "start")
            .attr("dx", "0")
            .attr("dy", ".15em")
            .attr("transform", "rotate(45)");

        var gy = histogram.append("g")
            .call(yAxis)
            .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");;

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

    function updateHist() {
        bar.data(wdiTopic)
            .transition()
            .duration(1000)
            .attr("x", d => x(d["Country Name"]))
            .attr("y", d => y(Number(d[year])))
            .attr("height", d => y(0) - y(Number(d[year])))
            .attr("width", x.bandwidth());

        var gx = histogram.append("g")
            .call(xAxis);

        var gy = histogram.append("g")
            .call(yAxis);

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
}
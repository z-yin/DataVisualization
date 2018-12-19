/**
 * Reference: https://bl.ocks.org/mbostock/1093025
 * We will mention it when we use copied code.
 */

/**
 * Global variables. 
 */
var wdiData; // WDI data.
var wdiTopic = []; // WDI data on a topic.
var year = "2016"; // Default year. 
var maxData; // Maximum of wdiTopic.
var minData; // Minimum of wdiTopic.
var wdiFormatted = []; // data (formatted to be used by stream graph)
var countryNames = []; // country names from dataset (already filtered some useless region name)
var wdiByIndicators = []; // data (formatted to be used by paralle coordinates), the indicator also means the topic for simplicity.
var flagStream = false; // true if the stream graph already exists

{
	// some position and size parameters
	var height = +d3.select(".row1").style("height").slice(0, -2);
	var flag = true;
	var margin = { // copied code
			top: 10, // copied code
			right: 0, // copied code
			bottom: 0, // copied code
			left: 0 // copied code
		},
		width = 300,
		barHeight = 20, // copied code
		barWidth = (width - margin.left - margin.right) * 0.8; // copied code

	var i = 0,
		duration = 400, // copied code
		root; // the hierarchy root

	// copied code
	var diagonal = d3.linkHorizontal()
		.x(function (d) {
			return d.y;
		})
		.y(function (d) {
			return d.x;
		});

	// d3-tip, used for showing the whole indicator name in case some names are too long to displayed.
	var cateTip = d3.tip()
		.attr('class', 'category-tip')
		.style("position", "absolute")
		.style("left", "380px")
		.direction("e")
		.html(function (d) {
			return `${d.data.name}`;
		});

	// add svg on the specified div
	var svg = d3.select("#div-catagory")
		.style("height", height)
		.append("svg")
		.call(cateTip)
		.attr("width", width)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// load the topic tree used for displaying the Collapsible Indented Tree
	Promise.all([d3.json("../data/topic_tree.json")]).then(function (values) {
		root = d3.hierarchy(values[0]); // copied code
		root.x0 = 0; // copied code
		root.y0 = 0; // copied code
		moveChildren(root); // the indented tree are folded by default
		update(root); // copied code
	});

	// load large data on the back end
	// the data is too large if converted to json file, so we just applied this method
	Promise.all([d3.csv("../data/WDIData.csv")]).then(function (values) {
		wdiData = values[0];
		// preload topic data of the default topic
		wdiTopic = wdiData.filter(function (row) {
			return row["Indicator Name"] == "Cereal production (metric tons)";
		});
		if (flag) { // generate the complete country names on the topic data for the first time
			// and will never generate again until the new topic data comes
			wdiTopic.forEach(function (e) {
				countryNames.push(e["Country Name"]);
			});
			flag = false;
		}

		// set up the country selector.
		// we do it here because we need to set the maximum selection length to the number of countries
		// which is generated after WDIData.csv is loaded.
		var countrySelect = $('#country-selector').select2({
			maximumSelectionLength: countryNames.length, //set the maximum selection length to the number of countries
			placeholder: 'Select countries to compare. (min. 2)',
			allowClear: true // allow selection clear operation
		});
		// generate <option> in country selector based on the countries the data has.
		countryNames.forEach(function (d) {
			countrySelect.append($('<option></option>').val(d).html(d));
		});

		// generate all components of our application on the first load
		generateMap(); // show the color on the map
		makeUpdateHist("value-descending"); // show the histogram
		streamData(new Set(countryNames)); // generate the data for stream graph
		makeStreamGraph(false, countryNames); // show the stream graph
		flagStream = true;

		var topicSelect = $("#topic-selector"); // topic selector
		// default selected topics
		var t = new Set(["Agricultural methane emissions (thousand metric tons of CO2 equivalent)",
			"Access to electricity (% of population)",
			"Unemployment, total (% of total labor force) (modeled ILO estimate)",
			"Electric power consumption (kWh per capita)",
			"Real interest rate (%)",
			"Exports as a capacity to import (constant LCU)",
			"Final consumption expenditure (% of GDP)"
		]);
		t.forEach(function (d) {
			// add selected <option> on topic selector
			topicSelect.append($('<option selected></option>').val(d).html(d));
		});
		Promise.all([d3.json("../data/topics.json")]).then(function (value) {
			var tps = value[0]["topics"];
			tps.forEach(function (d) {
				if (!t.has(d)) {
					// add all the topics to topic selector
					topicSelect.append($('<option></option>').val(d).html(d));
				}
			});
		});
		var values = $('#topic-selector').val();
		if (values.length >= 2) {
			attributeData(new Set(values), year);	// generate data for parallel coordinates
			parallel(); 							// show the parallel coordinates
		}
	});

	function update(source) {
		// Compute the flattened node list.
		var nodes = root.descendants();		// copied code
		// copied code
		var totalHeight = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);
		// copied code
		d3.select("svg").transition()
			.duration(duration)
			.attr("height", totalHeight);
		// copied code
		d3.select(self.frameElement).transition()
			.duration(duration)
			.style("height", totalHeight + "px");
		// copied code
		var index = -1;
		root.eachBefore(function (n) {
			n.x = ++index * barHeight;
			n.y = n.depth * 20;
		});

		// Update the node
		var node = svg.selectAll(".node")
			.data(nodes, function (d) {
				return d.id || (d.id = ++i);
			});
		// copied code
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.attr("transform", function (d) {
				return "translate(" + source.y0 + "," + source.x0 + ")";
			})
			.style("opacity", 0);

		// Enter any new nodes at the parent's previous position.
		nodeEnter.append("rect")
			.attr("y", -barHeight / 2)
			.attr("height", barHeight)
			.attr("width", barWidth)
			.style("fill", color)
			.on("click", click)
			.on("mouseover", function (d) {
				// if the leaf node
				if (!d.children && !d._children) {
					// dark the color when mouseover
					d3.select(this).style("fill", d3.rgb(d3.select(this).style("fill")).darker());
					cateTip.show(d);
				}
			})
			.on("mouseout", function (d) {
				// if the leaf node
				if (!d.children && !d._children) {
					// bright the color when mouseout
					d3.select(this).style("fill", d3.rgb(d3.select(this).style("fill")).brighter());
					cateTip.hide(d);
				}
			});

		// copied code
		nodeEnter.append("text")
			.attr("dy", 3.5)
			.attr("dx", 5.5)
			.text(function (d) {
				return d.data.name;
			});

		// Transition nodes to their new position. copied code
		nodeEnter.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d.y + "," + d.x + ")";
			})
			.style("opacity", 1);
		// copied code
		node.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d.y + "," + d.x + ")";
			})
			.style("opacity", 1)
			.select("rect")
			.style("fill", color);

		// Transition exiting nodes to the parent's new position. copied code
		node.exit().transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + source.y + "," + source.x + ")";
			})
			.style("opacity", 0)
			.remove();

		// Update the links… copied code
		var link = svg.selectAll(".link")
			.data(root.links(), function (d) {
				return d.target.id;
			});

		// Enter any new links at the parent's previous position. copied code
		link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("d", function (d) {
				var o = {
					x: source.x0,
					y: source.y0
				};
				return diagonal({
					source: o,
					target: o
				});
			})
			.transition()
			.duration(duration)
			.attr("d", diagonal);

		// Transition links to their new position. copied code
		link.transition()
			.duration(duration)
			.attr("d", diagonal);

		// Transition exiting nodes to the parent's new position. copied code
		link.exit().transition()
			.duration(duration)
			.attr("d", function (d) {
				var o = {
					x: source.x,
					y: source.y
				};
				return diagonal({
					source: o,
					target: o
				});
			})
			.remove();

		// Stash the old positions for transition. copied code
		root.each(function (d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	// Toggle children on click.
	function click(d) {
		if (wdiData == null) { // if the data is not loaded
			alert("Waiting for loading the data. Please try again seconds later.");
			return;
		}
		// If the leaf node.
		if (!d.children && !d._children) {
			// display the current selected topic on the top left corner
			$(".topic-name-display").html(`<strong>Topic: </strong>${d.data.name}`)
			// generate the new topic data by filtering
			wdiTopic = wdiData.filter(function (row) {
				return row["Indicator Name"] == d.data.name;
			});
			if (flag) {
				// generate the complete country names on the topic data for the first time
				// and will never generate again until the new topic data comes
				wdiTopic.forEach(function (e) {
					countryNames.push(e["Country Name"]);
				});
				flag = false;
			}
			generateMap();	// show the new colors on map
			var order = $(".order option:selected").val();
			makeUpdateHist(order);	// show the new histogram

			var values = $('#country-selector').val();
			if (values.length >= 2) {					// at least 2 countries are compared
				streamData(new Set(values));			// generate the data for stream graph
				makeStreamGraph(false, values);			// show the new stream graph
			} else if (values.length == 0) {			// if no country selected, default all the countries
				streamData(new Set(countryNames));
				makeStreamGraph(false, countryNames);
			}
			return;
		}

		if (d.children) { // copied code
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}

	// hide all the nodes after the page loads
	function moveChildren(node) {
		if (node.children) {
			node.children.forEach(function (c) {
				moveChildren(c);
			});
			node._children = node.children;
			node.children = null;
		}
	}

	function color(d) {	// copied code
		return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
	}

	/**
	 * Show choropleth on the Earth.
	 */
	function generateMap() {
		minData = d3.min(wdiTopic, d => Number(d[year]));	// get the minimum 
		maxData = d3.max(wdiTopic, d => Number(d[year]));	// get the maximum

		if (minData != maxData) { // if min = max, it means no value in the topic data
			var color = getColorRange(minData, maxData);	// get the color range 
			wdiTopic.forEach(function (row) {
				var country = $(`[data-country-name="${row["Country Name"]}"]`);
				if (row[year] != "") {	// if the value exists
					if (country.length == 1) {	// if the country exists on the map
						country.attr("fill", color([Number(row[year])]));	// set the country color based on color range
						country.attr("number", Number(row[year]));	// set the attribute "number" to the value which is accessed by map 
					}
				} else {	// if the value does not exist
					if (country.length == 1) { // if the country exists on the map
						country.attr("fill", "#ffffff")	// set the country color to white
						country.attr("number", null);	// set the attribute "number" to null
					}
				}
			});
		} else {
			wdiTopic.forEach(function (row) {
				if ($(`[data-country-name="${row["Country Name"]}"]`).length == 1) { // if the country exists on the map
					$(`[data-country-name="${row["Country Name"]}"]`).attr("fill", "lightgrey"); // set the unknow to grey color
				}
			});
		}
	}
}
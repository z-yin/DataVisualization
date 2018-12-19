/**
 * Global variables.
 */
var wdiData; // WDI data.
var wdiTopic = []; // WDI data on a topic.
var year = "2016"; // Selected year.
var maxData; // Maximum of wdiTopic.
var minData; // Minimum of wdiTopic.
var wdiFormatted = [];
var countryNames = [];
var wdiByIndicators = [];
var flagStream = false;

{
	var height = +d3.select(".row1").style("height").slice(0, -2);
	var flag = true;
	var margin = {
			top: 10,
			right: 0,
			bottom: 0,
			left: 0
		},
		width = 300,
		barHeight = 20,
		barWidth = (width - margin.left - margin.right) * 0.8;

	var i = 0,
		duration = 400,
		root;

	var diagonal = d3.linkHorizontal()
		.x(function (d) {
			return d.y;
		})
		.y(function (d) {
			return d.x;
		});

	var cateTip = d3.tip()
		.attr('class', 'category-tip')
		.style("position", "absolute")
		.style("left", "380px")
		.direction("e")
		.html(function (d) {
			return `${d.data.name}`;
		});

	var svg = d3.select("#div-catagory")
		.style("height", height)
		.append("svg")
		.call(cateTip)
		.attr("width", width) // + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var files = [
		"../data/topic_tree.json"
	];
	var promises = [];

	promises.push(d3.json(files[0]));

	Promise.all(promises).then(function (values) {
		root = d3.hierarchy(values[0]);
		root.x0 = 0;
		root.y0 = 0;
		moveChildren(root);
		update(root);
	});

	// load large data on the back end
	Promise.all([d3.csv("../data/WDIData.csv")]).then(function (values) {
		wdiData = values[0];
		// preload
		wdiTopic = wdiData.filter(function (row) {
			return row["Indicator Name"] == "Cereal production (metric tons)";
		});
		if (flag) {
			wdiTopic.forEach(function (e) {
				countryNames.push(e["Country Name"]);
			});
			flag = false;
		}

		var countrySelect = $('#country-selector').select2({
			maximumSelectionLength: countryNames.length,
			placeholder: 'Select countries to compare. (min. 2)',
			allowClear: true
		});

		countryNames.forEach(function (d) {
			countrySelect.append($('<option></option>').val(d).html(d));
		});

		displayColor();
		makeUpdateHist("value-descending");
		streamData(new Set(countryNames));
		makeStreamGraph(false, countryNames);
		flagStream = true;
		var values = $('#topic-selector').val();
		if (values.length >= 2) {
			attributeData(new Set(values), year);
			parallel();
		}
	});

	function update(source) {

		// Compute the flattened node list.
		var nodes = root.descendants();

		var totalHeight = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

		d3.select("svg").transition()
			.duration(duration)
			.attr("height", totalHeight);

		d3.select(self.frameElement).transition()
			.duration(duration)
			.style("height", totalHeight + "px");

		var index = -1;
		root.eachBefore(function (n) {
			n.x = ++index * barHeight;
			n.y = n.depth * 20;
		});

		// Update the nodes…
		var node = svg.selectAll(".node")
			.data(nodes, function (d) {
				return d.id || (d.id = ++i);
			});

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
					d3.select(this).style("fill", d3.rgb(d3.select(this).style("fill")).darker());
					cateTip.show(d);
				}
			})
			.on("mouseout", function (d) {
				// if the leaf node
				if (!d.children && !d._children) {
					d3.select(this).style("fill", d3.rgb(d3.select(this).style("fill")).brighter());
					cateTip.hide(d);
				}
			});

		nodeEnter.append("text")
			.attr("dy", 3.5)
			.attr("dx", 5.5)
			.text(function (d) {
				return d.data.name;
			});

		// Transition nodes to their new position.
		nodeEnter.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d.y + "," + d.x + ")";
			})
			.style("opacity", 1);

		node.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d.y + "," + d.x + ")";
			})
			.style("opacity", 1)
			.select("rect")
			.style("fill", color);

		// Transition exiting nodes to the parent's new position.
		node.exit().transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + source.y + "," + source.x + ")";
			})
			.style("opacity", 0)
			.remove();

		// Update the links…
		var link = svg.selectAll(".link")
			.data(root.links(), function (d) {
				return d.target.id;
			});

		// Enter any new links at the parent's previous position.
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

		// Transition links to their new position.
		link.transition()
			.duration(duration)
			.attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
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

		// Stash the old positions for transition.
		root.each(function (d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	// Toggle children on click.
	function click(d) {
		if (wdiData == null) {
			alert("Waiting for loading the data. Please try again seconds later.");
			return;
		}
		// If the leaf node.
		if (!d.children && !d._children) {
			$(".topic-name-display").html(`<strong>Topic: </strong>${d.data.name}`)
			wdiTopic = wdiData.filter(function (row) {
				return row["Indicator Name"] == d.data.name;
			});
			if (flag) {
				wdiTopic.forEach(function (e) {
					countryNames.push(e["Country Name"]);
				});
				flag = false;
			}
			displayColor();
			var order = $(".order option:selected").val();
			makeUpdateHist(order);

			var values = $('#country-selector').val();
			if (values.length >= 2) {
				streamData(new Set(values));
				makeStreamGraph(false, values);
			} else if (values.length == 0) {
				streamData(new Set(countryNames));
				makeStreamGraph(false, countryNames);
			}
			return;
		}

		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}

	function moveChildren(node) {
		if (node.children) {
			node.children.forEach(function (c) {
				moveChildren(c);
			});
			node._children = node.children;
			node.children = null;
		}
	}

	function color(d) {
		return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
	}

	/**
	 * Show choropleth on the Earth.
	 */
	function displayColor() {
		minData = d3.min(wdiTopic, d => Number(d[year]));
		maxData = d3.max(wdiTopic, d => Number(d[year]));

		if (minData != maxData) {
			var color = getColorRange(minData, maxData);
			wdiTopic.forEach(function (row) {
				var country = $(`[data-country-name="${row["Country Name"]}"]`);
				if (row[year] != "") {
					if (country.length == 1) {
						// console.log($(`[data-country-name="${row["Country Name"]}"]`).attr("data-country-name"));
						country.attr("fill", color([Number(row[year])]));
						country.attr("number", Number(row[year]));
						// console.log(sortedMap[Number(row[year])] / sorted.length);
					}
				} else {
					if (country.length == 1) {
						country.attr("fill", "#ffffff");
						country.attr("number", null);
					}
				}
			});
		} else {
			wdiTopic.forEach(function (row) {
				if ($(`[data-country-name="${row["Country Name"]}"]`).length == 1) {
					$(`[data-country-name="${row["Country Name"]}"]`).attr("fill", "lightgrey");
				}
			});
		}
	}
}
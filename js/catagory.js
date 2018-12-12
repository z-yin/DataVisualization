{
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

	var svg = d3.select("#div-catagory").append("svg")
		.attr("width", width) // + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var files = [
		"../data/topic_tree.json",
		"../data/WDIData1.csv",
	];
	var promises = [];
	var wdiData; // WDI data.
	var wdiTopic; // WDI data on a specific topic.

	promises.push(d3.json(files[0]));
	promises.push(d3.csv(files[1]));

	Promise.all(promises).then(function (values) {
		root = d3.hierarchy(values[0]);
		root.x0 = 0;
		root.y0 = 0;
		wdiData = values[1];
		update(root);
	});

	function update(source) {

		// Compute the flattened node list.
		var nodes = root.descendants();

		var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

		d3.select("svg").transition()
			.duration(duration)
			.attr("height", height);

		d3.select(self.frameElement).transition()
			.duration(duration)
			.style("height", height + "px");

		// Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
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
			.on("click", click);

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
		// If the leaf node.
		if (!d.children && !d._children) {
			wdiTopic = wdiData.filter(function (row) {
				return row["Indicator Name"] == d.data.name;
			});
			displayColor();
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

	function color(d) {
		return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
	}

	/**
	 * Show choropleth on the Earth.
	 */
	year = "2010";
	function displayColor() {
		var sorted;
		var maximum = -Infinity;
		var minimum = Infinity;
		wdiTopic.forEach(function (row) {
			console.log(row[year]);
			if (row[year] != "") {
				
				if (Number(row[year]) > maximum) maximum = Number(row[year]);
				if (Number(row[year]) < minimum) minimum = Number(row[year]);
			}
		});

		console.log(wdiTopic.length);

		if (maximum == minimum) {
			wdiTopic.forEach(function (row) {
				if ($(`[data-country-name="${row["Country Name"]}"]`).length == 0) {
					console.log("wrong" + $(`[data-country-name="${row["Country Name"]}"]`));
					$(`[data-country-name="${row["Country Name"]}"]`).attr("fill", "#ffffff");
				}
			});
			return;
		}

		var range = maximum - minimum;
		console.log(maximum + " - " + minimum);

		wdiTopic.forEach(function (row) {
			if (row[year] != "") {
				if ($(`[data-country-name="${row["Country Name"]}"]`).length == 1) {
					console.log($(`[data-country-name="${row["Country Name"]}"]`).attr("data-country-name"));
					$(`[data-country-name="${row["Country Name"]}"]`)
						.attr("fill", getColor((Number(row[year]) - minimum) / range));

					console.log((Number(row[year]) - minimum) / range);
				}
			}
		});
	}
}
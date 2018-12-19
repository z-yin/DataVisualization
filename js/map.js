/**
 * Reference: https://bl.ocks.org/austinczarnecki/fe80afa64724c9630930
 * We will mention it when we use copied code.
 */

/**
 * Global variables.
 */
var world; // World map (from local file).
var names; // Country names.
var countries;	// Countries for selecting.
var projection;	// Projection of the Earth.
var map;		// map svg.
var geoPath;	// path of map

{
	var color = getColorRange(minData, maxData);	// get color range (used by later color selecting)

	var width = 650,
		height = +d3.select(".row1").style("height").slice(0, -2);

	var colors = {
		clickable: 'lightgrey',
		hover: 'grey',
		clicked: "red",
		clickhover: "darkred"
	};

	var moving = false;			// true if the map is moving
	var initialScale = 300;		// set the initial map scale (for later )

	projection = d3.geoOrthographic()
		.scale(initialScale)
		.translate([width / 2, height / 2])
		.clipAngle(180)
		.precision(10);

	geoPath = d3.geoPath()		// copied code
		.projection(projection);

	var graticule = d3.geoGraticule();

	var map = d3.select("#div-map").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "map");

	// copied code
	map.append("defs").append("path")
		.datum({
			type: "Sphere"
		})
		.attr("id", "sphere")
		.attr("d", geoPath);

	// copied code
	map.append("use")
		.attr("class", "stroke")
		.attr("xlink:href", "#sphere");
	// copied code
	map.append("use")
		.attr("class", "fill")
		.attr("xlink:href", "#sphere");
	// copied code
	var path = map.append("path")
		.datum(graticule)
		.attr("class", "graticule")
		.attr("d", geoPath);

	var commaFormat = d3.format(",.3f");	// set the format for displaying the number
	// d3-tip, used for showing the country name and the corresponding value
	var tip = d3.tip()
		.attr('class', 'map-tip')
		.direction("e")
		.html(function (d) {
			var number = $(`[data-country-name="${d.name}"]`).attr("number");
			if (number) {
				return `<strong>${d.name}:</strong> ${commaFormat(number)}`;
			}
			return `<strong>${d.name}:</strong> <i>Unknown</i>`; // if value does not exist
		});
	map.call(tip);

	// local files
	var files = [
		"../data/world-110m.json",
		"../data/world-country-names.tsv",
	];
	var promises = [];

	promises.push(d3.json(files[0]));
	promises.push(d3.tsv(files[1]));

	Promise.all(promises).then(function (values) {
		world = values[0];
		names = values[1];

		var globe = {
			type: "Sphere"
		}
		// copied code
		var land = topojson.feature(world, world.objects.land);
		countries = topojson.feature(world, world.objects.countries).features;
		var borders = topojson.mesh(world, world.objects.countries, function (a, b) {
			return a !== b;
		});
		// sort the countries based on name for later use
		countries = countries.filter(function (d) {
			return names.some(function (n) {
				if (d.id == n.id) return d.name = n.name;
			});
		}).sort(function (a, b) {
			return a.name.localeCompare(b.name);
		});
		// copied code
		map.insert("path", ".graticule")
			.datum(topojson.feature(world, world.objects.land))
			.attr("class", "land")
			.attr("d", geoPath);

		for (i = 0; i < names.length; i++) {
			for (j = 0; j < countries.length; j++) {
				if (countries[j].id == names[i].id) {
					map.insert("path", ".graticule")
						.datum(countries[j])				// set the data source
						.attr("fill", colors.clickable)		// set the original color of countries
						.attr("d", geoPath)					// set the path of a specific country
						.attr("class", "clickable")			// copied code
						.attr("data-country-id", j)
						.attr("data-country-name", names[i].name) // use for color changing in by catagory.js
						.on("click", function () {
							// drop all previous .map-clicked class (not delete)
							d3.selectAll(".map-clicked")
								.classed("map-clicked", false)
							// set the class of the clicked item to .map-clicked
							d3.select(this)
								.classed("map-clicked", true);

							// half copied code
							(function transition() {
								d3.select(".map-clicked").transition()
									.duration(1250)
									// center to clicked country 
									.tween("rotate", function () {
										var p = d3.geoCentroid(countries[d3.select(this).attr("data-country-id")]),
											r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
										return function (t) {
											projection.rotate(r(t));
											map.selectAll("path").attr("d", geoPath);
										}
									});
							})();
						})
						.on('mouseover', function (d) {
							tip.show(d);	// show the country name and the corresponding value
							// when mouseover, set the stroke to red for easily recoginizing
							d3.select(this)
								.attr("stroke", "#ce3f46")
								.attr("stroke-width", 2);
							// get the handler of the country in histogram with the same name in map
							var thisOfHist = d3.select(`[hist-country-name="${d.name}"]`);
							if ($(`[hist-country-name="${d.name}"]`).length == 1) {	// if the country exists in the histogram
								// set the color of the previous hovered or clicked (clicked in the histogram) country to their original color
								d3.select(".histogram-hover").attr("fill", d => d3.select(".histogram-hover").attr("original-color"));
								d3.select(".histogram-clicked").attr("fill", d => d3.select(".histogram-clicked").attr("original-color"));
								// set the color of hovered country in histogram to "#7fbc41"
								thisOfHist.attr("fill", "#7fbc41");
								// drop all previous .histogram-hover and .histogram-clicked class (not delete)
								d3.selectAll(".histogram-hover")
									.classed("histogram-hover", false);
								d3.selectAll(".histogram-clicked")
									.classed("histogram-clicked", false);
								// set the class of the hovered country to histogram-hover
								thisOfHist.classed("histogram-hover", true);
								// show the country in histogram with the same name of the hovered country in map in the center of the histogram
								var offset = thisOfHist.attr("x") + thisOfHist.attr("width")/2 - Number($("#div-histogram").css("width").slice(0, -2)) / 2;
								$("#div-histogram").stop(true, false).animate({
									scrollLeft: offset
								}, 500);
							}
						})
						.on('mouseout', function (d) {
							tip.hide(d);		// when mouseout, hide the d3-tip
							d3.select(this)		// delete the red stroke
								.attr("stroke-width", 0);
						})
					break;
				}
			}
		}
		// copied code
		map.insert("path", ".graticule")
			.datum(topojson.mesh(world, world.objects.countries, function (a, b) {
				return a !== b;
			}))
			.attr("class", "boundary")
			.attr("d", geoPath);

		d3.select(self.frameElement).style("height", height + "px");

		var rotate0, coords0;
		const coords = () => projection.rotate(rotate0)
			.invert([d3.event.x, d3.event.y]);

		// add a map dragging operation based on orignal code
		map.call(d3.drag()
				.on('start', () => {
					rotate0 = projection.rotate();
					coords0 = coords();
					moving = true;
				})
				.on('drag', () => {
					const coords1 = coords();
					projection.rotate([
						rotate0[0] + coords1[0] - coords0[0],
						rotate0[1] + coords1[1] - coords0[1],
					])
					map.selectAll("path").attr("d", geoPath);
				})
				.on('end', () => {
					moving = false;
					map.selectAll("path").attr("d", geoPath);
				})
				// Goal: let zoom handle pinch gestures (not working correctly).
				.filter(() => !(d3.event.touches && d3.event.touches.length === 2))
			)
			// add a zoomming operation for details inspecting
			.call(d3.zoom()
				.on('zoom', () => {
					projection.scale(250 * d3.event.transform.k);
					map.selectAll("path").attr("d", geoPath);
				})
				.on('start', () => {
					moving = true;
					map.selectAll("path").attr("d", geoPath);
				})
				.on('end', () => {
					moving = false;
					map.selectAll("path").attr("d", geoPath);
				})
			)
	});
};
/**
 * Global variables.
 */
var world; // World map.
var names; // Country names.

{
	var width = 600,
		height = 600;

	var colors = {
		clickable: 'lightgrey',
		hover: 'grey',
		clicked: "red",
		clickhover: "darkred"
	};

	var moving = false;
	var initialScale = 300;

	var projection = d3.geoOrthographic()
		.scale(initialScale)
		.translate([width / 2, height / 2])
		.clipAngle(180)
		.precision(10);

	var geoPath = d3.geoPath()
		.projection(projection);

	var graticule = d3.geoGraticule();

	var map = d3.select("#div-map").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "map");

	map.append("defs").append("path")
		.datum({
			type: "Sphere"
		})
		.attr("id", "sphere")
		.attr("d", geoPath);

	map.append("use")
		.attr("class", "stroke")
		.attr("xlink:href", "#sphere");

	map.append("use")
		.attr("class", "fill")
		.attr("xlink:href", "#sphere");

	var path = map.append("path")
		.datum(graticule)
		.attr("class", "graticule")
		.attr("d", geoPath);

	var commaFormat = d3.format(",.3f");
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([0, 0])
		.html(function (d) {
			var number = $(`[data-country-name="${d.name}"]`).attr("number");
			if (number) {
				return `${d.name}: ${commaFormat(number)}`;
			}
			return `${d.name}: Unknown`;
		});
	map.call(tip);

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
		var land = topojson.feature(world, world.objects.land)
		var countries = topojson.feature(world, world.objects.countries).features
		var borders = topojson.mesh(world, world.objects.countries, function (a, b) {
			return a !== b;
		});

		countries = countries.filter(function (d) {
			return names.some(function (n) {
				if (d.id == n.id) return d.name = n.name;
			});
		}).sort(function (a, b) {
			return a.name.localeCompare(b.name);
		});

		map.insert("path", ".graticule")
			.datum(topojson.feature(world, world.objects.land))
			.attr("class", "land")
			.attr("d", geoPath);

		for (i = 0; i < names.length; i++) {
			for (j = 0; j < countries.length; j++) {
				if (countries[j].id == names[i].id) {
					map.insert("path", ".graticule")
						.datum(countries[j])
						.attr("fill", colors.clickable)
						.attr("d", geoPath)
						.attr("class", "clickable")
						.attr("data-country-id", j)
						.attr("data-country-name", names[i].name) // use for color changing in by catagory.js
						.on("click", function () {
							d3.selectAll(".clicked")
								.classed("clicked", false)
							// .attr("fill", colors.clickable);
							d3.select(this)
								.classed("clicked", true);
							// .attr("fill", colors.clicked);

							(function transition() {
								d3.select(".clicked").transition()
									.duration(1250)
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
							tip.show(d);
							d3.select(this)
								.attr("stroke", "#ce3f46")
								.attr("stroke-width", 2);
						})
						.on('mouseout', function (d) {
							tip.hide(d);
							d3.select(this)
								// .attr("stroke", "#ce3f46")
								.attr("stroke-width", 0);
						})
						.on("mousemove", function () {
							var c = d3.select(this);
							if (c.classed("clicked")) {
								// c.attr("fill", colors.clickhover);
							} else {
								// color.original = c.attr("fill");
							}
							// color.original = c.attr("fill");
						})

					// .on("mouseout", function () {
					// 	var c = d3.select(this);
					// 	if (c.classed("clicked")) {
					// 		// c.attr("fill", colors.original);
					// 	} else {
					// 		// d3.select(this).attr("fill", colors.clickable);
					// 		// c.attr("fill", colors.original);
					// 	}
					// })
					break;
				}
			}
		}

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
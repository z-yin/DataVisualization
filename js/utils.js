function getColorRange(min, max) {
    var scale = []
    for (var i = 0; i < 9; i++) {
        scale.push(min + i * (max - min) / 8);
    }
    return d3.scaleLinear()
        .domain(scale)     // Multiple color scale.
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
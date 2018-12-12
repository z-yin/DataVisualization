function getColor(d) {
    return d > 0.9 ? '#7f2704' :
        d > 0.8 ? '#a63603' :
        d > 0.7 ? '#d94801' :
        d > 0.6 ? '#f16913' :
        d > 0.5 ? '#fd8d3c' :
        d > 0.4 ? '#fdae6b' :
        d > 0.3 ? '#fdd0a2' :
        d > 0.2 ? '#fee6ce' :
        d > 0.1 ? '#fff5eb' : '#ffffff';
}
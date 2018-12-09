var sumAge = (function() {
    $.ajax({
        'async': true,
        'global': true,
        'url': "../data/sum_of_age.json",
        'dataType': "json",
        'success': function (data) {
            sumAge = data;
            histogramAge();
        }
    });
    return sumAge;
})();

$("#age-histogram").on('plotly_selected', function(eventData) {
    console.log("iii");
    var minKey = 200;
    var maxKey = -1;
    for (var key in eventData.points) {
        if (key < minKey) minKey = key;
        if (key > maxKey) maxKey = key;
    }
    age2 = [minKey, maxKey];
});

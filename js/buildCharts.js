/*
 * buildCharts.js
 * Part of the Team Visualization.
 * Loads the data and builds the charts.
 *
 * Authour: Wybe Westra
 * Date: 30-05-2016
 */

// Load the data and create the graph.
d3_queue.queue()
    .defer(d3.csv, "data/materialData.csv", coerceTypes)
    .await(createGraphs);


function createGraphs(error, materialData) {
    if (error) throw error;

    console.log(materialData);

    // The filter and update configuration.
    var config = {
        // Data.
        'nestedData': nestData(materialData),

        // Filters.
        'year': 2012,
        'product': "coal",

        // Update information.
        'transitionDuration': 1, // In seconds.
    }

    // ---- Build the framework ------------------------------------------------

    var mainContainer = d3.select("body").append("main");

    // ---- Build the plots ----------------------------------------------------

    var flowchart = createFlowchart("main", config);

    // ---- Plot update function -----------------------------------------------

    function updatePlots(config) {
        flowchart.update(config);
    }

    // Run the first update.
    updatePlots(config);
}


// ---- Data functions ---------------------------------------------------------

// Coerces the data types on load.
function coerceTypes(d) {
    d.year = +d.year;
    d.quantity = +d.quantity;
    return d;
}


function nestData(data) {
    var nest = d3.nest()
        .key(function(d) { return d.year; })
        .key(function(d) { return d.product; })
        .key(function(d) { return d.direction; })
        .key(function(d) { return d.country; })
        .rollup(function(leaves) { return d3.sum(leaves, function(d) {  return d.quantity; }); })
        .map(data, d3.map);

    return nest;
}

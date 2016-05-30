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

    // The filter and update configuration.
    var config = {
        // Filters.
        'year': 2015,

        // Update information.
        'transitionDuration': 1, // In seconds.
    }

    // ---- Build the plots ----------------------------------------------------

    var flowChart = createFlowChart();

    // ---- Plot update function -----------------------------------------------

    function updatePlots(configuration) {
        flowChart.update();
    }

    // Run the first update.
    updatePlots(config);
}


// ---- Data functions ---------------------------------------------------------

// Coerces the data types on load.
function coerceTypes(d) {
    return d;
}

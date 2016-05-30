/*
 * flowChart.js
 * Part of the Team Visualization.
 * Shows the flow between exporting and importing countries.
 *
 * Authour: Wybe Westra
 * Date: 30-05-2016
 */

// createFlowchart.
// container => string => The name of the container this chart should go in.
function createFlowchart(container) {

    // ---- Build the chart ----------------------------------------------------

    d3.select(container).append("svg")
        .classed("flowchart", true);

    dataPointClass = ".datapoint";

    // ---- Update function ----------------------------------------------------

    var updateFunction = function() {

    }

    // ---- Return the values --------------------------------------------------

    return { 'update': updateFunction, 'dataClass': dataPointClass};
}

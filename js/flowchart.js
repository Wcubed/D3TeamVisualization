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

    // The return value.
    var flowchart = {
        'datapoints': ".datapoints",
        'class': "flowchart"
    };


    // ---- Build the chart ----------------------------------------------------

    d3.select(container).append("svg")
        .classed(flowchart.class, true);

    // ---- Update function ----------------------------------------------------

    flowchart.update = function(config) {
        console.log("update");
    }

    // ---- Return the values --------------------------------------------------

    return flowchart;
}

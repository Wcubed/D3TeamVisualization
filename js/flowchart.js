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
function createFlowchart(container, config) {

    // The return value.
    var flowchart = {
        'datapoints': ".datapoints",
        'class': "flowchart"
    };

    var layout = d3.layout.stack();


    // ---- Build the chart ----------------------------------------------------

    d3.select(container).append("svg")
        .classed(flowchart.class, true);

    // ---- Update function ----------------------------------------------------

    flowchart.update = function(config) {
        // Get the currenly selected data.
        var data = config.nestedData
            .get(config.year)
            .get(config.product);

        var exportData = data.get("export");
        var importData = data.get("import");

        console.log(exportData);
    }

    // ---- Return the values --------------------------------------------------

    return flowchart;
}

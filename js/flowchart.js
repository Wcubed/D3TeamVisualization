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

    // Setup margins and graph size.
    var sizes = { margin: { top: 50, right: 50, bottom: 50, left: 50 } };
    sizes.totalWidth = 600;
    sizes.totalHeight = 600;
    sizes.width = sizes.totalWidth - sizes.margin.left - sizes.margin.right;
    sizes.height = sizes.totalHeight - sizes.margin.top - sizes.margin.bottom;

    // The return value.
    var flowchart = {
        'datapoints': ".datapoints",
        'class': "flowchart"
    };

    var layout = d3.layout.stack();


    // ---- Build the chart ----------------------------------------------------

    var chart = d3.select(container).append("svg")
        .classed(flowchart.class, true)
        .attr("width", sizes.totalWidth)
        .attr("height", sizes.totalHeight);

    // ---- Update function ----------------------------------------------------

    flowchart.update = function(config) {
        // Get the currenly selected data.
        var data = config.nestedData
            .get(config.year)
            .get(config.product);

        var exportData = data.get("export").entries();
        var importData = data.get("import").entries();

        exportData = calcStartAndEnd(exportData);
        importData = calcStartAndEnd(importData);

        console.log(exportData);
        console.log(importData);

        // ---- Datapoints -----------------------------------------------------

        var exportDatapoint = chart.selectAll("g")
            .data(exportData.entries());

        // -- Enter --

        var newExportDatapoint = exportDatapoint.enter().append("g");

        newExportDatapoint.append("rect");

        // -- Update --

        exportDatapoint.select("rect")
            .attr("x", 0)
            .attr("y", 10)
            .attr("width", 100)
            .attr("height", 20);

        // -- Remove --

        exportDatapoint.exit()
            .remove();
    }

    // ---- Return the values --------------------------------------------------

    return flowchart;
}


// Calculates start and end values, aranging the data into bands.
function calcStartAndEnd(data) {
    var y0 = 0;

    data.forEach(function (d) {
        d.value = {
            amount: d.value,
            y0: y0,
            y1: y0 += d.value,
        };
    });

    return data;
}

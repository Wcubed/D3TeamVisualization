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
    var size = { margin: { top: 50, right: 50, bottom: 50, left: 50 } };
    size.totalWidth = 600;
    size.totalHeight = 600;
    size.width = size.totalWidth - size.margin.left - size.margin.right;
    size.height = size.totalHeight - size.margin.top - size.margin.bottom;

    // The return value.
    var flowchart = {
        datapoints: ".datapoints",
        class: "flowchart",
    };

    // Scales.
    var importY = d3.scale.linear()
        .range([0, size.height]);

    var exportY = d3.scale.linear()
        .range([0, size.height]);


    // ---- Build the chart ----------------------------------------------------

    var chart = d3.select(container).append("svg")
        .classed(flowchart.class, true)
        .attr("width", size.totalWidth)
        .attr("height", size.totalHeight);

    // ---- Update function ----------------------------------------------------

    flowchart.update = function(config) {
        // Get the currenly selected data.
        var data = config.nestedData
            .get(config.year)
            .get(config.commodity);

        var importData = data.get("Import").entries();
        var exportData = data.get("Export").entries();

        // Calculate the stacking values.
        importData = calcStartAndEnd(importData);
        exportData = calcStartAndEnd(exportData);

        // Scale domains.
        var maxScaleSize = Math.max(
            importData[importData.length-1].y1,
            exportData[exportData.length-1].y1
        );

        importY.domain([0, maxScaleSize]);
        exportY.domain([0, maxScaleSize]);

        // ---- Datapoints -----------------------------------------------------

        var importDatapoint = chart.selectAll("g.import")
            .data(importData);

        var exportDatapoint = chart.selectAll("g.export")
            .data(exportData);

        // -- Enter --

        var newImportDatapoint = importDatapoint.enter().append("g")
            .classed("import", true);

        var newExportDatapoint = exportDatapoint.enter().append("g")
            .classed("export", true);

        newImportDatapoint.append("rect");
        newExportDatapoint.append("rect");

        // -- Update --

        importDatapoint.select("rect")
            .attr("x", 12)
            .attr("y", function(d) { return importY(d.y0); })
            .attr("width", 10)
            .attr("height", function(d) { return importY(d.y1 - d.y0); });

        exportDatapoint.select("rect")
            .attr("x", 0)
            .attr("y", function(d) { return exportY(d.y0); })
            .attr("width", 10)
            .attr("height", function(d) { return exportY(d.y1 - d.y0); });

        // -- Remove --

        importDatapoint.exit()
            .remove();

        exportDatapoint.exit()
            .remove();
    }

    // ---- Return the values --------------------------------------------------

    return flowchart;
}


// Calculates start and end values,
// stacking the data.
function calcStartAndEnd(data) {
    var y0 = 0;

    data.forEach(function (d) {
        d.y0 = y0; // Start.
        y0 += d.value;
        d.y1 = y0; // End.
    });

    return data;
}

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

    // Setup the import / export bar sizes.
    size.barMargin = size.width * 0.1;
    size.barWidth = (size.width - size.barMargin) / 2;

    // The return value.
    var flowchart = {
        class: "flowchart",
        datapointClass: "datapoint",
    };

    flowchart.datapointSelector =
        "." + flowchart.class + " ." + flowchart.datapointClass;

    // Scales.
    var yscale = d3.scale.linear()
        .range([0, size.height]);


    // ---- Build the chart ----------------------------------------------------

    var chart = d3.select(container).append("svg")
        .classed(flowchart.class, true)
        .attr("width", size.totalWidth)
        .attr("height", size.totalHeight)
      .append("g") // Add the margin offset.
        .attr("transform", "translate(" + size.margin.left + "," + size.margin.top + ")");

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

        yscale.domain([0, maxScaleSize]);

        // Containers.
        var importContainer = chart.append("g")
            .attr("transform", "translate(0, 0)")
            .classed("import", true);

        var exportContainer = chart.append("g")
            .attr("transform", "translate(" + (size.barWidth + size.barMargin) + ", 0)")
            .classed("export", true);

        // ---- Datapoints -----------------------------------------------------

        var importDatapoint = importContainer.selectAll("g")
            .data(importData);

        var exportDatapoint = exportContainer.selectAll("g")
            .data(exportData);

        // ---- Enter ----

        var newImportDatapoint = importDatapoint.enter().append("g")
            .classed(flowchart.datapointClass, true);

        var newExportDatapoint = exportDatapoint.enter().append("g")
            .classed(flowchart.datapointClass, true);


        // Chart boxes.
        newImportDatapoint.append("rect");
        newExportDatapoint.append("rect");

        // Country name.
        newImportDatapoint.append("svg:text")
            .html(function(d) { return d.key.substring(0, 3); });
        newExportDatapoint.append("svg:text")
            .html(function(d) { return d.key.substring(0, 3); });

        // ---- Update ----

        var datapoint = d3.selectAll(flowchart.datapointSelector);

        datapoint.attr("transform", function(d) {
            return "translate(" +
            "0," +
            yscale(d.y0) + ")";
        });

        datapoint.select("rect")
            .attr("width", size.barWidth)
            .attr("height", function(d) { return yscale(d.y1 - d.y0); });

        datapoint.select("text")
            .attr("x", size.barWidth / 2)
            .attr("y", function(d) { return yscale((d.y1 - d.y0)/2) });

        // ---- Remove ----

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

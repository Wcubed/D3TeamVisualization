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
    size.totalWidth = 300;
    size.totalHeight = 900;
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

    // ---- Location functions -------------------------------------------------

    var importX = function(d) { return 0; };
        exportX = function(d) { return size.barMargin + size.barWidth; };
        barY = function(d) { return yscale(d.y0); };
        barHeight = function(d) { return yscale(d.y1 - d.y0); };

        importLabelX = function(d) { return importX(d) + size.barWidth / 2; };
        exportLabelX = function(d) { return exportX(d) + size.barWidth / 2; };
        labelY = function(d) { return barY(d) + barHeight(d)/2; };


    // ---- Label functions ----------------------------------------------------

    var fontSize = 15;

    // Determines whether to display the label or not.
    var doHideLabel = function(d) {
        // Labels should be hidden when the bar isn't high enough.
        // Show it again on hover.
        if ((fontSize < barHeight(d)) ||
            (d.key == config.hoveredCountry)) {
                return 1;
        } else {
            return 0;
        }
    }

    var labelText = function(d) {
        return d.key.substring(0, 3);
    }


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

    // Containers.
    var importContainer = chart.append("g")
        .attr("transform", "translate(0, 0)")
        .classed("import", true);

    var exportContainer = chart.append("g")
        .attr("transform", "translate(" + (size.barWidth + size.barMargin) + ", 0)")
        .classed("export", true);

    var labelContainer = chart.append("g");

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

        // ---- Datapoints -----------------------------------------------------

        // Key function.
        var keyFn = function(d) {
            return d.key;
        };

        var importDatapoint = importContainer.selectAll("g")
            .data(importData, keyFn);

        var exportDatapoint = exportContainer.selectAll("g")
            .data(exportData, keyFn);

        // Labels.
        var importLabel = labelContainer.selectAll("text.import")
            .data(importData, keyFn);
        var exportLabel = labelContainer.selectAll("text.export")
            .data(exportData, keyFn);

        // ---- Enter ----

        var newImportDatapoint = importDatapoint.enter().append("g")
            .classed(flowchart.datapointClass, true);

        var newExportDatapoint = exportDatapoint.enter().append("g")
            .classed(flowchart.datapointClass, true);

        // Labels.
        importLabel.enter().append("text")
            .classed("import", true)
            .attr("y", 0)
            .style("opacity", 0)
            .style("font-size", fontSize);
        exportLabel.enter().append("text")
            .classed("export", true)
            .attr("y", 0)
            .style("opacity", 0)
            .style("font-size", fontSize);

        // Chart boxes.
        newImportDatapoint.append("rect")
            .attr("height", 0)
            .style("fill", "rgb(1, 87, 12)");
        newExportDatapoint.append("rect")
            .attr("height", 0)
            .style("fill", "rgb(1, 87, 12)");

        // ---- Update ----

        var datapoint = d3.selectAll(flowchart.datapointSelector);

        datapoint.transition()
            .duration(config.transitionDuration)
            .attr("transform", function(d) {
                return "translate(" +
                "0," +
                yscale(d.y0) + ")";
            });

        datapoint.select("rect").transition()
            .duration(config.transitionDuration)
            .attr("width", size.barWidth)
            .attr("height", barHeight)
            .style("fill", function(d) {
                if (d.key == config.hoveredCountry) {
                    // Hovered.
                    return "rgb(0, 112, 14)";
                } else {
                    // Normal.
                    return "rgb(1, 87, 12)";
                }
            });;

        // Labels.
        importLabel.attr("x", importLabelX)
            .html(labelText);
        importLabel.transition()
            .duration(config.transitionDuration)
            .attr("y", labelY)
            .style("opacity", doHideLabel);

        exportLabel.attr("x", exportLabelX)
            .html(labelText);
        exportLabel.transition()
            .duration(config.transitionDuration)
            .attr("y", labelY)
            .style("opacity", doHideLabel);


        // ---- Remove ----

        importDatapoint.exit()
            .remove();
        exportDatapoint.exit()
            .remove();

        // Labels.
        importLabel.exit().transition()
            .duration(config.transitionDuration)
            .style("opacity", 0)
            .remove();
        exportLabel.exit().transition()
            .duration(config.transitionDuration)
            .style("opacity", 0)
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

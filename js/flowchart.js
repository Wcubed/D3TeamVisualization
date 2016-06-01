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
    var size = { margin: { top: 0, right: 50, bottom: 0, left: 50 } };
    size.totalWidth = 300;
    size.totalHeight = 700;
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

    var barsContainer = chart.append("g");

    var labelContainer = chart.append("g");

    // ---- Update function ----------------------------------------------------

    flowchart.update = function(config) {
        // Get the currenly selected data.
        var data = config.nestedData
            .get(config.year)
            .get(config.commodity);

        console.log(data);

        // Calculate the stacking values.
        data = calcStartAndEnd(data);

        console.log(data);

        // Scale domains.
        var maxScaleSize;

        yscale.domain([0, maxScaleSize]);

        // ---- Datapoints -----------------------------------------------------

        // Key function.
        var keyFn = function(d) {
            return d.key;
        };

        var datapoint = barsContainer.selectAll("g")
            .data(data, keyFn);

        // Labels.
        var label = labelContainer.selectAll("text")
            .data(data, keyFn);

        // ---- Enter ----

        var newDatapoint = datapoint.enter().append("g")
            .classed(flowchart.datapointClass, true);

        // Labels.
        label.enter().append("text")
            .classed("import", true)
            .attr("y", 0)
            .style("opacity", 0)
            .style("font-size", fontSize);

        // Chart boxes.
        newDatapoint.append("rect")
            .attr("height", 0)
            .classed("import", true)
            .style("fill", "rgb(1, 87, 12)");
        newDatapoint.append("rect")
            .attr("height", 0)
            .classed("export", true)
            .style("fill", "rgb(1, 87, 12)");

        // ---- Update ----

        datapoint.selectAll("rect").transition()
            .duration(config.transitionDuration)
            .attr("transform", function(d) {
                return "translate(" +
                "0," +
                yscale(d.y0) + ")";
            });

        datapoint.selectAll("rect").transition()
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
        label.attr("x", importLabelX)
            .html(labelText);
        label.transition()
            .duration(config.transitionDuration)
            .attr("y", labelY)
            .style("opacity", doHideLabel);


        // ---- Remove ----

        datapoint.exit().transition()
            .duration(config.transitionDuration)
            .style("opacity", 0)
            .remove();

        // Labels.
        label.exit().transition()
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
        var imp = {};

        imp.value = d["Import"];

        imp.y0 = y0; // Start.
        y0 += imp.value;
        imp.y1 = y0; // End.

        console.log(imp);

        d = imp;
    });

    return data;
}

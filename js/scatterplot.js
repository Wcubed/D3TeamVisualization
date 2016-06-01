/*
 * scatterplot.js
 * Part of the Team Visualization.
 * Shows 
 *
 * Authour: Wybe Westra
 * Date: 30-05-2016
 */

// createFlowchart.
// container => string => The name of the container this chart should go in.
function createScatterplot(container, config) {

    // Setup margins and graph size.
    var size = { margin: { top: 50, right: 50, bottom: 50, left: 50 } };
    size.totalWidth = 600;
    size.totalHeight = 600;
    size.width = size.totalWidth - size.margin.left - size.margin.right;
    size.height = size.totalHeight - size.margin.top - size.margin.bottom;

    // The return value.
    var scatterplot = {
        class: "scatterplot",
        datapointClass: "datapoint",
    };

    scatterplot.datapointSelector =
        "." + scatterplot.class + " ." + scatterplot.datapointClass;

    // Scales.
    var importY = d3.scale.linear()
        .range([0, size.height]);

    var exportX = d3.scale.linear()
        .range([0, size.width]);


    // ---- Build the chart ----------------------------------------------------

    var chart = d3.select(container).append("svg")
        .classed(scatterplot.class, true)
        .attr("width", size.totalWidth)
        .attr("height", size.totalHeight)
        .append("g") // Add the margin offset.
        .attr("transform", "translate(" + size.margin.left + "," + size.margin.top + ")");

    // ---- Update function ----------------------------------------------------

    scatterplot.update = function(config) {
        // Get the currenly selected data.
        var data = config.nestedData
            .get(config.year)
            .get(config.commodity);

        var exportData = data.get("Export").entries();
        var importData = data.get("Import").entries();

        var datas = data.get("Country").entries();

        // Scale domains.
        var maxScalex = Math.max(exportData);
        var maxScaleY = Math.max(importData);

        exportX.domain([0, maxScalex]);
        importY.domain([0, maxScaleY]);

        // Setup X and Y Axis
        var yAxis = d3.svg.axis().scale(importY).orient("left").ticks(10);
        var xAxis = d3.svg.axis().scale(exportX).orient("bottom").ticks(5);

        // Draw X Axis
        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + size.height + ")")
            .call(xAxis)
            .style("fill", "green")
        .append("text")
            .attr("class", "label")
            .attr("x", size.width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Export");

        // Draw Y Axis
        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .style("fill", "green")
        .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Import");

        // ---- Datapoints -----------------------------------------------------
        var datapoints = chart.selectAll("g")
            .data(datas);

        // -- Enter --
        var newDatapoints = datapoints.enter().append("g")
            .classed(scatterplot.datapointClass, true)
            .classed("dots", true);

        // -- Update --

        chart.selectAll(".dots")
          .append("circle")
            .attr("class", "dot")
            .attr("r", 5)
            .attr("cx", function(d) { return exportX(d["Import"]); })
            .attr("cy", function(d) { return importY(d["Export"]); })
            .style("fill", "red");

        // -- Remove --

        datapoints.exit()
            .remove();

    }

    // ---- Return the values --------------------------------------------------

    return scatterplot;
}
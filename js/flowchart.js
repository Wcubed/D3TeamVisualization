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
// FlowDirection can be either "Import" or "Export".
function Flowchart(container, config, flowDirection) {

    // Setup margins and graph size.
    var size = { margin: { top: 0, right: 50, bottom: 0, left: 50 } };
    size.totalWidth = 300;
    size.totalHeight = 700;
    size.width = size.totalWidth - size.margin.left - size.margin.right;
    size.height = size.totalHeight - size.margin.top - size.margin.bottom;

    this.class = "flowchart" + flowDirection;
    this.datapointClass = "datapoint";
    this.flowDirection = flowDirection;

    this.datapointSelector = "." + this.class + " ." + this.datapointClass;

    // ---- Location functions -------------------------------------------------

    var barX = function(d) { return 0; };
        barY = function(d) { return yscale(d.y0); };
        barWidth = function(d) { return size.width; };
        barHeight = function(d) { return yscale(d.y1 - d.y0); };

        labelX = function(d) { return barX(d) + size.width / 2; };
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
        .classed(this.class, true)
        .attr("width", size.totalWidth)
        .attr("height", size.totalHeight)
      .append("g") // Add the margin offset.
        .attr("transform", "translate(" + size.margin.left + "," + size.margin.top + ")");

    var barsContainer = chart.append("g");

    var labelContainer = chart.append("g");

    // ---- Update function ----------------------------------------------------

    this.update = function(config) {
        // Get the currenly selected data.
        this.rawData = config.nestedData
            .get(config.year)
            .get(config.commodity);

        // Reset the data.
        this.data = {};

        // Calculate the stacking values.
        calcStartAndEnd(this);

        // Scale the domain.
        yscale.domain([0, this.maxScaleSize]);

        // ---- Datapoints -----------------------------------------------------

        console.log(this.data);

        // Key function.
        var keyFn = function(d) {
            return d.key;
        };

        var datapoint = barsContainer.selectAll("g")
            .data(this.data, keyFn);

        // Labels.
        var label = labelContainer.selectAll("text")
            .data(this.data, keyFn);

        // ---- Enter ----

        var newDatapoint = datapoint.enter().append("g")
            .classed(this.datapointClass, true);

        // Labels.
        label.enter().append("text")
            .attr("y", 0)
            .style("opacity", 0)
            .style("font-size", fontSize);

        // Chart boxes.
        newDatapoint.append("rect")
            .attr("height", 0)
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
            .attr("width", barWidth)
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
        label.attr("x", labelX)
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

    return this;
}


// Calculates start and end values,
// stacking the data.
function calcStartAndEnd(chart) {
    var y0 = 0;

    chart.rawData.forEach(function (key, value) {
        var d = {};

        d.value = value.get(chart.flowDirection);

        // Check for undefined.
        if (d.value) {
            d.y0 = y0; // Start.
            y0 += d.value;
            d.y1 = y0; // End.

            chart.data[key] = d;
        }
    });

    chart.maxScaleSize = y0;
}

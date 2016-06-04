/*
 * streamchart.js
 * Part of the Team Visualization.
 * Shows the flow between exporting and importing countries.
 *
 * Authour: Wybe Westra
 * Date: 04-06-2016
 */

// -----------------------------------------------------------------------------
// ---- Constructor ------------------------------------------------------------
// -----------------------------------------------------------------------------

function Streamchart(container, config, flowDirection) {
    this.flowDirection = flowDirection;

    // Determine sizes.
    this.size = {margin: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
        label: 10, // Margin between bars and labels.
    }};
    this.size.totalWidth = 200;
    this.size.totalHeight = 800;
    this.size.width = this.size.totalWidth - this.size.margin.left - this.size.margin.right;
    this.size.height = this.size.totalHeight - this.size.margin.top - this.size.margin.bottom;

    this.size.barWidth = this.size.totalWidth * 0.1;

    this.class = "streamchart" + this.flowDirection;
    this.datapointSelector = "." + this.class + " .bar";

    this.fontSize = 15;

    // Scales.
    this.yscale = d3.scale.linear()
        .range([0, this.size.height]);

    // ---- Build the chart svg ------------------------------------------------
    this.chart = d3.select(container).append("svg")
        .classed(this.class, true)
        .classed("streamchart", true)
        .attr("width", this.size.totalWidth)
        .attr("height", this.size.totalHeight)
      .append("g") // Add the margin offset.
        .attr("transform", "translate(" + this.size.margin.left + "," + this.size.margin.top + ")");

    // Add the containers.
    this.flowContainer = this.chart.append("g");
    this.labelContainer = this.chart.append("g")
        .attr("transform", "translate(" + (this.size.barWidth + this.size.margin.label) + ",0)");
}

// -----------------------------------------------------------------------------
// ---- Update function --------------------------------------------------------
// -----------------------------------------------------------------------------

Streamchart.prototype.update = function(config) {
    // ---- Get the data -------------------------------------------------------
    this.wrangleData(config);

    // Set scale domain.
    this.yscale.domain([0, this.maxDataValue]);

    //console.log("---- Updating" + this.flowDirection + " ----");
    //console.log(this.maxDataValue);
    //console.log(this.yscale(this.maxDataValue));
    //console.log(this.data);

    // ---- Datapoint location functions ---------------------------------------

    barPos = function(c) {
        return function(d) {
            return "translate(0," + c.yscale(d.y0) + ")";
        }
    };
    barHeight = function(c) {
        return function(d) {
            return c.yscale(d.y1 - d.y0);
        }
    };

    labelPos = function(c) {
        return function(d) {
            return "translate(0," + (c.yscale(d.y0) + c.yscale(d.y1 - d.y0)/2 ) + ")";
        }
    };

    // Checks if the label fits within the height of the bar
    // and adjusts the opacity accordingly.
    labelOpacity = function(c) {
        return function(d) {
            if (c.yscale(d.y1 - d.y0) > c.fontSize) {
                return 1;
            } else {
                return 0;
            }
        }
    };

    // ---- Datapoints ---------------------------------------------------------

    // Key function.
    var keyFn = function(d) {
        return d.key;
    };

    var datapoint = this.flowContainer.selectAll("g")
        .data(this.data, keyFn);

    var label = this.labelContainer.selectAll("g")
        .data(this.data, keyFn);

    // ---- Enter ----

    var newDatapoint = datapoint.enter().append("g")
        .style("opacity", 1);

    newDatapoint.append("rect")
        .classed("bar", true)
        .style("fill", "rgb(0, 16, 31)")
        .style("stroke", "rgb(0, 97, 190)");

    var newLabel = label.enter().append("g")
        .style("opacity", labelOpacity(this));

    newLabel.append("text")
        .classed("label-name", true)
        .html(function(d) { return d.key; });
    newLabel.append("line")
        .classed("label-separator", true)
        .attr("x1", -2)
        .attr("y1", 0)
        .attr("x2", -this.size.margin.label + 2)
        .attr("y2", 0);

    // ---- Update ----

    datapoint.transition()
        .duration(config.transitionDuration)
        .attr("transform", barPos(this))
        .style("opacity", 1);

    datapoint.select(".bar").transition()
        .duration(config.transitionDuration)
        .attr("height", barHeight(this))
        .attr("width", this.size.barWidth)
        .style("fill", function(d) {
            if (config.hoveredCountry == d.key) {
                return "rgb(18, 54, 87)";
            } else {
                return "rgb(0, 16, 31)";
            }
        });

    label.transition()
        .duration(config.transitionDuration)
        .style("opacity", labelOpacity(this))
        .attr("transform", labelPos(this));

    // ---- Remove ----

    datapoint.exit().transition()
        .duration(config.transitionDuration)
        .style("opacity", 0)
        .remove();

    label.exit().transition()
        .duration(config.transitionDuration)
        .style("opacity", 0)
        .remove();
}

// -----------------------------------------------------------------------------
// ---- Data wrangling function ------------------------------------------------
// -----------------------------------------------------------------------------

Streamchart.prototype.wrangleData = function(config) {
    var rawData = config.nestedData.get(config.year)
        .get(config.commodity);

    var data = [];
        y0 = 0;
        flowDirection = this.flowDirection;

    // Calculate the start and ending points of the data bars.
    rawData.forEach(function(key, value) {
        var d = {};

        d.key = key;
        d.value = value.get(flowDirection);

        if (d.value) {
            d.y0 = y0;
            y0 += d.value;
            d.y1 = y0;

            data.push(d); // Add the point to the dataset.
        }
    });

    this.data = data;
    this.maxDataValue = y0;
}

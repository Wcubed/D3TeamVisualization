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
        right: 10
    }};
    this.size.totalWidth = 100;
    this.size.totalHeight = 800;
    this.size.width = this.size.totalWidth - this.size.margin.left - this.size.margin.right;
    this.size.height = this.size.totalHeight - this.size.margin.top - this.size.margin.bottom;

    this.size.barWidth = this.size.totalWidth * 0.1;

    this.class = "streamchart" + this.flowDirection;

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

    // Add the flow container.
    this.flowContainer = this.chart.append("g");
}

// -----------------------------------------------------------------------------
// ---- Update function --------------------------------------------------------
// -----------------------------------------------------------------------------

Streamchart.prototype.update = function(config) {
    // ---- Get the data -------------------------------------------------------
    this.wrangleData(config);

    // Set scale domain.
    this.yscale.domain([0, this.maxDataValue]);

    // ---- Datapoint location functions ---------------------------------------

    var barY = function(scale) {
        return function(d) {
            return "translate(0," + scale(d.y0) + ")";
        }
    };
    var barHeight = function(scale) {
        return function(d) {
            return scale(d.y1 - d.y0);
        }
    };

    // ---- Datapoints ---------------------------------------------------------

    var datapoint = this.flowContainer.selectAll("g")
        .data(this.data);

    // ---- Enter ----

    var newDatapoint = datapoint.enter().append("g");

    newDatapoint.append("rect")
        .style("fill", "rgb(1, 26, 50)")
        .style("stroke", "rgb(0, 62, 121)");

    // ---- Update ----

    datapoint.transition()
        .duration(config.transitionDuration)
        .attr("transform", barY(this.yscale));

    datapoint.selectAll("rect").transition()
        .duration(config.transitionDuration)
        .attr("height", barHeight(this.yscale))
        .attr("width", this.size.barWidth);
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

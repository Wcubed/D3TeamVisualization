/*
 * buildCharts.js
 * Part of the Team Visualization.
 * Loads the data and builds the charts.
 *
 * Authour: Wybe Westra
 * Date: 30-05-2016
 */

// Load the data and create the graph.
d3_queue.queue()
    .defer(d3.csv, "data/metalData.csv", coerceTypes)
    .await(createGraphs);


function createGraphs(error, materialData) {
    if (error) throw error;

    // The filter and update configuration.
    var config = {
        // Data.
        nestedData: nestData(materialData),

        // Filters.
        year: 2012,
        commodity: "Silicon, <99.99% pure",
        hoveredCountry: "",

        // Update information.
        transitionDuration: 1000, // In milliseconds.
    }

    console.log(config.nestedData);

    // Make a list of all available years, as integers.
    config.yearList = config.nestedData.keys();
    config.yearList.forEach( function(d, i) {
        this[i] = +d;
    }, config.yearList);

    // Make a list of all available commodities.
    config.commodityList = {};

    config.nestedData.values().forEach( function(d) {
        d.keys().forEach( function (k) {
            config.commodityList[k] = true;
        });
    });

    console.log(config.commodityList);

    // ---- Hover/filter functions ---------------------------------------------

    var flowchartOver = function(d) {
        config.hoveredCountry = d.key;
        config.transitionDuration = 100;
        updatePlots(config);
    }

    var flowchartOut = function(d) {
        config.hoveredCountry = "";
        config.transitionDuration = 100;
        updatePlots(config);
    }

    // Change the year.
    var yearSliderInput = function() {
        config.year = this.value;
        config.transitionDuration = 1000;
        updatePlots(config);
    }

    // ---- Build the main container -------------------------------------------

    var mainContainer = d3.select("body").append("main");

    // ---- Create the filter area ---------------------------------------------

    var filterContainer = mainContainer.append("div")
        .classed("filter-container", true);

    // Commodity selectors.
    var commoditySelector = filterContainer.selectAll("div.commodity-selector")
        .data(Object.keys(config.commodityList))
      .enter().append("div")
        .classed("commodity-selector", true);

    commoditySelector.append("p")
        .html(function(d) { return d; });

    var yearSlider = filterContainer.append("input")
        .classed("year-slider", true)
        .attr("type", "range")
        .attr("min", Math.min.apply(null, config.yearList))
        .attr("max", Math.max.apply(null, config.yearList))
        .attr("step", 1)
        .on("input", yearSliderInput);

    // ---- Build the plots ----------------------------------------------------

    var flowchart = createFlowchart("main", config);
    var scatterplot = createScatterplot("main", config);

    // ---- Plot update function -----------------------------------------------

    function updatePlots(config) {
        flowchart.update(config);
        scatterplot.update(config);

        // --- Update filters --------------------------------------------------

        yearSlider.attr("value", config.year);

        // ---- Add the hover functions ----------------------------------------

        d3.selectAll(flowchart.datapointSelector)
            .on('mouseover', flowchartOver)
            .on('mouseout', flowchartOut);
    }

    // Run the first update.
    updatePlots(config);
}


// ---- Data functions ---------------------------------------------------------

// Coerces the data types on load.
function coerceTypes(d) {
    d.Year = +d.Year;
    d.Quantity = +d.Quantity;
    return d;
}


function nestData(data) {
    var nest = d3.nest()
        .key(function(d) { return d.Year; })
        .key(function(d) { return d.Commodity; })
        .key(function(d) { return d.Flow; })
        .key(function(d) { return d.Country; })
        .rollup(function(leaves) { return d3.sum(leaves, function(d) {  return d.Quantity; }); })
        .map(data, d3.map);

    return nest;
}

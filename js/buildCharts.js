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
    .defer(d3.csv, "data/continents.csv")
    .await(createGraphs);


function createGraphs(error, materialData, continentData) {
    if (error) throw error;

    // ---- Initialize configuration -------------------------------------------

    // The filter and update configuration.
    var config = {
        // ---- Data ----
        // Data nested by year -> commodity -> country -> flow.
        nestedData: nestData(materialData),
        // Data nested by commodity.
        commodityTimeData: commodityTimeData(materialData),

        continentData: convertContinentdata(continentData),

        continentMeta: {
            "Africa": {col: "rgb(0, 255, 214)", i: 0},
            "Asia": {col: "rgb(78, 0, 191)", i: 1},
            "Europe": {col: "rgb(156, 236, 87)", i: 2},
            "North America": {col: "rgb(244, 22, 80)", i: 3},
            "South America": {col: "rgb(194, 38, 139)", i: 4},
            "Oceania": {col: "rgb(244, 88, 11)", i: 5},
        },

        // ---- Filters ----
        year: 2012,
        commodity: "Silicon, <99.99% pure",
        hoveredCountry: "",

        // Update information.
        transitionDuration: 1000, // In milliseconds.
    }

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

    // ---- Hover/filter functions ---------------------------------------------

    var flowchartOverBar = function(d) {
        console.log("Hover update");

        config.hoveredCountry = d.key;
        config.transitionDuration = 500;
        updatePlots(config);
    }

    var flowchartOverStream = function(d) {
        console.log("Hover update");

        config.hoveredCountry = d[0].key;
        config.transitionDuration = 500;
        updatePlots(config);
    }

    // Change the year.
    var yearSliderInput = function() {
        console.log("Year update");

        config.year = this.value;
        config.transitionDuration = 1000;
        updatePlots(config);
    }

    // Changes the selected commodity.
    var commodityInput = function(d) {
        console.log("Commodity update");

        config.transitionDuration = 1000;
        config.commodity = d;
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
        .classed("commodity-selector", true)
        .on("click", commodityInput);

    commoditySelector.append("p")
        .html(function(d) { return d; });


    // To contain the graphs in.
    var graphContainer = mainContainer.append("div")
        .classed("graph-container", true);


    var sliderContainer = graphContainer.append("div");

    sliderContainer.append("p")
        .html("Select year:");

    // Year selector.
    var yearSlider = sliderContainer.append("input")
        .classed("year-slider", true)
        .attr("type", "range")
        .attr("min", Math.min.apply(null, config.yearList))
        .attr("max", Math.max.apply(null, config.yearList))
        .attr("step", 1)
        .on("input", yearSliderInput);

    // ---- Build the plots ----------------------------------------------------

    //var flowchartImport = new Flowchart("main", config, "Import");
    //var flowchartExport = new Flowchart("main", config, "Export");

    var streamchartImport = new Streamchart(".graph-container", config, "Import");
    var streamchartExport = new Streamchart(".graph-container", config, "Export");
    //var scatterplot = createScatterplot("main", config);

    // Country details display.
    var detailsDisplay = mainContainer.append("div")
        .classed("details-display", true);

    var detailsCountryName = detailsDisplay.append("h2");
    var detailsImport = detailsDisplay.append("p")
        .classed("details-import", true);
    var detailsExport = detailsDisplay.append("p")
        .classed("details-export", true);
    var detailsYear = detailsDisplay.append("p")
        .classed("details-year", true);

    // ---- Plot update function -----------------------------------------------

    function updatePlots(config) {
        console.log("-- Updating --");

        //flowchartImport.update(config);
        //flowchartExport.update(config);
        //scatterplot.update(config);

        streamchartImport.update(config);
        streamchartExport.update(config);

        // --- Update filters --------------------------------------------------

        yearSlider.attr("value", config.year);
        commoditySelector.classed("selected", function(d) {
            return config.commodity == d;
        });

        var hoveredData = config.nestedData.get(config.year)
            .get(config.commodity)
            .get(config.hoveredCountry);

        // Details display.
        if (hoveredData) {
            detailsCountryName.html(config.hoveredCountry);
            detailsImport.html(hoveredData.get("Import") + " kg");
            detailsExport.html(hoveredData.get("Export") + " kg");
        }
        detailsYear.html(config.year);

        // ---- Add the hover functions ----------------------------------------

        d3.selectAll(streamchartImport.barSelector)
            .on('mouseover', flowchartOverBar);

        d3.selectAll(streamchartImport.streamSelector)
            .on('mouseover', flowchartOverStream);

        d3.selectAll(streamchartExport.barSelector)
            .on('mouseover', flowchartOverBar);

        d3.selectAll(streamchartExport.streamSelector)
            .on('mouseover', flowchartOverStream);

        console.log("-- done --");
    }

    // Run the first update.
    console.log("First update");
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
        .key(function(d) { return d.Country; })
        .key(function(d) { return d.Flow; })
        .rollup(function(leaves) { return d3.sum(leaves, function(d) {  return d.Quantity; }); })
        .map(data, d3.map);

    return nest;
}

function commodityTimeData(data) {
    var nest = d3.nest()
        .key(function(d) { return d.Commodity; })
        .key(function(d) { return d.Flow; })
        .key(function(d) { return d.Country; })
        .key(function(d) { return d.Year; })
        .rollup(function(leaves) { return d3.sum(leaves, function(d) {  return d.Quantity; }); })
        .map(data, d3.map);

    return nest;
}

function convertContinentdata(data) {
    var dict = {};

    data.forEach(function(d) {
        dict[d.Country] = d.Continent;
    });

    return dict;
}

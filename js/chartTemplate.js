/*
 * chartTemplate.js
 * Part of the Team Visualization.
 * Template for new charts.
 *
 * Authour: Wybe Westra
 * Date: 30-05-2016
 */

function createChart() {

    // ---- Build the chart ----------------------------------------------------

    dataPointClass = ".datapoint";

    // ---- Update function ----------------------------------------------------

    var updateFunction = function() {

    }

    // ---- Return the values --------------------------------------------------

    return { 'update': updateFunction, 'dataClass': dataPointClass};
}

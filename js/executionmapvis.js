
/*
 * 
 *
 * ExecutionMapVis is a visualization for displaying geographical data.
 * 
 *
 * Design: TODO.
 *
 *
 */

ExecutionMapVis = function(_parentElement, _data, _mapEventHandler) {
	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = [];

	// dimensions
	this.margin = {top: 30, right: 50, bottom: 30, left: 40},
    this.width = 750 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

	this.initVis();
}


// Step 1
ExecutionMapVis.prototype.initVis = function() {

	var that = this;

    this.populationFormat = d3.format(",.0f");
    this.currentYear = 1977;

	this.statemap = new Datamap({
        scope: 'usa',
        element: document.getElementById('executionMapVis'),
        geographyConfig: {
            highlightFillColor: '#6E6E6E',
            highlightBorderColor: 'black',
            popupTemplate: function(geography, data) {
                return '<div class="hoverinfo"><strong>' + geography.properties.name + 
                '</strong><br>Executions: ' + data.executions + '</div>'
            },
            highlightBorderWidth: 1
        },
        fills: { 
            defaultFill: '#7da7ca',
            "none": "#BDBDBD",
            "< 3": "#F78181",
            "3 - 5": "#DF0101",
            "> 5": "#8A0808"
        }
    });

    this.statemap.labels();
    this.statemap.legend();

    // wrangle data
    this.wrangleData();

    // then update the visualization to display data
    this.updateVis();

}


// Step 2
ExecutionMapVis.prototype.wrangleData = function() {

    var that = this;

	// at least for now
	var newdata = this.data.filter(function(d) { return d.state != "Northeast" && d.state != "West" &&
                                                            d.state != "South" && d.state != "Midwest"; });

    var to_display = {};
    newdata.map(function(d) {
        var amount = d.values.filter(function(e) { return e.year == that.currentYear; })[0].amount;
        var fill;
        if (amount == 0)
            fill = "none";
        else if (amount > 0 && amount < 3)
            fill = "< 3";
        else if (amount >= 3 && amount <= 5)
            fill = "3 - 5";
        else
            fill = "> 5";

        to_display[d.state] = {
            fillKey: fill,
            executions: parseInt(amount)
        }
    });

    this.displayData = to_display;

}

// Step 3
ExecutionMapVis.prototype.updateVis = function() {

	var that = this;

    this.statemap.updateChoropleth(this.displayData);

}

// Signal map selection
ExecutionMapVis.prototype.onSelectionChange = function(year) {
    this.currentYear = year;

    $("#header").html(this.currentYear);

    this.wrangleData();

    this.updateVis();
}


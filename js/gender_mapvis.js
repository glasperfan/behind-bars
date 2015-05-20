/*
 * 
 *
 * MapGenderVis is a "helper" visualization for displaying the gender breakdown for a highlighted state.
 * 
 *
 * Design: pie chart, MapGender by male and female based on 2013 statistics.
 *
 *
 */

MapGenderVis = function(_parentElement, _data, _mapEventHandler) {
	this.parentElement = _parentElement;
	this.data = _data;
    this.mapEventHandler = _mapEventHandler;
	this.displayData = [];
    this.year = 2013;


	// dimensions
	this.margin = {top: 30, right: 50, bottom: 30, left: 80},
    this.width = 300 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;
    this.radius = Math.min(this.width, this.height) / 2;
    this.outerRadius = this.radius - 10;
    this.innerRadius = this.radius - 50;

	this.initVis();
}


// Step 1
MapGenderVis.prototype.initVis = function() {

	var that = this;

    this.color = d3.scale.ordinal().range(["#C13100", "#217C7E"]);

    this.arc = d3.svg.arc()
        .outerRadius(this.outerRadius)
        .innerRadius(this.innerRadius);

    this.pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d; });

    // create visual elements
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
    
    this.g = this.svg.append("g")
        .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    // wrangle data
    this.wrangleData(null, null);

    // then update the visualization to display data
    if (this.displayData)
        this.updateVis();

}


// Step 2
MapGenderVis.prototype.wrangleData = function(state, fields) {
    
    var that = this;
    
    if (!state)
	   this.displayData = null;
    
    else {
        var selection = this.data.filter(function(d) { return d.state === state; });
        that.displayData = []
        fields.forEach(function(field) {
            that.displayData.push(selection[0][that.year][field]);
        });
    }

}

// Step 3
MapGenderVis.prototype.updateVis = function() {
    
    // now that the data is set
	var that = this;

    this.g.datum(this.displayData).selectAll("path").data(this.pie).transition().duration(300).attrTween("d", arcTween)

	// set up groups
    this.path = this.g.datum(this.displayData).selectAll("path")
        .data(this.pie)
        .enter()
        .append("path")
        .attr("class","piechart")
        .attr("fill", function(d,i){ return that.color(i); })
        .attr("d", this.arc)
        .each(function(d){ this._current = d; });


    this.path.transition()
      .duration(300)
      .attr("fill", function(d, i) { return that.color(i); })
      .attr("d", this.arc)
      .each(function(d) { this._current = d; }); // store the initial angles

    var text = this.path.selectAll("text")
        .data(["Male, Female"]);

     text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return d;
        });

    // remove data not being used
    this.g.datum(this.displayData).selectAll("path")
        .data(this.pie).exit().remove();


    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return that.arc(i(t));
        };
    }

}

// Step 4: respond to changes in the map
MapGenderVis.prototype.onSelectionChange = function(data, fields) {
    this.wrangleData(data.state, fields);
    this.updateVis();
}
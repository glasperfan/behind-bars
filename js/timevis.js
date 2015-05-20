
/*
 * 
 *
 * TimeVis is a visualization for displaying the increase in national incarceration
 * rates between 1925 and 2013.
 * http://www.bjs.gov/content/pub/pdf/hcsus5084.pdf --> 1925 - 1982 data
 * 
 *
 * Design: area chart. X-axis: year (1925-2012). Y-axis: prison population count.
 *
 *
 */

TimeVis = function(_parentElement, _data) {
	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = [];


	// dimensions
	this.margin = {top: 10, right: 20, bottom: 30, left: 55},
    this.width = 650 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;

	this.initVis();
}


// Step 1
TimeVis.prototype.initVis = function() {

	var that = this;

	this.svg = this.parentElement
	.append('svg')
		.attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
   	.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    // create scales
    this.x = d3.scale.linear()
    	.range([0, this.width]);

    this.y = d3.scale.linear()
    	.range([this.height, 0]);

    // create axes
    this.xAxis = d3.svg.axis()
    	.scale(this.x)
    	.tickFormat(d3.format(""))
    	.orient("bottom");

    this.yAxis = d3.svg.axis()
    	.scale(this.y)
    	.orient("left");

    // create area element
    this.area = d3.svg.area()
      	.x(function(d) { return that.x(d.year); })
      	.y0(this.height)
      	.y1(function(d) { return that.y(d.population); });

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")");

    this.svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Prisoner population");



    // wrangle data
    this.wrangleData();

    // then update the visualization to display data
    this.updateVis();

}


// Step 2
TimeVis.prototype.wrangleData = function() {

	// at least for now
	this.displayData = this.data;

}

// Step 3
TimeVis.prototype.updateVis = function() {

	// now that the data is set(this.displayData)...
	var that = this;

	// set scale domains
	this.x.domain(d3.extent(this.displayData, function(d) { return d.year; } ));
	this.y.domain([0, d3.max(this.displayData, function(d) { return d.population * 1.1; } )]);

	// update axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis);

    // update area svg
    var path = this.svg.selectAll(".area")
    	.data([this.displayData]);

    path.enter()
      	.append("path")
      	.attr("class", "area");

    path
    	.transition()
    	.attr("d", this.area);

    path
    	.exit()
    	.remove();

    this.focus = this.svg.append("g")
      	.attr("class", "focus")
      	.style("display", "none");

  	this.focus.append("circle")
      	.attr("r", 5);

  	this.focus.append("text")
      	.attr("x", -60)
      	.attr("dy", "-1.5em");

    this.svg.append("rect")
      .attr("class", "overlay")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("mouseover", function() { that.focus.style("display", null); })
      .on("mouseout", function() { that.focus.style("display", "none"); })
      .on("mousemove", mousemove);

    this.populationFormat = d3.format(",d");
    function mousemove() {
	    //debugger;
	    var bisectDate = d3.bisector(function(d) { return d.year; }).left;
	    var x0 = that.x.invert(d3.mouse(this)[0]),
	        i = bisectDate(that.displayData, x0, 1),
	        d0 = that.displayData[i - 1],
	        d1 = that.displayData[i],
	        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
	    that.focus.attr("transform", "translate(" + that.x(d.year) + "," + that.y(d.population) + ")");
	    that.focus.select("text").text("(" + d.year + "): " + that.populationFormat(d.population));
	}

}


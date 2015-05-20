
/*
 * 
 *
 * ExecutionVis is a visualization for displaying state verss federal executions over time (1977 - 2014).
 * 
 *
 * Design: Animated multiple line graph.
 *
 *
 */

ExecutionVis = function(_parentElement, _data) {
	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = [];
  this.data_drawn = false;

	// dimensions
	this.margin = {top: 0, right: 50, bottom: 30, left: 20},
    this.width = 600 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;

	this.initVis();
}


// Step 1
ExecutionVis.prototype.initVis = function() {

	var that = this;

	this.svg = this.parentElement
	.append('svg')
		.attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
   	.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + 0 + ")");


    // create scales
    this.x = d3.scale.linear()
    	.range([0, this.width]);

    this.y = d3.scale.linear()
    	.range([this.height, 0]);

    this.color = d3.scale.category10();

    // create axes
    this.xAxis = d3.svg.axis()
    	.scale(this.x)
    	.tickFormat(d3.format(""))
    	.orient("bottom");

    this.yAxis = d3.svg.axis()
    	.scale(this.y)
    	.orient("left");

    // create area element
    this.valueline = d3.svg.line()
                    .interpolate("basis")
                    .x(function(d) { return that.x(d.year); })
                    .y(function(d) { return that.y(d.amount); });

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
        .text("Executions");

    // wrangle data
    this.wrangleData();

    // then update the visualization to display data
    this.updateVis();

}


// Step 2
ExecutionVis.prototype.wrangleData = function() {

	// at least for now
	this.displayData = this.data;

}

// Step 3
ExecutionVis.prototype.updateVis = function() {

	// now that the data is set(this.displayData)...
	var that = this;

	// set scale domains
	this.x.domain(d3.extent(this.displayData[1].values, function(d) { return d.year; } ));
	this.y.domain([0, d3.max(this.displayData[1].values, function(d) { return d.amount; } )]);

  this.color.domain(this.displayData.map(function(d) { return d.type; }));

	// update axis
  this.svg.select(".x.axis")
      .call(this.xAxis);

  this.svg.select(".y.axis")
      .call(this.yAxis);

  var legend = this.svg.append("g")
      .attr("class", "legend")
      .attr("x", this.width - 65)
      .attr("y", 25)
      .attr("height", 100)
      .attr("width", 100);

    legend.selectAll('g').data(this.displayData)
      .enter()
      .append('g')
      .each(function(d, i) {
        var g = d3.select(this);
        g.append("rect")
          .attr("x", that.width - 65)
          .attr("y", i*25 + 5)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", that.color(d.type));
        
        g.append("text")
          .attr("x", that.width - 50)
          .attr("y", i * 25 + 13)
          .attr("height",30)
          .attr("width",100)
          .style("fill", that.color(d.type))
          .text(d.type);
      });

	}

/** HELPER FUNCTIONS **/
ExecutionVis.prototype.drawLines = function(path) {
  var totalLength = [path[0][0].getTotalLength(), path[0][1].getTotalLength()];

  d3.select(path[0][0])
      .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0])
      .attr("stroke-dashoffset", totalLength[0])
      .transition()
        .duration(5000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

  d3.select(path[0][1])
      .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1])
      .attr("stroke-dashoffset", totalLength[1])
      .transition()
        .duration(5000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
}

ExecutionVis.prototype.onSelectionChange = function() {
  var that = this;
  if (!this.data_drawn)
    this.data_drawn = true;
  else return;

  // Add the valueline path.
  this.type = this.svg.selectAll(".type")
      .data(this.displayData)
    .enter().append("g")
      .attr("class", "type");

  path = this.type.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return that.valueline(d.values); })
        .style("stroke", function(d) { return that.color(d.type); });

  this.drawLines(path);
};
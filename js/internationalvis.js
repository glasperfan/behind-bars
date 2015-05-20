/*
 * 
 *
 * InternationalVis is a bar chart for visualizing different data related to the top 20 countries for total prisoners.
 * Data gathered from the CIA World Factbook and the United Nations Office on Drugs and Crime (https://data.unodc.org).
 * 
 *
 *
 */

InternationalVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.mode = "perHundredThousand";
    this.displayData = this.data.map(function(d) {
      d.perHundredThousand = Math.round(d.total / d.population * 100000);
      return d;
    })
    .sort(function(a,b) { return b.perHundredThousand - a.perHundredThousand; });

    // dimensions
    this.margin = {top: 20, right: 20, bottom: 100, left: 80},
    this.width = 700 - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}


// Step 1
InternationalVis.prototype.initVis = function() {

    var that = this;

    this.color = d3.scale.category20(); // can be changed later

    
    this.x = d3.scale.ordinal()
    	.rangeRoundBands([0, this.width], .3);

    this.y = d3.scale.linear()
    	.range([this.height, 0])

    this.xAxis = d3.svg.axis()
    	.scale(this.x)
    	.orient("bottom")

    this.yAxis = d3.svg.axis()
    	.scale(this.y)
    	.orient("left");

    // create visual elements
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.updateVis();

}

// Step 3
InternationalVis.prototype.updateVis = function() {
    
    // now that the data is set
    var that = this;

    // set axis domains
    this.x.domain(this.displayData.map(function(d) { return d.country; }));
    this.y.domain([0, d3.max(this.displayData, function(d) { return d[that.mode]; })]);

    this.svg.append("g")
      	.attr("class", "x axis")
      	.attr("transform", "translate(0," + this.height + ")")
      	.call(this.xAxis)
      	.selectAll("text")
      	.style("text-anchor", "end")
  		.attr("dx", "-.8em")
     	.attr("dy", ".15em")
     	.attr("transform", "rotate(-65)");

	this.svg.append("g")
		.attr("class", "y axis")
		.call(this.yAxis)

	this.svg.selectAll(".bar")
		.data(this.displayData)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("x", function(d) { return that.x(d.country); })
	      .attr("width", that.x.rangeBand())
	      .attr("height", 0)
	      .transition()
          .delay(function(d, i) { return i * 200; })
          .duration(400)
          .attr("y", function(d) { return that.y(d[that.mode]); })
	      .attr("height", function(d) { return that.height - that.y(d[that.mode]); })
	      .attr("fill", function(d,i) { return that.color(i); })

}

// Step 4: respond to changes in the map
InternationalVis.prototype.onSelectionChange = function(data, fields) {
    this.wrangleData(data.state, fields);
    this.updateVis();
}

// Helper function for determining mode of data (gender/race)
InternationalVis.prototype.setMode = function() {
    this.mode = document.querySelector('input[name="breakdown"].active').getAttribute("data-b");
}


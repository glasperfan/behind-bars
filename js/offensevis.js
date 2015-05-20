
/*
 * 
 *
 * OffenseVis is a visualization for displaying the different categories of offenses and their frequences.
 * 
 *
 * Design: stacked bar chart.
 *
 */

OffenseVis = function(_parentElement, _data, _legendOn) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.legendOn = _legendOn;
    this.displayData = [];

    this.width = this.data.length > 2 ? 400 : 280;
    // dimensions
    this.margin = {top: 10, right: 50, bottom: 30, left: 80},
    this.width = this.width - this.margin.left - this.margin.right;
    this.height = 310 - this.margin.top - this.margin.bottom;

    this.initVis();
}


// Step 1
OffenseVis.prototype.initVis = function() {

    var that = this;

    this.svg = this.parentElement
    .append('svg')
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    // create scales
    this.x = d3.scale.ordinal()
    .rangeRoundBands([0, this.width], .35);

    this.y = d3.scale.linear()
        .rangeRound([this.height, 0]);

    // create axes
    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    this.tip = d3.tip()
      .attr('class', 'd3-tip')
      .style('padding', '0px')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>" + d.name + ":</strong> " + d.percent.toFixed(1) + "%";
      });

    this.color = d3.scale.ordinal()
                    .range(["#5C755E", "#EECD86", "#E18942", "#B95835", "#3D3242"]);

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
        .text("Number of prisoners");

    this.svg.call(this.tip);


    // wrangle data
    this.wrangleData()

    // then update the visualization to display data
    this.updateVis();

}


// Step 2
OffenseVis.prototype.wrangleData = function() {

    // at least for now
    this.displayData = this.data;

}

// Step 3
OffenseVis.prototype.updateVis = function() {

    // now that the data is set(this.displayData)...
    var that = this;

    this.color.domain(d3.keys(this.displayData[0].values));

    this.displayData.forEach(function(d) {
        var y0 = 0;
        d.offenses = that.color.domain().map(function(name) { 
            return {
                name: name, 
                y0: y0, 
                y1: y0 += +d.values[name],
                percent: (d.values[name] / d.total) * 100,
                name: name
            }; 
        });
    });

    // set scale domains
    this.x.domain(this.displayData.map(function(d) { 
        return d.type; 
    }));

    this.y.domain([0, d3.max(this.displayData, function(d) { return d.total; })]);

    var state = this.svg.selectAll(".state")
      .data(this.displayData)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { 
        return "translate(" + that.x(d.type) + ",0)"; 
        });

      state.selectAll("rect")
          .data(function(d) { return d.offenses; })
        .enter().append("rect")
          .attr("width", this.x.rangeBand())
          .attr("y", function(d) { return that.y(d.y1); })
          .attr("height", 0)
          .on('mouseover', function(d) { that.tip.style("padding", "10px").show(d); })
          .on('mouseout', that.tip.hide)
          .transition()
          .duration(2000)
          .attr("height", function(d) { return that.y(d.y0) - that.y(d.y1); })
          .style("fill", function(d) { return that.color(d.name); });

    // update axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis);    

    if (this.legendOn) {
        this.legend = this.svg.selectAll(".legend")
          .data(this.color.domain().slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      this.legend.append("rect")
          .attr("x", this.width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", this.color);

      this.legend.append("text")
          .attr("x", this.width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });
    }

}


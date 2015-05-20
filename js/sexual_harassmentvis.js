
/*
 * 
 *
 * SexualHarassmentVis is a visualization for displaying sexual harassment data in the following ways:
 * Categories: Inmate-on-inate, Staff sexual misconduct
 * Type: Sex, Race, Age, Education, Mental Health Status (of attacker)
 *
 * Design: diverging stacked bar chart (http://bl.ocks.org/wpoely86/e285b8e4c7b84710e463)
 *
 */

SexualHarassmentVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.type = "Inmate-on-inmate";
    this.category = "Sex";

    // dimensions
    this.margin = {top: 20, right: 200, bottom: 30, left: 150},
    this.width = 950 - this.margin.left - this.margin.right;
    this.height = 180 - this.margin.top - this.margin.bottom;
    this.label_width = 50;
    this.row_height = 50;
    this.gap = 10;

    this.initVis();
}


// Step 1
SexualHarassmentVis.prototype.initVis = function() {

    var that = this;

    this.svg = this.parentElement
    .append('svg')
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // create scales
    this.heteroScale = d3.scale.linear();
    this.nonheteroScale = d3.scale.linear();

    // create axes
    this.heteroAxis = d3.svg.axis()
        .orient("top")
        .scale(this.heteroScale)
        .tickFormat(function(d) { return d + "%"; });

    this.nonheteroAxis = d3.svg.axis()
        .orient("top")
        .scale(this.nonheteroScale)
        .tickFormat(function(d) { return d + "%"; });

    // Add axes visual elements
    this.heteroAxisG = this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (this.label_width + (this.width - this.label_width) / 2) 
                + "," + (this.margin.top - 1) + ")");

    this.nonheteroAxisG = this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (this.label_width + (this.width - this.label_width) / 2) 
                + "," + (this.margin.top - 1) + ")");

    var heterotext = this.svg.append("text").text("Heterosexual").attr({
        x: -120,
        y: this.height - 20,
        "class": "hetero"
    });

    var nonheterotext = this.svg.append("text").text("Non-heterosexual").attr({
        x: this.width + 150,
        y: this.height - 30,
        "text-anchor": "end",
        "class": "nonhetero"
    });

    var bbox = heterotext.node().getBBox();

    this.svg.append("svg:rect")
        .attr("x", bbox.x - 5)
        .attr("y", bbox.y - 5)
        .attr("width", bbox.width + 10)
        .attr("height", bbox.height + 10)
        .style("fill", "black")
        .style("fill-opacity", ".2")
        .style("stroke", "#666")
        .style("stroke-width", "1.5px")
        .style("padding", "5px");

    bbox = nonheterotext.node().getBBox();

    this.svg.append("svg:rect")
        .attr("x", bbox.x - 5)
        .attr("y", bbox.y - 5)
        .attr("width", bbox.width + 10)
        .attr("height", bbox.height + 10)
        .style("fill", "black")
        .style("fill-opacity", ".2")
        .style("stroke", "#666")
        .style("stroke-width", "1.5px");

    // wrangle data
    this.wrangleData();

    // then update the visualization to display data
    this.updateVis();

}


// Step 2
SexualHarassmentVis.prototype.wrangleData = function() {

    var that = this;

    this.displayData = this.data.filter(function(d) {
      return d.category == that.category && d.type == that.type;
    });

}

// Step 3
SexualHarassmentVis.prototype.updateVis = function() {

    // now that the data is set(this.displayData)...
    var that = this;
    
    this.svg.selectAll("g.row").transition().duration(500).remove();

    var row = this.svg.selectAll("g.row").data(this.displayData);

    row.enter().append("g").classed("row", true).attr({
        transform: function(d, i) {
            return "translate(" + (that.label_width + (that.width - that.label_width) / 2) + "," 
                  + (that.margin.top + i * that.row_height) + ")";
        }
    }).call(function(row) {
        row.append("text").attr({
            "dx": 10,
            "class": "label",
            fill: "#333",
            transform: " translate(" + (-(that.width - that.label_width) / 2 - that.label_width) 
                + "," + (that.row_height - that.gap) + ") "
        });
        row.append("rect").attr({
            "class": "hetero",
            height: that.row_height - that.gap
        });
        row.append("rect").attr({
            "class": "nonhetero",
            height: that.row_height - that.gap
        });
    }).call(this.sizeFn, this);

    row.select(".label").text(function(d) {
        return d.characteristic;
    });

    row.transition().duration(1000).call(this.sizeFn, this);
    this.heteroAxisG.transition().duration(1000).call(this.heteroAxis);
    this.nonheteroAxisG.transition().duration(1000).call(this.nonheteroAxis);

}

SexualHarassmentVis.prototype.sizeFn = function(row, that) {

    var max = d3.max(that.displayData, function(d) {
        return (Math.max(d.heterosexual, d.non_heterosexual));
    });

    that.nonheteroScale.domain([ 0, max ]).range([ 0, (that.width - that.label_width) / 2 ]);
    that.heteroScale.domain([ 0, max ]).range([ 0, -(that.width - that.label_width) / 2 ]);

    row.select(".hetero").attr({
        width: function(d) {
            return that.heteroScale(0) - that.heteroScale(d.heterosexual);
        },
        x: function(d) {
            return that.heteroScale(d.heterosexual);
        }
    });
    row.select(".nonhetero").attr({
        width: function(d) {
            return that.nonheteroScale(d.non_heterosexual) - that.nonheteroScale(0);
        },
        x: function(d) {
            return that.nonheteroScale(0);
        }
    });
}

SexualHarassmentVis.prototype.onSelectionChange = function(type, value) {
    if (type == "category")
      this.category = value;
    else
      this.type = value;

    this.wrangleData();

    this.updateVis();
}


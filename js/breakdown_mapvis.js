/*
 * 
 *
 * BreakdownVis is a separate "helper" visualization for displaying EITHER the race OR gender breakdown.
 * Gender data is from 2013. Gathered from the Bureau of Justice Statistics.
 * Race data is from 2010. Gathered from http://www.prisonpolicy.org/reports/rates.html.
 *
 *
 *
 */

BreakdownVis = function(_parentElement, _genderData, _raceData, _stateData) {
    this.parentElement = _parentElement;
    this.genderData = _genderData;
    this.raceData = _raceData;
    this.stateData = _stateData;
    this.displayData = [];
    this.genderYear = 2013;
    this.raceYear = 2010;
    this.mode = null; // either "gender" or "race"
    this.state = null;
    this.tableData = {}; // for updating the table
    this.politicallyCorrect = {"white" : "Caucasian", "black": "African-American", "hispanic": "Hispanic/Latino", "AI": "American Indian" }


    // dimensions
    this.margin = {top: 100, right: 0, bottom: 0, left: 100},
    this.width = 450 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;
    this.radius = Math.min(this.width, this.height) / 2;
    this.outerRadius = this.radius - 10;
    this.innerRadius = 0;


    this.setMode();
    this.initVis();
}


// Step 1
BreakdownVis.prototype.initVis = function() {

    var that = this;

    this.color = d3.scale.ordinal()
        .domain(["Female", "Male", "Caucasian", "African-American", "Hispanic/Latino", "American Indian"])
        .range(["#F2C249", "#E6772E" , "#4DB3B3", "#E64A45", "#3D4C53", "#257E78"]); // can be changed later

    this.arc = d3.svg.arc()
        .outerRadius(this.outerRadius)
        .innerRadius(this.innerRadius);

    this.outerArc = d3.svg.arc()
        .innerRadius(this.innerRadius * 1.2)
        .outerRadius(this.outerRadius * 1.2);

    this.pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.population; });

    // create visual elements
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
    
    this.g = this.svg.append("g")
        .attr("transform", "translate(" + 220 + "," + 125 + ")");

    this.g.append("g")
        .attr("class", "slices");
    this.g.append("g")
        .attr("class", "labels");
    this.g.append("g")
        .attr("class", "lines");

    this.wrangleData(null);

    if (this.displayData)
        this.updateVis();

}


// Step 2
BreakdownVis.prototype.wrangleData = function(state) {
    
    var that = this;
    if (!state && !this.state)
        this.displayData = null;
    else {
        if (state) 
            this.state = state;
        if (this.mode === "gender") {
            var selection = this.genderData.filter(function(d) { return d.state === that.state; });
            selection = selection[0][this.genderYear];
            this.displayData = [
                {
                    type: "Male",
                    population: selection.male,
                    percentage: selection.male / selection.total
                },
                {
                    type: "Female",
                    population: selection.female,
                    percentage: selection.female / selection.total
                }
            ];
            this.tableData['male'] = selection.male;
            this.tableData['female'] = selection.female;
        } else {
            this.displayData = [];
            var el = this.raceData.filter(function(d) { return d.state === that.state; });
            for (var key in el[0])
                if (key !== "state") {
                    if (el[0][key] > 0)
                        this.displayData.push({ type: this.politicallyCorrect[key], population: el[0][key] });
                    this.tableData[key] = el[0][key];
                }
        }
        var e = this.genderData.filter(function(d) { return d.state === that.state; });
        this.tableData['total'] = e[0][2013].total;
    }


}

// Step 3
BreakdownVis.prototype.updateVis = function() {
    
    // now that the data is set
    var that = this;

    // update display table
    this.updateTable();

    var key = function(d) { return d.data.type; };

    /* Inspired by http://bl.ocks.org/dbuezas/9306799 */

    /* ------- PIE SLICES -------*/
    this.slice = this.svg.select(".slices").selectAll("path.slice")
        .data(this.pie(this.displayData), function(d) { return d.data.population; });

    this.slice.enter()
        .insert("path")
        .style("fill", function(d) { return that.color(d.data.type); })
        .attr("class", "slice");

    this.slice       
        .transition().duration(300)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return that.arc(interpolate(t));
            };
        });

    this.slice.exit()
        .remove();

    /* ------- TEXT LABELS -------*/

    this.text = this.svg.select(".labels").selectAll("text")
        .data(this.pie(this.displayData), key);

    this.text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(key);
    
    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    this.text.transition().duration(300)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = that.outerArc.centroid(d2);
                pos[0] = that.radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        });

    this.text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    this.polyline = this.svg.select(".lines").selectAll("polyline")
        .data(this.pie(this.displayData), key);
    
    this.polyline.enter()
        .append("polyline");

    this.polyline.transition().duration(300)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = that.outerArc.centroid(d2);
                pos[0] = that.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [that.arc.centroid(d2), that.outerArc.centroid(d2), pos];
            };          
        });
    
    this.polyline.exit()
        .remove();

}

// Step 4: respond to changes in the map
BreakdownVis.prototype.onSelectionChange = function(data) {
    this.setMode();
    if (data)
        this.wrangleData(data.state);
    else
        this.wrangleData(null);
    this.updateVis();
}

// Helper function for determining mode of data (gender/race)
BreakdownVis.prototype.setMode = function() {
    this.mode = document.querySelector('input[name="breakdown"].active').getAttribute("data-b");
}

BreakdownVis.prototype.updateTable = function() {
    var that = this;
    var state = this.stateData.filter(function(d) { return d.name === that.state; });
    state = state[0];
    this.f = d3.format(",");
    $('#state').show();
    $('.map-box .wrapper').show();
    d3.select(".map-box > h4 > .highlighted").text(this.state);
    this.showValue("#b-pop", state.population);
    this.showValue("#b-total", this.tableData.total);
    if (this.mode === "race") {
        this.showValue("#b-white", this.tableData.white);
        this.showValue("#b-black", this.tableData.black);
        this.showValue("#b-hispanic", this.tableData.hispanic);
        this.showValue("#b-ai", this.tableData.AI);
        this.hideValue("#b-male");
        this.hideValue("#b-female");
    } else {
        this.hideValue("#b-white");
        this.hideValue("#b-black");
        this.hideValue("#b-hispanic");
        this.hideValue("#b-ai");
        this.showValue("#b-male", this.tableData.male);
        this.showValue("#b-female", this.tableData.female);
    }
}

BreakdownVis.prototype.showValue = function(el, value) {
    if (value > 0)
        d3.select(el).style("display", null).select(".value").text(this.f(value));
    else
        this.hideValue(el);
}

BreakdownVis.prototype.hideValue = function(el) {
    d3.select(el).style("display", "none");
}


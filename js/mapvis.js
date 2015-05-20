
/*
 * 
 *
 * MapVis is a visualization for displaying geographical data.
 * 
 *
 * Design: A display of all 50 states (using datamaps).
 *
 *
 */

MapVis = function(_parentElement, _data, _mapEventHandler) {
	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = this.data;
    this.mapEventHandler = _mapEventHandler;
    this.currentSelection = null;
    this.mode = null;

	this.initVis();
}


MapVis.prototype.initVis = function() {

	var that = this;

    this.populationFormat = d3.format(",.0f");

	this.statemap = new Datamap({
        scope: 'usa',
        element: document.getElementById('mapVis'),
        geographyConfig: {
            highlightBorderColor: '#070719',
            highlightFillColor: '#0B4C5F',
            popupTemplate: function(geography) {
                var selection = that.data.filter(function(d) { return d.abbrev === geography.id; });
                selection = selection[0]; // should be only one state
                that.selectionMade(selection.name);
                return '<div class="hoverinfo"><strong>' + selection.name + 
                '</strong><br>Population: ' + that.populationFormat(selection.population) + '</div>'
            },
            highlightBorderWidth: 1
        },
        fills: { defaultFill: '#7da7ca' }
    });

    this.statemap.labels();

    d3.select("#mapVis svg").attr("height", 500);

}


// Signal map selection
MapVis.prototype.selectionMade = function(state) {
    // if the selection has changed
    if (this.currentSelection != state || this.setMode()) {
        $(this.mapEventHandler).trigger("selectionChanged", { state: state });
        this.currentSelection = state;
    }
}

MapVis.prototype.setMode = function() {
    var val = document.querySelector('input[name="breakdown"].active').getAttribute("data-b");
    var isDifferent = (this.mode !== val);
    this.mode = val;
    return isDifferent;
}


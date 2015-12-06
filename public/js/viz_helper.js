/**
 * This file contains numerous helper functions used throughout the application.
 */

var VizHelper = {
	toDollars: function(x) { // courtesy of http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
		while (/(\d+)(\d{3})/.test(x.toString())){
	      x = x.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	    }
	    return '$' + x;
	},

	isEasternState: function(state) {
		// stop tooltips from going over page width
		var easternStates = ["MI","WI","IL","KY","TN","AL","GA","FL","SC","NC","VA","WV","MD",
		"DE","RI","NJ","PA","NY","MA","CT","VT","NH","ME","OH"];
		for (var i = 0; i < easternStates.length; i++) {
			if (state === easternStates[i]) {
				return true;
			}
		}
		return false;
	},

	compareTotal: function(a,b) {
	    if (a.total < b.total) {
	      	return 1;
	    }
	    if (a.total > b.total) {
	      	return -1;
	    }
	    return 0;
	},
    comparePAC: function(a,b) {
	    if (a.pac < b.pac) {
	    	return 1;
	    }
	    if (a.pac > b.pac) {
	      	return -1;
	    }
	    return 0;
	},
  	compareIndivs: function(a,b) {
	    if (a.indivs < b.indivs) {
	      	return 1;
	    }
	    if (a.indivs > b.indivs) {
	      	return -1;
	    }
	    return 0;
	}
}
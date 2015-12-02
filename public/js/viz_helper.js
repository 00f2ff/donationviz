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
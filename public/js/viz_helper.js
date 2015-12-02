/**
 * This file contains numerous helper functions used throughout the application.
 */

var VizHelper = {
	toDollars: function(x) { // courtesy of http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
		while (/(\d+)(\d{3})/.test(x.toString())){
	      x = x.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	    }
	    return '$' + x;
	}
}
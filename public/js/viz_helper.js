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
		var easternStates = ["MI","WI","IL","KY","TN","AL","GA","SC","NC","VA","WV","MD",
		"DE","RI","NJ","PA","NY","MA","CT","VT","NH","ME","OH"];
		for (var i = 0; i < easternStates.length; i++) {
			if (state === easternStates[i]) {
				return true;
			}
		}
		return false;
	},

	isSouthmostState: function(state) {
		// stop tooltips from going over page height
		var southernStates = ["AL", "HI", "TX", "LA"];
		for (var i = 0; i < southernStates.length; i++) {
			if (state === southernStates[i]) {
				return true;
			}
		}
		return false;
	},

	populateTooltip: function(donation, senator_number) {
		if (donation) {
	        var fullname = donation.senator.name+' ('+donation.senator.party+')',
	        	href = '/senator/'+donation.senator.name,
	        	indivs = this.toDollars(donation.individual),
	        	pac = this.toDollars(donation.pac),
	        	total = this.toDollars(donation.total);
	    } else { // erase previous content
	        var fullname = '',
	        	href = '',
	        	indivs = '',
	        	pac = '',
	        	total = '';
      	}
      	// technically not clickable, but that's ok
        $('#tooltip #senator'+senator_number+' .name').attr('href', href).text(fullname);
        $('#tooltip #senator'+senator_number+' .indivs').text(indivs);
        $('#tooltip #senator'+senator_number+' .pac').text(pac);
        $('#tooltip #senator'+senator_number+' .total').text(total);
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
$(function() {
	$.getJSON("../backend/data/orgNames.json", function(data){

	 	$("#companyList").typeahead({ 
	 		source: data.organizations,
	 		items:'all',
	 		updater: function(item) {
	 			// undo legibility preprocessing to make db-compatible (will make url look kind of weird)
		        window.location.href = '/organization/'+item.replace(/\'/g, "\'\'"); 
		    } 
	 	});
	});
});

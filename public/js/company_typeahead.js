$(function() {
	$.getJSON("../backend/data/orgNames.json", function(data){

	 	$("#companyList").typeahead({ 
	 		source: data.organizations,
	 		items:'all',
	 		updater: function(item) {
		        window.location.href = '/organization/'+item;
		    } 
	 	});
	});
});

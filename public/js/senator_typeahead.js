// call when senator map isn't called
$(function() {
	$.getJSON("../backend/data/stateSenators.json", function(data){
		console.log(data);
		var senators = [];
		for (var state in data) {
			for (var sen in data[state]) {
				senators.push(data[state][sen].name);
			}
		}
	 	$("#senatorList").typeahead({ 
	 		items: 'all', 
		    source: senators, 
		    updater: function(item) {
		      window.location.href = '/senator/'+item.substring(0,item.length-4);
		    } 
	 	});
	});
});

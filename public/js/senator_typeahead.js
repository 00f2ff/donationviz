// call when senator map isn't called
$(function() {
	$.getJSON("../backend/data/stateSenators.json", function(data){
		var senators = {};
		for (var state in data) {
			for (var sen in data[state]) {
				// console.log(data[state][sen].cid)
				senators[data[state][sen].name] = data[state][sen].cid;
			}
		}
	 	$("#senatorList").typeahead({ 
	 		items: 'all', 
		    source: Object.keys(senators), 
		    updater: function(item) {
		      window.location.href = '/senator/'+senators[item];
		    } 
	 	});
	});
});

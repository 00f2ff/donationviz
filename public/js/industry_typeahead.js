$(function() {
	$.getJSON("../backend/data/industry_names.json", function(data){
		// var industry_codes = Object.keys(data);
		var industry_names = []
		for (var code in data) {
			// forward slahes are seen as new part of URL, so convert them into 'and' (industry_names not update with DB)
			data[code] = data[code].replace(/\//g,' & ');
			// grammar check here too...
			if (data[code] === "TV & Movies & Music") {
				data[code] = "TV, Movies & Music";
			}
			industry_names.push(data[code]);
		}
	 	$("#industryList").typeahead({ 
	 		source: industry_names,
	 		items:'all',
	 		updater: function(item) {
		        window.location.href = '/industry/'+item;
		    } 
	 	});
	});
});

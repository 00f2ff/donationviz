  $(function() {

    var data = JSON.parse($('#data-holder').html());
    console.log(data);
    //portrait
    var namequery= data[0].first_name +"+" +data[0].last_name +"+" +"official" + "+" +"photo";
    var photoQuery="https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q="+namequery+"&imgsz=medium&rsz=1&callback=?";
    $.getJSON(photoQuery, function(data){
    	$("#portrait").attr("src", data.responseData.results[0].unescapedUrl)    	
    })

    //breif info
    var party, state;
    if (data[0].party==="R"){
    	party="Republican"
    }
    else if(data[0].party==="D"){
    	party='Democratic'
    }
    else{
    	party="Independent"
    }
    state=statesAbbv[data[0].state];
    var display= party +" senator from " +state;
    console.log($("#breif").html());
    $("#breif").html(display); 

  });
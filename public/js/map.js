 

/* 
* At some point, refactor this into a normal AJAX call so we can use a loader instead
* of seeing the map flash from black to colored
*/
$(function() {
  $.getJSON("../backend/data/stateSenators.json", function(data){
    console.log(data);
    var senators = [];
    for (var state in data) {    
      //for map
      var party= data[state][0].party+data[state][1].party;
      var color;
      if(party==="RR"){
        color="#F44336";
      } 
      else if (party==="DD"){
        color="#2196F3";
      }
      else if(party==="RD" || party==="DR"){
        color="#673AB7";
      }
      else if(party==="RI"||party==="IR"){
        color="#EF9A9A"
      }
      else if (party==="DI"||party==="ID"){
        color="#90CAF9"
      };
      $("#"+state).css('fill',color);
      if(state==="MI"){
        $("#"+state).next().css('fill',color);
      }
      //for auto complete 
      senators.push(data[state][0].name);
      senators.push(data[state][1].name);
    }
    $('svg g').click(function (e) {
      var xPosition = e.pageX - 30;
      var yPosition = e.pageY - 30;

      $('#tooltip').css({'left': xPosition + "px", 'top': yPosition + "px"});
      var state = $(this).find('path').attr('id');
      console.log(statesAbbv[state]);
      $('#map svg g').css('opacity',0.6);
      $(this).css('opacity',1);

      $('#tooltip #senator1').attr('href', '/senator/'+data[state][0].name)
                             .text(data[state][0].name + ' (' + data[state][0].party + ')');
      $('#tooltip #senator2').attr('href', '/senator/'+data[state][1].name)
                             .text(data[state][1].name + ' (' + data[state][1].party + ')');

      $('#tooltip #state').text(statesAbbv[state]);

      if ($('#tooltip').hasClass('hidden')) { 
        $('#tooltip').removeClass('hidden');
      }

      $('#tooltip').on('mouseleave',function(){
        $('svg g').css('opacity',1);
        $("#tooltip").addClass('hidden');
      });
    });

    $("#senatorList").typeahead({ 
      items: 'all', 
      source: senators, 
      updater: function(item) {
        window.location.href = '/senator/'+item;
      } 
    });

  });
})
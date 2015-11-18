$(function() {
  var data = JSON.parse($('#data-holder').html())[0];
  // console.log(data);

  // right now this is post-processed, but it should be pre-processed, or done with a database call
  var min, max;
  for (var state in data.states) {
    console.log(data.states[state]);
    if (!min) { // base case
      min = data.states[state].total;
      max = data.states[state].total;
    } else if (data.states[state].total < min) {
      min = data.states[state].total;
    } else if (data.states[state].total > max) {
      max = data.states[state].total;
    }
  }
  console.log(min, max);

  // right now this styling is done in js; it should move to CSS for non-index files
  $('svg .state').css('fill','#D8D8D8')

  var color,
      minColor = '#e5f5e0',
      maxColor = '#006d2c';
  for (state2 in data.states) {
    // colors from http://colorbrewer2.org/
    color = d3.scale.linear().domain([min, max]).range([minColor, maxColor])(data.states[state2].total);
    $("#"+state2).css('fill',color);
  }

  // what data should I add to the tooltips (goes in previous loop)? (it's not really connected to senator atm)
  $('svg g').click(function (e) {
      var xPosition = e.pageX - 30;
      var yPosition = e.pageY - 30;

      $('#tooltip').css({'left': xPosition + "px", 'top': yPosition + "px"});
      var state = $(this).find('path').attr('id');
      console.log(statesAbbv[state]);
      $('#map svg g').css('opacity',0.6);
      $(this).css('opacity',1);

      $('#tooltip #indivs').text('$'+data.states[state].indivs); // add commas
      $('#tooltip #pac').text('$'+data.states[state].pac);

      $('#tooltip #state').text(statesAbbv[state]);

      if ($('#tooltip').hasClass('hidden')) { 
        $('#tooltip').removeClass('hidden');
      }

      $('#tooltip').on('mouseleave',function(){
        $('svg g').css('opacity',1);
        $("#tooltip").addClass('hidden');
      });
  });



  function compareTotal(a,b) {
    if (a.total < b.total)
      return 1;
    if (a.total > b.total)
      return -1;
    return 0;
  }
  function comparePAC(a,b) {
    if (a.pac < b.pac)
      return 1;
    if (a.pac > b.pac)
      return -1;
    return 0;
  }
  function compareIndivs(a,b) {
    if (a.indivs < b.indivs)
      return 1;
    if (a.indivs > b.indivs)
      return -1;
    return 0;
  }

  // data.donations.sort(compareTotal); // didn't work?
  // console.log(data.donations);
})
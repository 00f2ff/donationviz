$(function() {
  var data = JSON.parse($('#data-holder').html())[0];
  // if no data for this company
  if (!data || data.total === 0) { 
    data = {states: []} 
    // remove gradient
    $('#gradient-wrapper').remove();
  }
  console.log(data);
  // right now this is post-processed, but it should be pre-processed, or done with a database call
  var min, max, grandTotal = 0;
  for (var state in data.states) {
    if (!min) { // base case
      min = data.states[state].total;
      max = data.states[state].total;
    } else if (data.states[state].total < min) {
      min = data.states[state].total;
    } else if (data.states[state].total > max) {
      max = data.states[state].total;
    }
    grandTotal += data.states[state].total;
  }
  $('.total-contributions').text(VizHelper.toDollars(grandTotal));
  $('#gradient-wrapper #min').text(VizHelper.toDollars(min));
  $('#gradient-wrapper #max').text(VizHelper.toDollars(max))
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

  $('svg g').on('mousemove', function (e) {
    var xPosition = e.pageX + 10;
    var yPosition = e.pageY + 10;

    // style (so doesn't go over page width)
    var state = $(this).find('path').attr('id');

    if (VizHelper.isEasternState(state)) {
      var tooltipWidth = $('#tooltip').width();
      $('#tooltip').css({'left': (xPosition - tooltipWidth - 35)+ "px", 'top': yPosition + "px"});
    } else if (VizHelper.isSouthmostState(state)) { // causes flash, but meh
      var tooltipHeight = $('#tooltip').height();
      $('#tooltip').css({'left': xPosition+ "px", 'top': (yPosition - tooltipHeight - 25) + "px"});
    } else if (state === "FL") { // because florida is a special snowflake
      var tooltipWidth = $('#tooltip').width();
      var tooltipHeight = $('#tooltip').height();
      $('#tooltip').css({'left': (xPosition - tooltipWidth - 35)+ "px", 'top': (yPosition - tooltipHeight - 25) + "px"});
    } else {
      $('#tooltip').css({'left': xPosition + "px", 'top': yPosition + "px"});
    }
  
    // Only allow changes / tooltip if state is in data
    if (data.states[state]) {
      $('#map svg g').css('opacity',0.6);
      $(this).css('opacity',1);
      // populate table
      var donation1 = data.states[state].donations[0],
          donation2 = data.states[state].donations[1];

      VizHelper.populateTooltip(donation1, 1);
      VizHelper.populateTooltip(donation2, 2);

      $('#tooltip #state').text(statesAbbv[state]);

      if ($('#tooltip').hasClass('hidden')) { 
        $('#tooltip').removeClass('hidden');
      }

    }
  }).on('mouseleave',function(){
    $('svg g').css('opacity',1);
    $("#tooltip").addClass('hidden');
  });

  /* PIE CHARTS 
   * Broken down by source and party
   */

  function aggregateData() { // refactored to add some to minmax fxn?
    var result = {PAC: 0, Individual: 0, Total: 0, Democrat: 0, Republican: 0, Independent: 0}
    for (var state in data.states) {
      var stateDonation = data.states[state];
      // by state
      result.PAC += stateDonation.pac;
      result.Individual += stateDonation.individual;
      result.Total += stateDonation.total;
      // by party
      for (var i = 0; i < stateDonation.donations.length; i++) {
        var senatorDonation = stateDonation.donations[i];
        var party = senatorDonation.senator.party;
        if (party === 'R') {
          result.Republican += senatorDonation.total;
        } else if (party === 'D') {
          result.Democrat += senatorDonation.total;
        } else if (party === 'I') {
          result.Independent += senatorDonation.total;
        }
      }
    }
    return result;
  }
  var totals = aggregateData();

  function drawPieChart(totals, breakdown) { 
    var color = {},
        pieData;
    if (breakdown === 'source') {
      color.PAC = "#B6B6B6";
      color.Individual = "#212121";
      pieData = [{
        name: "PAC", 
        value: totals.PAC,
        amount: Math.round(totals.PAC/(totals.PAC+totals.Individual)*100)
      }, 
      {
        name: "Individual",
        value: totals.Individual,
        amount: Math.round(totals.Individual/(totals.PAC+totals.Individual)*100)
      }];
    } else if (breakdown === 'party') {
      color.Democrat = 'rgb(33, 150, 243)';
      color.Republican = 'rgb(244, 67, 54)';
      color.Independent = '#FFC107';
      pieData = [{
        name: "Democrat", 
        value: totals.Democrat,
        amount: Math.round(totals.Democrat/(totals.Democrat+totals.Republican+totals.Independent)*100)
      }, 
      {
        name: "Republican", 
        value: totals.Republican,
        amount: Math.round(totals.Republican/(totals.Democrat+totals.Republican+totals.Independent)*100)
      }, 
      {
        name: "Independent", 
        value: totals.Independent,
        amount: Math.round(totals.Independent/(totals.Democrat+totals.Republican+totals.Independent)*100)
      }];
    }

    var width = 150,
        height = 180,
        radius = Math.min(width, height) / 2;

    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

    var svg = d3.select("#pie-pan").append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("margin-top", "-30px")
      .attr("id", "pie-"+breakdown)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var title;
    breakdown === 'party' ? title = "Donations by Party" : title = "Donations by Type";
    svg.append("text")
        .attr("x", 0)             
        .attr("y", + (height/2 - 10))
        .attr("text-anchor", "middle")  
        .style("font-size", "14px") 
        .text(title);

    var g = svg.selectAll(".arc")
      .data(pie(pieData))
    .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color[d.data.name]; })
      .attr("id", function(d) { return d.data.name; })
      .attr("data-value", function(d) { if (d.value > 0) return d.value; })
      .attr("data-amount", function(d) { if (d.data.amount > 0) return d.data.amount; });

    g.on("mousemove", function (e) {
      var xPosition = d3.event.layerX + 10; // doesn't use standard JS event
      var yPosition = d3.event.layerY + 10;
      // style (make sure tooltip doesn't go over page width)
      if (breakdown === 'source') {
        $('#tooltip--'+breakdown).css({'left': xPosition + "px", 'top': yPosition + "px"});
      } else {
        var tooltipWidth = $('#tooltip--'+breakdown).width();
        // magic numbers abound
        $('#tooltip--'+breakdown).css({'left': (xPosition - tooltipWidth - 35) + "px", 'top': yPosition + "px"});
      }
      
      g.style('opacity',0.6);
      $(this).css('opacity',1);

      if ($('#tooltip--'+breakdown).hasClass('hidden')) { 
        $('#tooltip--'+breakdown).removeClass('hidden');
      }

      var path = $(this).find('path');
      var modifier;
      breakdown === 'party' ? modifier = 'to' : modifier = 'from';
      $('#tooltip--'+breakdown+' h4').text('Donations '+modifier+' '+ path.attr('id')+'s');
      $('#tooltip--'+breakdown+' h5').text(VizHelper.toDollars(path.data('value')) + ' ('+path.data('amount')+'%)');

      

    }).on('mouseleave',function(){
      g.style('opacity',1);
      $('#tooltip--'+breakdown).addClass('hidden');
    });

    // add legends
    if (breakdown === 'source') {
      var sourceLegend = $('<div class="legend-wrapper">\
                            <div class="legend-row">\
                              <div class="legend" style="background-color: rgb(33, 33, 33)"></div>\
                              <div class="legend-text">Individual Donations</div>\
                            </div>\
                            <div class="legend-row">\
                              <div class="legend" style="background-color: rgb(182, 182, 182)"></div>\
                              <div class="legend-text">PAC Donations</div>\
                            </div>\
                          </div>');
      $('#both-legends-wrapper').append(sourceLegend)
    } else {
      var partyLegend = $('<div class="legend-wrapper">\
                            <div class="legend-row">\
                              <div class="legend" style="background-color: rgb(244, 67, 54)"></div>\
                              <div class="legend-text">Donations to Republicans</div>\
                            </div>\
                            <div class="legend-row">\
                              <div class="legend" style="background-color: rgb(33, 150, 243)"></div>\
                              <div class="legend-text">Donations to Democrats</div>\
                            </div>\
                            <div class="legend-row">\
                              <div class="legend" style="background-color: #FFC107"></div>\
                              <div class="legend-text">Donations to Independents</div>\
                            </div>\
                          </div>');
      $('#both-legends-wrapper').append(partyLegend)
    }

  }

  // function createLegend(type) {
  //   var legendWrapper = $('<div class="legend-wrapper"></div>');
  //   var legend1 = $('<div class="legend"></div>');
  //   var legend2 = $('<div class="legend"></div>');
  //   var legendText1 = $('<div class="legend-text"></div>');
  //   var legendText2 = $('<div class="legend-text"></div>');
  //   if (type === 'source') {
  //     legend1.style('background-color', 'rgb(33, 33, 33)');
  //     legendText1.text('Individual Donations');
  //     legend2.style('background-color', 'rgb(182, 182, 182)');
  //     legendText2.text('PAC Donations');
  //   } else {

  //   }
  // }

  if (Object.keys(data.states).length > 0) {
    drawPieChart(totals, 'source'); // add legend below this (jQuery)
    // var sourceLegend = $('<div class="legend-wrapper">\
    //                         <div class="legend-row">\
    //                           <div class="legend" style="background-color: rgb(33, 33, 33)"></div>\
    //                           <div class="legend-text">Individual Donations</div>\
    //                         </div>\
    //                         <div class="legend-row">\
    //                           <div class="legend" style="background-color: rgb(182, 182, 182)"></div>\
    //                           <div class="legend-text">PAC Donations</div>\
    //                         </div>\
    //                       </div>');
    
    // $('#pie-source').after(createLegend('source'));
    drawPieChart(totals, 'party'); // add legend below this
    // var partyLegend = $('<div class="legend-wrapper">\
    //                         <div class="legend-row">\
    //                           <div class="legend" style="background-color: rgb(244, 67, 54)"></div>\
    //                           <div class="legend-text">Donations to Republicans</div>\
    //                         </div>\
    //                         <div class="legend-row">\
    //                           <div class="legend" style="background-color: rgb(33, 150, 243)"></div>\
    //                           <div class="legend-text">Donations to Democrats</div>\
    //                         </div>\
    //                         <div class="legend-row">\
    //                           <div class="legend" style="background-color: #FFC107"></div>\
    //                           <div class="legend-text">Donations to Independents</div>\
    //                         </div>\
    //                       </div>');
    // $('#both-legends-wrapper').append(sourceLegend)
    // $('#both-legends-wrapper').append(partyLegend)
    
    // $('#pie-party').after(createLegend('party'));
  }

})
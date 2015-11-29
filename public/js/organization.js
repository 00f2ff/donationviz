$(function() {
  var data = JSON.parse($('#data-holder').html())[0]; // the database is flawed -- repeated senators

  // right now this is post-processed, but it should be pre-processed, or done with a database call
  var min, max;
  for (var state in data.states) {
    if (!min) { // base case
      min = data.states[state].total;
      max = data.states[state].total;
    } else if (data.states[state].total < min) {
      min = data.states[state].total;
    } else if (data.states[state].total > max) {
      max = data.states[state].total;
    }
  }

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

      // style
      $('#tooltip').css({'left': xPosition + "px", 'top': yPosition + "px"});
      var state = $(this).find('path').attr('id');
      // Only allow changes / tooltip if state is in data
      if (data.states[state]) {
        $('#map svg g').css('opacity',0.6);
        $(this).css('opacity',1);
        // populate table
        var donation1 = data.states[state].donations[0],
            donation2 = data.states[state].donations[1],
            fullname;
        if (donation1) {
          fullname = donation1.senator.name+' ('+donation1.senator.party+')';
          $('#tooltip #senator1 .name').attr('href', '/senator/'+donation1.senator.name)
                               .text(fullname);
          $('#tooltip #senator1 .indivs').text(donation1.individual);
          $('#tooltip #senator1 .pac').text(donation1.pac);
          $('#tooltip #senator1 .total').text(donation1.total);
        }
        if (donation2) {
          fullname = donation2.senator.name+' ('+donation2.senator.party+')';
          $('#tooltip #senator2 .name').attr('href', '/senator/'+donation2.senator.name)
                               .text(fullname);
          $('#tooltip #senator2 .indivs').text(donation2.individual);
          $('#tooltip #senator2 .pac').text(donation2.pac);
          $('#tooltip #senator2 .total').text(donation2.total);
        }

        $('#tooltip #state').text(statesAbbv[state]);

        if ($('#tooltip').hasClass('hidden')) { 
          $('#tooltip').removeClass('hidden');
        }

        $('#tooltip').on('mouseleave',function(){
          $('svg g').css('opacity',1);
          $("#tooltip").addClass('hidden');
        });
      }
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
      color.PAC = "#fde0dd";
      color.Individual = "#c51b8a";
      pieData = [{name: "PAC", value: totals.PAC}, {name: "Individual", value: totals.Individual}];
    } else if (breakdown === 'party') {
      color.Democrat = 'rgb(33, 150, 243)';
      color.Republican = 'rgb(244, 67, 54)';
      color.Independent = '#ffffbf';
      pieData = [{name: "Democrat", value: totals.Democrat}, {name: "Republican", value: totals.Republican}, {name: "Independent", value: totals.Independent}];
    }

    var width = 400,
      height = 400,
      radius = Math.min(width, height) / 2;

    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

    var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    var g = svg.selectAll(".arc")
      .data(pie(pieData))
    .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color[d.data.name]; });

    g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { if (d.value > 0) return d.value; });

  }

  drawPieChart(totals, 'source');
  drawPieChart(totals, 'party');



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
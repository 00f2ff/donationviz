$(function() {
  var data = JSON.parse($('#data-holder').html())[0];
  // console.log(data);

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

      // style
      $('#tooltip').css({'left': xPosition + "px", 'top': yPosition + "px"});
      var state = $(this).find('path').attr('id');
      // Only allow changes / tooltip if state is in data
      if (data.states[state]) {
        $('#map svg g').css('opacity',0.6);
        $(this).css('opacity',1);

        // populate table
        console.log(data.states[state].donations);
        var senator1 = data.states[state].donations[0],
            senator2 = data.states[state].donations[1],
            fullname;
        if (senator1) {
          console.log(senator1);
          fullname = senator1.first_name+' '+senator1.last_name+' ('+senator1.party+')';
          $('#tooltip #senator1 .name').attr('href', '/senator/'+fullname.substring(0,fullname.length-4))
                               .text(fullname);
          $('#tooltip #senator1 .indivs').text(senator1.indivs);
          $('#tooltip #senator1 .pac').text(senator1.pac);
          $('#tooltip #senator1 .total').text(senator1.total);
        }
        if (senator2) {
          fullname = senator2.first_name+' '+senator2.last_name+' ('+senator2.party+')';
          $('#tooltip #senator2 .name').attr('href', '/senator/'+fullname)
                               .text(fullname);
          $('#tooltip #senator2 .indivs').text(senator2.indivs);
          $('#tooltip #senator2 .pac').text(senator2.pac);
          $('#tooltip #senator2 .total').text(senator2.total);
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

  function aggregateData() {
    var result = {PAC: 0, Individual: 0, Total: 0, Democrat: 0, Republican: 0, Independent: 0}
    for (var i in data.donations) {
      var don = data.donations[i],
          pac = +don.pac,
          indivs = +don.indivs,
          total = pac + indivs;
      result.PAC += pac;
      result.Individual += indivs;
      result.Total += total;
      if (don.party === 'R') {
        result.Republican += total;
      } else if (don.party === 'D') {
        result.Democrat += total;
      } else if (don.party === 'I') {
        don.Independent += total;
      }
    }
    return result;
  }
  var totals = aggregateData();

  // NOTE: I don't think Independent donations made it into org / database
  // review code that loads org file to make sure it's comprehensive

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
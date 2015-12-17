$(function() {

    var data = JSON.parse($('#data-holder').html());
    //portrait
    var namequery= data[0].name.replace(" ","%20"); // API is no longer available error

    $.ajax
    ({
      type: "GET",
      url: "https://api.datamarket.azure.com/Bing/Search/Image?Query=%27"+namequery+"%20official%20photo%27&ImageFilters=%27Size%3AMedium%2BAspect%3ATall%27&$format=json&$top=1",
      dataType: 'json',
        headers: {
      "Authorization": "Basic " + btoa("" + ":" + "oYxTtJDIDAU56O2bvsLAqOep8hzXV8XP4b900gCUyig")
      },
      success: function (data){
        console.log(data);
              $("#portrait").attr("src", data.d.results[0].MediaUrl)     
      }
    });

    //breif info
    var party, state;
    if (data[0].party==="R"){
      party="Republican"
    }
    else if(data[0].party==="D"){
      party='Democrat'
    }
    else{
      party="Independent"
    }
    state=statesAbbv[data[0].state];
    var display= party +", " +state;
    $("#breif").html(display); 
 

  //Top Contributors
  for(var i =0;i<5;i++){
    var orgName=data[0].donations[i].organization;
    var orgLink=data[0].donations[i].organization.replace(" ","%20");
    var total=data[0].donations[i].total;
    var individual=data[0].donations[i].individual;
    var pac =data[0].donations[i].pac;
    $("#topContributor").append("<div>"+"<h4><a href='http://localhost:50000/organization/"+orgLink+"'>"+orgName+"</a>"+"<b class='total-contributions'> Total "+VizHelper.toDollars(total)+"</b></h4>"+"<h5>PAC: <b class='total-contributions'>"+VizHelper.toDollars(pac)+"</b> Individual <b class='total-contributions'>"+VizHelper.toDollars(individual) + "</b></h5></div>");
  }

  //Total
  var totalIndividual=0;
  var totalPAC=0
  for(var i=0;i<100;i++){
    totalIndividual+=data[0].donations[i].individual;
    totalPAC+=data[0].donations[i].pac;
    data[0].donations[i].value=data[0].donations[i].total;
  }
  var totalAmount=totalPAC+totalIndividual;
$( "#totalContribution" ).after( "<h2 class='total-contributions'>"+VizHelper.toDollars(totalAmount)+"</h2>" );

  var orgData={children:data[0].donations.slice(0,20)};
  var industryData={children:data[0].industry_donations};

  console.log("org"+JSON.stringify(orgData));
  console.log("ind"+JSON.stringify(industryData));
//Bubble chart
function drawBubbleChart(data, breakdown){
var diameter = 560,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5)
    .value(function value(d) {
      return d.total;
    });

var svg = d3.select("#"+breakdown).append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

//d3.json("flare.json", function(error, root) {
  //if (error) throw error;
  var root =data;
  var index;

  var node = svg.selectAll(".node")
      .data(bubble.nodes(root))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  breakdown === 'org' ? index = "organization" : index = "industry_name";

  node.append("data")
      .text(function(d) { return d[index]; });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return color(d[index]); });

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { return VizHelper.toDollars(d.total+""); });
    // var g = svg.selectAll(".node")

      node.on("mousemove", function (e) {
      var xPosition = d3.event.layerX; // doesn't use standard JS event
      var yPosition = d3.event.layerY+12;
      // style (make sure tooltip doesn't go over page width)
      if (breakdown === 'org') {
        $('#tooltip--'+breakdown).css({'left': xPosition + "px", 'top': yPosition + "px"});
      }
      else{
        $('#tooltip--'+breakdown).css({'left': xPosition + "px", 'top': yPosition + "px"});
      }
      
      node.style('opacity',0.6);
      $(this).css('opacity',1);

      if ($('#tooltip--'+breakdown).hasClass('hidden')) { 
        $('#tooltip--'+breakdown).removeClass('hidden');
      }

      var path = $($(this)[0]).text()+"";
      // this is a mess
      $('#tooltip--'+breakdown+' h5#'+breakdown).text(path.replace("&amp;","&").split('$')[0]);
      $('#tooltip--'+breakdown+' h5#'+breakdown+'-value').text('$'+path.split('$')[1])
      }).on('mouseleave',function(){
      node.style('opacity',1);
      $('#tooltip--'+breakdown).addClass('hidden');
    });
  }

drawBubbleChart(orgData,'org');
drawBubbleChart(industryData,'industry')

$(".bubble .node:nth-child(1)").remove();

function drawPieChart(breakdown) { 
    var color = {},
        pieData;
      color.PAC = "#fde0dd";
      color.Individual = "#c51b8a";
      pieData = [{name: "PAC", value: totalPAC,amount: Math.round(totalPAC/totalAmount*100)}, {name: "Individual", value: totalIndividual,amount: Math.round(totalIndividual/totalAmount*100)}];
    

    var width = 300,
        height = 300,
        radius = Math.min(width, height) / 2;

    var arc = d3.svg.arc()
      .outerRadius(radius)
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

    var g = svg.selectAll(".arc")
      .data(pie(pieData))
    .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color[d.data.name]; })
      .attr("id", function(d) { return d.data.name; })
      .attr("data-value", function(d) { if (d.value > 0) return d.value; });

    g.on("mousemove", function (e) {
      var xPosition = d3.event.layerX-35; // doesn't use standard JS event
      var yPosition = d3.event.layerY+10;
      // style (make sure tooltip doesn't go over page width)
      if (breakdown === 'source') {
        $('#tooltip--'+breakdown).css({'left': xPosition + "px", 'top': yPosition + "px"});
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
      $('#tooltip--'+breakdown+' h5').text(VizHelper.toDollars(path.data('value')));
      }).on('mouseleave',function(){
      g.style('opacity',1);
      $('#tooltip--'+breakdown).addClass('hidden');
    });

      g.append("text")
      .attr("transform", function(d) { 
        return "translate(" + arc.centroid(d,i)
         + ")"; }) 
      .text(function(d) { return d.data.amount +"%"; });
  }
  drawPieChart("source");
});
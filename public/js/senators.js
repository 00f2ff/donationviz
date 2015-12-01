  $(function() {

    var data = JSON.parse($('#data-holder').html());
    //portrait
    var namequery= data[0].name.replace(/ /,"+") +"+" +"official" + "+" +"photo";
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
    $("#breif").html(display); 
 

  //Top Contributors
  for(var i =0;i<5;i++){
  	var orgName=data[0].donations[i].organization;
  	var total=data[0].donations[i].total;
  	var individual=data[0].donations[i].individual;
  	var pac =data[0].donations[i].pac;
  	$("#topContributor").append("<div>"+orgName +" <b>Total $ "+total+"</b>"+"<br>Pac: "+pac+" Individual "+individual + "</div>");
  }


  //Pie Chart
  var totalIndividual=0;
  var totalPAC=0
  for(var i=0;i<100;i++){
    totalIndividual+=data[0].donations[i].individual;
    totalPAC+=data[0].donations[i].pac;
  }
  var totalAmount=totalPAC+totalIndividual;

  var dataset = [
  { label: 'Individual', amount: Math.round(totalIndividual/totalAmount*100) }, 
  { label: 'PAC', amount: Math.round(totalPAC/totalAmount*100) }
];

  var width = 360;
  var height = 360;
  var radius = Math.min(width, height) / 2;     
  var color = d3.scale.category10();

  var svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

  var arc = d3.svg.arc()
  .outerRadius(radius);

  var pie = d3.layout.pie()
  .value(function(d) { return d.amount; })
  .sort(null);

  var labelArc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius - 150);

  var g = svg.selectAll(".arc")
  .data(pie(dataset))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.amount); });

  g.append("text")
      .attr("transform", function(d) { 
        return "translate(" + labelArc.centroid(d,i)
         + ")"; }) 
      .text(function(d) { return d.data.label +" "+ d.data.amount +"%"; });

  });
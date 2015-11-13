$(function() {
  var statesAbbv={
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
  };

  // at some point, refactor this as an AJAX call so we can initialize the map as hidden, 
  // stick a beforeLoad in with a loading animation, and then unhide the map when all the 
  // colors are loaded in. This will avoid that black flash that occurs due to default coloring
  $.getJSON("./backend/data/stateSenators.json", function(data){
    for (var state in data) {
      var senator1=data[state][0].name,
          senator2=data[state][1].name,
          party=senator1.charAt(senator1.length-2)+senator2.charAt(senator2.length-2),
          color;

      if(party==="RR"){
        color="#F44336";
      } else if (party==="DD"){
        color="#2196F3";
      } else if(party==="RD" || party==="DR"){
        color="#673AB7";
      } else if(party==="RI"||party==="IR"){
        color="#EF9A9A"
      } else if (party==="DI"||party==="ID"){
        color="#90CAF9"
      };

      $("#"+state).css('fill',color);

      if(state==="MI"){ // why?
        $("#"+state).next().css('fill',color);
      }
    }

    $('svg g').click(function (e) {
      var xPosition = e.pageX - 30,
          yPosition = e.pageY - 30,
          state = $(this).find('path').attr('id');

      $('#tooltip').css({'left': xPosition + "px", 'top': yPosition + "px"});
      console.log(statesAbbv[state]);
      $('#map svg g').css('opacity',0.6);

      $(this).css('opacity',1);
      $('#tooltip #senator1').text(data[state][0].name);
      $('#tooltip #senator2').text(data[state][1].name);
      $('#tooltip #state').text(statesAbbv[state]);

      if ($('#tooltip').hasClass('hidden')) { 
        $('#tooltip').removeClass('hidden');
      }

      $('#tooltip').on('mouseleave',function(){
        $('svg g').css('opacity',1);
        $("#tooltip").addClass('hidden');
      });
    });

  });

})
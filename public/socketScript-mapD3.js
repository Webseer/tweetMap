var socket = io.connect(window.location.hostname);


var map = new L.Map("map", {center: [0, 0],zoom: 2}),
    mapLink ='<a href="http://openstreetmap.org">OpenStreetMap</a>';
            L.tileLayer(
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; ' + mapLink + ' Contributors',
                maxZoom: 18,
                }).addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

function animate(d)
{
  var point = svg.append("g")
          .append("circle")
          .attr("cx", latlonPt(+d.Latitude,+d.Longitude).x)
          .attr("cy", latlonPt(+d.Latitude,+d.Longitude).y)
          .attr("r",2).attr("opacity",3)
          .attr("fill",d.color);

  blink(point);
}

function blink(point)
{
  point.transition().duration(1500).style("opacity",0).attr("r",10);
  point.transition().duration(150).style("opacity",1).attr("r",2);
} 

var transform = d3.geo.transform({point: projectPoint}),
    projection = d3.geo.mercator()
          .translate([1200 / 2, 800 / 2]),
    path = d3.geo.path().projection(transform);

map.on("viewreset", reset);
reset([{Latitude:90,
  Longitude:90}]);

function latlonPt(lt,ln)
{
  return map.latLngToLayerPoint(new L.LatLng(lt, ln));
}

// Reposition the SVG to cover the features.
function reset(data) {
  coll = {features:data};
  var bounds = path.bounds(coll),
      topLeft = bounds[0],
      bottomRight = bounds[1];

  svg.attr("width", 1200)
  .attr("height", 800)
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");
  }

  // Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

socket.on('message', function(json) 
{
    data = JSON.parse(json);
    var color = "#fff";
    console.log(data);
    geo = data.geo.coordinates;
    text = data.text
    for (var i = 0; i < tracks.length; i++)
    {
      var track = tracks[i].toLowerCase();

      if(text&&text.toLowerCase().indexOf(track)!=-1)
      {
        console.log(track);
        color = colorMap[track];
      }
    };
    animate({
      Latitude:geo[0],
      Longitude:geo[1],
      color:color

    });
});


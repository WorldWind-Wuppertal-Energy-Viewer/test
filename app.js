var wwd = new WorldWind.WorldWindow("myaa");
var layers = [
  {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
  {layer: new WorldWind.BingRoadsLayer(), enabled: false},
  {layer: new WorldWind.OpenStreetMapImageLayer(null), enabled: false},
  {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
  {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true},
  {layer: new WorldWind.RenderableLayer("3D Buildings"), enabled: true},
];
/*
//var serviceAddress = "http://gis.sinica.edu.tw/worldmap/wmts";
var serviceAddress = "https://tiles.maps.eox.at/wmts";
serviceAddress += "?service=wmts";
serviceAddress += "&request=getcapabilities";

// Create the callback parsing function
var parseXml = function (xml) {
       
  // Create a WmsCapabilities object from the returned xml
  var wmtsCapabilities = new WorldWind.WmtsCapabilities(xml);

  // Simulate a user selection of a particular layer to display
  var layerForDisplay = wmtsCapabilities.getLayer("osm");
  var layerConfig = WorldWind.WmtsLayer.formLayerConfiguration(layerForDisplay);

  // Create the layer
  //layers[1] = {layer: new WorldWind.WmtsLayer(layerConfig), enabled: false};
  wtms_obj = {layer: new WorldWind.WmtsLayer(layerConfig), enabled: false};
  layers.splice(1,0,wtms_obj);
  //wwd.addLayer(wmtsLayer);
};

// Create an asynchronous request to retrieve the data (XMLHttpRequest is not required)
var xhr = new XMLHttpRequest();
xhr.open("GET", serviceAddress);
xhr.onreadystatechange = function () {
	if (xhr.readyState === XMLHttpRequest.DONE) {
  	if (xhr.status === 200) {
    	parseXml(xhr.responseXML);
    }
  }
};
xhr.send();

wwd.addLayer(new WorldWind.OpenStreetMapImageLayer());
wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
var renderableLayer = new WorldWind.RenderableLayer();
wwd.addLayer(renderableLayer);
*/

for (var l = 0; l < layers.length; l++) {
  layers[l].layer.enabled = layers[l].enabled;
  wwd.addLayer(layers[l].layer);
}
var sLL = synchronizeLayerList(wwd)
$('#select-data').append($('<option>', {value: "Energy",text: "Energy (kWh)"}));
$('#select-data').append($('<option>', {value: "Water",text: "Water (l)"}));
$('#select-data').append($('<option>', {value: "GWP",text: "GWP in (gCO2eq)"}));
$('#select-data').append($('<option>', {value: "Empty",text: "Empty"}));

//var aaPosition = new WorldWind.Position(50.7746387992579, 6.0783691646013125, 0);
//var aa = new WorldWind.Placemark(aaPosition);
//aa.altitudeMode = WorldWind.CLAMP_TO_GROUND;

// layer = [];
layer_array = {};
//function add_collada({renderableLayer})
//add_collada({renderableLayer:renderableLayer})
function add_collada(key,y_origin,x_origin,z_origin){  
  var position = new WorldWind.Position(y_origin,x_origin,z_origin);
  var wupper = new WorldWind.Placemark(position);
  wupper.altitudeMode = WorldWind.CLAMP_TO_GROUND;
  var colladaLoader = new WorldWind.ColladaLoader(position);
  var modelAddress = 'data/'+key+'.dae';
  colladaLoader.load(modelAddress, function (model) {
    //model.scale = 1;
    model.materials.stuff = {id: 'stuff', diffuse: new Float32Array([255,255,255,0.5])};
    model.meshes['shape0-lib'].buffers[0].material = 'stuff';
    model.nodes[0].materials = [{id: 'stuff',symbol: 'stuff'}];
    wwd.layers[5].addRenderable(model);
  });
  //layer_array.push(colladaLoader)
  layer_array[key] = colladaLoader
};

$.getJSON("wupper_meta.json", function(result) {
  for (var key in result){
    add_collada(key,result[key]['y_origin'],result[key]['x_origin'],result[key]['z_origin']);
  }
});


myVar = setInterval(function(){myTimer(source='energy.json',color_start='lime', color_end='red');},  600);
wwd.goTo(new WorldWind.Position(  51.279994, 7.214101  , 900.0));


var screenText, screenOffset;
var textLayer = new WorldWind.RenderableLayer("Screen Text");
screenOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.06, WorldWind.OFFSET_FRACTION, 0.95);
screenText = new WorldWind.ScreenText(screenOffset, "0000-00-00T00:00:00");
textLayer.addRenderable(screenText);
wwd.addLayer(textLayer);

$("#select-data").change(function () {
  var str = "";
  $("select option:selected").each(function () {
      str = $(this).text();
  });

  if (str === "Energy (kWh)") {
    clearInterval(myVar);
    myVar = setInterval(function(){myTimer(source='energy.json',color_start='lime', color_end='red');},  600);
  } ;
  if (str === "Water (l)") {
    clearInterval(myVar);
    myVar = setInterval(function(){myTimer(source='water.json',color_start='lime', color_end='blue');},  600);
  } ;
  if (str === "GWP in (gCO2eq)") {
    clearInterval(myVar);
    myVar = setInterval(function(){myTimer(source='co2.json',color_start='lime', color_end='black');},  600);
  } ;
  if (str === "Empty") {
    clearInterval(myVar);
    for (i = 1; i <=10; i++){
      var ctx = document.getElementById('no'+i+'cID').getContext('2d');
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.fillRect(0, 0, 20, 20);
      document.getElementById('no'+i+'sID').innerHTML = '';
      document.getElementById('no'+i+'eID').innerHTML = '';
    };
    //for ( i = 0; i < layer_array.length; i++){
    //  layer_array[i].scene.materials.stuff.diffuse = new Float32Array([255,255,255,1]);
    //};
    for(var key in layer_array) {
      layer_array[key].scene.materials.stuff.diffuse = new Float32Array([255,255,255,1]);
    }

    wwd.redraw();
  }
})

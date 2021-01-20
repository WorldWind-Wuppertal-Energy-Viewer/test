/*
 * Copyright 2003-2006, 2009, 2017, United States Government, as represented by the Administrator of the
 * National Aeronautics and Space Administration. All rights reserved.
 *
 * The NASAWorldWind/WebWorldWind platform is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Illustrates how to load and display a GeoTiff file.
 */

requirejs(['./WorldWindShim',
           './LayerManager',
           './coloring',
           './draw_legend',
           './Rainbow'],
    function (WorldWind,
              LayerManager,
              coloring,
              draw_legend,
              Rainbow) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        var wwd = new WorldWind.WorldWindow("canvasOne");
        var layers = [
            {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: false},
            {layer: new WorldWind.BingRoadsLayer(), enabled: false},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true},
            {layer: new WorldWind.RenderableLayer("3D Buildings"), enabled: true}
          ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        $('#select-data').append($('<option>', {value: "Energy",text: "Energy (kWh)"}));
        $('#select-data').append($('<option>', {value: "Water",text: "Water (l)"}));
        $('#select-data').append($('<option>', {value: "GWP",text: "GWP in (gCO2eq)"}));
        $('#select-data').append($('<option>', {value: "Empty",text: "Empty"}));
        $('#select-data').append($('<option>', {value: "Runoff",text: "Surface Runoff (m)"}));

        var layer_array = {};
        var workers = 0, queue = [];
        function do_work() {
          if (workers < 15 && queue.length>0) {
            workers++;
            queue.shift()(()=> {
              workers--;
              do_work()
            })
          }
        };

        function add_collada(key,y_origin,x_origin,z_origin){  
            var position = new WorldWind.Position(y_origin,x_origin,z_origin+15.0);
            var wupper = new WorldWind.Placemark(position);
            //wupper.altitudeMode = WorldWind.CLAMP_TO_GROUND;
            var colladaLoader = new WorldWind.ColladaLoader(position);
            var modelAddress = 'data/'+key+'.dae';
            queue.push((cb) => {
              colladaLoader.load(modelAddress, function (model) {
                if(model){
                  //model.scale = 1;
                  model._entities[0].material = {id: 'stuff', diffuse: new Float32Array([255,255,255,1])};
                  model.displayName = key;
                  model.materials.stuff = {id: 'stuff', diffuse: new Float32Array([255,255,255,1])};
                  model.meshes['shape0-lib'].buffers[0].material = 'stuff';
                  model.nodes[0].materials = [{id: 'stuff',symbol: 'stuff'}];
                  wwd.layers[5].addRenderable(model);
                  layer_array[key] =model;
                } else {
                  console.log(`model not found: ${modelAddress}`)
                }
                cb()
             })
            })
            do_work()
         };

        function myTimer({source,color_start,color_end}) {
          var data = {};
          queue.push((cb) => {
            $.getJSON(source, function(source) {
              if(source){
                for (var key in source){
                    data[key] = source[key];
                    };
                textLayer["renderables"][0]["text"] = data.date;
                delete data.date;
                var rgb_dic = coloring(data,color_start,color_end);
                for (var key in rgb_dic) {
                    //layer_array[key].scene.materials.stuff.diffuse = new Float32Array([rgb_dic[key][0]/255,rgb_dic[key][1]/255,rgb_dic[key][2]/255,1]);
                    layer_array[key]._entities[0].material.diffuse = new Float32Array([rgb_dic[key][0]/255,rgb_dic[key][1]/255,rgb_dic[key][2]/255,1]);
                    };
               } else {
                 console.log(`json not found: ${key}`)
                  }
               cb()
               });
        //wwd.redraw();
        });
          do_work()
          };
          

        $.getJSON("wupper_meta.json", function(result) {
            for (var key in result){
              add_collada(key,result[key]['y_origin'],result[key]['x_origin'],result[key]['z_origin']);
            }
          });

        wwd.goTo(new WorldWind.Position(51.280808, 7.214872, 10000.0));
        
        var screenText, screenOffset;
        var textLayer = new WorldWind.RenderableLayer("Timestamp");
        screenOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.06, WorldWind.OFFSET_FRACTION, 0.95);
        screenText = new WorldWind.ScreenText(screenOffset, "0000-00-00T00:00:00");
        textLayer.addRenderable(screenText);
        textLayer.enabled = true;
        textLayer.showSpinner = false;
        textLayer.hide = true;
        wwd.addLayer(textLayer);

        var geoTiffLayer = new WorldWind.RenderableLayer("Surface Runoff");
        geoTiffLayer.enabled = false;
        geoTiffLayer.showSpinner = false;
        //geoTiffLayer.hide = true;
        wwd.addLayer(geoTiffLayer);

        var layerManager = new LayerManager(wwd);
        layerManager.synchronizeLayerList();

        function load_runoff (){
          var resourceUrl = "./wupper_runoff.tif";
          WorldWind.GeoTiffReader.retrieveFromUrl(resourceUrl, function (geoTiffReader, xhrStatus) {
            var surfaceGeoTiff = new WorldWind.SurfaceImage(
                geoTiffReader.metadata.bbox,
                new WorldWind.ImageSource(geoTiffReader.getImage())
            );
            geoTiffLayer.addRenderable(surfaceGeoTiff);
            geoTiffLayer.enabled = true;
            geoTiffLayer.showSpinner = false;
            wwd.redraw();
         });
         $.getJSON("runoff_meta.json", function(result) {
           var date = result.date;
           var color_start = result.color_start;
           var color_end = result.color_end;
           var max_data = result.max_data;
           var rainbow = new Rainbow(); 
           rainbow.setSpectrum(color_start,color_end);
           rainbow.setNumberRange(0, max_data);
           draw_legend(rainbow,max_data);
           textLayer["renderables"][0]["text"] = date;
        });
        }

        var myVar = setInterval(myTimer,600,{source:'energy.json',color_start:'lime', color_end:'red'});
        //wwd.redraw();
        var myRunoff;
        $("#select-data").change(function () {
            
            var str = "";
            $("select option:selected").each(function () {
                str = $(this).text();
            });
          
            if (str === "Energy (kWh)") {
              clearInterval(myVar);
              clearInterval(myRunoff);
              myVar = setInterval(myTimer,600,{source:'energy.json',color_start:'lime', color_end:'red'});
            } ;

            if (str === "Water (l)") {
              clearInterval(myVar);
              clearInterval(myRunoff);
              myVar = setInterval(myTimer,600,{source:'water.json',color_start:'lime', color_end:'blue'});
            } ;

            if (str === "GWP in (gCO2eq)") {
              clearInterval(myVar);
              clearInterval(myRunoff);
              myVar = setInterval(myTimer,600,{source:'co2.json',color_start:'lime', color_end:'black'});
            } ;

            if (str === "Empty") {
              clearInterval(myVar);
              clearInterval(myRunoff);
              textLayer["renderables"][0]["text"] = "0000-00-00T00:00:00";
              for (var i = 1; i <=10; i++){
                var ctx = document.getElementById('no'+i+'cID').getContext('2d');
                ctx.fillStyle = 'rgb(255,255,255)';
                ctx.fillRect(0, 0, 20, 20);
                document.getElementById('no'+i+'sID').innerHTML = '';
                document.getElementById('no'+i+'eID').innerHTML = '';
              };
              for(var key in layer_array) {
                layer_array[key]._entities[0].material.diffuse = new Float32Array([255,255,255,1]);
              }
              wwd.redraw();
            };
            if (str === "Surface Runoff (m)"){
              clearInterval(myVar);
              myRunoff = setInterval(load_runoff,600);
              for(var key in layer_array) {
                layer_array[key]._entities[0].material.diffuse = new Float32Array([255,255,255,1]);
              }
            }
            
            
        })
                
       });

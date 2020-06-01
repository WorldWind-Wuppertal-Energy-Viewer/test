define( "add_collada",['./WorldWindShim'],function () {
    return function add_collada(key,y_origin,x_origin,z_origin) {  
        var position = new WorldWind.Position(y_origin,x_origin,z_origin,wwd,layer_array);
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
});
 
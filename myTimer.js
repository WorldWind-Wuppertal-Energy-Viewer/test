function myTimer({source,color_start,color_end,layer_array}) {
    var data = {};
    $.getJSON(source, function(source) {
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
        });
    wwd.redraw();
    };
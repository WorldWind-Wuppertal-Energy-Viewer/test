define( "coloring",["Rainbow","convertHex","draw_legend","https://unpkg.com/mathjs@7.0.0/dist/math.min.js"],function (Rainbow,convertHex,draw_legend,Math) {
    return function coloring(data,color_start,color_end) {
        var rainbow = new Rainbow(); 
        //rainbow.setSpectrum('lime', 'red');
        var max_data = Math.max.apply(null,Object.values(data));
        //var min_data = Math.min.apply(null,Object.values(data));
        rainbow.setSpectrum(color_start,color_end);
        rainbow.setNumberRange(0, max_data);
        var rgb_array = {};
        var hex_array = {};
        for (var key in data){
            hex_array[key] = rainbow.colourAt(data[key]);
            rgb_array[key]  = convertHex(hex_array[key]);      
            //rgb_array.push(rbgColor); 
            //hex_array.push(hexColour);
        };
        draw_legend(rainbow,max_data)
        //return rgb_array;
            return rgb_array;
        };
});

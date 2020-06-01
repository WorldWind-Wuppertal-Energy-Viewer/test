define( "draw_legend",["convertHex"],function (convertHex) {
    return function draw_legend(rainbow,max_data) {

		for (i = 1; i <=10; i++){
		var ctx = document.getElementById('no'+i+'cID').getContext('2d');
		var hexColour = rainbow.colourAt(i/10*max_data);
		var rbgColor  = convertHex(hexColour);
		ctx.fillStyle = 'rgb(' + rbgColor[0] + ', ' + rbgColor[1] + ', ' + rbgColor[2] + ')';
		ctx.fillRect(0, 0, 20, 20);
		document.getElementById('no'+i+'sID').innerHTML = ((i-1)/10*max_data).toFixed(1);
		document.getElementById('no'+i+'eID').innerHTML = (i/10*max_data).toFixed(1);
		}
	};
})
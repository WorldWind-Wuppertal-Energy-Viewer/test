define( "Rainbow",["ColourGradient"],function (ColourGradient) {
    return function Rainbow() {
		"use strict";
		var gradients = null;
		var minNum = 0;
		var maxNum = 100;
		var colours = ['ff0000', 'ffff00', '00ff00', '0000ff']; 
		setColours(colours);
		
		function setColours (spectrum) 
		{
			if (spectrum.length < 2) {
				throw new Error('Rainbow must have two or more colours.');
			} else {
				var increment = (maxNum - minNum)/(spectrum.length - 1);
				var firstGradient = new ColourGradient();
				firstGradient.setGradient(spectrum[0], spectrum[1]);
				firstGradient.setNumberRange(minNum, minNum + increment);
				gradients = [ firstGradient ];
				
				for (var i = 1; i < spectrum.length - 1; i++) {
					var colourGradient = new ColourGradient();
					colourGradient.setGradient(spectrum[i], spectrum[i + 1]);
					colourGradient.setNumberRange(minNum + increment * i, minNum + increment * (i + 1)); 
					gradients[i] = colourGradient; 
				}

				colours = spectrum;
			}
		}

		this.setSpectrum = function () 
		{
			setColours(arguments);
			return this;
		}

		this.setSpectrumByArray = function (array)
		{
			setColours(array);
			return this;
		}

		this.colourAt = function (number)
		{
			if (isNaN(number)) {
				throw new TypeError(number + ' is not a number');
			} else if (gradients.length === 1) {
				return gradients[0].colourAt(number);
			} else {
				var segment = (maxNum - minNum)/(gradients.length);
				var index = Math.min(Math.floor((Math.max(number, minNum) - minNum)/segment), gradients.length - 1);
				return gradients[index].colourAt(number);
			}
		}

		this.colorAt = this.colourAt;

		this.setNumberRange = function (minNumber, maxNumber)
		{
			if (maxNumber > minNumber) {
				minNum = minNumber;
				maxNum = maxNumber;
				setColours(colours);
			} else {
				throw new RangeError('maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')');
			}
			return this;
		}
	}
});

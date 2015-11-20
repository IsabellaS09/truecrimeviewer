(function () {
	var viewer = $('#viewer');
	var assets = null;
	$.getJSON('assets.json', function(a) {
		// TODO Don't start doing things until we get this
		assets = a;
	});

	var map = L.map('map').setView([39.0869949,-77.1811684], 13);
	var baseLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	$.getJSON("data/violations.geojson", function(json) {
		var violationLayer = L.geoJson(json, {
			onEachFeature: function (feature, layer) {
				layer.on('click', renderScene);
			}
		});

		var markers = L.markerClusterGroup();
		markers.addLayer(violationLayer);
		map.addLayer(markers);
		map.fitBounds(markers.getBounds());
	});

	function raceToColor(race){
		var raceMap = {
			'hispanic':'#c0803f',
			'black': '#3a2613',
			'white': '#ecd8c5',
			'asian': '#cc9966',
			'native american': '#996533',
			'other': '0000ff'
		}
		if(typeof raceMap[race.toLowerCase()] != 'undefined'){
			return raceMap[race.toLowerCase()];
		}
		else {
			return "FF0000"; // This should never happen
		}
	}

	function renderScene(e) {
		if (!assets) return; // hack
		var feature = e.target.feature;
		var props = feature.properties;
		viewer.empty();

		// background 640 x 360
		viewer.css('background-image', 'url("' + assets['background']['day'] + '")');

		// vehicle 640 x 360 transparent
		var v = assets['vehicle']['corolla'];
		viewer.append('<img class="vehicle" src="' + v['url'] + '">');

		// driver 300 x 120 transparent, assuming the neck is at the middle bottom
		var driver = assets['driver']['confused'];
		viewer.append('<img class="driver" src="' + driver['url'] + '">');
		viewer.find('.driver').css({top: v['driver']['top'], left: v['driver']['left']});

		// title, subject to change
		viewer.append('<div>' + props.description + '</div>');

		var $img = jQuery('img.driver');
		var src = swapImageColors($img, assets['driver_default_color'], raceToColor(props.race));
		$img.attr('src', src);
	}

	$(document).ready(function() {
		resizeMap();
	});

	$(window).resize(function() {
		resizeMap();
	});

	function resizeMap(){
		// Make map full-screen
		$('#map').width($(window).width());
		$('#map').height($(window).height());
		map.invalidateSize();
	}

	function hex2rgb(hex){
		var long = parseInt(hex.replace(/^#/, ""), 16);
	    return long ? {
	        r: (long >>> 16) & 0xff,
	        g: (long >>> 8) & 0xff,
	        b: long & 0xff
	    } : null;
	}
	function swapImageColors($img, fromHex, toHex){
		// pull the entire image into an array of pixel data
		if($img.height() < 1 || $img.width() < 1){
			return $img.attr('src');
		}
		var h = $img.height();
		var w = $img.width();
		var canvas = document.createElement('canvas');
		var $canvas = jQuery(canvas);
		$canvas.height(h);
		$canvas.width(w);
		var context = canvas.getContext('2d');
		context.drawImage($img[0], 0, 0);
		var fromRGB = hex2rgb(fromHex);
		var toRGB = hex2rgb(toHex);

		var imageData = context.getImageData(0, 0, w, h);

		// examine every pixel, 
		// change any old rgb to the new-rgb
		for (var i=0;i<imageData.data.length;i+=4)
		  {
		      // is this pixel the old rgb?
		      if(imageData.data[i]==fromRGB.r &&
		         imageData.data[i+1]==fromRGB.g &&
		         imageData.data[i+2]==fromRGB.b
		      ){
		          // change to your new rgb
		          imageData.data[i]=toRGB.r;
		          imageData.data[i+1]=toRGB.g;
		          imageData.data[i+2]=toRGB.b;
		      }
		  }
		// put the altered data back on the canvas  
		context.putImageData(imageData,0,0);
		return canvas.toDataURL();
	}

}());

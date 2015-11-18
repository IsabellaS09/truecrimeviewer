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

	function renderScene(e) {
		if (!assets) return; // hack
		var feature = e.target.feature;
		var props = feature.properties;
		viewer.empty();
		viewer.append('<div>' + props.description + '</div>');

		// background
		viewer.css('background-image', 'url("' + assets['background']['day'] + '")');

		// vehicle
		var v = assets['vehicle']['corolla'];
		viewer.append('<img class="vehicle" src="' + v['url'] + '">');
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

}());

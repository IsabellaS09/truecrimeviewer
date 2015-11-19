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

	function getVehicle(vType) {
		if (/emerg/i.test(vType)) return 'emergency';
		if (/boat/i.test(vType)) return 'boat';
		if (/truck/i.test(vType)) return 'truck';
		if (/bus/i.test(vType)) return 'bus';
		return 'auto';
	}

	function renderScene(e) {
		if (!assets) return; // hack
		var feature = e.target.feature;
		var props = feature.properties;
		viewer.empty();

		// background 640 x 360
		viewer.css('background-image', 'url("' + assets['background']['day'] + '")');

		// vehicle 640 x 360 transparent
		var v = assets['vehicle'][getVehicle(props['vehicle_type'])];
		viewer.append('<img class="vehicle" src="' + v['url'] + '">');

		// driver, reference point middle bottom
		var driver = assets['driver']['confused'];
		viewer.append('<img class="driver" src="' + driver['url'] + '">');
		viewer.find('.driver').css({bottom: v['driver']['bottom'], left: v['driver']['left']});

		// cop, reference point middle bottom
		var cop = assets['cop'];
		viewer.append('<img class="cop" src="' + cop['url'] + '">');
		viewer.find('.cop').css({bottom: cop['bottom'], left: cop['left']});

		// title, subject to change
		viewer.append('<div>' + props.description + '</div>');
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

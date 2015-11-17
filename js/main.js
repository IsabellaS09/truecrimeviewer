(function () {
	var map = L.map('map').setView([39.0869949,-77.1811684], 13);
	var baseLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	$.getJSON("data/violations.geojson", function(json) {
		var violationLayer = L.geoJson(json, {
			onEachFeature: function (feature, layer) {
				layer.bindPopup(feature.properties.description);
			}
		});

		var markers = L.markerClusterGroup();
		markers.addLayer(violationLayer);
		map.addLayer(markers);
		map.fitBounds(markers.getBounds());
	});

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

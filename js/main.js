(function () {
	var wrapper = $('#wrapper');
	var template = $('#viewer-template');
	var chat = $('#chat');
	var assets = null;
	$.getJSON('assets.json', function(a) {
		// TODO Don't start doing things until we get this
		assets = a;
		// Vehicle
		var vehicles = a['vehicle'];
		for (var vk in vehicles) {
			if (vehicles.hasOwnProperty(vk)) {
				var v = vehicles[vk];
				template.append('<img class="vehicle ' + vk + '" src="' + v['url'] + '">');
			}
		}
		template.append('<div id="make"></div>');

		// Driver
		var drivers = a['driver'];
		for (var dk in drivers) {
			if (drivers.hasOwnProperty(dk)) {
				var d = drivers[dk];
				template.append('<img class="driver ' + dk + '" src="' + d['url'] + '">');
			}
		}
		// cop, reference point middle bottom
		var cops = a['cop'];
		for (var ck in cops) {
			if (cops.hasOwnProperty(ck)) {
				var c = cops[ck];
				template.append('<img class="cop ' + ck + '" src="' + c['url'] + '">');
				template.find('.cop.' + ck).css({bottom: c['bottom'], left: c['left']});
			}
		}

		template.append('<div class="timestamp"></div>');
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

	function getViolationType(vType) {
		if (/citation/i.test(vType)) return 'citation';
		// Somehow 2 cops aren't as funny as 3
		// if (/citation/i.test(vType)) return '2';
		return 'warning';
	}

	function renderScene(e) {
		if (!assets) return; // hack
		var feature = e.target.feature;
		var props = feature.properties;
		var scene = template.clone();
		scene.attr('id', 'viewer');
		wrapper.empty();
		wrapper.prepend(scene);

		var tstamp = new Date(props['timestamp']);
		var isDay = tstamp.getHours() > 6 && tstamp.getHours() < 18;
		scene.find('.timestamp:first').text(props['timestamp']);

		// background 640 x 360
		scene.css('background-image', 'url("' + assets['background'][isDay ? 'day' : 'night'] + '")');

		// vehicle 640 x 360 transparent
		var vk = getVehicle(props['vehicle_type']);
		var v = assets['vehicle'][vk];
		scene.find('.vehicle').hide();
		scene.find('.vehicle.' + vk).show();

		// driver, reference point middle bottom
		var dk = 'confused';
		scene.find('.driver').hide();
		scene.find('.driver.' + dk).css({bottom: v['driver']['bottom'], left: v['driver']['left']});
		scene.find('.driver.' + dk).show();

		var ck = getViolationType(props['violation_type']);
		scene.find('.cop').hide();
		scene.find('.cop.' + ck).show();

		// Chat
		chat.empty();
		var quotes = props['chat'];
		var qhtml = '<ul>';
		for (var i = 0; i < quotes.length; i++) {
			var q = quotes[i];
			qhtml += '<li><strong>' + q['char'] + '</strong> ' + q['text'] + '</li>';
		}
		qhtml += '<li><strong>' + quotes[0]['char'] + '</strong> ' + props['description'] + '</li>';
		qhtml += '</ul>';
		chat.append(qhtml);

		// Make
		var make = $('#make');
		make.empty();
		make.text(props['color'] + ' ' + props['make'] + ' ' + props['model']);
		make.css({top: v['make']['top'], left: v['make']['left'], color: props['color']});
	}

	$(document).ready(function() {
		resizeMap();
	});

	$(window).resize(function() {
		resizeMap();
	});

	function resizeMap(){
		// Make map full-screen
		$('#map').width($(window).width() - 640);
		$('#map').height($(window).height());
		map.invalidateSize();
	}

}());

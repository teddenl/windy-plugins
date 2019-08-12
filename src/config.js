module.exports = {

	// Display name of your plugin, as it will appear in the menu
	displayName: 'Greta Thunberg',

	// Place, where opening link to your plugin will appear. So far only
	// Allowed: 'contextmenu', 'menu'
	hook: 'menu',

	// List of external libraries, taht should be loade before
	// your plugin is even mounted to the page
	dependencies: ['https://code.jquery.com/jquery-3.4.1.min.js','https://cdn.jsdelivr.net/npm/leaflet-rotatedmarker@0.2.0/leaflet.rotatedMarker.js']

	// List of classnames that will be attached to your plugin upon mounting
	// className: 'plugin-lhpane plugin-mobile-fullscreen',

	// If you want to apply different set of classes on mobile devices
	// classNameMobile: 'this-is-other-class',

	// Forcess all other window panes, with same pane to be closed
	// Allowed: 'lhpane', 'rhpane' and 'all'
	// exclusive: 'lhpane',

	// The place in page, where your plugin element will be mounted
	// to the page. By default all the plugins are attached to
	// #plugins div
	// attachPoint: '#map_container .leaflet-popup-pane',

	// If you want to apply different mounting point on mobile devices
	// attachPointMobile: '#plugins'
}

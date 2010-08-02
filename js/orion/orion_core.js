/*!
* @file                 orion_core.js
* @author               Filipe Araujo
*
* @TODO                 content priority loading
* @TODO                 onEnter, onExit, onChange, onComplete
* @TODO                 spinner
*/

/**
 * Orion Object
 * @class
 * @namespace       Orion
 */
Orion = (function(){

	var

	init = function(){

		Orion.structure.load();

		/* map interactions */
		$(document).bind('keydown', Orion.interaction.registerKeyPress)
			.bind('mousedown mouseup', Orion.interaction.registerInput);
	};


	$(function(){
		init();
	});

	return {}

})();








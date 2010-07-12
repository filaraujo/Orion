/*
* @file                 orion_interaction.js
* @author               Filipe Araujo
*/

Orion = Orion || {};

/**
 * Orion Object
 * @class
 * @namespace       Orion.interaction
 */
Orion.interaction = (function(){

	var

	/**
	* Interaction API
	* @memberOf CN.navigation
	* @private
	*/
	interactionApi = function(){
		return {
			/**
			 * @description Register keypress and executes move() based direction passed
			 * @memberOf    Orion.navigation
			 * @method      registerKeyPress
			 * @public
			 * @params      {Object} event  Event with keypress to register
			 */
			registerKeyPress : function(e){
				switch(e.which){
					case 40:
						$(window).trigger({type:'Orion.navigation.move', to:'south'});
						break;
					case 39:
						$(window).trigger({type:'Orion.navigation.move', to:'east'});
						break;
					case 38:
						$(window).trigger({type:'Orion.navigation.move', to:'north'});
						break;
					case 37:
						$(window).trigger({type:'Orion.navigation.move', to:'west'});
						break;
					case 36:
					case 33:
						$(window).trigger({type:'Orion.navigation.move', to:'home'});
						break;
					default:
						break;
				}
			},

			/**
			 * @description Register mouse events and exectures based on action
			 * @memberOf    Orion.navigation
			 * @method      registerMouse
			 * @public
			 * @params      {Object} event  Event with mouse event to register
			 */
			registerInput : function(e){
				switch(e.type){
					case 'mousedown':
						$(document).bind('mousemove', Orion.interaction.registerInput);
						$(window).trigger({type:'Orion.navigation.gesture', action:'start', input : e});
						break;
					case 'mousemove':
						$(window).trigger({type:'Orion.navigation.gesture', action:'flick', input : e});
						break;
					case 'mouseup':
						$(document).unbind('mousemove', Orion.interaction.registerInput);
						$(window).trigger({type:'Orion.navigation.gesture', action:'stop', input : e});
						break;
					default:
						break;
				}
			}
		}
	};

	return interactionApi();
})();
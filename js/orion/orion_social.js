/*
* @file                 orion_social.js
* @author               Filipe Araujo
*/

Orion = Orion || {};

/**
 * Orion Object
 * @class
 * @namespace       Orion.social
 */
Orion.social = (function(){

	var

	/**
	* Storage object for social aside
	* @memberOf		Orion.social
	* @private
	* @type			{Object} jQuery Object
	*/
	$social,

	/**
	* className of fx applied to social aside
	* @memberOf	    Orion.social
	* @private
	* @type			{String} effect name : default, slide
	* @default      default
	*/
	fx = 'default',

	/**
	 * @description close social aside by removing class name
	 * @memberOf    Orion.social
	 * @method      close
	 * @private
	 */
	close = function(){
		$social.removeClass('open');
	},

	/**
	 * @description opens social aside by adding class name
	 * @memberOf    Orion.social
	 * @method      open
	 * @private
	 */
	open = function(){
		$social.addClass('open');
	},

	/**
	 * @description toggle social aside
	 * @memberOf    Orion.social
	 * @method      close
	 * @private
	 */
	toggle = function(e){
		$social.toggleClass('open', function(){
			return $social.is('.open');
		});
	},

	/**
	* Social API
	* @memberOf CN.social
	* @private
	*/
	socialApi = function(){
		return {

			/**
			 * @description initiate social bar
			 * @memberOf    Orion.social
			 * @method      init
			 * @public
			 */
			init : function(){
				$(window).bind('Orion.social.open', open)
					.bind('Orion.social.close', close)
					.bind('Orion.social.toggle', toggle);
				$social = $('#orion-social').attr('class', fx || 'default');
			},

			/**
			 * @description pointer to private open function
			 * @memberOf    Orion.social
			 * @method      open
			 * @public
			 * @usage       Orion.social.open();
			 */
			open : open,

			/**
			 * @description pointer to private open function
			 * @memberOf    Orion.social
			 * @method      close
			 * @public
			 * @usage       Orion.social.close();
			 */
			close : close,

			/**
			 * @description pointer to private toggle function
			 * @memberOf    Orion.social
			 * @method      toggle
			 * @public
			 * @usage       Orion.social.toggle();
			 */
			toggle : toggle,

			/**
			 * @description sets social aside effect
			 * @memberOf    Orion.social
			 * @method      fx
			 * @public
			 * @usage       Orion.social.fx('slide').init();
			 */
			fx : function(str){
				fx = str || 'default';
				return this;
			}
		}
	};
	
	return socialApi();
})();
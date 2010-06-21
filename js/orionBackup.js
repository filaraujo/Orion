/*!
* @file                 Orion.js
* @author               Filipe Araujo
*
* @TODO                 Ajax loading
* @TODO                 onEnter, onExit, onChange, onComplete
*/


/**
 * Orion Object
 * @class
 * @namespace       Orion
 */
Orion = {};


/**
 * Orion Object
 * @class
 * @namespace       Orion.interaction
 */
Orion.interaction = (function(){

	var

	/**
	* Storage object for device orientation
	* @memberOf		Orion.interaction
	* @private
	* @type			{String}
	*/
	orientation = 'default',

	/**
	 * @description Initialization function
	 * @memberOf    Orion.interaction
	 * @method      init
	 * @private
	 */
	init = function(){
		$(document).bind('keydown', register);
		$(window).bind('Orion.move', move);
		$(window).bind('Orion.rotate', rotate);

		Orion.structure.build();
	},

	/**
	 * @description Move grid based on data stored on the element
	 * @memberOf    Orion.interaction
	 * @method      move
	 * @private
	 * @params      {Object} event  Event with stored direction
	 */
	move = function(e){
		var active = Orion.grid.active.data(e.to),
			pos;

		if(!active){
			return false;
		}
		pos = active.data('position');

		onChange();

		Orion.grid.$el.css({
			'left' : -pos.left,
			'top' : -pos.top
		});
		Orion.grid.active = active;

		onComplete();

	},

	onChange = function(){
		console.log(Orion.grid.active.onChange);
		console.log('triggering onChange');
		$(window).trigger('Orion.timeline.onChange');
	},

	onComplete = function(){
		$(window).trigger('Orion.timeline.onComplete');
		console.log('triggering onComplete');
	},

	/**
	 * @description Register keypress and executes move() base on Code
	 * @memberOf    Orion.interaction
	 * @method      register
	 * @private
	 * @params      {Object} event  Event with keypress to register
	 */
	register = function(e){
		switch(e.charCode || e.keyCode){
			case 40:
				$(window).trigger({type:'Orion.move', to:'south'});
				break;
			case 39:
				$(window).trigger({type:'Orion.move', to:'east'});
				break;
			case 38:
				$(window).trigger({type:'Orion.move', to:'north'});
				break;
			case 37:
				$(window).trigger({type:'Orion.move', to:'west'});
				break;
			case 36:
			case 33:
				$(window).trigger('Orion.move.home');
				break;
			default:
				break;
		}
	},

	/**
	 * @description Rotates orion orientation
	 * @memberOf    Orion.interaction
	 * @method      register
	 * @private
	 * @params      {Object} event  Event with stored orientation
	 */
	rotate = function(e){
		$("#orion").attr('class', e.to);
		orientation = e.to;
	};

	social = function(e){

	}

	$(function(){
		init();
	});

	return {}
})();


/**
 * Orion Object
 * @class
 * @namespace       Orion.structure
 */
Orion.structure = (function(){

	var

	/**
	* Storage object for featureSet
	* @memberOf			Orion.structure
	* @private
	* @type			{Object}
	*/
	featureSet = {},

	/**
	* Storage object for orion
	* @memberOf		Orion.structure
	* @private
	* @type			{Object}
	*/
	$orion,

	/**
	 * @description Build and maps orion components and features
	 * @memberOf    Orion.structure
	 * @method      register
	 * @private
	 */
	build = function(){

		featureSet = $('.featureSet').map(function(i, val){
			var $el = $(this);
			return {
				feature : $el.children('section').map(function(){
					return $(this);
				}),
				orientation : {
					X : $el.hasClass('orientationX'),
					Y : $el.hasClass('orientationY'),
					Z : $el.hasClass('orientationZ'),
					negative  : $el.hasClass('negative')
				}
			}
		});

		$orion = $('#orion');

		setLayout();
		setFeatureMapping();
	},

	/**
	 * @description Creates style block setting feature>section layout
	 * @memberOf    Orion.structure
	 * @method      register
	 * @private
	 */
	setLayout = function(){
		var height = $orion.height(),
			width = $orion.width();

		$('head').append(
			'<style>'+
				'#orion .featureSet { height : '+height+'px; }\n'+
				'#orion .featureSet>section, #orion-content { height : '+height+'px; width : '+width+'px; }\n'+
				'#orion #orion-social { height : '+height+'px; }\n'+
			'</style>');
	},

	/**
	 * @description Maps each featureSet and feature to Orion.grid object
	 *              mapping its corresponding east, north, south and west elements
	 *              Also stores element positioning for usage in
	 *              Orion.interaction.move()
	 * @memberOf    Orion.structure
	 * @method      register
	 * @private
	 */
	setFeatureMapping = function(){

		Orion.grid = {
			$el : $('#grid'),
			featureSet : featureSet,
			active : featureSet[0].feature[0]
		};

		featureSet.each(function(i,fs){
			fs.feature.each(function(j,f){
				var next = fs.feature[j+1],
					prev = fs.feature[j-1],
					nextSet = featureSet[i+1],
					prevSet = featureSet[i-1],
					reverse = fs.orientation.negative;

				f.data('home', fs.feature[0]);
				f.data('position', f.position());

				/** first element **/
				if(i == 0 && j == 0){
					f.data('east', next || nextSet.feature[0]);
					return;
				}
				/** last element **/
				if((i == featureSet.length-1 && j == fs.feature.length-1) && !fs.orientation.Y){
					f.data('west', prev || prevSet.feature[0]);
					return;
				}
				/** Any X or Z element **/
				if(fs.orientation.X || fs.orientation.Z){
					f.data('east', next || nextSet.feature[0]);
					f.data('west', prev || prevSet.feature[(prevSet.orientation.Y) ? 0 : prevSet.feature.length-1]);
				}
				/** Any Y element **/
				if(fs.orientation.Y){
					/** first Y element **/
					if(f.is(':first-child')){
						if(nextSet){
							f.data('east', nextSet.feature[0]);
						}
						if(prevSet){
							f.data('west', prevSet.feature[0]);
						}
					}
					else{
						f.css({
							top : ((reverse) ? 1 : -1 ) * ($orion.height() * j)
						});
						f.data('position', f.position());
					}
					/** Any Y element with next sibling **/
					if(next){
						f.data((reverse) ? 'south' : 'north', next);
					}
					/** Any Y element with prev sibling **/
					if(prev){
						f.data((reverse) ? 'north' : 'south', prev);
					}
				}
			});
		})
	};

	return {
		build : build
	}
})();







Orion.social = (function(){

	var

	$social,
	fx = 'default',

	init = function(){
		$(window).bind('Orion.social.open', open);
		$(window).bind('Orion.social.close', close);
		$social = $('#orion-social').attr('class',fx);
	},

	close = function(){
		$social.removeClass('open');
	},

	open = function(){
		$social.addClass(' open');
	},

	setFX = function(str){
		fx = str || 'default';
		return this;
	};

	return {
		init : init,
		setFX : setFX
	}
})();


$(function(){
	Orion.social.init();
});
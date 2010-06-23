/*!
* @file                 Orion.js
* @author               Filipe Araujo
*
* @TODO                 content priority loading
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
	},

	/**
	 * @description Move grid based on data stored on the element
	 * @memberOf    Orion.interaction
	 * @method      move
	 * @private
	 * @params      {Object} event  Event with stored direction
	 */
	move = function(e){
		var active = Orion.featureSet.active[e.to],
			pos;
		
		if(!active){
			console.log(e.to);
			return false;
		}
		pos = $(active).position();

		//onChange();

		$('#orion-grid').css({
			'left' : -pos.left,
			'top' : -pos.top
		});

		//onComplete();

		Orion.featureSet.active = active;
	},

	onChange = function(){
		//eval(Orion.grid.active.onChange);
		console.log('triggering onChange');
		$(window).trigger('Orion.timeline.onChange');
	},

	onComplete = function(){
		console.log(Orion.grid.active.onComplete);
		if(Orion.grid.active.onComplete){
			setTimeout('eval('+Orion.grid.active.onComplete+')' , 1000);
		}
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
	 * @method      rotate
	 * @private
	 * @params      {Object} event  Event with stored orientation
	 */
	rotate = function(e){
		$("#orion").attr('class', e.to);
		orientation = e.to;
	};

	$(function(){
		init();
	});

	return {};
})();


/**
 * Orion Object
 * @class
 * @namespace       Orion.structure
 */
Orion.structure = (function(){

	var

	/**
	* Storage object for feature schema
	* @memberOf		Orion.structure
	* @private
	* @type			{Object} jQuery Object
	*/
	$feature = $('<section>'),

	/**
	* Storage object for featureSet schema
	* @memberOf		Orion.structure
	* @private
	* @type			{Object} jQuery Object
	*/
	$featureSet = $('<div class="featureSet">'),

	/**
	* Storage object for grid component
	* @memberOf		Orion.structure
	* @private
	* @type			{Object} jQuery Object
	*/
	$grid,

	/**
	* Storage object for orion
	* @memberOf		Orion.structure
	* @private
	* @type			{Object}
	*/
	$orion,

	/**
	 * @description loads structure.json containaing featureSet and feature
	 *              structure
	 * @memberOf    Orion.structure
	 * @method      loadStructure
	 * @private
	 */
	loadStructure = function(){
		$.ajax({
			url : 'data/structure.json',
			success : buildFramework,
			type : 'GET',
			dataType : 'json'
		});
	},

	/**
	 * @description Build html structure for featureSets and features
	 * @memberOf    Orion.structure
	 * @method      buildFramework
	 * @private
	 * @param       {Object} json object from xhr request 
	 */
	buildFramework = function(data){

		var $f,
			$fs;

		$grid = $('#orion-grid');
		$orion = $('#orion');
		
		Orion.featureSet = data.featureSet;

		$.each(Orion.featureSet, function(i,fs){
			$fs = $featureSet.clone().addClass('orientation' + fs.orientation);

			$.each(fs.feature,function(j,f){
				$f = $feature.clone().addClass(f.type);
				$f.file = f.file;
				$f.type = f.type;
				Orion.featureSet[i].feature[j] = $f;
				$fs.append($f);
			});
			$grid.append($fs);
		});

		setLayout();
		mapFeatures();
		loadFeatures();
	},

	/**
	 * @description Systematically load features
	 * @memberOf    Orion.structure
	 * @method      loadFeatures
	 * @private
	 */
	loadFeatures = function(){
		var fs = Orion.featureSet;

		$.each(fs, function(i,fs){
			if(fs.loaded){
				return false;
			}
			$.each(fs.feature, function(j,f){
				if(f.loaded){
					return false;
				}
				f.load(f.file, function(){
					f.loaded = true;
				});
			});
			fs.loaded = true;
		});
	},

	/**
	 * @description Maps each featureSet and feature to Orion.grid object
	 *              mapping its corresponding east, north, south and west elements
	 *              Also stores element positioning for usage in
	 *              Orion.interaction.move()
	 * @memberOf    Orion.structure
	 * @method      mapFeatures
	 * @private
	 */
	mapFeatures = function(){
		$.each(Orion.featureSet, function(i,fs){
			$.each(fs.feature,function(j,f){
				var next = (fs.feature[j+1]) ? fs.feature[j+1] : undefined,
					nextSet = (Orion.featureSet[i+1]) ? Orion.featureSet[i+1].feature[0] : undefined,
					prev = (fs.feature[j-1]) ? fs.feature[j-1] : undefined,
					prevSet = (Orion.featureSet[i-1]) ? Orion.featureSet[i-1].feature[0] : undefined,
					reverse;

				
				f.home = fs.feature[0];

				/** first element **/
				if(i === 0 && j === 0){
					f.east = next || nextSet;
					Orion.featureSet.active = f;
					return;
				}
				/** last element **/
				if((i == Orion.featureSet.length-1 && j == fs.feature.length-1) && (fs.orientation != "Y")){
					f.west = prev || prevSet;
					return;
				}
				/** Any X or Z element **/
				if(fs.orientation != "Y"){
					f.east = next || nextSet;
					f.west = prev || Orion.featureSet[i-1].feature[(Orion.featureSet[i-1].orientation == "Y") ? 0 : Orion.featureSet[i-1].feature.length-1];
				}
				/** Any Y element **/
				if(fs.orientation == "Y"){
					/** first Y element **/
					if(j === 0){
						if(nextSet){
							f.east = nextSet;
						}
						if(prevSet){
							f.west = prevSet;
						}
					}
					else{
						f.css({
							top : ((reverse) ? 1 : -1 ) * ($orion.height() * j)
						});
					}
					/** Any Y element with next sibling **/
					if(next){
						f[(reverse) ? 'south' : 'north'] = next;
					}
					/** Any Y element with prev sibling **/
					if(prev){
						f[(reverse) ? 'north' : 'south'] = prev;
					}
				}
			});
		});
	},

	/**
	 * @description Creates style block setting feature>section layout
	 * @memberOf    Orion.structure
	 * @method      setLayout
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
	};

	$(function(){
		loadStructure();
	});

	return {};
})();


/**
 * Orion Object
 * @class
 * @namespace       Orion.social
 */
Orion.social = (function(){

	var

	/**
	* Storage object for social aside
	* @memberOf			Orion.social
	* @private
	* @type			{Object} jQuery Object
	*/
	$social,

	/**
	* className of fx applied to social aside
	* @memberOf	    Orion.social
	* @private
	* @type			{String} effect name : default, slide
	*/
	fx = 'default',

	/**
	 * @description Initialization function
	 * @memberOf    Orion.social
	 * @method      init
	 * @private
	 */
	init = function(){
		$(window).bind('Orion.social.open', open);
		$(window).bind('Orion.social.close', close);
		$social = $('#orion-social').attr('class',fx);
	},

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
		$social.addClass(' open');
	},

	/**
	 * @description sets social aside effect
	 * @memberOf    Orion.social
	 * @method      setFX
	 * @private
	 */
	setFX = function(str){
		fx = str || 'default';
		return this;
	};

	return {
		init : init,
		setFX : setFX
	};
})();


$(function(){
	Orion.social.init();
});
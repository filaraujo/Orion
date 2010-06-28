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
Orion = {


};


/**
 * Orion Object
 * @class
 * @namespace       Orion.navigation
 */
Orion.navigation = (function(){

	var

	/**
	 * @description Initialization function
	 * @memberOf    Orion.navigation
	 * @method      init
	 * @private
	 */
	init = function(){
		$(document).bind('keydown', register);
		$(window).bind('Orion.move', move);
	},

	/**
	 * @description Move grid based on data stored on the element
	 * @memberOf    Orion.navigation
	 * @method      move
	 * @private
	 * @params      {Object} event  Event with stored direction
	 */
	move = function(e){
		var active = Orion.articles.active[e.to],
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

		Orion.articles.active = active;
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
	 * @memberOf    Orion.move
	 * @method      navigation
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

	
	navigationApi = function(){
		return {
			setArticle : function(index){
				Orion.articles.active = Orion.articles[index].pages[0];
				$(window).trigger({type:'Orion.move', to:'home'});
				move();
			}
		}
	}

	$(function(){
		init();
	});

	return navigationApi();
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
	$page = $('<section>'),

	/**
	* Storage object for featureSet schema
	* @memberOf		Orion.structure
	* @private
	* @type			{Object} jQuery Object
	*/
	$article = $('<article>'),

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
		var $art,
			$pg;

		$grid = $('#orion-grid');
		$orion = $('#orion');
		Orion.articles = data.articles;
		$.each(Orion.articles, function(i,article){
			$art = $article.clone().addClass('orientation' + article.orientation).attr("id",'a'+i);
			$.each(article.pages,function(j,page){
				$pg= $page.clone().addClass(page.type);
				$pg.src = page.src;
				$pg.type = page.type;
				Orion.articles[i].pages[j] = $pg;
				$art.append($pg);
			});
			$grid.append($art);
		});

		setLayout();
		mapArticles();
		loadArticles();
	},

	/**
	 * @description Systematically load features
	 * @memberOf    Orion.structure
	 * @method      loadFeatures
	 * @private
	 */
	loadArticles = function(){
		$.each(Orion.articles, function(i,article){
			if(article.loaded){
				return false;
			}
			$.each(article.pages, function(j,page){
				if(page.loaded){
					return false;
				}
				page.load(page.src, function(){
					page.loaded = true;
				});
			});
			article.loaded = true;
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
	mapArticles = function(){
		$.each(Orion.articles, function(i,article){
			$.each(article.pages,function(j,page){
				var next = (article.pages[j+1]) ? article.pages[j+1] : undefined,
					nextSet = (Orion.articles[i+1]) ? Orion.articles[i+1].pages[0] : undefined,
					prev = (article.pages[j-1]) ? article.pages[j-1] : undefined,
					prevSet = (Orion.articles[i-1]) ? Orion.articles[i-1].pages[0] : undefined,
					reverse;

				page.home = article.pages[0];

				/** first element **/
				if(i === 0 && j === 0){
					page.east = next || nextSet;
					Orion.articles.active = page;
					return;
				}
				/** last element **/
				if((i == Orion.articles.length-1 && j == article.pages.length-1) && (article.orientation != "Y")){
					page.west = prev || prevSet;
					return;
				}
				/** Any X or Z element **/
				if(article.orientation != "Y"){
					page.east = next || nextSet;
					page.west = prev || Orion.articles[i-1].pages[(Orion.articles[i-1].orientation == "Y") ? 0 : Orion.articles[i-1].pages.length-1];
				}
				/** Any Y element **/
				if(article.orientation == "Y"){
					/** first Y element **/
					if(j === 0){
						if(nextSet){
							page.east = nextSet;
						}
						if(prevSet){
							page.west = prevSet;
						}
					}
					else{
						page.css({
							top : ((reverse) ? -1 : 1 ) * ($orion.height() * j)
						});
					}
					/** Any Y element with next sibling **/
					if(next){
						page[(reverse) ? 'north' : 'south'] = next;
					}
					/** Any Y element with prev sibling **/
					if(prev){
						page[(reverse) ? 'south' : 'north'] = prev;
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
				'#orion #orion-grid>article { height : '+height+'px; }\n'+
				'#orion #orion-grid>article>section, #orion-content { height : '+height+'px; width : '+width+'px; }\n'+
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
	 * @usage       Orion.social.setFX('slide').init();
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
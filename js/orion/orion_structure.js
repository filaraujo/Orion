/*
* @file                 orion_structure.js
* @author               Filipe Araujo
*/

Orion = Orion || {};

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
					prevSetLastItem = (Orion.articles[i-1]) ? Orion.articles[i-1].pages[(Orion.articles[i-1].orientation == "Y") ? 0 : Orion.articles[i-1].pages.length-1] : undefined,
					reverse;

				page.home = article.pages[0];

				/** first element **/
				if(i === 0 && j === 0){
					page.east = next || nextSet;
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
					page.west = prev || prevSetLastItem;
				}
				/** Any Y element **/
				if(article.orientation == "Y"){
					/** first Y element **/
					if(j === 0){
						if(nextSet){
							page.east = nextSet;
						}
						if(prevSet){
							page.west = prevSetLastItem;
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
	},

	/**
	* Structure API
	* @memberOf CN.structure
	* @private
	*/
	structureApi = function() {
		return {
			/**
			 * @description loads structure.json containaing featureSet and feature
			 *              structure
			 * @memberOf    Orion.structure
			 * @method      load
			 * @public
			 */
			load : function(){
				$.ajax({
					url : 'data/structure.json',
					success : buildFramework,
					type : 'GET',
					dataType : 'json'
				});
			}
		}
	};

	return structureApi();
})();
/*!
* @file                 orion_plugins.js
* @author               Filipe Araujo
*
* @TODO                 slideshow
* @TODO                 rotater
* @TODO                 video
* @TODO                 audio
* @TODO                 ad
* @TODO                 tabs
* @TODO                 poll
* @TODO                 lightbox
*
* @TODO                 rewrite for extension
*
*/

Orion = Orion || {};

/*
* @version              1.0.0
* @author               Paul Bronshteyn
* @modified             Filipe Araujo
*/
Orion.plugins = (function($) {
	var

	plugins = {
		rotator : {
			api : 'rotatorApi',
			defaults : {
				autoplay : false
			},
			version : 1.1
		},
		test2 : {
			api : 'testApi',
			version : 1.0
		}
	},

	pluginApis = {

		rotatorApi : function(el, options){
			var

			$link,
			$content,

			goto = function(e){
				var active = $content.find('img.'+this.hash.replace("#",'')),
					pos = active.position();
				$content.scrollLeft(pos.left);
			},

			init = function(){
				console.info('Rotator initiated');
				$link = el.find('.orion-rotator-nav a').bind('click', goto);
				$content = el.find('.orion-rotator-content');
			};

			$(function(){
				init();
			});

			return {
				prev : function(){
					console.log('prev');
					return this
				},
				next : function(){
					console.log('next');
					return this
				}
			}
		}
	};

    $.options = $.options || {};
	
	$.each(plugins, function(p, plugin){

		$.options[p] = {
			defaults: {
				api: true
			}
		}

		$.fn[p] = function(options) {
			var api = $(this).data(p);

			if (api) {
				return api;
			}

			options = $.extend({}, plugin.defaults, $.options[p].defaults, options || {});

			this.each(function() {
				$(this).data(p, api = new pluginApis[plugin.api]($(this), options));
			});

			return options.api ? api : this;
		}
	});


})(jQuery);
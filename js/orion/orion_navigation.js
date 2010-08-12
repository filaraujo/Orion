/*
* @file                 orion_navigation.js
* @author               Filipe Araujo
*/

Orion = Orion || {};

/**
 * Orion Object
 * @class
 * @namespace       Orion.navigation
 */
Orion.navigation = (function(){

	var

	active,

	input,

	/**
	* input details constructor
	* @memberOf     Orion.navigation
	* @private
	* @constructor
	*/
	InputDetails = function(){

		var _old = {},
			_new,
			_spd,
			_vel;

		return {
			isDragging : true,
			update :function(e){
				_old = _new;
				_new = {
					x : e.pageX,
					y : e.pageY
				};
				if(!_old){
					_old = _new;
				}
				_vel = {
					x : _new.x - _old.x,
					y : _new.y - _old.y
				};
				_spd = Math.ceil(Math.sqrt(_vel.x * _vel.x + _vel.y * _vel.y));

				this.speed = _spd;
				this.velocity = _vel;

				return this;
			},
			stop : function(){
				this.isDragging = false;
				return this;
			}
		}
	},

	/**
	* Limitations constructor
	* @memberOf     Orion.navigation
	* @private
	* @constructor
	*/
	Limitations = function(){
		active = active || Orion.articles[0].pages[0];
		return {
			east : active.east,
			north : active.north,
			home : active.home,
			south : active.south,
			west : active.west
		}
	},

	/**
	 * @description Determine gesture and move based on gesture
	 * @memberOf    Orion.navigation
	 * @method      gesture
	 * @private
	 * @params      {Object} event  Event with stored gesture
	 */
	gesture = function(e){
		var action = e.action;

		switch(action){
			case 'start':
				input = new InputDetails();
				input.update(e.input);
				break;
			case 'stop':
				var vel = input.stop().velocity;

				if(!vel.x && !vel.y){
					break;
				}
				if(Math.abs(vel.x) > Math.abs(vel.y)) {
					if(vel.x < 1){
						$(window).trigger({type:'Orion.navigation.move', to:'east'});
					}
					else{
						$(window).trigger({type:'Orion.navigation.move', to:'west'});
					}
				}
				else{
					if(vel.y < 1){
						$(window).trigger({type:'Orion.navigation.move', to:'south'});
					}
					else{
						$(window).trigger({type:'Orion.navigation.move', to:'north'});
					}
				}
				break;
			case 'flick':
				if(input && input.isDragging){
					input.update(e.input);
				}
				break;
			default :
				break;
		}
	},

	/**
	 * @description Go to active element
	 * @memberOf    Orion.navigation
	 * @method      goto
	 * @private
	 */
	go = function(){
		var pos = active.position();

		$('#orion-grid').css({
			'left' : -pos.left,
			'top' : -pos.top
		});
	},

	/**
	 * @description Move grid, based on data stored on the element
	 * @memberOf    Orion.navigation
	 * @method      move
	 * @private
	 * @params      {Object} event  Event with stored direction
	 */
	move = function(e){
		var limits = new Limitations(),
			direction = e.to,
			pos;

		if(direction && !limits[direction]){
			return false;
		}

		active = limits[direction];

		go();
	},

	/**
	* Navigation API
	* @memberOf CN.navigation
	* @private
	*/
	navigationApi = function(){
		return {

			/**
			 * @description Move grid directly to specified article
			 * @memberOf    Orion.navigation
			 * @method      article
			 * @public
			 * @params      {String} index  starts with 0 index
			 * @usage       Orion.navigation.article(1)
			 */
			article : function(index){
				active = Orion.articles[index];
				return this;
			},

			/**
			 * @description Move grid to east
			 * @memberOf    Orion.navigation
			 * @method      east
			 * @public
			 * @usage       Orion.navigation.east()
			 */
			east : function(){
				$(window).trigger({type:'Orion.navigation.move', to:'east'});
			},

			/**
			 * @description Move grid to first page in article
			 * @memberOf    Orion.navigation
			 * @method      home
			 * @public
			 * @usage       Orion.navigation.home()
			 */
			home : function(){
				$(window).trigger({type:'Orion.navigation.move', to:'home'});
			},

			/**
			 * @description Move grid to north
			 * @memberOf    Orion.navigation
			 * @method      north
			 * @public
			 * @usage       Orion.navigation.north()
			 */
			north : function(){
				$(window).trigger({type:'Orion.navigation.move', to:'north'});
			},

			/**
			 * @description Move grid directly to specified article
			 * @memberOf    Orion.navigation
			 * @method      page
			 * @public
			 * @params      {String} index  starts with 1 index
			 * @usage       Orion.navigation.page(2)
			 *              Orion.navigation.article().page(2)
			 */
			page : function(index){
				active = active.pages[index-1];
				$(window).trigger('Orion.navigation.goto');
			},

			/**
			 * @description Move grid to south
			 * @memberOf    Orion.navigation
			 * @method      south
			 * @public
			 * @usage       Orion.navigation.south()
			 */
			south : function(){
				$(window).trigger({type:'Orion.navigation.move', to:'south'});
			},

			/**
			 * @description Move grid to west
			 * @memberOf    Orion.navigation
			 * @method      west
			 * @public
			 * @usage       Orion.navigation.west()
			 */
			west : function(){
				$(window).trigger({type:'Orion.navigation.move', to:'west'});
			}
		}
	};

	$(function(){
		$(window).bind('Orion.navigation.gesture', gesture)
			.bind('Orion.navigation.goto', go)
			.bind('Orion.navigation.move', move);
	});

	return navigationApi();
})();
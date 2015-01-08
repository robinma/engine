/**
 * [description]
 * @return {[type]}
 */
(function(root, factory) {

	root.engine = factory();
}(this, function() {
	/**
	 * pubsub events
	 * @type null
	 */
	var pubsub = {
		_handlers: '',
		on: function(etype, handler) {
			if (typeof this._handlers !== 'object') {
				this._handlers = [];
			}
			if (!this._handlers[etype]) {
				this._handlers[etype] = []
			}
			if (typeof handler === 'function') {
				this._handlers[etype].push(handler)
			}
			return this;
		},
		emit: function(etype) {
			var args = Array.prototype.slice.call(arguments, 1)
			var handlers = this._handlers[etype] || [];
			for (var i = 0, l = handlers.length; i < l; i++) {
				handlers[i].apply(null, args)
			}
			return this;
		}
	};
	//base config data
	var config = {
		Cx: 0.01, 			//阻力系数
		accSpeed: 25, 		//加速度
		accFrameLen: 50, 	//加速度持续帧数
		maxSpeed:250,		//max speed
		minSpeed:20,		//min speed
		totalFrame:0,		//total frames
		currFrame:0,
		curSpeed:0,

		lotteryLen:6,
		lotteryIndex:0,
		errorIndex:0,
		isStop:true
	};
	//合并新成员
	var extend = function(){
		var target = arguments[0] || {},
		i=1,
		length = arguments.length,
		options,name;

		if(length >=1) return target;
		for(i=0;i<length;i++){

			if((options = arguments[i]) != null){
				for(name in options ){
					target[name] = options[name];
				}
			}
		}

		return target;
	};

	 //main class
	var Engine = function(args){
		this.params = {};
		extend(this.params,args);

	};

	extend(Engine.prototype,events);
	//动入扩展
	extend(Engine.prototype,{
		

	});





}));
/**
 * @author jerry
 */

var turnplate=(function(){
	var turnplate = {
	turnplateBox : '',
	turnplateBtn : '',
	lightDom : '',
	initBoxEle : '',
	progressEle : '',
	freshLotteryUrl : '/ajaxTurnplate/freshLottery/',
	msgBox : $('.msg'),
	lotteryUrl : '/dianping/ajax/main/Newbigwheel/lottery.php',
	height : '506', //帧高度
	lightSwitch : 0, //闪灯切换开关. 0 和 1间切换
	minResistance : 5, //基本阻力
	Cx : 0.01, //阻力系数 阻力公式：  totalResistance = minResistance + curSpeed * Cx;	
	accSpeed : 25, //加速度
	accFrameLen : 50, //加速度持续帧数
	maxSpeed : 250, //最大速度 
	minSpeed : 20, //最小速度 
	frameLen : 6, //帧总数
	totalFrame : 0, //累计帧数,每切换一帧次数加1
	curFrame : 0, //当前帧
	curSpeed : 20, //上帧的速度
	lotteryTime : 1, //抽奖次数
	lotteryIndex : 6, //奖品index
	errorIndex : 6, //异常时的奖品指针
	initProgressContent : '~~~^_^~~~', //初始化进度条的内容
	initFreshInterval : 500, //进度条刷新间隔
	virtualDistance : 10000, //虚拟路程,固定值，速度越快，切换到下帧的时间越快: 切换到下帧的时间 = virtualDistance/curSpeed
	isStop : true, //抽奖锁,为true时，才允许下一轮抽奖
	timer2 : undefined, //计时器
	initTime : undefined,
	showMsgTime : 2000, //消息显示时间
	data:'',
	/*
	//基本提示
	baseMsgArr : [
		'没有抽奖次数了哦，明天再来吧',
		'真的没有抽奖次数了，明天记得过来抽奖哦',
		'真的不能抽奖了，明天见...',
		'明天，明天，明天......,'
	],
	//胡言乱语
	chatMsgArr : [
		
	],
	*/

	lotteryType : {
		1 : 2,	
		2 : 3,
		3 : 4,
		4 : 5,
		5 : 0,
		6 : 1
	},

	lotteryList : [
		'博雅积分',
		'博雅明信片',
	    '谢谢你！请再接再厉！',
	    '博雅学分',
		'IPAD Air',
		'100元移动充值卡'
	],

	lotteryDes : [
		'手气一般般，幸运指数半颗星！',
		'手气不错呢，幸运指数3颗星！',
		'手气无敌了，幸运指数4颗星！',
		'手气很好呢，幸运指数3颗星！',
		'手气很好呢，幸运指数3颗星！',
		'手气还凑合，幸运指数1颗星！',
		'手气太差了，幸运指数0颗星！',
		'手气太好了，幸运指数5颗星！',
		'手气还可以，幸运指数2颗星！',
		'手气爆棚了，幸运指数5颗星！'
	],

	//初始化
	init : function(callback) {
		this.turnplateBox =$('.turnplate');
		this.turnplateBtn = $('.turnbtn');
		this.lightDom = $('.turnplatewrapper');
		this.initBoxEle = $('.turnplate .init');
		this.progressEle = $('.turnplate .init span');
		this.callback=callback;
		// this.boxid=boxid;
		this.initAnimate();
		this.freshLottery();
		var _t=this;
		this.turnplateBtn.click(function() {
			by.util.checkLogin(true,$.proxy(function() {
				this.click();
			}, _t));
		}); 
	},

	//初始化动画
	initAnimate : function() {
		this.initBoxEle.show();
		clearTimeout(this.initTimer);
		var curLength = this.progressEle.text().length,
			totalLength = this.initProgressContent.length;

		if (curLength < totalLength) {
			this.progressEle.text(this.initProgressContent.slice(0, curLength + 1));
		}else{
			this.progressEle.text('');
		}
		this.initTimer = setTimeout($.proxy(this.initAnimate, this), this.initFreshInterval);
	},

	//停止初始化动画
	stopInitAnimate : function() {
		clearTimeout(this.initTimer);
		this.initBoxEle.hide();
	},

	//更新抽奖次数
	freshLottery : function() {
		// $.get(this.freshLotteryUrl, $.proxy(function(data){
			// if(data.status == 'ok'){
				// this.stopInitAnimate();
				// this.setBtnHover();
				// this.isStop = true;
				// this.lotteryTime = data.data.total;
				// $('div[node-type="lotteryTime"]').html(data.data.total);
			// }else{
				// this.initBoxEle.html('初始化失败 {{{>_<}}} <a style="color:#039;" href="javascript:location.reload();">重试</a>')
			// }
		// }, this),'json');	
		this.stopInitAnimate();
		this.setBtnHover();
		this.isStop = true;
		this.lotteryTime = $('span[node-type="lotteryTime"]').html();					
	},

	//设置按钮三态
	setBtnHover : function() {
		//按钮三态
		$('.turnbtn').hover(function(){
			$(this).addClass('hover');
		},function() {
			$(this).removeClass('hover');
		});	
	},

	//获取奖品
	lottery : function() {
		this.lotteryIndex = undefined;
		this.lotteryTime--;
		this.totalFrame = 0;
		this.curSpeed = this.minSpeed;
		$('span[node-type="lotteryTime"]').html(this.lotteryTime);
		this.turnAround();
		$.get(this.lotteryUrl,{}, $.proxy(function(data){
			if(data.code==1){
				this.lotteryIndex = typeof this.lotteryType[data.type] !== 'undefined' ? this.lotteryType[data.type] : this.errorIndex;
				this.data = data; 
			}else if(data.code == 0){
				this.lotteryIndex = this.errorIndex;
				hm.alert({text:data.msg});	
				return;
			}
		}, this),'json');		
	},

	//点击抽奖
	click : function() {
		//加锁时
		if(this.isStop == false) {
			hm.alert({text:'现在还不能抽奖哦'});
			return;
		} 
		//抽奖次数不足
		if(this.lotteryTime <= 0) {
			//频繁点击会闪灯
			// if(display == 'block') {
				// this.switchLight();
			// }
			var href = $('a[node-type="inviteBtn"]').attr('href-val'); 
				if(href.match(/inviteRegUid/ig)){
					var hstr='';
					hstr=location.protocol+'//'+location.host+href;
					this.inviteFn(hstr);
					return false;
				}
			//hm.alert({text:'不可以再次抽奖了。'});
			return;
		}
		this.lottery();
	},
	
	inviteFn : function(href) {
						this.getScript( typeof Invite, '/dianping/www/js/project/newbigwheel/invite_friend.js', function() {
							Invite(href);
						});
				},
	getScript : function(obj, fileUrl, fn) {
						if ( typeof fn !== 'function')
							fn = function() {
						}
						if (obj !== 'undefined') {
							fn();
						} else {
							$.getScript(fileUrl, function() {
								fn();
						});
					}
				},

	//更新当前速度
	freshSpeed : function() {
		var totalResistance = this.minResistance + this.curSpeed * this.Cx;
		var accSpeed = this.accSpeed;
		var curSpeed = this.curSpeed;
		if(this.totalFrame >= this.accFrameLen) {
			accSpeed = 0;
		}
		curSpeed = curSpeed - totalResistance + accSpeed;

		if(curSpeed < this.minSpeed){
			curSpeed = this.minSpeed;
		}else if(curSpeed > this.maxSpeed){
			curSpeed = this.maxSpeed;
		}

		this.curSpeed  = curSpeed;
	},

	//闪灯,切换到下一张时调用
	switchLight : function() {
		this.lightSwitch = this.lightSwitch === 0 ? 1 : 0;
		var lightHeight = -this.lightSwitch * this.height;
		this.lightDom.css('backgroundPosition','0 ' + lightHeight.toString() + 'px');	
	},

	//旋转,trunAround,changeNext循环调用
	turnAround : function() {
		//加锁
		this.isStop = false;
		var intervalTime = parseInt(this.virtualDistance/this.curSpeed);		
		this.timer = window.setTimeout('turnplate.changeNext()', intervalTime);		
	},

	//弹出奖品
	showAwards : function(){
		//$('.lotteryMsg').dialog('open');
		//hm.alert({texg:"恭喜您获得："+this.lotteryList[this.curFrame]});
		if(typeof this.callback === 'function'){
			this.callback(this.data);
		}
	},

	//显示提示信息
	showMsg : function(msg, isFresh) {
		isFresh = typeof isFresh == 'undefined' ? false : true;
		if(typeof msg != 'string'){
			msg = '今天已经抽过奖了，明天再来吧';
		}
		var msgBox = this.msgBox;
		var display = msgBox.css('display');

		msgBox.html(msg);	

		window.clearTimeout(this.timer2);
		msgBox.stop(true,true).show();
		var fadeOut = $.proxy(function() {
			this.msgBox.fadeOut('slow');
		}, this);
		this.timer2 = window.setTimeout(fadeOut, this.showMsgTime);
	},


	//切换到下帧
	changeNext : function() {
		//判断是否应该停止
		// window.console&&console.log(this.lotteryIndex !== undefined , this.curFrame == this.lotteryIndex , this.curSpeed <= this.minSpeed+10 , this.totalFrame > this.accFrameLen);
		if(this.lotteryIndex !== undefined && this.curFrame == this.lotteryIndex && this.curSpeed <= this.minSpeed+10 && this.totalFrame > this.accFrameLen) {
			this.isStop = true;
			this.showAwards();
			return; 		
		}

		var nextFrame =  this.curFrame+1 < this.frameLen ? this.curFrame+1 : 0;
		var bgTop = - nextFrame * this.height;
		this.turnplateBox.css('backgroundPosition','0 ' + bgTop.toString() + 'px');	
		this.switchLight();
		this.curFrame = nextFrame;
		this.totalFrame ++;
		this.freshSpeed();
		this.turnAround();
	}
}
return turnplate;
}());


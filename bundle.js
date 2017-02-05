!function(t){function e(n){if(s[n])return s[n].exports;var i=s[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var s={};return e.m=t,e.c=s,e.i=function(t){return t},e.d=function(t,e,s){Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:s})},e.n=function(t){var s=t&&t.__esModule?function(){return t["default"]}:function(){return t};return e.d(s,"a",s),s},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=5)}([function(t,e){"use strict";var s=function(){function t(){}return t.async=function(t,e,s){!function n(i){i<t.length?e(t[i],function(){n(i+1)}):s()}(0)},t}();e.Util=s},function(t,e){"use strict";var s=function(){function t(){}return t}();e.State=s},,function(t,e,s){"use strict";var n=this&&this.__extends||function(t,e){function s(){this.constructor=t}for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);t.prototype=null===e?Object.create(e):(s.prototype=e.prototype,new s)},i=s(5),r=s(7),a=s(1),o=s(6),u=s(0),c=function(t){function e(){var e=t.call(this)||this;e.ready=!1,e.currentTask="",e.currentProgress=0,e.click=function(t){new o.Point(t.offsetX,t.offsetY);e.ready&&i.game.stateMachine.push(new r.GameState)},e.render=function(){i.game.context.clearRect(0,0,i.game.width,i.game.height);var t="";t=e.ready?"Click anywhere to start.":"Loading "+e.currentTask+": "+e.currentProgress+"%",i.game.context.font="20px 'Open Sans'",i.game.context.fillStyle="#fff";var s=i.game.context.measureText(t).width;i.game.context.fillText(t,(i.game.width-s)/2,i.game.height/2),requestAnimationFrame(e.render)},e.update=function(){};var s=e;return requestAnimationFrame(e.render),u.Util.async([i.game.loadAssets],function(t,e){t(function(t,n,i,r){s.currentTask=t,"done"===n?e():"progress"===n&&null!==i&&(s.currentProgress=Math.round(1e4*i)/100,r())})},function(){}),e}return n(e,t),e}(a.State);e.MenuState=c},function(t,e){"use strict";var s=function(){function t(){this.stack=[]}return t.prototype.empty=function(){return 0===this.stack.length},t.prototype.peek=function(){if(this.empty())throw new Error("State machine is empty.");return this.stack[this.stack.length-1]},t.prototype.push=function(t){this.stack.push(t)},t.prototype.pop=function(){var t=this.stack.pop();if(void 0===t)throw new Error("State machine is empty.");return t},t}();e.StateMachine=s},function(t,e,s){"use strict";var n=s(4),i=s(3),r=s(8),a=s(0),o=function(){function t(){var t=this;this.loadAssets=function(e){var s=0,n=t.assetLibrary.assets.length;a.Util.async(t.assetLibrary.assets,function(t,i){t.load(function(){s+=1,e("assets","progress",1*s/n,function(){i()})})},function(){e("assets","done",null,function(){})})},this.resize=function(e){t.canvas.width=t.width=window.innerWidth,t.canvas.height=t.height=window.innerHeight},this.click=function(e){try{var s=t.stateMachine.peek();s.click(e)}catch(n){console.log("Error reading from stateMachine: "+n)}},this.init=function(){t.canvas=document.getElementById("canvas");var e=t.canvas.getContext("2d");null!==e&&(t.context=e,window.onresize=t.resize,window.onclick=t.click,t.resize(),t.assetLibrary=new r.AssetLibrary,t.stateMachine=new n.StateMachine,t.stateMachine.push(new i.MenuState))},console.log("Mergem")}return t}();e.Game=o,e.game=new o,e.game.init()},function(t,e){"use strict";var s=function(){function t(t,e){this.x=t,this.y=e}return t}();e.Point=s},function(t,e,s){"use strict";var n=this&&this.__extends||function(t,e){function s(){this.constructor=t}for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);t.prototype=null===e?Object.create(e):(s.prototype=e.prototype,new s)},i=s(1),r=function(t){function e(){var e=t.call(this)||this;return e.click=function(t){},e.render=function(){},e.update=function(){},console.log("SHIET"),e}return n(e,t),e}(i.State);e.GameState=r},function(t,e,s){"use strict";var n=s(9),i=function(){function t(){this.assets=[],this.assets.push(new n.Asset("sound","applause","applause.mp3")),this.assets.push(new n.Asset("music","bgm","bgm.mp3")),this.assets.push(new n.Asset("sound","end","end.mp3")),this.assets.push(new n.Asset("music","endgame","endgame.mp3")),this.assets.push(new n.Asset("image","floor","floor.png")),this.assets.push(new n.Asset("sound","ice","ice.mp3")),this.assets.push(new n.Asset("image","ice","ice.png")),this.assets.push(new n.Asset("sound","menuhit","menuhit.wav")),this.assets.push(new n.Asset("sound","merge","merge.mp3")),this.assets.push(new n.Asset("sound","portal","portal.mp3")),this.assets.push(new n.Asset("image","portal","portal.png")),this.assets.push(new n.Asset("sound","retry","retry.mp3")),this.assets.push(new n.Asset("image","space","space.png")),this.assets.push(new n.Asset("image","sprite","sprite.png")),this.assets.push(new n.Asset("image","sprite1","sprite1.png")),this.assets.push(new n.Asset("sound","step","step.mp3")),this.assets.push(new n.Asset("image","switch","switch.png")),this.assets.push(new n.Asset("sound","switch","switch.wav")),this.assets.push(new n.Asset("image","wall","wall.png"))}return t}();e.AssetLibrary=i},function(t,e){"use strict";var s=function(){function t(t,e,s){var n=this;this.type=t,this.name=e,this.path=s,this.loaded=!1,this.load=function(t){$.get("assets/"+n.path,function(e){n.data=e,n.loaded=!0,t()}).fail(function(){console.error("Failed to load asset "+n.path+".")})}}return t}();e.Asset=s}]);
//# sourceMappingURL=bundle.js.map
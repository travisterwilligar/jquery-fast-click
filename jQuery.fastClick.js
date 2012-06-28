/**
 * jQuery.fastClick.js
 *
 * Work around the 300ms delay for the click event in some mobile browsers.
 *
 * Code based on <http://code.google.com/mobile/articles/fast_buttons.html>
 *
 * @usage
 * $('button').fastClick(function() {alert('clicked!');});
 *
 * @license Under Creative Commons Attribution 3.0 License
 * @author Dave Hulbert (dave1010)
 * @version 0.2 2011-09-20
 */

/*global document, window, jQuery, Math */

(function($) {

$.fn.fastClick = function(options) {
	options = options || {};
	return $(this).each(function() {
		var button = $(this)[0],
				clickEvent = null;

		if (options.handler == null) {
			if (button.onclick instanceof Function) {
				clickEvent = button.onclick;
				button.onclick = '';
			}
		}

		if (options.handler != null || clickEvent != null) {
			$.FastButton(button, options.handler || clickEvent, options);
		}
	});
};

$.FastButton = function(element, handler, options) {
	var startX, startY;

	var reset = function() {
		$(element).unbind('touchend');
		$("body").unbind('touchmove.fastClick');
	};

	var onClick = function(event) {
		event.stopPropagation();
		reset();
		delayManager.running && delayManager.stop() || handler.call(this, event);

		if (event.type === 'touchend') {
			$.clickbuster.preventGhostClick(startX, startY);
		}
	};

	var onTouchMove = function(event) {
		if (Math.abs(event.originalEvent.touches[0].clientX - startX) > 10 ||
			Math.abs(event.originalEvent.touches[0].clientY - startY) > 10) {
			reset();
		}
	};

	var onTouchStart = function(event) {
		event.stopPropagation();

		$(element).bind('touchend', onClick);
		$("body").bind('touchmove.fastClick', onTouchMove);

		startX = event.originalEvent.touches[0].clientX;
		startY = event.originalEvent.touches[0].clientY;

		// keep firing handler if option "permanent" is set
		if (options && options.permanent) {
			delayManager.start(element, handler);
		}
	};

	$(element).unbind();
	$(element).bind({
		touchstart: onTouchStart,
		mouseover: function() { return false; },
		click: onClick
	});

	var delayManager = (function() {
		var delay = 200,
				applyHandler;

		this.start = function(el, handler) {
			// initialize applyHandler everytime start gets called
			applyHandler = function(ms) {
				console.log(handler);
				if (this.running) {
					ms = ms || delay; // TODO: ease the shit out of this
					window.setTimeout(applyHandler, ms);
					handler.call(el);
				}
			};

			// kick off
			window.setTimeout(applyHandler, delay);
			this.running = true;
		};

		this.stop = function() {
		this.running = false;
		applyHandler = null;
	};

	return this;
	})();
};

$.clickbuster = {
	coordinates: [],

	preventGhostClick: function(x, y) {
		$.clickbuster.coordinates.push(x, y);
		window.setTimeout($.clickbuster.pop, 2500);
	},

	pop: function() {
		$.clickbuster.coordinates.splice(0, 2);
	},

	onClick: function(event) {
		var x, y, i;
		for (i = 0; i < $.clickbuster.coordinates.length; i += 2) {
			x = $.clickbuster.coordinates[i];
			y = $.clickbuster.coordinates[i + 1];
			if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
				event.stopPropagation();
				event.preventDefault();
			}
		}
	}
};

$(function(){
	document.addEventListener('click', $.clickbuster.onClick, true);
});

}(jQuery));

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

    if (!options.doNotPreventSelection) {
      // preventing selection cannot be done on the elements only
      $("*").css({
        "-webkit-user-select":"none",
        "-moz-user-select":"none",
        "-khtml-user-select":"none"
      });
    }

    return $(this).each(function() {
      var button = this,
          $button = $(button),
          clickHandler = null;
          
      // try to get events from jquery directly
      var foo = jQuery._data(this);
      console.log(button.id, foo, foo.events);

      if (options.handler == null) {
        if (button.onclick instanceof Function) {
          // button has clickHandler
          clickHandler = button.onclick;
          $button.data("clickHandler", button.onclick);
          button.onclick = '';
        } else if ($button.data("clickHandler")) {
          // button has already been fastclicked (use old clickhandler)
          clickHandler = $button.data("clickHandler");
        } else if ($button.attr('href') != null) {
          // button carries link
          clickHandler = function() {
            window.location.href = $button.attr('href');
          }
        }
      } else {
        // store handler, so future calls to fastclick remember it 
        $button.data("clickHandler", options.handler);
      }

      if (options.handler != null || clickHandler != null) {
        $.FastButton(button, options.handler || clickHandler, options);
      }
    });
  };

  $.FastButton = function(element, handler, options) {
    var startX, startY;

    var reset = function() {
      $(element).unbind('touchend');
      $("body").unbind('touchmove.fastClick');
      delayManager.stop();
    };

    var onClick = function(event) {
      event.stopPropagation();
      delayManager.running && delayManager.stop() || handler.call(this, event);
      reset();

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
      var delay = 300,
          applyHandler;

      this.start = function(el, handler) {
        // initialize applyHandler everytime start gets called
        applyHandler = function(ms) {
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

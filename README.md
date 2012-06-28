# jQuery fastClick plugin

Work around the 300ms delay for the click event in some mobile browsers (e.g. Android and iOS).
 
Original: https://github.com/dave1010/jquery-fast-click
Homepage: http://dave1010.github.com/jquery-fast-click
 
## Usage

    var options = {
      handler: function(el) { someCode... }, // falls back to the elements clickhandler if no option set
      permanent: false // if true, keeps firing the handler as long as you are pressing the button 
    }
    $('.button').fastClick(options);

    // or no options at all
    $('.button').fastClick();

## Why fork?

 - uses existing clickhandler on buttons, if any
 - has a "permanent" option where the handler keeps firing as long as you press the button
 - can reassign handlers. calling fastclick multiple times will always replace the existing handler
 
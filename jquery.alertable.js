//
// jquery.alertable.js - Minimal alert, confirmation, and prompt alternatives.
//
// Developed by Cory LaViska for A Beautiful Site, LLC
//
// Licensed under the MIT license: http://opensource.org/licenses/MIT
//
if(jQuery) (function($) {
  'use strict';

  var modal;
  var overlay;
  var okButton;
  var cancelButton;
  var activeElement;

  function show(type, message, options) {
    var defer = $.Deferred();

    // Remove focus from the background
    activeElement = document.activeElement;
    activeElement.blur();

    // Remove other instances
    $(modal).add(overlay).remove();

    // Merge options
    options = $.extend({}, $.alertable.defaults, options);

    // Create elements
    modal = $(options.modal).hide();
    overlay = $(options.overlay).hide();
    okButton = $(options.okButton);
    cancelButton = $(options.cancelButton);

    // Add message
    if(options.html) {
      modal.find('.alertable-message').html(message);
    } else {
      modal.find('.alertable-message').text(message);
    }

    // Add prompt
    if(type === 'prompt') {
      modal.find('.alertable-prompt').html(options.prompt);
    } else {
      modal.find('.alertable-prompt').remove();
    }

    // Add buttons
    $(modal).find('.alertable-buttons')
    //.append(type === 'alert' ? '' : cancelButton)
    //.append(okButton);
		//handling optional buttons for prompt mode
		.append(type === 'alert' ? '' : type === 'prompt' && options.promptOptions.displayCancelButton ? cancelButton : '')
		.append(type === 'prompt' && !options.promptOptions.displayOKButton ? '' : okButton);

    // Add to container
    $(options.container).append(overlay).append(modal);

	//set top and left
	if (options.top > 0) {
		$(modal).css({"top" : options.top});
	}
	if (options.left > 0) {
		$(modal).css({"left" : options.left});
	}
			
	//hide the overlay on click
	overlay.on('click.alertable', function () {
		hide(options);
		defer.reject();
	});	
	
    // Show it
    options.show.call({
      modal: modal,
      overlay: overlay
    });

    // Set focus
    if(type === 'prompt') {
      // First input in the prompt
      $(modal).find('.alertable-prompt :input:first').focus();
    } else {
      // OK button
      $(modal).find(':input[type="submit"]').focus();
    }

    // Watch for submit
    $(modal).on('submit.alertable', function(event) {
      var i;
      var formData;
      var values = [];

      event.preventDefault();

      if(type === 'prompt') {
        formData = $(modal).serializeArray();
        for(i = 0; i < formData.length; i++) {
          values[formData[i].name] = formData[i].value;
        }
      } else {
        values = null;
      }

      hide(options);
      defer.resolve(values);
    });

    // Watch for cancel
    cancelButton.on('click.alertable', function() {
      hide(options);
      defer.reject();
    });

    // Cancel on escape
    $(document).on('keydown.alertable', function(event) {
      if(event.keyCode === 27) {
        event.preventDefault();
		event.stopImmediatePropagation(); //prevent UndoRecord in Siebel OpenUI
        hide(options);
        defer.reject();
      }
    });

    // Prevent focus from leaving the modal
    $(document).on('focus.alertable', '*', function(event) {
      if(!$(event.target).parents().is('.alertable')) {
        event.stopPropagation();
        event.target.blur();
        $(modal).find(':input:first').focus();
      }
    });

    return defer.promise();
  }

  function hide(options) {
    // Hide it
    options.hide.call({
      modal: modal,
      overlay: overlay
    });

    // Remove bindings
    $(document).off('.alertable');
    modal.off('.alertable');
    cancelButton.off('.alertable');

    // Restore focus
    activeElement.focus();
  }

  // Defaults
  $.alertable = {
    // Show an alert
    alert: function(message, options) {
      return show('alert', message, options);
    },

    // Show a confirmation
    confirm: function(message, options) {
      return show('confirm', message, options);
    },

    // Show a prompt
    prompt: function(message, options, val) { //added the third input parameter - val
      return show('prompt', message, options);
    },

    defaults: {
      // Preferences
      container: 'body',
      html: false,
	  //added the top and left options, also promptOptions
	  top: 0, 
	  left: 0,
	  promptOptions: {
		displayCancelButton: false,
		displayOKButton: false,
		initialValue: '' //initial value to be displayed in prompt
	  },	  

      // Templates
      cancelButton: '<button class="alertable-cancel" type="button">Cancel</button>',
      okButton: '<button class="alertable-ok" type="submit">OK</button>',
      overlay: '<div class="alertable-overlay"></div>',
      prompt: '<input class="alertable-input" type="text" name="value">',
      modal:
        '<form class="alertable">' +
        '<div class="alertable-message"></div>' +
        '<div class="alertable-prompt"></div>' +
        '<div class="alertable-buttons"></div>' +
        '</form>',

      // Hooks
      hide: function() {
        $(this.modal).add(this.overlay).fadeOut(100);
      },
      show: function() {
        $(this.modal).add(this.overlay).fadeIn(100);
      }
    }
  };
})(jQuery);
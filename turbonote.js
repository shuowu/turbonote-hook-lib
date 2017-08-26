(function(global) {
  var api = {};
  var origin = window.location.origin;
  var init = function(options) {
    if (!options) {
      console.error('Missing options to hook TurboNote with video.');
      help();
      return;
    }

    if (!options.selector) {
      console.error('Missing video selector in options.');
      help();
      return;
    }

    var requiredFuncs = ['play', 'pause', 'seek', 'getCurrentTime', 'getDuration', 'isPlaying'];
    for (var i = 0, ii = requiredFuncs.length; i < ii; i++) {
      var func = requiredFuncs[i];
      if (typeof options[func] !== 'function') {
        console.error('Missing ' + func + ' function in options.');
        help();
        return;
      }
    }

    api = options;
    window.addEventListener('message', function(event) {
      if (event.source != window) {
        return;
      }

      processEvent(event['data']);
    }, false);

    window.postMessage({
      action: 'init',
      selector: options.selector
    }, origin);

    setInterval(function() {
      window.postMessage({
        type: 'playerState',
        playing: options.isPlaying() ? 1 : 0
      }, origin);
    }, 500);
  };

  var processEvent = function(data) {
    data = data || {};
    var action = data.action;
    switch (action) {
      case 'play':
        api.play();
        break;
      case 'pause':
        api.pause();
        break;
      case 'seek':
        api.seek(+data.data.time);
        break;
      case 'currentTime':
        var time = api.getCurrentTime();
        window.postMessage({
          type: 'currentTime',
          time: time
        }, origin);
        break;
      case 'duration':
        var duration = api.getDuration();
        window.postMessage({
          type: 'duration',
          time: duration
        }, origin);
        break;
      default:
        break;
    }
  };

  var help = function() {
    console.info('********** TurboNote API Helper **********');
    console.info('Call \'TurboNote.init(options)\' to hook video with TurboNote extension.');
    console.info('Fields:');
    console.info('selector --- Type: String.  Example: selector: \'#video-container video\'');
    console.info('play --- Type: function. Trigger video play. Example: play: function() { video.play() }');
    console.info('pause --- Type: function. Trigger video pause. Example: pause: function() { video.pause() }');
    console.info('seek --- Type: function. Trigger video seek. Example: seek: function(sec /* target time, int */) { video.currentTime = +currentTime; }');
    console.info('getCurrentTime -- Type: function. Get currentTime of video. Example: getCurrentTime: function() { return video.currentTime; }');
    console.info('getDuration -- Type: function. Get duration of video. Example: getDuration: function() { return video.duration; }');
    console.info('isPlaying -- Type: function. Return boolean status of video. Example: isPlaying: function() { return true; }');
    console.info('********** TurboNote API Helper **********');
  };

  global.TurboNote = {
    init: init
  };
})(window);

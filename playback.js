window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQA804RRxj-ptZy2oSQ9SMtxOq3tyvALIiPM0kj5jgAvIEZGHivOeuV96aU8miKIPsfmm6kKqwn5PTvVEqx7ny6oivmDzBNiSQ-F1cxgpDiW7hYzNJcjnr6RVNsZeuX05e0q2XWTpHtf0ciktENUgfTyCT2wTIIsIWBakxrC';
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => { cb(token); }
    });
  
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
  
    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });
  
    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });
  
    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });
  
    // Connect to the player!
    player.connect();
  };
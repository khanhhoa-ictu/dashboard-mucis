export const playbackOptions = [
  { title: 'Audio Quality', value: 'High (320 kbps)', type: 'select', icon: 'N' },
  { title: 'Crossfade', value: '5 seconds', type: 'select', icon: 'H' },
  { title: 'Equalizer', value: 'Custom', type: 'select', icon: 'E' },
  { title: 'Autoplay', value: 'Play similar songs', type: 'toggle', enabled: true, icon: 'P' },
  { title: 'Normalize Volume', value: 'Maintain consistent volume', type: 'toggle', enabled: true, icon: 'M' },
]

export const notificationSettings = [
  { title: 'New Music Releases', note: 'Get notified about new releases', enabled: true, tone: 'pink', icon: 'N' },
  { title: 'Playlist Updates', note: 'Updates to your playlists', enabled: true, tone: 'violet', icon: 'L' },
  { title: 'Recommendations', note: 'New music picks just for you', enabled: true, tone: 'violet', icon: 'H' },
  { title: 'Podcast Updates', note: 'New episodes from your shows', enabled: false, tone: 'sky', icon: 'P' },
  { title: 'Offers & News', note: 'Promotions and app news', enabled: false, tone: 'violet', icon: 'A' },
]

export const appearanceThemes = [
  { name: 'Lavender', tone: 'lavender' },
  { name: 'Peach', tone: 'peach' },
  { name: 'Mint', tone: 'mint' },
  { name: 'Deep Night', tone: 'deep' },
]

export const connectedDevices = [
  { name: "Mia's Headphones", model: 'AirPods Max', status: 'Connected', tone: 'headphones', connected: true },
  { name: 'Bedroom Speaker', model: 'Sonos One', status: 'Connected', tone: 'speaker', connected: true },
  { name: 'Car Audio', model: 'Tesla Model 3', status: 'Not Connected', tone: 'car', connected: false },
]

export const privacyOptions = [
  { title: 'Private Session', note: 'Hide your listening activity', type: 'toggle', enabled: false, icon: 'O' },
  { title: 'Blocked Users', note: 'Manage blocked accounts', type: 'link', icon: 'U' },
  { title: 'Data & Personalization', note: 'Manage your data and ads', type: 'link', icon: 'D' },
  { title: 'Download My Data', note: 'Request a copy of your data', type: 'link', icon: 'V' },
  { title: 'Account', note: 'Delete or deactivate your account', type: 'link', icon: 'A' },
]


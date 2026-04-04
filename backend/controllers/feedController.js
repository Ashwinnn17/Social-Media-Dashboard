const axios = require('axios');

// GET /api/feed/github
const getGitHub = async (req, res) => {
  const username = req.user.accounts.github;
  if (!username)
    return res.status(400).json({ message: 'No GitHub username set. Update your account settings.' });

  try {
    const headers = { 'User-Agent': 'social-dashboard' };

    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers }),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, { headers }),
    ]);

    res.json({
      user: {
        login:        userRes.data.login,
        name:         userRes.data.name,
        avatar_url:   userRes.data.avatar_url,
        bio:          userRes.data.bio,
        followers:    userRes.data.followers,
        following:    userRes.data.following,
        public_repos: userRes.data.public_repos,
        html_url:     userRes.data.html_url,
      },
      repos: reposRes.data.map(r => ({
        id:               r.id,
        name:             r.name,
        description:      r.description,
        html_url:         r.html_url,
        stargazers_count: r.stargazers_count,
        language:         r.language,
        updated_at:       r.updated_at,
      })),
    });
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) return res.status(404).json({ message: `GitHub user "${username}" not found` });
    res.status(500).json({ message: 'Failed to fetch GitHub data' });
  }
};

// GET /api/feed/reddit
const getReddit = async (req, res) => {
  const username = req.user.accounts.reddit;
  if (!username)
    return res.status(400).json({ message: 'No Reddit username set. Update your account settings.' });

  try {
    const headers = { 'User-Agent': 'social-dashboard:v1.0 (by /u/social_dashboard_app)' };

    const [postsRes, aboutRes] = await Promise.all([
      axios.get(`https://www.reddit.com/user/${username}/submitted.json?limit=5`, { headers }),
      axios.get(`https://www.reddit.com/user/${username}/about.json`, { headers }),
    ]);

    const posts = postsRes.data?.data?.children?.map(c => ({
      id:          c.data.id,
      title:       c.data.title,
      subreddit:   c.data.subreddit_name_prefixed,
      score:       c.data.score,
      num_comments:c.data.num_comments,
      permalink:   `https://reddit.com${c.data.permalink}`,
      created_utc: c.data.created_utc,
    })) ?? [];

    const about = aboutRes.data?.data;

    res.json({
      about: {
        name:           about?.name,
        total_karma:    about?.total_karma,
        link_karma:     about?.link_karma,
        comment_karma:  about?.comment_karma,
        icon_img:       about?.icon_img,
      },
      posts,
    });
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) return res.status(404).json({ message: `Reddit user "${username}" not found` });
    res.status(500).json({ message: 'Failed to fetch Reddit data' });
  }
};

// GET /api/feed/lastfm
const getLastfm = async (req, res) => {
  const username = req.user.accounts.lastfm;
  if (!username)
    return res.status(400).json({ message: 'No Last.fm username set. Update your account settings.' });

  const key  = process.env.LASTFM_API_KEY;
  const base = `https://ws.audioscrobbler.com/2.0/?api_key=${key}&format=json&user=${username}`;

  try {
    const [infoRes, recentRes, topRes] = await Promise.all([
      axios.get(`${base}&method=user.getinfo`),
      axios.get(`${base}&method=user.getrecenttracks&limit=5`),
      axios.get(`${base}&method=user.gettopartists&period=7day&limit=5`),
    ]);

    if (infoRes.data.error)
      return res.status(404).json({ message: `Last.fm user "${username}" not found` });

    const info   = infoRes.data.user;
    const recent = recentRes.data.recenttracks?.track ?? [];
    const top    = topRes.data.topartists?.artist ?? [];

    res.json({
      info: {
        name:       info.name,
        playcount:  info.playcount,
        country:    info.country,
        registered: info.registered?.unixtime,
        image:      info.image?.find(i => i.size === 'large')?.['#text'],
      },
      recent: recent.map(t => ({
        name:       t.name,
        artist:     t.artist?.['#text'],
        album:      t.album?.['#text'],
        nowplaying: !!t['@attr']?.nowplaying,
        date:       t.date?.['#text'] ?? 'now',
      })),
      topArtists: top.map(a => ({
        name:      a.name,
        playcount: a.playcount,
        url:       a.url,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Last.fm data' });
  }
};

// GET /api/feed/steam
const getSteam = async (req, res) => {
  const steamId = req.user.accounts.steam;
  if (!steamId)
    return res.status(400).json({ message: 'No Steam ID set. Update your account settings.' });

  const key  = (process.env.STEAM_API_KEY || '').trim();
  const base = 'https://api.steampowered.com';

  try {
    const [summaryRes, recentRes, ownedRes] = await Promise.all([
      axios.get(`${base}/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`),
      axios.get(`${base}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${key}&steamid=${steamId}&count=5`),
      axios.get(`${base}/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}&include_appinfo=false`),
    ]);

    const player  = summaryRes.data?.response?.players?.[0];
    if (!player)
      return res.status(404).json({ message: `Steam profile not found for ID "${steamId}"` });

    const recentGames = (recentRes.data?.response?.games || []).map(g => ({
      appid:             g.appid,
      name:              g.name,
      playtime_2weeks:   Math.round(g.playtime_2weeks  / 60 * 10) / 10, // hours
      playtime_forever:  Math.round(g.playtime_forever / 60 * 10) / 10,
      img_icon_url:      g.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
        : null,
    }));

    const totalGames = ownedRes.data?.response?.game_count ?? 0;

    const statusMap = { 0: 'Offline', 1: 'Online', 2: 'Busy', 3: 'Away', 4: 'Snooze', 5: 'Looking to Trade', 6: 'Looking to Play' };

    res.json({
      profile: {
        steamid:      player.steamid,
        name:         player.personaname,
        avatar:       player.avatarfull,
        profileUrl:   player.profileurl,
        status:       statusMap[player.personastate] || 'Offline',
        gameExtraInfo: player.gameextrainfo || null, // currently playing game
      },
      recentGames,
      totalGames,
    });
  } catch (err) {
    console.error('Steam API error:', err.message);
    res.status(500).json({ message: 'Failed to fetch Steam data' });
  }
};

module.exports = { getGitHub, getReddit, getLastfm, getSteam };
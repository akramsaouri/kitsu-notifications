const fetch = require('node-fetch');
const isToday = require('date-fns/is_today')

exports.handler = async (event) => {
  const { kitsuUserId } = event.queryStringParameters
  const url = `http://${event.headers.host}/.netlify/functions/sync?kitsuUserId=${kitsuUserId}` // TODO: make this dynamic
  const { data, errors } = await fetch(url).then(res => res.json())
  if (errors) {
    return {
      statusCode: errors[0].status,
      body: JSON.stringify({ errors })
    }
  }
  const today = new Date().getDay()
  const todayScheduledAnimes = data.filter(entry => {
    return entry.active && entry.airedAt.value === today
  })
  console.log({ todayScheduledAnimes })
  const todayReleasedEps = await Promise.all(todayScheduledAnimes.map(fetchThisWeekEpisode))
  console.log({ todayReleasedEps })
  const response = await Promise.all(todayReleasedEps
    .filter(x => !!x && x.success)
    .map(sendEpReleasedNotification)
  )
  return {
    statusCode: 200,
    body: JSON.stringify(response)
  }
}

async function fetchThisWeekEpisode(anime) {
  const url = `https://kitsu.io/api/edge/anime/${anime.id}/episodes?page[limit]=20"`
  const { errors, data } = await fetch(url).then(res => res.json())
  // TODO: fix pagniation for longer going animes 
  if (errors) {
    return {
      success: false,
      errors
    }
  }
  const thisWeekEpisode = data.find(row => isToday(row.attributes.airdate))
  console.log({ thisWeekEpisode })
  if (isEpisodeReleased(thisWeekEpisode)) {
    return {
      success: true,
      anime,
      episode: thisWeekEpisode
    }
  }
  return {
    success: false,
    errors: [{ title: 'Episode is still not out.' }]
  }
}

function isEpisodeReleased(episode) {
  return !!episode
    && !!episode.attributes.titles.en_us // new released episodes usually have a title 
    && episode.attributes.thumbnail !== null // and a thumbnail
}

function sendEpReleasedNotification({ anime, episode }) {
  return console.info(`A new episode (number ${episode.attributes.number}) for ${anime.title} is out.`)
}
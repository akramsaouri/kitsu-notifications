const fetch = require('node-fetch');
const isAfter = require('date-fns/is_after')

/**
 * Requires a valid kitsu user id
 * Fetches library (currently watched animes) for that user 
 * then fetches animes per library entry
 */
exports.handler = async (event) => {
  const { kitsuUserId } = event.queryStringParameters
  if (!kitsuUserId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        errors: [{
          title: 'Query param "kitsuUserId" is required.',
        }]
      }),
    }
  }
  const url = `https://kitsu.io/api/edge/library-entries?filter[userId]=${kitsuUserId}&filter[status]=current&filter[kind]=anime` // current watched animes
  const { data, errors } = await fetch(url).then(res => res.json())
  if (errors) {
    return {
      statusCode: errors[0].status,
      body: JSON.stringify({ errors })
    }
  }
  const results = await Promise.all(data.map(async entry => {
    // fetch anime for each library entry
    const { data } = await fetch(entry.relationships.anime.links.related).then(res => res.json())
    return {
      ...normalizeAnime(data),
      active: !hasFinishedAiring(data)
    }
  }))
  return {
    statusCode: 200,
    body: JSON.stringify({ data: results })
  }
}

const airedAtToLabel = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

function normalizeAnime(row) {
  const airedAtValue = new Date(row.attributes.startDate).getDay()
  return {
    id: row.id,
    title: row.attributes.titles.en || row.attributes.titles.en_jp,
    airedAt: {
      value: airedAtValue,
      label: airedAtToLabel[airedAtValue]
    }
  }
}

function hasFinishedAiring(data) {
  return data.attributes.endDate ? isAfter(new Date(), data.attributes.endDate) : false
}
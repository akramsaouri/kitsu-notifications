exports.handler = function (event, context, callback) {
  callback(null, {
    statusCode: 200,
    body: "Hello, World"
  });
}
// const express = require('express')
// const fetch = require('node-fetch');
// const bodyParser = require('body-parser')
// const isAfter = require('date-fns/is_after')
// const isToday = require('date-fns/is_today')
// const OneSignal = require('onesignal-node');

// const app = express()
// const port = 3000
// const oneSignalClient = new OneSignal.Client({
// 	userAuthKey: 'NjhlZTQ3NTQtM2YyYS00MDNlLTliYTctODFmMTI3ZjYxZDky',
// 	app: { appAuthKey: 'YzQxODY0MTYtN2QyOC00MWRlLThiMjMtNmE3NGVmYjM0NmQ4', appId: 'f62a85c3-110e-4179-8a94-6261afe791d1' }
// });
// const testPlayerID = 'c2aad8c9-36ad-4e7d-99c2-25d7e4d15930'

// app.use(bodyParser.json())

// /**
//  * Requires a valid kitsu user id
//  * Fetches library (currently watched animes) for that user 
//  * then fetches animes per library entry
//  * * This endpoints omit animes who finished airing
//  */
// app.get('/sync', async (req, res) => {
// 	const { kitsuUserId } = req.query
// 	if (!kitsuUserId) {
// 		return res.status(400).send({
// 			errors: [{
// 				title: 'Query param "kitsuUserId" is required.',
// 				status: 400
// 			}]
// 		})
// 	}
// 	const url = `https://kitsu.io/api/edge/library-entries?filter[userId]=${kitsuUserId}&filter[status]=current&filter[kind]=anime` 	// current watched animes
// 	const { data, errors } = await fetch(url).then(res => res.json())
// 	if (errors) {
// 		return res.status(errors[0].status).json({ errors })
// 	}
// 	const results = await Promise.all(data.map(async entry => {
// 		// fetch anime for each library entry
// 		const { data, errors } = await fetch(entry.relationships.anime.links.related).then(res => res.json())
// 		if (errors) {
// 			return {
// 				error: {
// 					title: `Failed to fetch anime.`,
// 					detail: errors,
// 					status: 500
// 				}
// 			}
// 		}
// 		if (hasFinishedAiring(data)) {
// 			return {
// 				error: {
// 					title: `Anime with id ${data.id} has already finished airing.`,
// 					detail: {
// 						...normalizeAnime(data)
// 					},
// 					status: 400,
// 				}
// 			}
// 		}
// 		return { data: normalizeAnime(data) }
// 	}))
// 	return res.json(toPair(results))
// })

// // app.post('/notify', async (_, res) => {
// // 	const animes = trackeds.filter(tracked => {
// // 		return tracked.airedAt.value === new Date().getDay()
// // 	})
// // 	const results = await Promise.all(animes.map(async anime => {
// // 		const url = `https://kitsu.io/api/edge/anime/${anime.id}/episodes`
// // 		const { errors, data } = await fetch(url).then(res => res.json())
// // 		if (errors) {
// // 			return errors
// // 		}
// // 		const thisWeekEpisode = data.find(row => isToday(row.attributes.airdate))
// // 		const isEpisodeRelesed = !!thisWeekEpisode
// // 			&& !!thisWeekEpisode.attributes.titles.en_us // new released episodes usually have a title 
// // 			&& thisWeekEpisode.attributes.thumbnail !== null // and a thumbnail
// // 		if (isEpisodeRelesed) return { anime, episode: thisWeekEpisode }
// // 		return null
// // 	}))
// // 	const response = await Promise.all(results.filter(x => !!x).map(sendEpReleasedNotification))
// // 	return res.json(response)
// // })


// // function sendEpReleasedNotification({ anime, episode }) {
// // 	const notification = new OneSignal.Notification({
// // 		contents: {
// // 			en: `A new episode (number ${episode.attributes.number}) for ${anime.title} is out.`
// // 		},
// // 		include_player_ids: [testPlayerID]
// // 	});

// // 	return oneSignalClient.sendNotification(notification)
// // 	// .then(function (response) {
// // 	// 	res.status(response.httpResponse.statusCode).json(response.data);
// // 	// })
// // 	// .catch(function (err) {
// // 	// 	res.send(err)
// // 	// });
// // }

// const airedAtToLabel = {
// 	1: 'Monday',
// 	2: 'Tuesday',
// 	3: 'Wednesday',
// 	4: 'Thursday',
// 	5: 'Friday',
// 	6: 'Saturday',
// 	7: 'Sunday',
// }

// function normalizeAnime(row) {
// 	const airedAtValue = new Date(row.attributes.startDate).getDay()
// 	return {
// 		id: row.id,
// 		title: row.attributes.titles.en || row.attributes.titles.en_jp,
// 		airedAt: {
// 			value: airedAtValue,
// 			label: airedAtToLabel[airedAtValue]
// 		}
// 	}
// }

// function hasFinishedAiring(data) {
// 	return data.attributes.endDate ? isAfter(new Date(), data.attributes.endDate) : false
// }

// function toPair(results) {
// 	return results.reduce((prev, current) => {
// 		if (current.error) {
// 			prev.errors.push(current.error)
// 		}
// 		if (current.data) {
// 			prev.data.push(current.data)
// 		}
// 		return prev
// 	}, { errors: [], data: [] })
// }

// app.listen(port, () => console.log(`App listening on port ${port}!`))
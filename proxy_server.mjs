// https://www28.gogocdn.club/www04/DguGWt0YYiBxIm6AqsWnfA/1645298559/e7b499c11b82dfdaa72dc10c08c31757/ep.1.1634310704.720.m3u8

import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import got from 'got';
import stream from 'stream';
import cors from 'cors';

const app = express()
app.use(cors())
const port = process.env.PORT || 3000
const Transform = stream.Transform;

app.get('/fetch_ts', async (req, res) => {
	const url = req.query.url
	res.setHeader('content-type', 'video/mp2t');
	console.log(url)
	got.stream(url).pipe(res)
})

app.get('/fetch_m3u8', async (req, res) => {
	const url = req.query.url
	const base_url = url.split('/').slice(0, -1).join('/')
	const parser = new Transform();
	res.setHeader('content-type', 'application/x-mpegURL');
	parser._transform = function(data, encoding, done) {
		const regex = /([a-z0-9./-]*.ts)/gm
		const m3u8_filtered = Buffer.from(
			data.toString()
			.replace(regex, `/fetch_ts?url=${base_url}/$1`)
		)
		this.push(m3u8_filtered)
		// console.log(m3u8_filtered.toString())
		done();
	};
	got.stream(url).pipe(parser).pipe(res);
})

// app.get('/fetch_m3u8', async (req, res) => {
// 	const url = req.query.url
// 	const m3u8_raw = await fetch(url).then(res => res.text())
// 	const regex = /([a-z0-9./-]*.ts)/gm
// 	const m3u8_filtered = m3u8_raw.replace(regex, `http://localhost:3000/fetch_ts?url=${url}/$1`)
// 	res.setHeader('content-type', 'application/x-mpegURL');
// 	res.send(m3u8_filtered)
//   })

app.get('/player', function(req, res) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  res.sendFile(path.join(__dirname, '/player.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
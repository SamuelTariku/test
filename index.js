const express = require("express"),
	bodyParser = require("body-parser"),
	path = require("path"),
	fs = require("fs"),
	app = express();

// app.use('/mp3', express.static(__dirname + '/mp3'));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get("/stream", (req, res) => {
	const file = __dirname + "\\mp3\\Isaac Asimov - Foundation.mp3";
	const stat = fs.statSync(file);
	const total = stat.size;
	if (!req.headers.range) {
		res.send("Error - 404");
		res.end();
		return;
	}
	console.log("Stream: ", req.headers.range);
	fs.exists(file, (exists) => {
		if (exists) {
			const range = req.headers.range;
			const parts = range.replace(/bytes=/, "").split("-");
			const partialStart = parts[0];
			const partialEnd = parts[1];

			const start = parseInt(partialStart, 10);
			const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
			const chunksize = end - start + 1;
			const rstream = fs.createReadStream(file, { start: start, end: end });

			res.writeHead(206, {
				"Content-Range": "bytes " + start + "-" + end + "/" + total,
				"Accept-Ranges": "bytes",
				"Content-Length": chunksize,
				"Content-Type": "audio/mpeg",
			});
			rstream.pipe(res);
		} else {
			res.send("Error - 404");
			res.end();
			// res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
			// fs.createReadStream(path).pipe(res);
		}
	});
});

app.get("/download", (req, res) => {
	const file = __dirname + "\\mp3\\Duel of The Fates.mp3";
	res.download(file);
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));

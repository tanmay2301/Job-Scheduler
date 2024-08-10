const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Error loading the form.');
            } else {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(data);
            }
        });
    } else if (req.method === 'POST' && req.url === '/schedule') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const formData = querystring.parse(body);
                const numSchedulers = parseInt(formData.numSchedulers);
                const numJobs = parseInt(formData.numJobs);

                if (isNaN(numSchedulers) || isNaN(numJobs) || numSchedulers < 1 || numJobs < 1) {
                    throw new Error('Invalid input: Number of schedulers and jobs must be positive integers.');
                }

                const schedulers = {};
                for (let i = 0; i < numSchedulers; i++) {
                    schedulers[`Scheduler ${i + 1}`] = [];
                }

                for (let i = 0; i < numJobs; i++) {
                    const schedulerIndex = i % numSchedulers;
                    schedulers[`Scheduler ${schedulerIndex + 1}`].push(`Job ${i + 1}`);
                }

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write('<h1>Scheduling Result</h1>');
                for (let scheduler in schedulers) {
                    res.write(`<p><strong>${scheduler}:</strong> ${schedulers[scheduler].join(', ')}</p>`);
                }
                res.end();

            } catch (error) {
                console.error('Error processing request:', error.message);
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end('Error: ' + error.message);
            }
        });

    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

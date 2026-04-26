const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

const server = http.createServer((req, res) => {
    // 1. READ ALL RECORDS (GET /tasks)
    if (req.url === '/tasks' && req.method === 'GET') {
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Error reading data" }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } 

    // 2. CREATE A RECORD (POST /tasks)
    else if (req.url === '/tasks' && req.method === 'POST') {
        let body = '';
        
        // Listen for data chunks (Streams)
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newTask = JSON.parse(body);
            
            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                const tasks = JSON.parse(data);
                
                // Assign a simple ID based on timestamp
                newTask.id = Date.now();
                tasks.push(newTask);

                fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: "Error saving data" }));
                        return;
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newTask));
                });
            });
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
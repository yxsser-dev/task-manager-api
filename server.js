const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

const server = http.createServer((req, res) => {
    const { method, url } = req;

    // 1. READ ALL (GET /tasks)
    if (url === '/tasks' && method === 'GET') {
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } 

    // 2. CREATE (POST /tasks)
    else if (url === '/tasks' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const newTask = JSON.parse(body);
            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                const tasks = JSON.parse(data);
                newTask.id = Date.now(); // Create unique ID [cite: 12]
                tasks.push(newTask);
                fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), () => {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newTask));
                });
            });
        });
    }

    // 3. UPDATE (PUT /tasks/id) & DELETE (DELETE /tasks/id)
    else if (url.startsWith('/tasks/') && (method === 'PUT' || method === 'DELETE')) {
        const id = parseInt(url.split('/')[2]); // Parse ID from URL [cite: 19, 23]
        
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            let tasks = JSON.parse(data);
            
            if (method === 'PUT') {
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', () => {
                    const updatedInfo = JSON.parse(body);
                    tasks = tasks.map(t => t.id === id ? { ...t, ...updatedInfo } : t);
                    fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), () => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: "Task updated" }));
                    });
                });
            } else if (method === 'DELETE') {
                tasks = tasks.filter(t => t.id !== id);
                fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Task deleted" }));
                });
            }
        });
    }
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));
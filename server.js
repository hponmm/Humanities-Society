const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'newsletters.json');
const EVENTS_FILE = path.join(__dirname, 'data', 'events.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Ensure data directory and files exist
async function initializeDataFiles() {
    try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        
        // Initialize newsletters file
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify({ newsletters: [] }));
        }
        
        // Initialize events file
        try {
            await fs.access(EVENTS_FILE);
        } catch {
            await fs.writeFile(EVENTS_FILE, JSON.stringify({ events: [] }));
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// Get all newsletters
app.get('/api/newsletters', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const { newsletters } = JSON.parse(data);
        res.json(newsletters);
    } catch (error) {
        console.error('Error reading newsletters:', error);
        res.status(500).json({ error: 'Failed to fetch newsletters' });
    }
});

// Add a new newsletter
app.post('/api/newsletters', async (req, res) => {
    try {
        const { title, author, date, content, imageUrl, videoUrl } = req.body;
        
        if (!title || !date || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = await fs.readFile(DATA_FILE, 'utf8');
        const { newsletters } = JSON.parse(data);
        
        const newNewsletter = {
            id: Date.now().toString(),
            title,
            author: author || 'Anonymous',
            date,
            content,
            imageUrl: imageUrl || '',
            videoUrl: videoUrl || '',
            timestamp: new Date().toISOString()
        };
        
        newsletters.unshift(newNewsletter);
        await fs.writeFile(DATA_FILE, JSON.stringify({ newsletters }, null, 2));
        
        res.json(newNewsletter);
    } catch (error) {
        console.error('Error adding newsletter:', error);
        res.status(500).json({ error: 'Failed to add newsletter' });
    }
});

// Delete a newsletter
app.delete('/api/newsletters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const { newsletters } = JSON.parse(data);
        
        const filteredNewsletters = newsletters.filter(n => n.id !== id);
        
        if (newsletters.length === filteredNewsletters.length) {
            return res.status(404).json({ error: 'Newsletter not found' });
        }
        
        await fs.writeFile(DATA_FILE, JSON.stringify({ newsletters: filteredNewsletters }, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting newsletter:', error);
        res.status(500).json({ error: 'Failed to delete newsletter' });
    }
});

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const data = await fs.readFile(EVENTS_FILE, 'utf8');
        const { events } = JSON.parse(data);
        res.json(events);
    } catch (error) {
        console.error('Error reading events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Add a new event
app.post('/api/events', async (req, res) => {
    try {
        const { name, date, startTime, endTime, hosts, description, tags, location, capacity, formUrl } = req.body;
        
        if (!name || !date || !startTime || !endTime || !hosts || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = await fs.readFile(EVENTS_FILE, 'utf8');
        const { events } = JSON.parse(data);
        
        const newEvent = {
            id: Date.now().toString(),
            name,
            date,
            startTime,
            endTime,
            hosts: hosts.split(',').map(h => h.trim()),
            description,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            location: location || 'TBD',
            capacity: capacity || null,
            formUrl: formUrl || '',
            registrations: 0,
            timestamp: new Date().toISOString()
        };
        
        events.unshift(newEvent);
        await fs.writeFile(EVENTS_FILE, JSON.stringify({ events }, null, 2));
        
        res.json(newEvent);
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ error: 'Failed to add event' });
    }
});

// Delete an event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(EVENTS_FILE, 'utf8');
        const { events } = JSON.parse(data);
        
        const filteredEvents = events.filter(e => e.id !== id);
        
        if (events.length === filteredEvents.length) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        await fs.writeFile(EVENTS_FILE, JSON.stringify({ events: filteredEvents }, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Start server
initializeDataFiles().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log('Press Ctrl+C to stop the server');
    });
});
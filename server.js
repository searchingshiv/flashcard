const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://QQQQ:QQQQ@cluster0.1mfmnnf.mongodb.net/flashcardDB?retryWrites=true&w=majority', {
    tls: true,
    tlsAllowInvalidCertificates: true, // Use this if you are facing certificate issues
}).then(() => {
    console.log('Successfully connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});

// Flashcard Schema
const flashcardSchema = new mongoose.Schema({
    id: { type: String, required: true },
    questions: [String],
    answers: [String],
    userId: String, // Optional if implementing user auth
});

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the flashcard view page
app.get('/flashcards/view/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view-flashcard.html'));
});

// Create flashcard set
app.post('/flashcards', async (req, res) => {
    try {
        const { questions, answers, userId } = req.body;
        const id = uuidv4();
        const newFlashcardSet = new Flashcard({ id, questions, answers, userId });
        await newFlashcardSet.save();
        res.json({ id });
    } catch (error) {
        console.error('Error creating flashcard set:', error);
        res.status(500).json({ error: 'Failed to create flashcard set' });
    }
});

// Get flashcard set by ID
app.get('/flashcards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const flashcardSet = await Flashcard.findOne({ id });
        if (flashcardSet) {
            res.json(flashcardSet);
        } else {
            res.status(404).json({ error: 'Flashcard set not found' });
        }
    } catch (error) {
        console.error('Error fetching flashcard set:', error);
        res.status(500).json({ error: 'Failed to fetch flashcard set' });
    }
});

// Get all flashcard sets for a user (optional)
app.get('/user/:userId/flashcards', async (req, res) => {
    try {
        const { userId } = req.params;
        const flashcardSets = await Flashcard.find({ userId });
        res.json(flashcardSets);
    } catch (error) {
        console.error('Error fetching user flashcard sets:', error);
        res.status(500).json({ error: 'Failed to fetch user flashcard sets' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// server.js

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
// Updated MongoDB connection string
mongoose.connect('mongodb+srv://wwww:wwww@cluster0.u2hhi.mongodb.net/flashcardDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });


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
    const { questions, answers, userId } = req.body;
    const id = uuidv4();
    const newFlashcardSet = new Flashcard({ id, questions, answers, userId });
    await newFlashcardSet.save();
    res.json({ id });
});

// Get flashcard set by ID
app.get('/flashcards/:id', async (req, res) => {
    const { id } = req.params;
    const flashcardSet = await Flashcard.findOne({ id });
    if (flashcardSet) {
        res.json(flashcardSet);
    } else {
        res.status(404).json({ error: 'Flashcard set not found' });
    }
});

// Get all flashcard sets for a user (optional)
app.get('/user/:userId/flashcards', async (req, res) => {
    const { userId } = req.params;
    const flashcardSets = await Flashcard.find({ userId });
    res.json(flashcardSets);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

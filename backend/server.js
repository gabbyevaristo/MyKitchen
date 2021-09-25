import express from 'express';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import usersRoutes from './routes/usersRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize middleware
app.use(cors());
app.use(express.json());

// Add routes
app.use('/users', usersRoutes);
app.use('/recipe', recipeRoutes);

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('CONNECTED TO DATABASE')
);

app.listen(PORT, () => console.log('SERVER RUNNING'));

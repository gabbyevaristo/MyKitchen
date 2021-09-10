import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// Get all users
router.get('/getUsers', async (req, res) => {
    try {
        const user = await User.find();
        res.json(user);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Get a specific user
router.get('/getUser/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new Error(`User with ID: ${req.params.id} does not exist`);
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Register a user
router.post('/registerUser', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (user) {
            if (user.email === email) {
                throw new Error(`User with email: ${email} already exists`);
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Login user
router.post('/loginUser', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                res.json({ msg: 'OK' });
            } else {
                throw new Error(`Wrong email or password`);
            }
        } else {
            throw new Error(`Wrong email or password`);
        }
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Add to ingredients list
router.put('/addIngredient/:id', async (req, res) => {
    try {
        const { ingredient, quantity } = req.body;
        const query = `ownedIngredients.${ingredient}`;
        const foundIngredient = await User.findOne(
            { _id: req.params.id },
            {
                [query]: 1,
            }
        );
        const oldQuantity = foundIngredient.ownedIngredients[ingredient];
        const value = oldQuantity ? oldQuantity + quantity : quantity;
        const updatedUser = await User.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    [query]: value,
                },
            }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Modify ingredients list
router.put('/editIngredient/:id', async (req, res) => {
    try {
        const { ingredient, quantity } = req.body;
        const query = `ownedIngredients.${ingredient}`;
        const updatedUser = await User.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    [query]: quantity,
                },
            }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Remove from ingredients list
router.put('/deleteIngredient/:id', async (req, res) => {
    try {
        const { ingredient } = req.body;
        const query = `ownedIngredients.${ingredient}`;
        const updatedUser = await User.updateOne(
            { _id: req.params.id },
            {
                $unset: {
                    [query]: '',
                },
            }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Add to saved recipes
router.put('/addRecipe/:id', async (req, res) => {
    try {
        const { recipeId } = req.body;
        const updatedUser = await User.updateOne(
            { _id: req.params.id },
            {
                $addToSet: {
                    savedRecipes: [recipeId],
                },
            }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Remove from saved recipes
router.put('/deleteRecipe/:id', async (req, res) => {
    try {
        const { recipeId } = req.body;
        const updatedUser = await User.updateOne(
            { _id: req.params.id },
            {
                $pull: {
                    savedRecipes: recipeId,
                },
            }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Delete user
router.delete('/deleteUser/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new Error(`User with ID: ${req.params.id} does not exist`);
        }
        const removedUser = await User.deleteOne({
            _id: req.params.id,
        });
        res.json(removedUser);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Edit password

export default router;

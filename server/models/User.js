import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true   // Ensures no duplicate usernames
    },
    password: {
        type: String,
        required: true // Will store hashed password
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'  // New users default to 'user' role
    }
});

const User = mongoose.model('User', userSchema);

export default User;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/rentdb')
    .then(async () => {
        const existingAdmin = await User.findOne({ username: 'admin' });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);

            const admin = new User({
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
            });

            await admin.save();
            console.log('✅ Admin user created');
        } else {
            console.log('ℹ️ Admin user already exists');
        }

        mongoose.disconnect();
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

// generateHash.js
import bcrypt from 'bcrypt';

const plainPassword = 'HelloLove';

bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
        console.error('❌ Error hashing password:', err);
    } else {
        console.log('✅ New bcrypt hash:', hash);
    }
});

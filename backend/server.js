const dotenv = require('dotenv');
dotenv.config();

// Patch for BigInt serialization (prevents crash on BigInt fields)
BigInt.prototype.toJSON = function() { return this.toString() };

const app = require('./src/app');
const githubRoutes = require('./src/routes/githubRoutes');

const PORT = process.env.PORT || 4000;

app.use('/api/github', githubRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

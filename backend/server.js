const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const githubRoutes = require('./src/routes/githubRoutes');

const PORT = process.env.PORT || 4000;

app.use('/api/github', githubRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

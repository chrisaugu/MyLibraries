import Redis from "ioredis";

const redis = new Redis();

app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    const cachedUser = await redis.get(`user:${id}`);
    if (cachedUser) {
        return res.json(JSON.parse(cachedUser));
    }
    const user = await User.findById(id);
    redis.setex(`user:${id}`, 3600, JSON.stringify(user)); // Cache for 1 hour
    res.json(user);
});

app.get('/users', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find()
        .skip((page - 1) * limit)
        .limit(Number(limit));
    res.json(users);
});
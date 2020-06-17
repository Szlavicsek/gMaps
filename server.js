const express = require('express');
const db = require('./db.json');
const path = require("path");
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

app.listen(process.env.PORT, () => {
    console.log("❇️ Express server is running on port", process.env.PORT);
});

const verifySignature = (req, res, next) => {
    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha1', process.env.GITHUB_SECRET);
    const digest = 'sha1=' + hmac.update(payload).digest('hex');
    const checksum = req.headers['x-hub-signature'];
    
    if (!checksum || !digest || checksum !== digest) {
        return res.status(403).send('auth failed')
    }
    
    return next()
};

app.post('/api/git', verifySignature, (req, res) => {
    console.log('posted on api git')
    if (req.headers['x-github-event'] === 'push') {
        cmd.get('bash git.sh', (err, data) => {
            if (err) return console.log(err);
            console.log(data);
            cmd.run('refresh');
            return res.status(200).send(data)
        })
    } else if(req.headers['x-github-event'] == 'ping') {
        return res.status(200).send('PONG')
    } else {
        return res.status(200).send('Unsuported Github event. Nothing done.')
    }
});


app.get('/api/stores', (req, res) => {
    res.status(200).json(db);
});

const app = require('express')();
const Chance = require('chance');
const chance = new Chance();

const urls = {};

app.get('/new/*', (req, res) => {
  const url = req.path.slice(5);
  const urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/

  const allow = req.query.allow ? JSON.parse(req.query.allow) : false;

  if (!urlRegex.test(url) && !(allow)) {
    return res.send('url not valid');
  }

  for (const key in urls) {
    if (urls[key] === url) {
      return res.send({
        'original_url': url,
        'short_url': `${req.hostname}/${key}`
      });
    }
  }

  const short = chance.string({length: 5, pool: 'abcdefghijklmnopqrstuvwxyz'});
  urls[short] = url;
  console.log(`shortened ${url} to ${short}`);
  res.send(JSON.stringify({
    'original_url': url,
    'short_url': `${req.hostname}/${short}`
  }));
});

app.get('/:short', (req, res) => {
  const url = urls[req.params.short];
  if (url) {
    console.log(`redirecting ${req.params.short} to ${url}`);
    res.redirect(url);
  } else {
    console.log(`${url} does not exist`);
    res.status(404).send('That url does not exist');
  }
});

const server = app.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log(`app listening at ${port}`);
});

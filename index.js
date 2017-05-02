const express = require('express');
const validator = require('validator');
const path = require('path');
const mongodb = require('mongodb');
const monk = require('monk');
const shortid = require('shortid');
const compareUrls = require('compare-urls');

const db = monk(process.env.DATABASE_URL);
const app = express();
const port = process.env.PORT || 3500;
const collection = db.get('usercollection');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/new/*', (req, res) => {
  const url = req.path.split('/new')[1].split('').slice(1).join('');
  if (validator.isURL(url, {require_protocol: true})) {
    collection.find({},{}, function(e, docs) {
      if (e) {
        console.log(e);
        return res.json({error: 'Somethong went wrong.'})
      }

      let result = {};
      if (urlExists(url, docs, 'orginal_url')) {
        result = {
          orginal_url: url,
          short_url: getShortUrl(url, docs, req)
        };
      } else {
        result = createNewUrl(url, req);
      }

      res.json(result);
    });
  } else {
    res.json({
      url,
      error: 'Wrong url format, make sure you have a valid protocol and real site.'
    });
  }
});

app.get('/:short_url', (req, res) => {
  collection.find({},{}, function(e, docs) {
    if (e) {
      console.log(e);
      return res.json({error: 'Somethong went wrong.'})
    }

    const short_url = req.params.short_url;
    const orginal_url = getOriginalUrl(short_url, docs);
    if (orginal_url) {
      res.redirect(orginal_url);
    } else {
      res.json({
        error: 'This url is not on the database.'
      });
    }
  });

});

function getOriginalUrl(short_url, docs) {
  for (item of docs) {
    if (item.short_url === short_url) {
      return item.orginal_url;
    }
  }

  return null;
}

function getUrls(docs, key) {
  return docs.map((record) => { return record[key] });
}

function urlExists(url, docs, key) {
  if (!docs) {
    return false;
  }

  const urls = getUrls(docs, key);
  let url_exists = false;
  for (existing_url of urls) {
    if (compareUrls(existing_url, url)) {
      url_exists = true
    }
  }
  return url_exists;
}

function getShortUrl(url, docs, req) {
  for (record of docs) {
    if (record.orginal_url === url) {
      const locationUrl = getLocationUrl(req);
      return locationUrl + '/' + record.short_url;
    }
  }
}

function createNewUrl(url, req) {
  const short_url = shortid.generate();
  collection.insert({
    'orginal_url': url,
    'short_url': short_url
  });

  return {
    'orginal_url': url,
    'short_url': getLocationUrl(req) + '/' + short_url
  }
}

function getLocationUrl(req) {
  return req.protocol + '://' + req.get('host');
}

app.listen(port);

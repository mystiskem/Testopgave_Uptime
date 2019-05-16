import 'zone.js/dist/zone-node';
import { enableProdMode } from '@angular/core';
// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import { join } from 'path';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
export const app = express();

// Body-parser (håber det virker)
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP
} = require('./dist/server/main');

// Upload directory path
const userFiles = './user_upload/';
const fs = require('fs');

// listFiles sættes til callBack objektet, som indeholder et array med filnavnene fra ./user_upload.
const listFiles = (callBack) => {
  return fs.readdir('./user_upload', callBack);
};

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine(
  'html',
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [
      provideModuleMap(LAZY_MODULE_MAP),
      {provide: 'LIST_FILES', useValue: listFiles} // Provider listFiles til ngExpressEngine?
    ]
  })
);

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// * Upload endpoint
app.put('/files', (req, res) => {
  const file = req.body;
  // Erstatter 'data: og alt derefter op til ',' med en tom string, så der kun er ren data tilbage.
  const base64data = file.content.replace(/^data:.*,/, '');
  // Skriver base64data til filen og forsøger at sende/uploade filen.
  fs.writeFile(userFiles + file.name, base64data, err => {
    if (err) {
      console.log(err);
      res.sendStatus(500); // 500 Internal server error.
    } else {
      res.set('Location', userFiles + file.name);
      res.status(200);
      res.send(file);
    }
  });
});

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });
// Serve static files from /browser
app.get(
  '*.*',
  express.static(DIST_FOLDER, {
    maxAge: '1y'
  })
);

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// * Delete endpoint
app.delete('/files/**', (req, res) => {
  // Extracter substringen efter index 7 og erstatter alle forekomster af %20 med en tom string. (Hvorfor lige 7?)
  const fileName = req.url.substring(7).replace(/%20/g, '');
  // Fjerner filen (er ikke sikker på hvordan fileName ser ud her).
  fs.unlink(userFiles + fileName, err => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.status(204); // 204 No content.
      res.send({});
    }
  });
});

// * Get
// Sørger for at alle Get requests til /files/** endpointet behandles som static hosting,
// fra userFiles (user_upload) mappen.
app.use('/files', express.static(userFiles));

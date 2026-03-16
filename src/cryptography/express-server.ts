import express from 'express';
import bodyParser from 'body-parser';
import ocr from './ocr';
import EncryptionMiddleware from './encryption-middleware';
import webhook from './webhook';
import path from 'node:path';

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// app.use(express.raw({ type: 'application/webhook+json' }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({
  // verify: (req, res, buffer) => {
  //   Object.assign(req, {
  //     rawBody: buffer
  //   });
  //   return req;
  // }
}));
// app.use(ocr);
app.use(express.static(path.join(__dirname, 'public')));

const serverPrivateKey = '';
const clientPublicKeyRegistry = {};
const encryptionMiddleware = new EncryptionMiddleware(
  serverPrivateKey,
  clientPublicKeyRegistry
);
// app.use(encryptionMiddleware.decryptRequest);
// app.use(encryptionMiddleware.encryptResponse);

app.use(webhook);

app.get('/api/users/me', async (req, res) => {
  // const imageUrl = req.query.imageurl as string;
  // console.log(imageUrl);

  res.send('Eh');
});

export default app;

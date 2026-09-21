const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir));

// L'appli Angular est une SPA : toute route inconnue retombe sur
// index.html pour que le routeur Angular côté client prenne le relais.
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Serveur de démo en écoute sur le port ${port}`);
});

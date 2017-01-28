var express = require('express'),
    port = process.env.PORT || 3000,
    app = express(),
    sendApp = function(req, res){
      res.status(200).sendFile('index.html');
    },
    listening = function(){
      console.log('Tragenda running..');
    };

app.use(express.static('public'));
app.get('/', sendApp);
app.listen(port, listening);

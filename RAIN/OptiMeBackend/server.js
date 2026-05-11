const app = require('./app');
const mongoose = require('mongoose');

mongoose.connect('mongodb://zigalebic02:jp8bQs3yA1FSR0sH@ac-rxpanwp-shard-00-00.yjssyxx.mongodb.net:27017,ac-rxpanwp-shard-00-01.yjssyxx.mongodb.net:27017,ac-rxpanwp-shard-00-02.yjssyxx.mongodb.net:27017/OptiMe?ssl=true&replicaSet=atlas-822hpm-shard-0&authSource=admin&appName=OptiMe')
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.log(" MongoDB error:", err));

app.listen(3000, function() {
    console.log('listening on 3000')
});

module.exports = app;
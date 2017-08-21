
const cloudant = require('cloudant');
const request = require('request');

const readBitcoinPrice = function () {
  return new Promise(function(resolve, reject) {
    var req = {
      url: 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD',
      json: true 
    };
    request(req, function (err,r,data) {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

const main = function(args) {
  return readBitcoinPrice().then(function(data) {
    console.log(data);
    var obj = {
      _id: new Date().getTime().toString(),
      btcinusd: data.BTC.USD
    };
    if (args && args.url) {
      const c = cloudant({url: args.url, plugin: 'promises'});
      const db = c.db.use('bitcoin');
      return db.insert(obj);
    } else {
      return { ok: true }
    } 

  })
};

exports.main = main;  
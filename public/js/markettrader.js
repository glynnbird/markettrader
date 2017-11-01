var plot = null;


function update() {  

}

var rsi = function(data) {
  var n = data.length;
  var totgain = 0;
  var numgain = 0;
  var totloss = 0;
  var numloss = 0;
  
  for(var i = n - 100; i < n; i++) {
    if (i > 0) {
      var a1 = data[i-1];
      var a2 = data[i];
      if (a2 > a1) {
        totgain += a2 - a1;
        numgain++;
      } else if (a2 < a1) {
        totloss += a1 - a2;
        numloss++;
      }
    }
  }
  if (!numgain || !numloss) {
    return 50;
  }
  var avgain = totgain / numgain;
  var avloss = totloss / numloss;
  if (avloss === 0) {
    return 100;
  }
  var rs = avgain / avloss;
  //console.log(avgain, avloss, numgain, numloss);
  return 100 - (100 / (1 + rs));
};

Vue.filter('twodp', function(value, decimals) {
  if(!value) {
    value = 0;
  }

  if(!decimals) {
    decimals = 0;
  }

  value = value * 100;
  value = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return value/100;
});


var app = new Vue({
  el: '#vue',
  data: {
    mode:'start',
    i: 0,
    losspertransaction: 0.2, // percent 0.2%
    btcinusd: 1,
    btcbalance: 0,
    usdbalance: 10000.0,
    rsi: 50,
    graphdata: [],
    rsidata: [],
    marketdata: [],
    interval: null
  },
  computed: {
    total: function() {
      return this.usdbalance + this.btcbalance * this.btcinusd;
    }
  },
  created: function () {
    this.loadMarketData();
  },
  methods: { 
    loadMarketData: function() {
      $.get({
        url: 'https://reader.cloudant.com/bitcoin/_all_docs?limit=2000&descending=true&include_docs=true',
        json: true
      }).done(function(data) {
        console.log(data);
        app.marketdata = data.rows.map(function(d) { return d.doc.btcinusd}).reverse()
      });
    },
    getPrices: function() {
      var series = [];
      for(var i in app.graphdata) {
        series.push([parseInt(i), app.graphdata[i]]);
      }
      return series;
    },
    getRSIs: function() {
      var series = [];
      for(var i in app.rsidata) {
        series.push([parseInt(i), app.rsidata[i]]);
      }
      return series;
    },
    getAutoScale: function() {
      var min = 1000000;
      var max = 0;
      for(var i in app.graphdata) {
        min = Math.min(app.graphdata[i], min);
        max = Math.max(app.graphdata[i], max);
      }
      return {
        min: Math.floor(min/100) * 100,
        max: Math.floor((max + 100)/100) * 100
      };
    },
    onClickStart: function() {
      app.btcinusd = app.marketdata[0];
      app.usdbalance = 5000.0;
      app.btcbalance = 5000.0 / app.btcinusd;
      app.i = 0;
      app.mode='running';

      plot = $.plot("#chart", [ ], {
        series: {
          shadowSize: 0	// Drawing is faster without shadows
        },
        legend: {
          position: 'nw'
        },
        yaxis: [ { position:'left'}, { min:0, max:100, position:'right' }],
        xaxis: { min: 0, max: 500}
      });

      app.interval = setInterval(function () {
        if (app.i == app.marketdata.length - 1) {
          clearInterval(app.interval);
          app.interval = null;
          app.mode='stopped';
          return;
        }

        var x = Math.floor((new Date()).getTime() / 1000); // current time
        var y = app.marketdata[app.i++];
        app.btcinusd = y;
        
        app.graphdata.push(y);
        if (app.graphdata.length > 100) {
          app.rsi = rsi(app.graphdata);
        } else {
          app.rsi = 50;
        }
        app.rsidata.push(app.rsi);


        if (app.graphdata.length > 500) {
          app.graphdata.shift();
          app.rsidata.shift();
        }
        
        plot.setData([ { label:'Bitcoin', yaxis:1, data: app.getPrices()} , { label:'RSI', yaxis:2, data: app.getRSIs()} ]);
        
        // Since the axes don't change, we don't need to call plot.setupGrid()
        var scale = app.getAutoScale();
        opts = plot.getYAxes()[0].options
        opts.min = scale.min;
        opts.max = scale.max;
        opts = plot.getYAxes()[1].options;
        opts.min = 35;
        opts.max = 65;
        plot.setupGrid();
        plot.draw();

      }, 100);

    },
    buy: function(proportion) {
      if (app.usdbalance > 0.1) {
        var x = app.usdbalance * proportion;
        //app.log.unshift('Buying ' + x/app.btcinusd + ' BTC for $' + x);
        app.btcbalance = (1.0 - app.losspertransaction/100)  * (app.btcbalance + x/app.btcinusd);
        app.usdbalance = app.usdbalance - x;
      }
    }, 
    sell: function(proportion) {
      if(app.btcbalance > 0.01) {
        var y = app.btcbalance*proportion;
        //app.log.unshift('Selling ' + y + ' BTC for $' + y*app.btcinusd);       
        app.usdbalance = (1.0 - app.losspertransaction/100)  * (app.usdbalance +  app.btcinusd * y);
        app.btcbalance = app.btcbalance - y;
      }
    },
    onClickBuy: function() {
      app.buy(0.1);
    },
    onClickSell: function() {
      app.sell(0.1);
    },
    onClickBuyAll: function() {
      app.buy(1);
    },
    onClickSellAll: function() {
      app.sell(1);
    },
    summary: function() {

    }
  }
});

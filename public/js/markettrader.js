var plot = null;


function update() {  

}

var rsi = function(data) {
  var n = data.length;
  var totgain = 0;
  var numgain = 0;
  var totloss = 0;
  var numloss = 0;
  for(var i = 1; i < n; i++) {
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
    i: 0,
    losspertransaction: 0.2, // percent 0.2%
    btcinusd: 2600,
    btcbalance: 4,
    usdbalance: 10000.0,
    //log: [],
    rsi: 50,
    graphdata: [],
    rsidata: [],
    started: false
  },
  computed: {
    total: function() {
      return this.usdbalance + this.btcbalance * this.btcinusd;
    }
  },
  created: function () {
    console.log('marketdata', marketdata.length);
  },
  methods: { 
    getPrices: function() {
      var series = [];
      for(var i in app.graphdata) {
        series.push([parseInt(i), app.graphdata[i]]);
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
        min: Math.floor(min/1000) * 1000,
        max: Math.floor((max + 1000)/1000) * 1000
      };
    },
    onClickStart: function() {
      app.usdbalance = 5000.0;
      app.btcbalance = 5000.0 / app.btcinusd;
      app.started = true;

      plot = $.plot("#chart", [ ], {
        series: {
          shadowSize: 0	// Drawing is faster without shadows
        },
        yaxis: {
          show:true
        },
        xaxis: {
          min: 0,
          max: 500
        }
      });

      setInterval(function () {
        var x = Math.floor((new Date()).getTime() / 1000); // current time
        var y = parseFloat(marketdata[app.i++]);
        app.btcinusd = y;
        
        app.graphdata.push(y);
        if (app.graphdata.length > 100) {
          app.rsi = rsi(app.graphdata);
        } else {
          app.rsi = 50;
        }


        if (app.graphdata.length > 500) {
          app.graphdata.shift();
        }


        
        plot.setData([app.getPrices()]);
        
        // Since the axes don't change, we don't need to call plot.setupGrid()
        var scale = app.getAutoScale();
        opts = plot.getYAxes()[0].options
        opts.min = scale.min;
        opts.max = scale.max;
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
    }
  }
});
/*
Highcharts.setOptions({
  global: {
    useUTC: false
  }
});


Highcharts.chart('chart', {
  chart: {
    type: 'spline',
    animation: false, //Highcharts.svg, // don't animate in old IE
    marginRight: 10,
    events: {
      load: function () {
        // set up the updating of the chart each second
        var series = this.series[0];
        var rsiseries = this.series[1];
        setInterval(function () {
          var x = (new Date()).getTime(); // current time
          var y = marketdata[app.i++];
          app.btcinusd = y;
          
          app.graphdata.push(y);
          if (app.graphdata.length > 30) {
            app.graphdata.shift();
            app.rsi = rsi(app.graphdata);
          } else {
            app.rsi = 50;
          }
          series.addPoint([x, parseFloat(y)], true, true);
          rsiseries.addPoint([x, app.rsi], true, true);
          console.log(y, app.rsi);
        }, 300);
      }
    }
  },
  title: {
    text: ''
  },
  xAxis: {
    type: 'datetime',
    tickPixelInterval: 150
  },
  yAxis: [ {
    title: {
      text: 'Price USD'
    },
    plotLines: [{
      value: 0,
      width: 3,
      color: '#808080'
    }]
  }, 
  {
    title: {
      text: 'RSI'
    },
    plotLines: [{
      value: 0,
      width: 2,
      color: '#FF0030'
    }],
    opposite: true
  }
  ],
  tooltip: {
    formatter: function () {
      return '<b>' + this.series.name + '</b><br/>' +
        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
        Highcharts.numberFormat(this.y, 2);
    }
  },
  legend: {
    enabled: false
  },
  exporting: {
    enabled: false
  },
  series: [{
    name: 'Bitcoin price',
    yaxis:1, 
    data: (function () {
      // generate an array of random data
      var data = [],
        time = (new Date()).getTime() - 100,
        i;

      for (i = -99; i <= 0; i += 1) {
        data.push({
          x: time + i * 1000,
          y: 2600
        });
      }
      return data;
    }())
  }, {
    name: 'RSI',
    yaxis: 2,
    data: (function () {
      // generate an array of random data
      var data = [],
        time = (new Date()).getTime() - 100,
        i;

      for (i = -99; i <= 0; i += 1) {
        data.push({
          x: time + i * 1000,
          y: 50
        });
      }
      return data;
    }())
  }]
});
*/
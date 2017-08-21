var chart = null;

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
    btcinusd: 2600,
    btcbalance: 4,
    usdbalance: 10000.0,
    log: [],
    graphdata: [],
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
    onClickStart: function() {
      app.usdbalance = 5000.0;
      app.btcbalance = 5000.0 / app.btcinusd;
      app.started = true;
    },
    buy: function(proportion) {
      if (app.usdbalance > 0.1) {
        var x = app.usdbalance * proportion;
        app.log.unshift('Buying ' + x/app.btcinusd + ' BTC for $' + x);
        app.btcbalance = app.btcbalance + x/app.btcinusd;
        app.usdbalance = app.usdbalance - x;
      }
    }, 
    sell: function(proportion) {
      if(app.btcbalance > 0.01) {
        var y = app.btcbalance*proportion;
        app.log.unshift('Selling ' + y + ' BTC for $' + y*app.btcinusd);       
        app.usdbalance = app.usdbalance +  app.btcinusd * y;
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
        setInterval(function () {
          var x = (new Date()).getTime(); // current time
          var y = marketdata[app.i++];
          app.btcinusd = y;
          console.log(y);
          //app.graphdata.push(y);
          series.addPoint([x, parseFloat(y)], true, true);
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
  yAxis: {
    title: {
      text: 'Value'
    },
    plotLines: [{
      value: 0,
      width: 3,
      color: '#808080'
    }]
  },
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
    name: 'Random data',
    data: (function () {
      // generate an array of random data
      var data = [],
        time = (new Date()).getTime(),
        i;

      for (i = -99; i <= 0; i += 1) {
        data.push({
          x: time + i * 1000,
          y: 2600
        });
      }
      return data;
    }())
  }]
});
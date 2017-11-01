## markettrader

To create a database of Bitcoin price against time, we can use the OpenWhisk serverless platform to run a function every minute to fetch the data from [cryptocompare API](https://www.cryptocompare.com/). Sign for an [OpenWhisk](https://www.ibm.com/cloud-computing/bluemix/openwhisk) service and ensure you have the `bx wsk` [command-line client](https://console.bluemix.net/openwhisk/learn/cli) setup correctly.

You'll need a Cloudant service. Sign up for a [Cloudant service](https://www.ibm.com/analytics/us/en/technology/cloud-data-services/cloudant/) in Bluemix and make a note of your URL in the form:

    https://USER:PASSWORD@hostname.cloudant.com

Create a database called "bitcoin" in your Cloudant dashboard, then create an environment variable called `CLOUDANT_URL`:

    export CLOUDANT_URL="https://USER:PASSWORD@hostname.cloudant.com"

Then run `deploy.sh` in the `actions` folder to create your service.

    ./deploy.sh

Congratulations, the Bitcoin price is being saved into Cloudant once per minute!

## The markettrader app

The web app in the `public` folder loads the last 2000 records from a Cloudant database and lets you "trade" between US dollars and bitcoin an a simulated environment. See if you can make money from the crypto-currency market!

Try the app here: https://glynnbird.github.io/markettrader/public/index.html

require('dotenv-safe').config();

const { MercadoBitcoin } = require("./api");
var infoApi = new MercadoBitcoin({ currency: 'ETH' });

setInterval(async () => {
    const tick = await infoApi.ticker();
    console.log(tick.ticker);

},process.env.CRAWLER_INTERVAL);
//MERCADO BITCOIN
const axios = require('axios');
const crypto = require('crypto');
const qs = require('querystring');

const ENDPOINT_API = 'https://www.mercadobitcoin.net/api/';
const ENDPOINT_TRADE_PATH = "/tapi/v3/"
const ENDPOINT_TRADE_API = 'https://www.mercadobitcoin.net' + ENDPOINT_TRADE_PATH
 
class MercadoBitcoin {

    constructor(config) {
        this.config = {
            CURRENCY: config.currency
        }
    }

    ticker() {
        return this.call('ticker');
    }

    async call(method) {

        let config = {
            headers: {
                'Accept': 'application/json',
            }
        }

        try {
            const response = await axios.get(`${ENDPOINT_API}${this.config.CURRENCY}/${method}`, config);
            return response.data;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

class ApiTrade {

    constructor(config) {
        this.config = {
            KEY: config.key,
            SECRET: config.secret,
            CURRENCY: config.currency
        }
    }

    getAccountInfo() {
        return this.call('get_account_info', {});
    }

    placeBuyOrder(qty, limit_price) {
        return this.call('place_buy_order', { coin_pair: `BRL${this.config.CURRENCY}`, quantity: `${qty}`.substr(0, 10), limit_price: `${limit_price}` });
    }

    placeSellOrder(qty, limit_price) {
        return this.call('place_sell_order', { coin_pair: `BRL${this.config.CURRENCY}`, quantity: `${qty}`.substr(0, 10), limit_price: `${limit_price}` });
    }

    async call(tapi_method, parameters) {

        const tapi_nonce = new Date().getTime();
        let queryString = qs.stringify({ tapi_method, tapi_nonce });
        if (parameters) {
            queryString += `&${qs.stringify(parameters)}`;
        }

        const signature = crypto.createHmac('sha512', this.config.SECRET)
            .update(`${ENDPOINT_TRADE_PATH}?${queryString}`)
            .digest('hex');

        const config = {
            headers: {
                'TAPI-ID': this.config.KEY,
                'TAPI-MAC': signature
            }
        }

        const response = await axios.post(ENDPOINT_TRADE_API, queryString, config);
        if (response.data.error_message) {
            throw new Error(response.data.error_message);
        }

        return response.data.response_data;
    }

}

module.exports = {
    MercadoBitcoin,
    ApiTrade
}
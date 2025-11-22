require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('❌ BOT_TOKEN not found!');
  process.exit(1);
}

const USE_WEBHOOK = process.env.USE_WEBHOOK === 'true';
const WEBHOOK_PATH = '/telegram-webhook';

// Ping route
app.get('/ping', (req, res) => res.send('✅ Bot is online!'));

// Initialize bot
let bot;
if (USE_WEBHOOK) {
  bot = new TelegramBot(token);
  app.post(WEBHOOK_PATH, (req, res) => {
    bot.processUpdate(req.body).then(() => res.sendStatus(200)).catch(() => res.sendStatus(500));
  });
} else {
  bot = new TelegramBot(token, { polling: true });
}

// --------- Products ----------
const products = {
  'lizzy_and_bro': { name: 'Lizzy And Bro', price: 35, videoUrl: 'https://files.fm/f/kk9bqdp546', cashAppLink: 'https://buy.stripe.com/6oUdR94Egc3I1o12lE3F60m' },
  'savannah': { name: 'Savannah', price: 40, videoUrl: 'https://files.fm/f/qhztu3g6jn', cashAppLink: 'https://buy.stripe.com/4gMfZhgmY1p4giV3pI3F60n' },
  'iavnka_and_bro': { name: 'Ivanka and Bro', price: 35, videoUrl: 'https://files.fm/f/pq5uuca43k', cashAppLink: 'https://buy.stripe.com/eVq4gz0o00l00jXe4m3F60o' },
  'anita': { name: 'Anita', price: 35, videoUrl: 'https://files.fm/f/xdyqgs24z9', cashAppLink: 'https://buy.stripe.com/dRm6oHb2Ed7M0jXaSa3F60p' },
  'amelia_blonde': { name: 'Amelia Blonde', price: 25, videoUrl: 'https://files.fm/f/jaz5fsg7hg', cashAppLink: 'https://buy.stripe.com/bJe8wPb2E0l09Ux8K23F60q' },
  'darkzadie': { name: 'Darkzadie', price: 30, videoUrl: 'https://files.fm/f/4ewxxswfpp', cashAppLink: 'https://buy.stripe.com/eVq9ATfiU2t82s57FY3F60r' },
  'desire_garcia': { name: 'Desire Garcia', price: 25, videoUrl: 'https://files.fm/f/dey5b3753c', cashAppLink: 'https://buy.stripe.com/28EeVd4Eg6Joc2Fgcu3F60s' },
  'baby_ashlee': { name: 'Baby Ashlee', price: 30, videoUrl: 'https://files.fm/f/e9fz5g4qrt', cashAppLink: 'https://buy.stripe.com/28E3cvb2Ed7M8Qt2lE3F60t' },
  'anxious_panda': { name: 'Anxious Panda', price: 25, videoUrl: 'https://files.fm/f/jwyqepghre', cashAppLink: 'https://buy.stripe.com/aFacN50o03xceaNd0i3F60u' },
  'emmi_sellers': { name: 'Emmi Sellers', price: 35, videoUrl: 'https://files.fm/f/bakhhg7nf5', cashAppLink: 'https://buy.stripe.com/eVq9AT3Ac4Bgc2Ff8q3F60v' },
  'mom_and_son': { name: 'Mom and Son', price: 45, videoUrl: 'https://files.fm/f/cj9gdrknrg', cashAppLink: 'https://buy.stripe.com/00wcN52w8c3IfeRaSa3F60w' },
  'cp1': { name: 'CP1', price: 40, videoUrl: 'https://files.fm/f/f5vq5vvkdw', cashAppLink: 'https://buy.stripe.com/aFa3cvb2E3xc2s50dw3F60x' },
  'cp2': { name: 'CP2', price: 45, videoUrl: 'https://files.fm/f/efc84kjpk5', cashAppLink: 'https://buy.stripe.com/00w4gz7Qs4Bg2s50dw3F60y' },
  'cp3': { name: 'CP3', price: 50, videoUrl: 'https://files.fm/f/bwkmcqnw79', cashAppLink: 'https://buy.stripe.com/bJe9ATb2Ed7MgiVf8q3F60z' },
  'cp4': { name: 'CP4', price: 55, videoUrl: 'https://files.fm/f/v4gpk3ps4h', cashAppLink: 'https://buy.stripe.com/eVq9AT3Ac2t87Mp0dw3F60A' },
  'omegle': { name: 'Omegle', price: 25, videoUrl: 'https://files.fm/f/348qv4k7qm', cashAppLink: 'https://buy.stripe.com/aFa6oHgmY8Rwc2Fe4m3F60C' },
  'new_cps': { name: 'New Cps', price: 75, videoUrl: 'https://files.fm/f/ub55r44mtx', cashAppLink: 'https://buy.stripe.com/3cI7sLdaM8Rwd6J6BU3F60B' }
};

function formatPrice(v) { return `$${v.toFixed(2)}`; }
const states = {};

// --------- Helpers ----------
function buildProductKeyboard(selectedKeys = []) {
  const keys = Object.keys(products);
  const rows = [];
  for (let i = 0; i < keys.length; i += 2) {
    const row = [];
    const k1 = keys[i];
    if (!selectedKeys.includes(k1)) row.push({ text: `${products[k1].name} — ${formatPrice(products[k1].price)}`, callback_data: `product_${k1}` });
    if (keys[i + 1] && !selectedKeys.includes(keys[i + 1])) row.push({ text: `${products[keys[i + 1]].name} — ${formatPrice(products[keys[i + 1]].price)}`, callback_data: `product_${keys[i + 1]}` });
    if (row.length) rows.push(row);
  }
  rows.push([{ text: '🛒 View Cart', callback_data: 'cart' }]);
  return rows;
}

function buildPaymentKeyboard() {
  return [
    [{ text: '💳 PayPal', callback_data: 'method_paypal' }],
    [{ text: '🪙 Binance', callback_data: 'method_binance' }],
    [{ text: '💼 CashApp/Apple Pay', callback_data: 'method_cashapp' }],
    [{ text: '🎁 Rewarble Gift Card', callback_data: 'method_giftcard' }]
  ];
}

function resetState(chatId) {
  states[chatId] = { step: 'awaiting_product', cart: [], selected: null, method: null };
}

// --------- Handlers ----------
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  resetState(chatId);
  bot.sendMessage(chatId, '👋 Welcome! Choose a product below:', {
    reply_markup: { inline_keyboard: buildProductKeyboard() }
  });
});

// ---- Payment method selected ----
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  if (!states[chatId]) resetState(chatId);
  const st = states[chatId];
  
  // ---- Product selected ----
  if (data.startsWith('product_')) {
    const key = data.replace('product_', '');
    const prod = products[key];
    st.selected = key;
    st.step = 'awaiting_interest';
    await bot.sendMessage(chatId, `🎬 Preview: ${prod.videoUrl}`);
    await bot.sendMessage(chatId, `💬 Do you want to buy *${prod.name}* for *${formatPrice(prod.price)}* ?`, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [
        [
          { text: '🛒 Add to Cart', callback_data: 'add_to_cart' },
          { text: '✅ Buy Now', callback_data: 'buy_now' },
          { text: '❌ Cancel', callback_data: 'cancel' }
        ]
      ]}
    });
    return bot.answerCallbackQuery(query.id);
  }

  // ---- Buy now ----
  if (data === 'buy_now') {
    st.cart.push(products[st.selected]);
    st.step = 'awaiting_method';
    await bot.sendMessage(chatId, '💰 Choose a payment method:', {
      reply_markup: { inline_keyboard: buildPaymentKeyboard() }
    });
    return bot.answerCallbackQuery(query.id);
  }

  // ---- Payment method selected ----
  if (st.step === 'awaiting_method' && data.startsWith('method_')) {
    const method = data.replace('method_', '');
    st.method = method;
    st.step = 'awaiting_confirmation';
    let totalPrice = st.cart.reduce((sum, p) => sum + p.price, 0);
    let prodList = st.cart.map(p => `${p.name} — ${formatPrice(p.price)}`).join('\n');

    let reply = `🧾 *Order Summary*\n\n${prodList}\n\nTotal: *${formatPrice(totalPrice)}*\nPayment: *${method.toUpperCase()}*\n\n`;

    if (method === 'paypal') {
      reply += '💳 PayPal\nSend as family and friends to: `zenitanatal@gmail.com`\nPay then send proof to Support';
    } else if (method === 'binance') {
      reply += '🪙 Binance\nBTC: `13rRzDpRi7tMA6JmhRdwTAMh5bZpsFa2jX`\nUSDT: `0x155977f480e363c195c69d9a6793fe28c35b718a`\nPay then send proof to Support';
    } else if (method === 'cashapp') {
      // Aqui pegamos o link do CashApp para o produto escolhido
      const selectedProduct = products[st.selected]; // Aqui pegamos o produto selecionado diretamente
      reply += `💼 CashApp/Apple Pay\n👉 [Payment Link](${selectedProduct.cashAppLink})\nPay then send proof to [Support](https://t.me/leak_checkout)`;
    } else if (method === 'giftcard') {
      reply += '🎁 Rewardable Gift Card\n👉 [Support](https://t.me/leak_checkout)\nBuy card then send to support to receive content';
    }

    await bot.sendMessage(chatId, reply, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [
        [{ text: '🆘 Support', url: 'https://t.me/leak_checkout' }],
        [{ text: '🔄 Change Payment Method', callback_data: 'change_method' }]
      ]},
      disable_web_page_preview: false
    });
    return bot.answerCallbackQuery(query.id);
  }

  // ---- Change payment method ----
  if (data === 'change_method') {
    st.step = 'awaiting_method';
    await bot.sendMessage(chatId, '💰 Choose a payment method:', {
      reply_markup: { inline_keyboard: buildPaymentKeyboard() }
    });
    return bot.answerCallbackQuery(query.id);
  }
});


// Server and webhook setup
if (USE_WEBHOOK) {
  app.listen(PORT, () => {
    console.log(`Bot running with webhook on port ${PORT}`);
    bot.setWebHook(`${process.env.HOSTNAME}${WEBHOOK_PATH}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Bot running on port ${PORT}`);
  });
}







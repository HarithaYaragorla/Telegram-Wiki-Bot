// Import the request module for makinh HTTP requests
const request = require("request");

//dotenv module to store and use config or settings of the app
require('dotenv').config();

// Import the node-telegram-bot-api module for interacting with the Telegram Bot API
const TelegramBot = require("node-telegram-bot-api");

// Setup the bot token
const token=process.env.MY_API_TOKEN

// Creating a new bot instance
const bot = new TelegramBot(token, { polling: true });

// Command to start the bot
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Send me a Wikipedia title and I will provide information about it."
  );
});


// Handling the user's input
bot.onText(/(.+)/, (msg, match) => {

  // Get the chat ID where the message was sent
  const chatId = msg.chat.id;

  // Get the user's input, trimming any extra spaces
  const query = match[1].trim();

  // Make a request to the Wikipedia API to get a summary of the page if the matching the user's input
  request(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      query
    )}`,

    // If there was an error making the request, log the error and send an error message to the user
    (error, response, body) => {
      if (error) {
        console.error("Error fetching Wikipedia data:", error);
        bot.sendMessage(
          chatId,
          "Error occurred while fetching Wikipedia data."
        );
        return;
      }

      try {

        // Send the response body from the Wikipedia API
        const data = JSON.parse(body);
        
        // If the response contains the article title and summary
        if (data && data.title && data.extract) {

          // Check if there is a thumbnail image for the article
          const imageUrl = data.thumbnail ? data.thumbnail.source : null;

          // Format the message with the article title, summary, and a link to read more
          let message = `*${data.title}*\n\n${data.extract}\n\n[Read more on Wikipedia](${data.content_urls.desktop.page})`;
          

          // If there is a thumbnail image, send it as a photo with the message as a caption
          if (imageUrl) {
            bot.sendPhoto(chatId, imageUrl, {
              caption: message,
              parse_mode: "Markdown",
            });
          } else {

            // If there is no thumbnail image, send the message as text
            bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
          }
        } else {

          // If the article was not found, send a message saying it was not found
          bot.sendMessage(chatId, "Unable to find the specified article.");
        }
      } catch (parseError) {

        // If there was an error parsing the response, log the error and send an error message to the user
        console.error("Error parsing Wikipedia response:", parseError);
        bot.sendMessage(
          chatId,
          "Error occurred while processing Wikipedia data."
        );
      }
    }
  );
});

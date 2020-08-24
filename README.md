# Discord Elo Bot

This repository is the home of a Discord Elo Bot (nicknamed Oracle Bot). At its core, Oracle Bot is a Magic the Gathering statistics and information bot, aimed at the CEDH community. The bot will track data deck and player statistics inside of Discord Servers. 

## Installation
To install all dependancies, run the following command in the project directory:

```
npm install
```

## Environment

Create a Discord application using the following link:
https://discord.com/developers/applications

After you've created a Discord application, create and invite the bot account to your Discord server.

Once that's done, create a file named `.env` in the project root directory.

`.env` file template - 
```
DISCORD_CLIENT_ID='<discord application client id>'
DISCORD_TOKEN='<discord bot token>'
MONGO_CONNECTION_URL='<mongo connection url>'
ALLOW_DUPLICATE_USERS=true
```

Alternatively, environmental variables can be set with the above keys/values instead of using a `.env` file.

## Usage

To run the bot after the environment is set up, naviagate to the project directory and run the following:

```
npm start
```

## Contributing
Pull requests are welcome and very appreciated! For major changes, please open an issue first to discuss what you would like to change.


## Need more help?
Join our discord server for any more questions about the bot
https://discord.gg/HynH4BH

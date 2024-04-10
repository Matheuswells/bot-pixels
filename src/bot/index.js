const fs = require("fs");
// const { REST, Routes } = require('discord.js');
returnTimestampFromTimer = (time) => {
  // get timestampo from time considering the day as today
  const date = new Date();
  const hours = time.split(":")[0];
  const minutes = time.split(":")[1];
  const seconds = time.split(":")[2];
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds);
  return date.getTime();
};

const mongoConnection = require("../db/db");

mongoConnection.on("error", console.error.bind(console, "connection error:"));
mongoConnection.once("open", function () {
  console.log("connected to mongo db");
});

function timestampToTime(timestamp) {
  //get time in são paulo from timestamp
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

async function closeLand(land) {
  land = String(land);
  const landData = await mongoConnection.collection("lands").findOne({ land });
  if (landData) {
    landData.door = "closed";
    await mongoConnection
      .collection("lands")
      .updateOne({ land }, { $set: { door: "closed" } });
  }
}

async function openLand(land) {
  land = String(land);
  const landData = await mongoConnection.collection("lands").findOne({ land });
  if (landData) {
    landData.door = "open";
    await mongoConnection
      .collection("lands")
      .updateOne({ land }, { $set: { door: "open" } });
  }
}

async function saveVerification(user, userId, wallet) {
  await mongoConnection.collection("verifications").insertOne({
    user,
    userId,
    wallet,
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function verifyUser(userId) {
  await mongoConnection
    .collection("verifications")
    .updateOne({ userId }, { $set: { verified: true, updatedAt: new Date() } });
}

// search on mongo lands for treesTimestamp for the next 5 minutes and send a notification

async function searchForTrees() {
  //get sao paulo timestamp
  const timestamp = new Date().getTime({ timeZone: "America/sao_paulo" });
  const landsWithTrees = [];
  const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const getlands = await mongoConnection.collection("lands").find({
    treesTimestamp: { $gt: timestamp, $lt: timestamp + 300000 },
    updatedAt: { $gte: fiveHoursAgo },
    door: "open",
  }); //,
  const lands = await getlands.toArray();

  console.log("Found lands with trees", lands.length);
  lands.forEach((land) => {
    land.treesTimestamp.forEach((treeTimestamp) => {
      if (treeTimestamp > timestamp && treeTimestamp < timestamp + 300000) {
        landsWithTrees.push({ land: land.land, treeTimestamp: treeTimestamp });

        // fs.appendFileSync('trees.txt', `Found tree ${timestampToTime(treeTimestamp)} on land ${land.land}\n`);
        // console.log('Found tree', timestampToTime(treeTimestamp), 'on land', land.land)
      }
    });
  });

  let grouped = landsWithTrees.reduce((acc, obj) => {
    let key = obj.land;
    if (!acc[key]) {
      acc[key] = { land: key, treesTimestamps: [] };
    }
    acc[key].treesTimestamps.push(obj.treeTimestamp);
    return acc;
  }, {});

  return Object.values(grouped);
}

// searchForTrees()

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require("discord.js");
const { channel } = require("diagnostics_channel");

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
    type: "1",
  },
  {
    name: "time",
    description: "Replies with the current time!",
    type: "1",
  },
  {
    name: "clear",
    description: "Clears all messages in the channels!",
    type: "1",
  },
];

//create command for close land with SlashCommandBuilder
const closeCommand = new SlashCommandBuilder()
  .setName("close")
  .setDescription("Close a land")
  .addIntegerOption((option) =>
    option.setName("number").setDescription("The land number").setRequired(true)
  );

// open command

const openCommand = new SlashCommandBuilder()
  .setName("open")
  .setDescription("Open a land")
  .addIntegerOption((option) =>
    option.setName("number").setDescription("The land number").setRequired(true)
  );

const requestVerifyCommand = new SlashCommandBuilder()
  .setName("pay")
  .setDescription("Verify a wallet")
  .addStringOption((option) =>
    option
      .setName("wallet")
      .setDescription("The wallet address")
      .setRequired(true)
  );

const verifyCommand = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Verify a user")
  .addStringOption((option) =>
    option
      .setName("user")
      .setDescription("The user to verify")
      .setRequired(true)
  );

commands.push(closeCommand.toJSON());
commands.push(openCommand.toJSON());
commands.push(requestVerifyCommand.toJSON());
commands.push(verifyCommand.toJSON());

const rest = new REST({ version: "9" }).setToken("BOT TOKEN HERE");

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands("APP ID HERE", "GUILD ID HERE"),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Ready!");
});

const channel100 = "CHANNEL ID HERE";
const channel200 = "CHANNEL ID HERE";
const channel300 = "CHANNEL ID HERE";
const channel400 = "CHANNEL ID HERE";
const channel600 = "CHANNEL ID HERE";
const channel500 = "CHANNEL ID HERE";
const channel700 = "CHANNEL ID HERE";
const channel800 = "CHANNEL ID HERE";
const channel900 = "CHANNEL ID HERE";
const channel1000 = "CHANNEL ID HERE";
const channel1100 = "CHANNEL ID HERE";
const channel1200 = "CHANNEL ID HERE";
const channel1300 = "CHANNEL ID HERE";
const channel1400 = "CHANNEL ID HERE";
const channel1500 = "CHANNEL ID HERE";
const channel1600 = "CHANNEL ID HERE";
const channel1700 = "CHANNEL ID HERE";
const channel1800 = "CHANNEL ID HERE";
const channel1900 = "CHANNEL ID HERE";
const channel2000 = "CHANNEL ID HERE";
const channel2100 = "CHANNEL ID HERE";
const channel2200 = "CHANNEL ID HERE";
const channel2300 = "CHANNEL ID HERE";
const channel2400 = "CHANNEL ID HERE";
const channel2500 = "CHANNEL ID HERE";
const channel2600 = "CHANNEL ID HERE";
const channel2700 = "CHANNEL ID HERE";
const channel2800 = "CHANNEL ID HERE";
const channel2900 = "CHANNEL ID HERE";
const channel3000 = "CHANNEL ID HERE";
const channel3100 = "CHANNEL ID HERE";
const channel3200 = "CHANNEL ID HERE";
const channel3300 = "CHANNEL ID HERE";
const channel3400 = "CHANNEL ID HERE";
const channel3500 = "CHANNEL ID HERE";
const channel3600 = "CHANNEL ID HERE";
const channel3700 = "CHANNEL ID HERE";
const channel3800 = "CHANNEL ID HERE";
const channel3900 = "CHANNEL ID HERE";
const channel4000 = "CHANNEL ID HERE";
const channel4100 = "CHANNEL ID HERE";
const channel4200 = "CHANNEL ID HERE";
const channel4300 = "CHANNEL ID HERE";
const channel4400 = "CHANNEL ID HERE";
const channel4500 = "CHANNEL ID HERE";
const channel4600 = "CHANNEL ID HERE";
const channel4700 = "CHANNEL ID HERE";
const channel4800 = "CHANNEL ID HERE";
const channel4900 = "CHANNEL ID HERE";
const channel5000 = "CHANNEL ID HERE";

// create a array of channels
const channels = [
  channel100,
  channel200,
  channel300,
  channel400,
  channel500,
  channel600,
  channel700,
  channel800,
  channel900,
  channel1000,
  channel1100,
  channel1200,
  channel1300,
  channel1400,
  channel1500,
  channel1600,
  channel1700,
  channel1800,
  channel1900,
  channel2000,
  channel2100,
  channel2200,
  channel2300,
  channel2400,
  channel2500,
  channel2600,
  channel2700,
  channel2800,
  channel2900,
  channel3000,
  channel3100,
  channel3200,
  channel3300,
  channel3400,
  channel3500,
  channel3600,
  channel3700,
  channel3800,
  channel3900,
  channel4000,
  channel4100,
  channel4200,
  channel4300,
  channel4400,
  channel4500,
  channel4600,
  channel4700,
  channel4800,
  channel4900,
  channel5000,
];

client.on("ready", () => {
  channels.forEach((channel) => {
    client.channels.cache.get(channel).bulkDelete(100);
  });
  console.log(`Logged in as ${client.user.tag}!-`);
  setInterval(() => {
    searchForTrees().then((lands) => {
      //clear all channels from array
      channels.forEach((channel) => {
        client.channels.cache.get(channel).bulkDelete(100);
      });

      //get current timestamp
      const timestamp = new Date().getTime();
      for (const land of lands) {
        // select channel based on land number
        let channel = null;
        //land.land to number
        if (parseInt(land.land) < 100) {
          channel = client.channels.cache.get(channel100);
        } else if (parseInt(land.land) < 200) {
          channel = client.channels.cache.get(channel200);
        } else if (parseInt(land.land) < 300) {
          channel = client.channels.cache.get(channel300);
        } else if (parseInt(land.land) < 400) {
          channel = client.channels.cache.get(channel400);
        } else if (parseInt(land.land) < 500) {
          channel = client.channels.cache.get(channel500);
        } else if (parseInt(land.land) < 600) {
          channel = client.channels.cache.get(channel600);
        } else if (parseInt(land.land) < 700) {
          channel = client.channels.cache.get(channel700);
        } else if (parseInt(land.land) < 800) {
          channel = client.channels.cache.get(channel800);
        } else if (parseInt(land.land) < 900) {
          channel = client.channels.cache.get(channel900);
        } else if (parseInt(land.land) < 1000) {
          channel = client.channels.cache.get(channel1000);
        } else if (parseInt(land.land) < 1100) {
          channel = client.channels.cache.get(channel1100);
        } else if (parseInt(land.land) < 1200) {
          channel = client.channels.cache.get(channel1200);
        } else if (parseInt(land.land) < 1300) {
          channel = client.channels.cache.get(channel1300);
        } else if (parseInt(land.land) < 1400) {
          channel = client.channels.cache.get(channel1400);
        } else if (parseInt(land.land) < 1500) {
          channel = client.channels.cache.get(channel1500);
        } else if (parseInt(land.land) < 1600) {
          channel = client.channels.cache.get(channel1600);
        } else if (parseInt(land.land) < 1700) {
          channel = client.channels.cache.get(channel1700);
        } else if (parseInt(land.land) < 1800) {
          channel = client.channels.cache.get(channel1800);
        } else if (parseInt(land.land) < 1900) {
          channel = client.channels.cache.get(channel1900);
        } else if (parseInt(land.land) < 2000) {
          channel = client.channels.cache.get(channel2000);
        } else if (parseInt(land.land) < 2100) {
          channel = client.channels.cache.get(channel2100);
        } else if (parseInt(land.land) < 2200) {
          channel = client.channels.cache.get(channel2200);
        } else if (parseInt(land.land) < 2300) {
          channel = client.channels.cache.get(channel2300);
        } else if (parseInt(land.land) < 2400) {
          channel = client.channels.cache.get(channel2400);
        } else if (parseInt(land.land) < 2500) {
          channel = client.channels.cache.get(channel2500);
        } else if (parseInt(land.land) < 2600) {
          channel = client.channels.cache.get(channel2600);
        } else if (parseInt(land.land) < 2700) {
          channel = client.channels.cache.get(channel2700);
        } else if (parseInt(land.land) < 2800) {
          channel = client.channels.cache.get(channel2800);
        } else if (parseInt(land.land) < 2900) {
          channel = client.channels.cache.get(channel2900);
        } else if (parseInt(land.land) < 3000) {
          channel = client.channels.cache.get(channel3000);
        } else if (parseInt(land.land) < 3100) {
          channel = client.channels.cache.get(channel3100);
        } else if (parseInt(land.land) < 3200) {
          channel = client.channels.cache.get(channel3200);
        } else if (parseInt(land.land) < 3300) {
          channel = client.channels.cache.get(channel3300);
        } else if (parseInt(land.land) < 3400) {
          channel = client.channels.cache.get(channel3400);
        } else if (parseInt(land.land) < 3500) {
          channel = client.channels.cache.get(channel3500);
        } else if (parseInt(land.land) < 3600) {
          channel = client.channels.cache.get(channel3600);
        } else if (parseInt(land.land) < 3700) {
          channel = client.channels.cache.get(channel3700);
        } else if (parseInt(land.land) < 3800) {
          channel = client.channels.cache.get(channel3800);
        } else if (parseInt(land.land) < 3900) {
          channel = client.channels.cache.get(channel3900);
        } else if (parseInt(land.land) < 4000) {
          channel = client.channels.cache.get(channel4000);
        } else if (parseInt(land.land) < 4100) {
          channel = client.channels.cache.get(channel4100);
        } else if (parseInt(land.land) < 4200) {
          channel = client.channels.cache.get(channel4200);
        } else if (parseInt(land.land) < 4300) {
          channel = client.channels.cache.get(channel4300);
        } else if (parseInt(land.land) < 4400) {
          channel = client.channels.cache.get(channel4400);
        } else if (parseInt(land.land) < 4500) {
          channel = client.channels.cache.get(channel4500);
        } else if (parseInt(land.land) < 4600) {
          channel = client.channels.cache.get(channel4600);
        } else if (parseInt(land.land) < 4700) {
          channel = client.channels.cache.get(channel4700);
        } else if (parseInt(land.land) < 4800) {
          channel = client.channels.cache.get(channel4800);
        } else if (parseInt(land.land) < 4900) {
          channel = client.channels.cache.get(channel4900);
        } else if (parseInt(land.land) < 5000) {
          channel = client.channels.cache.get(channel5000);
        }

        //send a message for each land object   {  land: '2380',treesTimestamps: [1712031160834 ] }
        timesMessages = () => {
          let message = "\n";
          land.treesTimestamps.forEach((treeTimestamp) => {
            message += `${timestampToTime(treeTimestamp)} | `;
          });
          return message;
        };

        timesMessagesTimestamp = () => {
          //get the today date and join with the time from treeTimestamp
          let message = "\n";
          land.treesTimestamps.forEach((treeTimestamp) => {
            message += `<t:${returnTimestampFromTimer(timestampToTime)}:R> `;
          });
          return message;
        };

        if (channel) {
          console.log("sending");
          channel.send(
            `https://play.pixels.xyz/pixels/share/${land.land}\`\`\`Found ${
              land.treesTimestamps.length
            } tree(s) on land ${
              land.land
            } spawning at ${timesMessages()} \`\`\``
          );
        }
      }
    });
  }, 300000 / 2);
});

client.on("guildMemberAdd", (member) => {
  member.roles.add("MEMBER ROLE");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (commandName === "time") {
    await interaction.reply(
      `The current time is ${new Date().toLocaleTimeString(
        {},
        { timeZone: "America/sao_paulo" }
      )}`
    );
  }

  if (commandName === "clear") {
    channels.forEach((channel) => {
      client.channels.cache.get(channel).bulkDelete(100);
    });
  }

  if (commandName === "close") {
    const number = interaction.options.getInteger("number");
    //check if user has permission to close land 1224476175737290855
    const member = interaction.member;
    const roles = member.roles.cache.map((role) => role.id);
    if (!roles.includes("ADMIN ROLE HERE")) {
      await interaction.reply(
        "You don't have permission to close a land, please contact a moderator"
      );
      return;
    }
    await interaction.reply(
      `https://play.pixels.xyz/pixels/share/${number} \`\`\`Closed land ${number} \`\`\``
    );

    await closeLand(number);
  }

  if (commandName === "open") {
    const number = interaction.options.getInteger("number");
    //check if user has permission to close land 1224476175737290855
    const member = interaction.member;
    const roles = member.roles.cache.map((role) => role.id);
    if (!roles.includes("ADMIN ROLE HERE")) {
      await interaction.reply(
        "You don't have permission to open a land, please contact a moderator"
      );
      return;
    }
    await interaction.reply(
      `https://play.pixels.xyz/pixels/share/${number} \`\`\`Opened land ${number} \`\`\``
    );

    await openLand(number);
  }

  if (commandName === "pay") {
    const wallet = interaction.options.getString("wallet");
    const user = interaction.user;
    const userTag = user.tag;
    const userId = user.id;
    await interaction.reply(
      `Hello ${user}, we received your wallet ||**${wallet}**|| and it will be checked soon, wait for the confirmation and enjoy or community`
    );
    await saveVerification(userTag, userId, wallet);
  }

  if (commandName === "verify") {
    const user = interaction.options.getString("user");
    //form user remove 2 first characters and the last
    const parsedUser = user.substring(2, user.length - 1);

    const userId = parsedUser;
    //check if user has permission to verify 1224476175737290855
    const member = interaction.member;
    const roles = member.roles.cache.map((role) => role.id);
    if (!roles.includes("ADMIN ROLE HERE")) {
      await interaction.reply(
        "You don't have permission to verify a user, please contact a moderator"
      );
      return;
    }
    // metion user on @
    let now = new Date(Date.now());

    await interaction.reply(
      `Verified payment ${user}, now you can enjoy our community until next 30 days, if you have any question please contact a moderator`
    );

    interaction.guild.members.cache.get(userId).roles.add("MEMBER ROLE HERE");

    await verifyUser(userId);
  }
});

client.login("BOT TOKEN HERE");

const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
});

server.listen(process.env.PORT || 3001);

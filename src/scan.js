const mongoConnection = require("./db/db");
const { get20LandInfo } = require("./scrapping/getLandInfo");
const getSessionInfo = require("./scrapping/getSessionInfo");
const { getWs } = require("./scrapping/ws");
const landSchema = require("./db/land");

mongoConnection.on("error", console.error.bind(console, "connection error:"));
mongoConnection.once("open", function () {
  console.log("connected to mongo db");
});

const Land = mongoConnection.model("Land", landSchema);
// skip should be 0 or receive the first argument from the command line
let skip = parseInt(process.argv[2]) || 0;

const landStarters = [];

for (let i = 1; i <= 5000; i += 20) {
  landStarters.push(i);
}

async function taskv2(landStarter) {
  const lands = await get20LandInfo(landStarter);
  if (!lands || !lands[0].metadata || !lands[0].metadata.mapId) {
    console.log("No lands found 1");
    return;
  }
  const sessions = await Promise.all(
    lands.map(async (lands) => {
      const info = await getSessionInfo(lands);
      if (!info || !info.room) {
        console.log("No session found");
        return;
      }
      return info;
    })
  );
  const wsPromises = sessions.map(async (session, index) => {
    return await getWs(session, lands[index]);
  });

  const wsdata = await Promise.all(wsPromises);
  return wsdata;
}

function splitTreeTimes(tree) {
  const separator = "#";
  const treeData = tree.split(separator);
  return { key: treeData[0], time: treeData[1] };
}

// function to convert hh:mm:ss to timestamp
function convertToTimestamp(time) {
  const [hours, minutes, seconds] = time.split(":");
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds);
  return date.getTime();
}

async function runTasks(skip) {
  for (let i = skip; i < landStarters.length; i++) {
    skip = i;
    console.log(
      "Runing task",
      i,
      "of",
      landStarters.length,
      " lands ",
      landStarters[i],
      " to ",
      landStarters[i] + 20 - 1
    );
    await taskv2(landStarters[i])
      .then((lands) => {
        //remove undefined values from lands
        lands = lands.filter((land) => land !== undefined);
        //validate if lands is empty
        if (!lands || lands.length === 0) {
          console.log("No lands found 2");
          return;
        }

        lands = lands.map((land) => {
          return {
            land: land.land,
            trees: land.trees.map((tree) => splitTreeTimes(tree)),
            treesTimestamp: land.trees.map((tree) =>
              convertToTimestamp(splitTreeTimes(tree).time)
            ),
          };
        });

        lands.forEach((land) => {
          mongoConnection
            .collection("lands")
            .findOne({ land: land.land }, function (err, res) {
              if (err) throw err;
              if (res) {
                mongoConnection.collection("lands").updateOne(
                  { land: land.land },
                  {
                    $set: {
                      trees: land.trees,
                      treesTimestamp: land.treesTimestamp,
                      updatedAt: new Date(),
                    },
                  },
                  function (err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                  }
                );
              } else {
                const landDocument = new Land(land);
                mongoConnection
                  .collection("lands")
                  .insertOne(landDocument, function (err, res) {
                    if (err) throw err;
                    console.log(operation);
                  });
              }
            });
        });
      })
      .catch((error) => {
        console.error("Task failed2", error);
        console.log("last skip", skip);
        throw error;
      });
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
}

async function safeExecution(skip) {
  try {
    runTasks(skip)
      .then(() => {
        console.log("All tasks completed");
      })
      .catch((error) => {
        console.error("All tasks failed", error);
      });
  } catch (error) {
    console.log("waiting 10 minutes before retrying");
    setTimeout(safeExecution, 300000);
  }
}

safeExecution(skip)
  .then(() => {
    console.log("All tasks completed");
  })
  .catch((error) => {
    console.error("All tasks failed", error);
  });

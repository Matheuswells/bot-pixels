const WebSocket = require("ws");
const { get } = require("../src/db/land");
const world = 99;
// Função para obter informações da land
const getLandInfo = async (landNumber) => {
  const timestamp = new Date().getTime();
  const fetch = (await import("node-fetch")).default;
  const response = await fetch(
    `https://pixels-server.pixels.xyz/game/findroom/pixelsNFTFarm-${landNumber}/${world}?v=${timestamp}`
  );
  return await response.json();
};

const Alltrees = [];
// Função para obter informações da sessão
const getSessionInfo = async (land) => {
  const fetch = (await import("node-fetch")).default;
  const response = await fetch(
    `https://pixels-server.pixels.xyz/matchmake/joinById/${land.roomId}/${land.server}`,
    {
      method: "POST",
      body: JSON.stringify({
        mapId: land.metadata.mapId,
        token: "iamguest",
        isGuest: true,
        cryptoWallet: {},
        username: "Guest-the-traveling-tourist",
        world: world,
        ver: 6.7,
        avatar: "{}",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return await response.json();
};

// Função para parsear as árvores
const parseTrees = (message) => {
  const separator = "lastChop�";
  const treeData = message.split(separator).slice(1); // Ignorar o primeiro elemento, pois está vazio

  const trees = treeData
    .map((tree, index) => {
      const treeInfo = tree.split("��"); // Dividir por outro padrão para obter lastChop e lastTimer
      if (treeInfo.length >= 2) {
        const lastChop = index + 1; // Número da árvore (começando de 1)
        const lastTimer = parseInt(treeInfo[1], 10); // Interpretar como inteiro
        const nextChopTime = getNextChopTime(lastTimer);
        return { lastChop, nextChopTime };
      }
      return null;
    })
    .filter(Boolean);

  return trees;
};

// Função para calcular o próximo tempo de corte
const getNextChopTime = (lastTimer) => {
  const nextChopTime = lastTimer + 7 * 60 * 60 * 1000 + 15 * 60 * 1000;
  return nextChopTime;
};
// calc difference two times hh:mm:ss discarding the seconds
const calculateDifferenceInMinutes = (time1, time2) => {
  const [hours1, minutes1] = time1.split(":");
  const [hours2, minutes2] = time2.split(":");

  //if time2 is bigger than time1, return -1
  if (hours2 > hours1) {
    return -1;
  }

  return Math.abs((hours1 - hours2) * 60 + (minutes1 - minutes2));
};

const getWs = (session, messagesList, landNumber) => {
  // console.log("WS:", `wss://pixels-server.pixels.xyz/${session.room.processId}/${session.room.roomId}?sessionId=${session.sessionId}`);

  const ws = new WebSocket(
    `wss://pixels-server.pixels.xyz/${session.room.processId}/${session.room.roomId}?sessionId=${session.sessionId}`
  );
  ws.binaryType = "arraybuffer";
  ws.on("message", async function message(data) {
    try {
      const uint8Array = new Uint8Array(data);
      const jsonString = new TextDecoder().decode(uint8Array);

      const trees = parseTrees(jsonString);

      if (trees.length > 0) {
        // Ordenar árvores por próximo horário de corte
        trees.sort((a, b) => a.nextChopTime - b.nextChopTime);

        // console.log("Trees:", trees);
        for (const tree of trees) {
          const formattedNextChopTime = new Date(
            tree.nextChopTime
          ).toLocaleTimeString();
          // console.log(`Tree ${tree.lastChop}: ${formattedNextChopTime}`);

          // Adicionar mensagem à lista
          const messageToSend = `Árvore ${tree.lastChop} em ${formattedNextChopTime}`;
          messagesList.push(messageToSend);
          Alltrees.push(messageToSend);
          // console.log("Messages:", landNumber , messageToSend);
        }

        for (const tree of Alltrees) {
          //get the time from message
          const time = tree.split("em ")[1];
          const currentTimeBrasilia = new Date().toLocaleTimeString("pt-BR", {
            timeZone: "America/Manaus",
          });
          // if the difference between the time of the message and the current time is less than 1 hour , print
          const diff = calculateDifferenceInMinutes(time, currentTimeBrasilia);

          if (diff < 10 && diff > 0) {
            console.log(landNumber, tree, diff);
          }
        }
        ws.close();
      }
    } catch (error) {
      console.log("Erro ao processar mensagem:", error);
    }
  });

  ws.on("open", function open() {
    ws.send(new Uint8Array([10]).buffer);
  });

  return ws;
};

// task
const counter = [];
for (let i = 20; i <= 5000; i += 20) {
  counter.push(i);
}

const lands = [];
for (let i = 3140; i <= 3160; i++) {
  lands.push(i);
}

async function task() {
  console.time("Task");
  const landsInfo = await Promise.all(lands.map(getLandInfo));
  console.log(landsInfo);
  const sessions = await Promise.all(landsInfo.map(getSessionInfo));
  let messagesList = [];
  for (let i = 0; i < lands.length; i++) {
    const landNumber = lands[i];
    const session = sessions[i];
    const ws = getWs(session, messagesList, landNumber);
  }

  console.timeEnd("Task");
}

// getLandInfo(3181).then((land) => {
//     console.log(land)
//     getSessionInfo(land).then((session) => {
//         console.log(session)
//         // getWs(session, [], 3140);
//     });
// });

//run task asynchrounously

task()
  .then(() => {
    console.log("Task completed");
  })
  .catch((error) => {
    console.error("Task failed", error);
  });

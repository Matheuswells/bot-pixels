const getSessionInfo = async (land) => {
    if(!land || !land.metadata || !land.metadata.mapId) {
        return;
    }
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://pixels-server.pixels.xyz/matchmake/joinById/${land.roomId}/${land.server}`, {
        method: 'POST',
        body: JSON.stringify(
            {
                "mapId": land.metadata.mapId,
                "token": "iamguest",
                "isGuest": true,
                "cryptoWallet": {},
                "username": "Guest-the-traveling-tourist",
                "world": 99,
                "ver": 6.7,
                "avatar": "{}"
            }
        ),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
};

module.exports = getSessionInfo;
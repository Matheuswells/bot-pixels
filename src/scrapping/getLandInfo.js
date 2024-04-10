

const getLandInfo = async (landNumber) => {
    const timestamp = new Date().getTime();
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://pixels-server.pixels.xyz/game/findroom/pixelsNFTFarm-${landNumber}/99?v=${timestamp}`);
    // console.log(response.status)
    
    if (response.status >= 400) {
        console.log("No lands found 3");
        return;
    }
    
    return await response.json();
};

const get20LandInfo = async (starterLand) => {
    const lands = [];
    for (let i = starterLand; i <= (starterLand + 20 - 1); i++) {
        const info = getLandInfo(i);
        if (info) {
            lands.push(info);
        }
    }

    return await Promise.all(lands);
}
    

module.exports = { getLandInfo, get20LandInfo };
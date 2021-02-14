const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {v4: uuidv4} = require('uuid');

module.exports= {
async getRequestLinkLol(req,res){
    const [, token] = req.headers.authorization.split(' ');
    const authUserId = jwt.decode(token).id;

    const linkcode = uuidv4();
    const savelinkcode = await User.findByIdAndUpdate(authUserId, {linkCode:linkcode});
    return res.send(linkcode);
    
},

async verifyRequestLinkLol(req,res){
    const [, token] = req.headers.authorization.split(' ');
    const authUserId = jwt.decode(token).id;

    const summonerName = req.body.summonerName;
    const server = req.body.server;
    const searchAccountId = await axios.get(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.LOL_API_KEY}`).catch(error => console.error(error));

    const verify = await axios.get(`https://${server}.api.riotgames.com/lol/platform/v4/third-party-code/by-summoner/${searchAccountId.data.id}?api_key=${process.env.LOL_API_KEY}`).catch(error => console.error(error));
    const getlinkcode = await User.findById(authUserId, "linkCode");
    console.log(getlinkcode);
    console.log(verify.data);

    if (verify.data != getlinkcode.linkCode) 
        return res.send({error:'Account Link Failed'});
    const saveData = await User.findByIdAndUpdate(authUserId, {LolServer:server,LolData:searchAccountId.data});
    return res.send(saveData);
}
}

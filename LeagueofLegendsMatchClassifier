const axios = require('axios');
const Match = require('../models/Match');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

//rota usuário pede pra recuperar as próprias partidas

module.exports = {
async getMatchHistory(req,res) {

    //Get user info
    const [, token] = req.headers.authorization.split(' ');
    const authUserId = jwt.decode(token).id;
    const userLolData = await User.findById(authUserId); 
    //Get match history
    const matches = await axios.get(`https://${userLolData.LolServer}.api.riotgames.com/lol/match/v4/matchlists/by-account/${userLolData.LolData.accountId}?queue=420&queue=440&api_key=${process.env.LOL_API_KEY}`).catch(error => res.sendStatus(error.response.status));
    const tierIndex = {"CHALLENGER":1,"GRANDMASTER":2,"MASTER":3,"DIAMOND":4,"PLATINUM":8,"GOLD":12,"SILVER":16,"BRONZE":20,"IRON":24, "UNRANKED":28};
    const rankIndex = {"I":0,"II":1,"III":2,"IV":3};

    
    for (var i=0; i < 100 ;i++){
        const lolgameid = matches.data.matches[i].gameId;
        const verify = await Match.find({gameId:lolgameid});
        
        if (verify[0] === undefined){
            const matchstats = await axios.get(`https://${userLolData.LolServer}.api.riotgames.com/lol/match/v4/matches/${lolgameid}?api_key=${process.env.LOL_API_KEY}`).catch(error => res.sendStatus(error.response.status));
            const timeline = await axios.get(`https://${userLolData.LolServer}.api.riotgames.com/lol/match/v4/timelines/by-match/${lolgameid}?api_key=${process.env.LOL_API_KEY}`).catch(error => res.sendStatus(error.response.status));
            const lolgamepatch = matchstats.data.gameVersion;
            const flexelovalue = [];
            const soloelovalue = [];
            if(matches.data.matches[i].queue == 440){
                //flex
                for (var u=0;u<10; u++){
                    const sId = matchstats.data.participantIdentities[u].player.summonerId;
                    const elo = await axios.get(`https://${userLolData.LolServer}.api.riotgames.com/lol/league/v4/entries/by-summoner/${sId}?api_key=${process.env.LOL_API_KEY}`).catch(error => res.sendStatus(error.response.status));
                    var eloflex = elo.data.find( ({queueType}) => queueType === "RANKED_FLEX_SR");
                    if(typeof eloflex == "undefined"){eloflex = {"tier":"UNRANKED", "rank":"I"};}
                    const elovalue = tierIndex[eloflex.tier] + rankIndex[eloflex.rank];
                    flexelovalue.push(elovalue);
                    
                }
                const elomean = flexelovalue.reduce((a,b) => a + b, 0)/10;
                const matchsave = await Match.create({gameId: lolgameid ,elo: elomean , match:matchstats.data , timeline:timeline.data, patch:lolgamepatch, queue:matches.data.matches[i].queue});
                
            }
            
            else{
                    //soloduo
                for (var u=0;u<10; u++){
                    const sId = matchstats.data.participantIdentities[u].player.summonerId;
                    const elo = await axios.get(`https://${userLolData.LolServer}.api.riotgames.com/lol/league/v4/entries/by-summoner/${sId}?api_key=${process.env.LOL_API_KEY}`).catch(error => res.sendStatus(error.response.status));
                    
                    var elosolo = elo.data.find( ({queueType}) => queueType === "RANKED_SOLO_5x5");
                    if(typeof elosolo == "undefined"){elosolo = {"tier":"UNRANKED", "rank":"I"};};
                    const elovalue = tierIndex[elosolo.tier] + rankIndex[elosolo.rank];
                    soloelovalue.push(elovalue);
                }
                const elomean = soloelovalue.reduce((a,b) => a + b, 0)/10;
                const matchsave = await Match.create({gameId: lolgameid ,elo: elomean , match:matchstats.data , timeline:timeline.data, patch:lolgamepatch, queue:matches.data.matches[i].queue});
                
            }
            verify.result = undefined;
            
        }
        
        //else {
        //   break;
        //}

    };

}
}

let boneClass = require('./boneClass')
class gameServerClass {
    constructor(
        io,
        room,
        players
    ) {
        this.io = io
        this.room = room
        this.players = players
        console.log('moon game server initializing..')
        this.halt = false
            this.bonepoolMoon = [  // complete pool of 22 dominoes for MOON (const)
                '00', // '01','02','03','04','05','06',
                '11','12','13','14','15','16',
                '22','23','24','25','26',
                '33','34','35','36',
                '44','45','46',
                '55','56',
                '66'
            ]
            this.bonepool = [] // dynamic pool (var)
            this.replaceSocketMap = new Map()
            // Convert bone strings to bone objects
            this.bonepoolMoon = this.bonepoolMoon.map((x) => new boneClass(x))
            this.shakeBones()
            this.call = 'Follow Me'
    }

    start(
    ) {
        let io = this.io;
        console.log('moon game server starting..');
        // Never use 'this' keyword in callbacks
    }

    async emitUntilAckOrTimeout(
        player,
        data
    ) {
        let p1 = new Promise( resolve => {
            console.log(`Emitting yourturn event to client ${player.nickName} with {${data.cmd} ..`)
            data.status = 'ACK'
            // Pass resolve function as an ack function
            player.socket.emit('yourturn', data, resolve)
        })
        let p2 = new Promise( resolve => {
            setTimeout(resolve, 1000, {status:'RETRY'})
        })
        let p3 = new Promise( resolve => {
            // Set haltGame function to this resolve function
            this.haltGame = resolve
        })
        let p = Promise.race([p1,p2,p3])
        return p
    }

    async emitUntilAck(
        player,
        data
    ) {
        let result = {status:'RETRY'}
        let retries = 3
        while (retries && (result.status == 'RETRY')) {
            result = await this.emitUntilAckOrTimeout(player, data)
            retries--
        }
        if (result.status == 'RETRY') {
            console.log(`Player ${player.nickName} lost connection`)
        }
        return result
    }

    async getPlayerResponse(
        player,
        timeout
    ) {
        console.log('getPlayerResponse called ..')
        let p1 = new Promise( (resolve, reject) => {
            player.socket.once('done', (data) => {
                data.status = 'DONE'
                resolve(data)
            })
        })
        let p2 = new Promise( resolve => {
            //setTimeout(resolve, 1000*timeout, {status:'TIMED OUT'})
            this.moonTimeout(resolve, player, timeout)
        })
        let p3 = new Promise( resolve => {
            this.haltGame = resolve
        })
        let p = Promise.race([p1,p2,p3])
        // These lines stop timeout countdown at resolution
        p.then(() => new Promise( resolve => {
            this.moonTimeout(resolve, player, 0)
            player.socket.emit('timeout', {enable:false})
        }))
        return p
    }

    async playerTurn(
        room,
        player,
        data,
        timeout
    ) {
        let socket = player.socket
        let nickName = player.nickName
        let result
        console.log(`It is player ${nickName} turn`)
        if (nickName == 'moonbot') {
            result = await this.moonBot(data)
        }
        else {
            result = await this.emitUntilAck(player, data)
            if (result.status == 'ACK') {
                result = await this.getPlayerResponse(player, timeout)
                if (result.status != 'DONE') { // timed out waiting for response
                    console.log(`MoonBot playing for ${nickName} ..`)
                    socket.to(this.room).emit(`MoonBot playing for ${nickName} (no response) ..`)
                    result = await this.moonBot(data)
                    socket.emit('moonbot', result)
                }
            }
            else { // timed out waiting for ACK
                console.log(`MoonBot playing for ${nickName} ..`)
                socket.to(this.room).emit(`MoonBot playing for ${nickName} (ack timeout) ..`)
                result = await this.moonBot(data)
            }
        }
        return result
    }
    
    async drawForShake(
        room
    ) {
        let winners = room.round()
        // Short circuit this for faster development..
        return winners[0]
        while (winners.length != 1) {
            let maxBone = new boneClass("00") // set to lowest domino (double blank)
            let nextWinners = []
            for (let player of winners) {
                let socket = player.socket
                let data = {cmd:'draw', bones:this.sendBonePool(socket.id)}
                let result = await this.playerTurn(room, player, data, 10)
                let boneId = result.boneId
                let bone = this.bonepool[boneId]
                bone.faceup = true
                bone.owner = ''
                this.io.to(room.name).emit('drewbone', {player:nickName, boneId:boneId, boneStr:bone.boneStr})
                if (bone.ov_gt(maxBone)) {
                    maxBone = bone
                    nextWinners = [player]
                    console.log(nickName)
                }
                else if (bone.ov_eq(maxBone)) {
                    nextWinners.push(player)
                    console.log('tie')
                }
            }
            winners = nextWinners
        }
        return winners[0]
    }

    ack(
        data
    ) {
        console.log(`client has acknowledged it is his turn by returning..`)
        console.log(data)
    }
    
    async trick(
        room,
        players
    ) {
        let first = true
        let maxBone = null
        let winner
        let bones = []
        this.suit = -1
        for (let player of players) {
            let socket = player.socket
            let pool = await this.sendBonePool(socket.id, first)
            let stats = await this.getStats(players)
            let result = await this.playerTurn(room, player, {cmd:'play', bones:pool, stats:stats, maxBone:maxBone, trump:this.call}, 20)
            let {boneId} = result
            let bone = this.bonepool[boneId]
            bone.played = true
            bone.faceup = true
            bone.owner = ''
            bones.push(bone)
            if (first) {
                if ((bone.lo == bone.trump) || (bone.hi == bone.trump)) {
                    bone.suit = bone.trump
                }
                else if ((bone.trump == 7) && (bone.lo == bone.hi)) {
                    bone.suit = bone.trump
                }
                else {
                    bone.suit = bone.hi
                }
                console.log(`suit = ${bone.suit}`)
                this.suit = bone.suit
                maxBone = bone
                winner = player
                first = false
            }
            else {
                bone.suit = this.suit
                if (bone.ov_gt(maxBone)) {
                    maxBone = bone
                    winner = player
                }
            }
            console.log('bone.value = ' + bone.value())
            this.io.to(room.name).emit('state', {socketId:socket.id, player:player.nickName, boneId:boneId, bone:this.sendBone(boneId)})
        }
        winner.tricks++
        this.tricks++
        for (let bone of bones) {
            bone.trick = this.tricks
            bone.otrick = winner.tricks
            bone.owner = winner.socket.id
        }
        return winner
    }

    getStats(
        players
    ) {
        let stats = {}
        let player
        let socketIds = []
        for (player of players) {
            socketIds.push(player.socket.id)
            stats[player.socket.id] = {
                'name': player.nickName,
                'wins': player.wins,
                'score': player.score,
                'tricks': player.tricks
            }
        }
        stats['socketIds'] = socketIds
        return stats
    }
    
    async firstValidPlay(
        bones
    ) {
        let i = 0
        for (let bone of bones) {
            if (bone.valid) {
                return i
            }
            i++
        }
        return 0
    }

    async bestValidPlay(
        data
    ) {
        let i = 0
        let plays = []
        let {bones, maxBone} = data
        let bone
        let nvalid = 0
        for (let _bone of bones) {
            if (_bone.valid) {
                nvalid += 1
                plays.push(i)
                bone = this.bonepool[i] // get the real bone
                bone.suit = this.suit
                // Play the first winner you see
                if (maxBone && (bone.ov_gt(maxBone))) {
                    return i
                }
            }
            i++
        }
        if (plays.length == 1) {
            // Only one valid play
            return plays[0]
        }
        if (! maxBone) {
            // Since I am leading, play a double if I have it
            for (let play of plays) {
                bone = this.bonepool[play]
                if (bone.suits[7]) {
                    return play // stop at first double
                }
            }
            // Otherwise, play first valid one
            return plays[0]
        }
    
        if (plays.length == nvalid) {
            // If no bones remaining in hand follow suit,
            // play a small non-double or small double..
            let minValue = 999
            let value
            let minPlay
            for (let play of plays) {
                bone = this.bonepool[play]
                value = bone.lo + bone.hi
                value += ((bone.lo == bone.hi) && (bone.lo > 2))*100
                if (value < minValue) {
                    minValue = value
                    minPlay = play
                }
            }
            return minPlay
        }
    
        // If there are more than one losing plays,
        // play the lowest one.
        let minPlay = plays[0]
        let minBone = this.bonepool[minPlay]
        for (let play of plays) {
            bone = this.bonepool[play]
            if (bone.ov_lt(minBone)) {
                minBone = bone
                minPlay = play
            }
        }
        return minPlay
    }

    async firstFacedown(
        bones
    ) {
        let i = 0
        for (let bone of bones) {
            if (! bone.faceup) {
                return i
            }
            i++
        }
        return 0
    }
    
    async firstFacedown7(
        bones
    ) {
        let i = 0
        let rv = []
        for (let bone of bones) {
            if (! bone.faceup) {
                rv.push(i)
                if (rv.length == 7) {
                    return rv
                }
            }
            i++
        }
        console.log(`firstFacedown7: ERROR - Not enough facedown bones, only found ${rv.length}`)
        return rv
    }

    async delay(
        time
    ) {
        return new Promise( resolve => setTimeout(resolve, time) )
    }

    async moonBot(
        data
    ) {
        let result = {}
        result.status = 'MOONBOTDONE'
        await this.delay(1000) // artificial delay simulates thinking..
        if (data.cmd == 'play') {
            //result.boneId = await this.firstValidPlay(data.bones)
            result.boneId = await this.bestValidPlay(data)
        }
        else if ((data.cmd == 'draw') || (data.cmd == 'shake')) {
            result.boneId = await this.firstFacedown(data.bones)
        }
        else if (data.cmd == 'draw7') {
            result.boneIds = await this.firstFacedown7(data.bones)
        }
        else if (data.cmd == 'bid') {
            if (data.maxBid == -2) { // stuck bid
                result.bid = 1 // must bid at least 4
            }
            else {
                result.bid = 0 // pass
            }
        }
        else if (data.cmd == 'discard') {
            result.boneId = await this.firstValidPlay(data.bones)
        }
        else if (data.cmd == 'call') {
            result.call = 8 // follow me
        }
        else {
            console.log(`moonBot: ${data.cmd} not recognized`)
            result.status = 'MOONBOTERROR'
        }
        return result
    }
    
    async playHand(
        room,
        shaker
    ) {
        //shaker.socket.emit('yourturn', {cmd:'shake'}, this.ack)
        await this.shakeBones() // just to initialize dominoes
        await this.shake(room, shaker)
        let leadPlayer = room.next(shaker) // lead player
        let players = room.round(leadPlayer)
        let stats = await this.getStats(players)
        //for (let player of players) {
        for (let player of room.nextPlayer(leadPlayer.idx)) {
            if (this.halt) { break }
            let socketId = player.socket.id
            player.tricks = 0
            let pool = await this.sendBonePool(socketId)
            let data = {cmd:'draw7', bones:pool, stats:stats}
            let result = await this.playerTurn(room, player, data, 60)
            if (this.replaceSocketMap.has(socketId)) {
                socketId = this.replaceSocketMap.get(socketId)
            }
            let {boneIds} = result
            for (let boneId of boneIds) {
                let bone = this.bonepool[boneId]
                bone.faceup = true
                bone.owner = socketId
                //console.log(`Assigned owner ${bone.owner} to ${bone.boneStr}`)
            }
        }
        this._remapSocketId()
        //let caller = await this.biddingRound(room, players)
        let caller = await this.biddingRound(room, leadPlayer.idx)
        // Determine remaining bone in kitty
        let kitty = await this.findKitty(caller.socket.id)
        //console.log(caller)
        console.log(`Player ${caller.nickName} won the bid`)
        let boneId = await this.getDiscard(room, caller)
        kitty.kitty = false // no longer need to identify this bone
        console.log(`boneId = ${boneId}`)
        let bone = this.bonepool[boneId]
        bone.discarded = true
        bone.faceup = false
        bone.owner = ''
        this.call = await this.getCall(room, caller)
        this.io.to(room.name).emit('call', {caller:caller.nickName, call:this.call})
        let leader = caller
        this.tricks = 0
        for (let i=0; i<7; i++) {
            if (this.halt) { break }
            leader = await this.trick(room, room.round(leader))
            console.log(`Player ${leader.nickName} wins the trick`)
            console.log(`Player ${leader.nickName} has won ${leader.tricks} tricks`)
        }
        console.log(`Player ${caller.nickName} won ${caller.tricks} tricks and bid ${caller.bid}`)
        // Update score for caller based on if he made his bid
        let minTricks = caller.bid + 3
        if (minTricks > 7) { // MOON
            if (caller.tricks < 7) {
                caller.score -= 21
            }
            else {
                caller.score += 21 // Caller took all 7 tricks
            }
        }
        else {
            if (caller.tricks < minTricks) {
                caller.score -= minTricks
            }
            else {
                caller.score += caller.tricks
            }
        }
        for (let player of room.nextPlayer(leadPlayer.idx)) {
            if (player != caller) {
                player.score += player.tricks
            }
            player.tricks = 0
            //console.log(`Player ${player.nickName} : ${player.score}`)
        }
    
        // Emit stats
        stats = await this.getStats(players)
        let pool = await this.sendBonePool(caller)
        this.io.to(room.name).emit('stats', {stats, bones:pool})
        await this.delay(1000) // allow players to see final trick and stats
        return 0
    }

    haltGame(
        x
    ) {
        console.log('Error - haltGame function should be overridden')
        return x
    }
    
    async playMoon(
        room
    ) {
        console.log(`Starting MOON game in ${room.name} ..`)
        let shaker = await this.drawForShake(room)
        let shakerIdx = shaker.idx
        console.log(`${shaker.nickName} wins the shake`)
        while (! this.halt) {
            let winner = null
            while ((! winner) && (! this.halt)) {
                await this.playHand(room, shaker)
                if (this.halt) { break }
                // next player shakes
                shaker = room.nextIdx(shakerIdx)
                shakerIdx = shaker.idx
                for (let player of room.round()) {
                    if (player.score >= 21) {
                        winner = player
                        console.log(`Player ${player.nickName} wins MOON`)
                        this.io.to(room.name).emit('info', `${player.nickName} wins MOON`) 
                        winner.wins++
                    }
                }
            }
            if (this.halt) { break }
            for (let player of room.round()) {
                player.bid = 0
                player.tricks = 0
                player.score = 0
            }
        }
        return 0
    }

    shuffle(
        array
    ) {
        /**
         * Randomly shuffle an array
         * https://stackoverflow.com/a/2450976/1293256
         * @param  {Array} array The array to shuffle
         * @return {String}      The first item in the shuffled array
         */
        var currentIndex = array.length
        var temporaryValue, randomIndex
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }
    return array
    }
    
    async findKitty(
        socketId
    ) {
    for (let bone of this.bonepool) {
        if (!bone.faceup) {
            console.log(bone)
            bone.owner = socketId
            bone.kitty = true
            bone.faceup = true
            return bone
        }
    } // for
    // TODO: raise or throw an error here
    }
    
    sendBone(
        boneId
    ) {
    let bone = this.bonepool[boneId]
    let rv = {
        faceup: bone.faceup,
        owner: bone.owner,
        otrick: bone.otrick,
        trick: bone.trick,
        kitty: bone.kitty,
        boneStr: bone.boneStr,
        played: bone.played,
        discarded: bone.discarded
    }
    return rv
    }
    
    sendBonePool(
        socketId="",
        first=true
    ) {
    let bone
    let nvalid = 0
    if (first) {
        console.log('Calculating valid first plays..')
        for (bone of this.bonepool) {
            if ((bone.owner == socketId) && (! bone.trick)) {
                console.log(`Bone ${bone.boneStr} is valid`)
                bone.valid = true
                bone.trump = this.call
            }
            else {
                bone.valid = false
            }
        }
    }
    else {
        console.log('Calculating valid plays..')
        for (bone of this.bonepool) {
            bone.trump = this.call
            if ((bone.owner == socketId) && (! bone.trick)) {
                console.log('Bone ' + bone.boneStr)
                if (bone.trump == this.suit) {
                    if (bone.suits[this.suit]) {
                        bone.valid = true
                        nvalid++
                        console.log('This one follows the trump suit.')
                    }
                    else {
                        bone.valid = false
                    }
                }
                else if (bone.suits[this.suit] && ((bone.trump == 8) || (! bone.suits[bone.trump]))) {
                    bone.valid = true
                    nvalid++
                    console.log('This one follows suit.')
                }
                else {
                    bone.valid = false
                }
            }
            else {
                bone.valid = false
            }
        }
        if (! nvalid) {
            for (bone of this.bonepool) {
                if ((bone.owner == socketId) && (! bone.trick)) {
                    bone.valid = true
                }
            }
        }
    }
    return this.bonepool.map((x) => {
        let rv = {
            faceup: x.faceup,
            owner: x.owner,
            otrick: x.otrick,
            trick: x.trick,
            kitty: x.kitty,
            boneStr: x.boneStr,
            played: x.played,
            discarded: x.discarded,
            trump: x.trump,
            valid: x.valid
        }
        // hide owner if face down or not owned by you
        if (!rv.faceup) {
            rv.owner = ''
        }
        // hide owner and boneStr if in opponent's hand
        else if (x.owner && (x.owner != socketId) && (x.trick == 0)) {
            rv.owner = '-'
            rv.boneStr = ''
        }
        return rv
    })
    }
    
    _remapSocketId(
    ) {
    for (let bone of this.bonepool) {
        if (this.replaceSocketMap.has(bone.owner)) {
            bone.owner = this.replaceSocketMap.get(bone.owner)
        }
    }
    }
    
    remapSocketId(
        oldSocketId,
        newSocketId
    ) {
    this.replaceSocketMap.set(oldSocketId, newSocketId)
    }
    
    shakeBones(
        seed=22
    ) {
    console.log(`Applying random seed, ${seed}, to inject randomness`)
    let s = 0
    for (let i=0; i<((seed % 32)+1); i++) {
        s += Math.random()
    }
    this.bonepool = this.shuffle(this.bonepoolMoon.slice()) // copy and shuffle
    for (let i in this.bonepool) {
        //bone.faceup = false
        //bone.owner = ''
        this.bonepool[+i].faceup = false
        this.bonepool[+i].owner = ''
        this.bonepool[+i].otrick = 0
        this.bonepool[+i].trick = 0
        this.bonepool[+i].played = false 
        this.bonepool[+i].discarded = false 
        //this.bonepool[+i].boneStr = ''
    }
    return 0
    }
    async biddingRound(
        room,
        idx
    ) {
    let maxBid = -1
    let winner
    let data
    let i = 0
    for (let player of room.nextPlayer(idx)) {
        let socket = player.socket
        let nickName = player.nickName
        i++
        if ((i == 3) && (maxBid == 0)) {
     console.log(`Player ${nickName} gets a stuck bid`)
     maxBid = -2 // special code for stuck bid
        }
        data = {cmd:'bid', maxBid}
        let result = await this.playerTurn(room, player, data, 60)
        let bid = result.bid
        this.io.to(room.name).emit('bid', {player:nickName, bid})
        if (bid > maxBid) {
     maxBid = bid
     winner = player
        }
    }
    winner.bid = maxBid
    return winner
    }
    async getCall(
        room,
        caller
    ) {
    let data = {cmd:'call', choices:['1','2','3','4','5','6','doubles','none']}
    let result = await this.playerTurn(room, caller, data, 60)
    let call = result.call
    return call
    }
    async shake(
        room,
        shaker
    ) {
    let shakerPool = await this.sendBonePool(shaker.socket.id)
    let data = {cmd:'shake', bones:shakerPool}
    let result = await this.playerTurn(room, shaker, data, 20)
    let {boneId} = result
    let sbone = this.bonepool[boneId]
    await this.shakeBones(sbone.hi*8 + sbone.lo)
    }
    async getDiscard(
        room,
        caller
    ) {
    let callerPool = await this.sendBonePool(caller.socket.id)
    let data = {cmd:'discard', bones:callerPool}
    let result = await this.playerTurn(room, caller, data, 180)
    let boneId = result.boneId
    return boneId
    }
    async moonTimeout(
        resolve,
        player,
        timeout
    ) {
    const nonce = this.moonTimeoutNonce = new Object()
    for(let t=timeout; t>0; t--) {
        await this.delay(1000)
        if (nonce !== this.moonTimeoutNonce) {
            resolve({status:'CANCELED'})
            //console.log('moonTimeout was canceled')
            return // a new call was made to moonTimeout, so cancel this one
        }
        console.log(`TIMEOUT: ${t-1}`)
        player.socket.emit('timeout', {enable:true, timeout:t-1})
    }
    resolve({status:'TIMED OUT'})
    }
}

module.exports = gameServerClass;

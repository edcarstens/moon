let roomClass = require('./roomClass')
let playerClass = require('./playerClass')
let gameServerClass = require('./gameServerClass')
class gameroomClass extends roomClass {
    constructor(io, id, maxCapacity=0) {
	super(io, id, maxCapacity)
	this.players = []
	this.gameServer = null
    }

    toJSON(
    ) {
            let rv = {
        	players: this.players.map(p => {
        	    return {nickName: p.nickName,
        		    wins: p.wins,
        		    score: p.score,
        		    idx: p.idx}
        	})
            }
        return rv
    }

    playMoon(
    ) {
            var i = this.players.length
            while (this.players.length < this.maxCapacity) {
        	let id = `moonbot${i}`
        	let p = new playerClass({id:id}, 'moonbot')
        	p.idx = i++
        	this.players.push(p)
            }
            this.n = 3
            this.isFull = true
            console.log('Starting game..')
            this.io.to(this.name).emit('startmoon', {roomName:this.name, roomid:this.id})
            this.gameServer = new gameServerClass(this.io, this, this.players)
            this.gameServer.playMoon(this).then( (x) => {
        	console.log('Game ended..')
        	this.gameServer = null
        //	process.kill(process.pid, 'SIGTERM')
            })
    }
    
    arrive(
        socket,
        nickName
    ) {
            super.arrive(socket, nickName)
            let player = new playerClass(socket, nickName)
            if (this.players.length < this.maxCapacity) {
        	this.players.push(player)
        	player.idx = this.players.length - 1
            }
            else {
        	// replace moonbot
        	this.n--
        	let idx = this.players.findIndex(p => { return (p.nickName == 'moonbot') })
        	console.log(`found moonbot idx = ${idx}`)
        	console.log(`players.length = ${this.players.length}`)
        	console.log(`${this.players[0].nickName}`)
        	console.log(`${this.players[1].nickName}`)
        	console.log(`${this.players[2].nickName}`)
        	let oldSocketId = this.players[idx].socket.id
        	let newSocketId = socket.id
        	console.log('oldSocketId=${oldSocketId}')
        	console.log('newSocketId=${newSocketId}')
        	if (this.gameServer) {
        	    this.gameServer.remapSocketId(oldSocketId, newSocketId)
        	}
        	this.players[idx] = player
        	player.idx = idx
        	console.log('player.idx=${player.idx}')
            }
            if (this.isFull && (! this.gameServer)) {
        	this.playMoon()
            }
            return this
    }
    leave(
        socket
    ) {
            //super.leave(socket)
            let io = this.io
            let idx
            io.to(this.name).emit('roomleft', {roomName:this.name, roomid:this.id})
            this.isFull = false
            idx = this.sockets.findIndex((x) => { return (x[0] === socket) })
            this.sockets.splice(idx, 1)
            idx = this.players.findIndex(p => {return (p.socket === socket)})
            this.players[idx].nickName = 'moonbot'
            console.log(`set player at idx=${idx} to moonbot`)
            if (this.gameServer && (this.sockets.length == 0)) {
        	this.gameServer.halt = true
        	this.gameServer.haltGame({status:"HALT"})
            }
            return (this.sockets.length > 0)
    }
    round(
        player=0
    ) {
            let i = 0
            if (player) {
        	while ((i < this.n) && (this.players[i] !== player)) { i++ }
            }
            // check for error?
            if (i == 0) {
        	return this.players
            }
            else {
        	return this.players.slice(i,this.n).concat(this.players.slice(0,i))
            }
    }
    next(
        player=0
    ) {
            let i = 0
            if (player) {
        	while ((i < this.n) && (this.players[i] !== player)) { i++ }
            }
            i = (i + 1) % this.n
            console.log('next: player index - i=${i}')
            console.log('next: this.players[i]=${this.players[i]}')
            return this.players[i]
    }
    nextIdx(
        i=0
    ) {
        let ni = (i + 1) % this.n
        return this.players[ni]
    }

    // New Improved Generator Method
    *nextPlayer(
        idx=0
    ) {
            for (let i=0; i<3; i++) {
        	console.log(`nextPlayer: idx=${idx}`)
        	if (this.players[idx] === undefined) {
        	    console.log(`nextPlayer: ERROR`)
        	}
        	yield this.players[idx]
        	idx = (idx + 1) % this.n
            }
    }

    /*
    *players(rounds) { // generator method
	while (this.rounds < rounds) {
	    this.playerTurn = this.playerNextTurn
	    this.playerNextTurn++
	    if (this.playerNextTurn >= this.n) {
		this.playerNextTurn = 0
		this.rounds++
	    }
	    yield this.sockets[this.playerTurn] // return the socket
	}
    }*/
}
module.exports = gameroomClass

let roomClass = require('./roomClass')
class clerkClass {
    constructor(
        io,
        clientsPerRoom,
    ) {
        this.io = io
        this.clientsPerRoom = clientsPerRoom
        this.rooms = {}
        this.vacancies = []
        this.roomNumber = 0
        this.roomNumberOf = {}
    }

    newRoom(
        roomId,
    ) {
        return new roomClass(this.io, roomId, this.clientsPerRoom)
    }

    getVacancies(
    ) {
        let rv = {vacancies:{}}
    	//console.log('clerk.getVacancies called..')
    	//console.log(this.vacancies.length)
        if (this.vacancies.length) {
     for (let roomNumber of this.vacancies) {
         if (! (roomNumber in rv)) {
      rv.vacancies[roomNumber] = 1
      rv[roomNumber] = this.rooms[roomNumber]
         }
         else {
      rv.vacancies[roomNumber] += 1
         }
     }
        }
        return rv
    }

    arrive(
        socket,
        inData,
    ) {
        let io = this.io
        var r
        var room = inData.room
        //console.log(room)
        var roomFunc = function(val,idx,ary) {
     return val == room
        }
        // Is room vacant?
        //console.log('clerk.arrive: vacancies..')
        //console.log(this.vacancies)
        var x = this.vacancies.find(roomFunc)
        //console.log(x)
        if (room < 0) { // requested new empty room
     console.log('requested new room')
     x = this.roomNumber++
     r = this.newRoom(x)
     this.rooms[x] = r
     for(let i=0; i<this.clientsPerRoom-1; i++) {
                this.vacancies.push(x)
            }
        }
        else if (x != undefined) { // requested specific room
     console.log('requested room has a vacancy')
     console.log(x)
     this.removeVacancy(x)
     r = this.rooms[x]
        }
        else if (this.vacancies.length) {
     console.log('forcing you into first vacant room')
     x = this.vacancies.shift() // room # of oldest vacancy first
     r = this.rooms[x]
        }
        else {
     console.log('forcing you into new room')
     x = this.roomNumber++
     r = this.newRoom(x)
     this.rooms[x] = r
     for(let i=0; i<this.clientsPerRoom-1; i++) {
                this.vacancies.push(x)
            }
        }
        //console.log(this.vacancies)
        this.roomNumberOf[socket.id] = x
        var rv = r.arrive(socket, inData.player)
        io.emit('vacancies', this.getVacancies())
        return rv
    }

    leave(
        socket,
    ) {
        let x = this.roomNumberOf[socket.id]
    	let io = this.io
        delete this.roomNumberOf[socket.id]
        if (this.rooms[x]) {
     if (this.rooms[x].leave(socket)) {
                this.vacancies.push(x)
    		io.to(this.rooms[x].name).emit('info', socket.id + ' has disconnected')
     }
     else {
                console.log('closing room ' + x)
                // remove all vacancies for this room
                this.removeVacancies(x)
                // remove the room
                delete this.rooms[x]
     }
        }
    }

    removeVacancy(
        x,
    ) {
        var idx = this.vacancies.indexOf(x)
        if (idx >= 0) {
     this.vacancies.splice(idx, 1)
        }
    }

    removeVacancies(
        x,
    ) {
        var idx = this.vacancies.indexOf(x)
        while (idx >= 0) {
     this.vacancies.splice(idx, 1)
     idx = this.vacancies.indexOf(x)
        }
    }

    playWithBots(
        data,
    ) {
    console.log('clerk method playWithBots called')
    console.log(data)
    let x = this.roomNumberOf[data.socketId]
    let r = this.rooms[x]
    if (r) {
        r.playMoon()
    }
    else {
        console.log(`ERROR - Bad room ID, ${x}`)
        console.log(r)
        process.kill(process.pid, 'SIGTERM')
    }
    }
}
module.exports = clerkClass

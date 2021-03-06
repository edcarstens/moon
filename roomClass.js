class roomClass {
    constructor(
        io,
        id,
        maxCapacity=0
    ) {
        this.io = io
        this.id = id
        this.maxCapacity = maxCapacity
        this.name = 'room ' + id // room name
        this.sockets = [] // sockets that joined room
        this.n = 0 // current number of occupants
        this.isFull = false
    }
        
    arrive(
        socket,
            nickName
    ) {
        console.log('arrive: ' + nickName)
        let io = this.io
        socket.join(this.name)
        this.sockets.push([socket, nickName])
        this.n++
        socket.emit('roomgrant', {roomName:this.name, roomid:this.id})
        io.to(this.name).emit('roomjoined', {roomName:this.name, roomid:this.id, nickName:nickName})
        let n = io.nsps['/'].adapter.rooms[this.name].length
        console.log('n = ' + n)
        if ((this.maxCapacity > 0) && (n >= this.maxCapacity)) {
            //io.to(this.name).emit('roomfull', {roomName:this.name, roomid:this.id})
            this.isFull = true
        }
        return this
    }
    
    leave(
        socket
    ) {
        let io = this.io
        let idx
        this.n--
        io.to(this.name).emit('roomleft', {roomName:this.name, roomid:this.id})
        this.isFull = false
        idx = this.sockets.findIndex((x) => { return (x[0] === socket) })
        this.sockets.splice(idx, 1)
        return (this.sockets.length > 0)
    }
}
module.exports = roomClass

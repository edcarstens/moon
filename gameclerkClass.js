let clerkClass = require('./clerkClass')
let gameroomClass = require('./gameroomClass')
class gameclerkClass extends clerkClass {
    newRoom(
        roomId,
    ) {
        return new gameroomClass(this.io, roomId, this.clientsPerRoom)
    }
}
module.exports = gameclerkClass

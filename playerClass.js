class playerClass {
    constructor(
        socket=null,
        nickName="",
    ) {
        this.socket = socket
        this.nickName = nickName
        this.bid = 0
        this.tricks = 0
        this.score = 0
        this.wins = 0
        this.idx = 0
    }
}
module.exports = playerClass

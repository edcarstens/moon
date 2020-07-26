class moonClass {
    constructor(
        player='',
        state=null,
        socket=null,
        roomOfBtn={0:0,1:1,2:2},
        room=null,
    ) {
        this.player = player
        this.state = state
        this.socket = socket
        this.roomOfBtn = roomOfBtn
        this.room = room
        this.describeTrump = {
            1: 'aces',
            2: 'ducks',
            3: 'threes',
            4: 'fours',
            5: 'fives',
            6: 'sixes',
            7: 'doubles',
            8: 'follow me' 
        }
            this._boneClicked = (boneId) => boneId
            this.clickBoneId = {}
            this._bidClicked = (bid) => bid
            this._callClicked = (call) => call
    }

    gotoLogin(
    ) {
        $('#btnRoom1').show()
        $('#btnRoom2').show()
        $('#btnRoom3').show()
        $('#inputChatName').show()
        $('#gfx').hide()
        $('#btnSend').hide()
        $('#inputMessage').hide()
            $('#btnBone0').hide();
            $('#tile00').hide()
            $('#btnBone1').hide();
            $('#tile11').hide()
            $('#btnBone2').hide();
            $('#tile12').hide()
            $('#btnBone3').hide();
            $('#tile13').hide()
            $('#btnBone4').hide();
            $('#tile14').hide()
            $('#btnBone5').hide();
            $('#tile15').hide()
            $('#btnBone6').hide();
            $('#tile16').hide()
            $('#btnBone7').hide();
            $('#tile22').hide()
            $('#btnBone8').hide();
            $('#tile23').hide()
            $('#btnBone9').hide();
            $('#tile24').hide()
            $('#btnBone10').hide();
            $('#tile25').hide()
            $('#btnBone11').hide();
            $('#tile26').hide()
            $('#btnBone12').hide();
            $('#tile33').hide()
            $('#btnBone13').hide();
            $('#tile34').hide()
            $('#btnBone14').hide();
            $('#tile35').hide()
            $('#btnBone15').hide();
            $('#tile36').hide()
            $('#btnBone16').hide();
            $('#tile44').hide()
            $('#btnBone17').hide();
            $('#tile45').hide()
            $('#btnBone18').hide();
            $('#tile46').hide()
            $('#btnBone19').hide();
            $('#tile55').hide()
            $('#btnBone20').hide();
            $('#tile56').hide()
            $('#btnBone21').hide();
            $('#tile66').hide()
            for (let i=0; i<6; i++) {
                $('#btnBid' + i).hide()
            }
            for (let i=0; i<8; i++) {
                $('#btnCall' + i).hide()
            }
            $('#btnPlayWithBots').hide()
    }

    init(
        socket,
    ) {
        moon.socket = socket
        moon.gotoLogin()
    }

    async clickPlay(
    ) {
        let plist = []
        for (let i=0; i<3; i++) {
            plist.push( new Promise( (resolve, reject) => {
                $('#btnRoom' + i).on('click', () => {
                    resolve({player:$("#inputChatName").val(), room:i})
                })
            }) )
        } // for i
        return Promise.race(plist)
    }

    async clickSend(
    ) {
        return new Promise( (resolve, reject) => {
            $('#btnSend').on('click', () => {
                resolve($("#inputMessage").val())
            })
        })
    }

    async boneClickedOrBot(
    ) {
        let p1 = new Promise( (resolve, reject) => {
            moon._boneClicked = (boneId) => {
                resolve({boneId, status:'DONE'})
            }
        })
        let p2 = new Promise( resolve => {
            moon.socket.once('moonbot', result => {
                resolve(result)
            })
        })
        return Promise.race([p1,p2])
    }

    async boneClicked(
    ) {
        let {boneId} = await this.boneClickedOrBot()
        return boneId
    }

    async rxRoom(
    ) {
        return new Promise( (resolve, reject) => {
            moon.socket.once('roomgrant', (data) => {
                resolve(data.roomName)
            })
        })
    }

    async waitForStart(
    ) {
        return new Promise( (resolve, reject) => {
            moon.socket.once('startmoon', (data) => {
                resolve(data.roomName)
            })
        })
    }

    async myTurn(
    ) {
        return new Promise( (resolve, reject) => {
            moon.socket.once('yourturn', (data, ack) => {
                //resolve(data.nickName == moon.player)
                //ack(moon.socket.id, moon.player)
                ack(data)
                resolve(data)
            })
        })
    }

    async delay(
        time,
    ) {
        return new Promise( resolve => setTimeout(resolve, time) )
    }

    async start(
    ) {
        let data, bone, boneId
        let done = false
        console.log('Starting MOON...')
        $('#trump').hide()
        $('#suit').hide()
        
        // Need to show active gamerooms with moonbots..
        moon.socket.on('vacancies', data => {
            console.log('vacancies..')
            console.log(data.vacancies)
            //console.log(data)
            var rooms = []
            if (moon.room == null) {
                for (let room in data.vacancies) {
                    rooms.push(room)
                }
                //console.log('rooms')
                //console.log(rooms)
                //let room = data[Number(rooms[0])]
                for (let i=0; i<3; i++) {
                    if (rooms.length > i) {
                        let room = data[rooms[i]]
                        console.log('room')
                        console.log(room)
                        let players = room.players
                        console.log(players)
                        let playerNames = []
                        for (let player of players) {
                            playerNames.push(moon.limit(player.nickName,7))
                        }
                        //console.log(playerNames)
                        moon.roomOfBtn[i] = i
                        $('#btnRoom' + i).html(`<b>Room_ ${i}: ${playerNames.join('<br>')}</b>`)
                        $('#btnRoom' + i).show()
                    }
                    else { // new room
                        moon.roomOfBtn[i] = -1
                        $('#btnRoom' + i).html(`<b>(New Room)</b>`)
                        $('#btnRoom' + i).show()
                    }
                }
            }
        })
    
        let x = await moon.clickPlay()
        console.log(`x=${x}`)
        console.log(x)
        moon.player = x.player
        moon.room = moon.roomOfBtn[x.room]
        for(let i=0; i<3; i++) {
            $('#btnRoom' + i).hide()
        }
        $('#inputChatName').hide()
        $('#btnSend').show()
        $('#inputMessage').show()
        console.log(`Hello ${moon.player}`)
        moon.waitForStart().then( (x) => {
            console.log('Moon game starting..')
            $('#message').html('<b>Moon Game Starting..</b>')
            $('#message').show()
            $('#btnPlayWithBots').hide()
        })
        console.log(`You requested room ${moon.room}`)
        moon.socket.emit('roomreq', {player:moon.player, room:moon.room})
        moon.room = await moon.rxRoom()
        console.log(`You get ${moon.room}`)
        $('#message').html('<b>Waiting For Players..</b>')
        $('#message').show()
            $('#btnBone0').show();
            $('#tile00').hide()
            $('#btnBone1').show();
            $('#tile11').hide()
            $('#btnBone2').show();
            $('#tile12').hide()
            $('#btnBone3').show();
            $('#tile13').hide()
            $('#btnBone4').show();
            $('#tile14').hide()
            $('#btnBone5').show();
            $('#tile15').hide()
            $('#btnBone6').show();
            $('#tile16').hide()
            $('#btnBone7').show();
            $('#tile22').hide()
            $('#btnBone8').show();
            $('#tile23').hide()
            $('#btnBone9').show();
            $('#tile24').hide()
            $('#btnBone10').show();
            $('#tile25').hide()
            $('#btnBone11').show();
            $('#tile26').hide()
            $('#btnBone12').show();
            $('#tile33').hide()
            $('#btnBone13').show();
            $('#tile34').hide()
            $('#btnBone14').show();
            $('#tile35').hide()
            $('#btnBone15').show();
            $('#tile36').hide()
            $('#btnBone16').show();
            $('#tile44').hide()
            $('#btnBone17').show();
            $('#tile45').hide()
            $('#btnBone18').show();
            $('#tile46').hide()
            $('#btnBone19').show();
            $('#tile55').hide()
            $('#btnBone20').show();
            $('#tile56').hide()
            $('#btnBone21').show();
            $('#tile66').hide()
            for (let i=0; i<6; i++) {
                $('#btnBid' + i).on('click', () => {
            	moon._bidClicked(i)
                })
            }
            for (let i=0; i<8; i++) {
                $('#btnCall' + i).on('click', () => {
            	moon._callClicked(i + 1)
                })
            }
            $('#btnPlayWithBots').show()
            $('#btnPlayWithBots').on('click', () => {
                console.log('sending request to server to play with bots..')
                moon.socket.emit('playWithBots', {socketId:moon.socket.id, player:moon.player, room:moon.room})
                $('#btnPlayWithBots').hide()
            })
        moon.socket.on('drewbone', (data) => {
            console.log(`Player ${data.player} drew bone ${data.boneStr}`)
            $('#message').html(`<b>Player ${data.player} drew bone ${data.boneStr}</b>`)
            $('#message').show()
            bones.pool[data.boneId].faceup = true
            bones.pool[data.boneId].boneStr = data.boneStr
            bones.display(false)
        })
        
        moon.socket.on('state', (data) => {
            let player = data.player
            let boneId = data.boneId
            let bone = data.bone
            $('#message').html(`<b>${data.player} played ${bone.boneStr}</b>`)
            $('#message').show()
            //if (socket.id != data.socketId) {
            bones.pool[boneId].faceup = bone.faceup
            bones.pool[boneId].owner = bone.owner
            bones.pool[boneId].trick = bone.trick
            bones.pool[boneId].boneStr = bone.boneStr
            bones.pool[boneId].played = bone.played
            bones.pool[boneId].discarded = bone.discarded
            bones.display(false)
            //}
        })
        
        moon.socket.on('info', (s) => {
            $('#message').html('<b>' + s + '</b>')
        })
        
        moon.socket.on('call', data => {
            //moon.trump = data.call
            let s = moon.describeTrump[data.call]
            $('#message').html(`<b> ${data.caller} called ${s} trump</b>`)
            $('#message').show()
            moon.displayTrump(data.call)
        })
        
        while (! done) {
            data = await moon.myTurn()
            console.log(`My turn to ${data.cmd}`)
            //done = (data.cmd == 'shake')
            $('#suit').hide()
            $('#trump').hide()
            switch (data.cmd) {
                    case "bid": {
                      $('#message').html(`<b>State your bid</b>`)
                      $('#message').show()
                      let choices = [true] // pass is always a choice
                      let bid
                      console.log('Max bid is ' + data.maxBid)
                      for (let i=1; i<6; i++) {
                          choices.push( (i > data.maxBid) )
                      }
                      if (data.maxBid == -2) {
                          choices[0] = false // stuck bid
                      }
                      for (let choice in choices) {
                          if (choices[choice]) {
                      	$('#btnBid' + choice).show()
                      	$('#btnBid' + choice).prop("disabled", false)
                          }
                          else {
                      	$('#btnBid' + choice).hide()
                      	$('#btnBid' + choice).prop("disabled", true)
                          }
                      }
                      bid = await moon.bidClicked()
                      console.log('My bid is ' + bid)
                      moon.socket.emit('done', {bid})
                      for (let i=0; i<6; i++) {
                          $('#btnBid' + i).hide()
                      }
                      $('#message').hide()
                        break
                      }
                    case "call": {
                      $('#message').html(`<b>Call your trump suit</b>`)
                      $('#message').show()
                      let choices = data.choices
                      let call
                      for (let choice in choices) {
                          if (choices[choice]) {
                      	$('#btnCall' + choice).show()
                      	$('#btnCall' + choice).prop("disabled", false)
                          }
                          else {
                      	$('#btnCall' + choice).hide()
                      	$('#btnCall' + choice).prop("disabled", true)
                          }
                      }
                      call = await moon.callClicked()
                      console.log('My call is ' + call)
                      moon.socket.emit('done', {call})
                      for (let i=0; i<8; i++) {
                          $('#btnCall' + i).hide()
                      }
                      $('#message').hide()
                        break
                      }
                    case "shake": {
                      bones.pool = data.bones
                      bones.display(true)
                      $('#message').html(`<b>Draw one domino for shake</b>`)
                      $('#message').show()
                      boneId = await moon.boneClicked()
                      bones.pool[boneId].faceup = true
                      console.log(`I drew ${boneId}`)
                      bones.display(false)
                      moon._boneClicked = (boneId) => boneId
                      console.log('shaking..')
                      await moon.delay(1000)
                      moon.socket.emit('done', {boneId})
                      $('#message').hide()
                        break
                      }
                    case "play": {
                      bones.pool = data.bones
                      //console.log(data.stats)
                      bones.display(true)
                      $('#message').html(`<b>Play a domino</b>`)
                      $('#message').show()
                      this.displayStats(data.stats)
                      //console.log(data.maxBone)
                      this.displaySuit(data.maxBone)
                      this.displayTrump(data.trump)
                      boneId = -1
                      while (boneId < 0) {
                          boneId = await moon.boneClicked()
                          if (boneId < 0) {
                      	let txt1 = 'Illegal play - '
                      	let txt2 = ''
                      	if (boneId == -1) {
                      	    txt2 = 'Must follow suit'
                      	}
                      	if (boneId <= -2) {
                      	    txt2 = 'Choose one from your hand'
                      	}
                      	$('#message').html(`<b>${txt1}${txt2}</b>`)
                          }
                      }
                      bones.pool[boneId].faceup = true
                      bones.pool[boneId].owner = ''
                      bones.pool[boneId].played = true
                      console.log(`I played boneId ${boneId}`)
                      bones.display(false)
                      moon._boneClicked = (boneId) => boneId
                      moon.socket.emit('done', {boneId})
                      $('#message').hide()
                        break
                      }
                    case "draw": {
                      bones.pool = data.bones
                      bones.display(true)
                      $('#message').html(`<b>Draw one domino</b>`)
                      $('#message').show()
                      boneId = await moon.boneClicked()
                      bones.pool[boneId].faceup = true
                      //bones.pool[boneId].owner = moon.socket.id
                      console.log(`I drew ${boneId}`)
                      bones.display(false)
                      moon._boneClicked = (boneId) => boneId
                      moon.socket.emit('done', {boneId})
                      $('#message').hide()
                        break
                      }
                    case "draw7": {
                      //console.log(data.bones)
                      bones.pool = data.bones
                      //console.log(bones.pool)
                      let boneIds = []
                      let result
                      $('#message').html(`<b>Select 7 dominoes</b>`)
                      $('#message').show()
                      this.displayStats(data.stats)
                      for (let i=0; i<7; i++) {
                          bones.display(true)
                          result = await moon.boneClickedOrBot()
                          if (result.status == 'MOONBOTDONE') {
                      	break
                          }
                          boneId = result.boneId
                          console.log(`I drew ${boneId}`)
                          boneIds.push(boneId)
                          bones.pool[boneId].faceup = true
                          bones.pool[boneId].owner = moon.socket.id
                      }
                      
                      if (result.status == 'MOONBOTDONE') {
                          for (boneId of result.boneIds) {
                      	bones.pool[boneId].faceup = true
                      	bones.pool[boneId].owner = moon.socket.id
                          }
                      }
                      else {
                          moon.socket.emit('done', {boneIds})
                      }
                      bones.display(false)
                      $('#message').hide()
                        break
                      }
                    case "discard": {
                      // let player discard a domino (with the kitty)
                      //console.log('Discarding -- click on one domino')
                      bones.pool = data.bones
                      bones.display(true)
                      $('#message').html(`<b>Discard a domino</b>`)
                      $('#message').show()
                      // do I really need to find the bone in bones.pool?
                      boneId = await moon.boneClicked()
                      console.log(`clicked ${boneId}`)
                      bones.pool[boneId].faceup = false
                      bones.pool[boneId].owner = ''
                      bones.pool[boneId].discarded = true
                      moon.socket.emit('done', {boneId})
                      bones.display(false)
                      moon._boneClicked = (boneId) => boneId
                      $('#message').hide()
                        break
                      }
            }
            console.log('done')
        }
        return 0
    }

    limit(
        s,
        lim,
    ) {
        let rv = s
        if (s.length > lim) {
            rv = s.slice(0,lim)
        }
        return rv
    }

    displayStats(
        stats,
    ) {
        let s = '<tr>'
        s += '<th>' + 'Name' + '</th>'
        s += '<th>' + 'Wins' + '</th>'
        s += '<th>' + 'Score' + '</th>'
        s += '<th>' + 'Tricks' + '</th>'
        s += '</tr>'
        let socketId
        for (socketId of stats.socketIds) {
            let ps = stats[socketId]
            s += '<tr>'
            s += '<td>' + moon.limit(ps.name, 10)   + '</td>'
            s += '<td>' + ps.wins   + '</td>'
            s += '<td>' + ps.score  + '</td>'
            s += '<td>' + ps.tricks + '</td>'
            s += '</tr>'
        }
        $('#stats').html(s)
        $('#stats').show()
    }

    displaySuit(
        maxBone,
    ) {
        let suit, trump
        if (maxBone) {
            suit = maxBone.suit
            trump = maxBone.trump
            if (trump == 7) {
                trump = 'DOUBLES'
            }
            if (suit == 7) {
                suit = 'DOUBLES'
            }
            if ((suit == trump) && (suit != 'DOUBLES')) {
                suit += ' (TRUMP)'
            }
        }
        else {
            suit = '-'
        }
        let s = '<b> SUIT: ' + suit + ' </b>'
        $('#suit').html(s)
        $('#suit').show()
    }

    displayTrump(
        trump,
    ) {
        let trumpStr
        if (trump == 7) {
            trumpStr = 'TRUMP: DOUBLES'
        }
        else if (trump >= 8) {
            trumpStr = 'FOLLOW ME'
        }
        else if (trump >= 1) {
            trumpStr = 'TRUMP: ' + trump
        }
        else {
            trumpStr = '-'
        }
        $('#trump').html('<b> ' + trumpStr + ' </b>')
        $('#trump').show()
    }
    
    async bidClicked(
    ) {
    return new Promise( (resolve, reject) => {
        moon._bidClicked = (bid) => {
     resolve(bid)
        }
    })
    }
    async callClicked(
    ) {
    return new Promise( (resolve, reject) => {
        moon._callClicked = (call) => {
     resolve(call)
        }
    })
    }

}

//module.exports = moonClass
//export default moonClass
    

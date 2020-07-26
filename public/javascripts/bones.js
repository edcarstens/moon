$('#btnBone0').on('click', function() {
    $('#btnBone0').hide()
    moon._boneClicked(0)
})
//$('#tile00').on('click', () => {
//    $('#tile00').hide()
//    moon._boneClicked(0)
//})
$('#btnBone1').on('click', function() {
    $('#btnBone1').hide()
    moon._boneClicked(1)
})
//$('#tile11').on('click', () => {
//    $('#tile11').hide()
//    moon._boneClicked(1)
//})
$('#btnBone2').on('click', function() {
    $('#btnBone2').hide()
    moon._boneClicked(2)
})
//$('#tile12').on('click', () => {
//    $('#tile12').hide()
//    moon._boneClicked(2)
//})
$('#btnBone3').on('click', function() {
    $('#btnBone3').hide()
    moon._boneClicked(3)
})
//$('#tile13').on('click', () => {
//    $('#tile13').hide()
//    moon._boneClicked(3)
//})
$('#btnBone4').on('click', function() {
    $('#btnBone4').hide()
    moon._boneClicked(4)
})
//$('#tile14').on('click', () => {
//    $('#tile14').hide()
//    moon._boneClicked(4)
//})
$('#btnBone5').on('click', function() {
    $('#btnBone5').hide()
    moon._boneClicked(5)
})
//$('#tile15').on('click', () => {
//    $('#tile15').hide()
//    moon._boneClicked(5)
//})
$('#btnBone6').on('click', function() {
    $('#btnBone6').hide()
    moon._boneClicked(6)
})
//$('#tile16').on('click', () => {
//    $('#tile16').hide()
//    moon._boneClicked(6)
//})
$('#btnBone7').on('click', function() {
    $('#btnBone7').hide()
    moon._boneClicked(7)
})
//$('#tile22').on('click', () => {
//    $('#tile22').hide()
//    moon._boneClicked(7)
//})
$('#btnBone8').on('click', function() {
    $('#btnBone8').hide()
    moon._boneClicked(8)
})
//$('#tile23').on('click', () => {
//    $('#tile23').hide()
//    moon._boneClicked(8)
//})
$('#btnBone9').on('click', function() {
    $('#btnBone9').hide()
    moon._boneClicked(9)
})
//$('#tile24').on('click', () => {
//    $('#tile24').hide()
//    moon._boneClicked(9)
//})
$('#btnBone10').on('click', function() {
    $('#btnBone10').hide()
    moon._boneClicked(10)
})
//$('#tile25').on('click', () => {
//    $('#tile25').hide()
//    moon._boneClicked(10)
//})
$('#btnBone11').on('click', function() {
    $('#btnBone11').hide()
    moon._boneClicked(11)
})
//$('#tile26').on('click', () => {
//    $('#tile26').hide()
//    moon._boneClicked(11)
//})
$('#btnBone12').on('click', function() {
    $('#btnBone12').hide()
    moon._boneClicked(12)
})
//$('#tile33').on('click', () => {
//    $('#tile33').hide()
//    moon._boneClicked(12)
//})
$('#btnBone13').on('click', function() {
    $('#btnBone13').hide()
    moon._boneClicked(13)
})
//$('#tile34').on('click', () => {
//    $('#tile34').hide()
//    moon._boneClicked(13)
//})
$('#btnBone14').on('click', function() {
    $('#btnBone14').hide()
    moon._boneClicked(14)
})
//$('#tile35').on('click', () => {
//    $('#tile35').hide()
//    moon._boneClicked(14)
//})
$('#btnBone15').on('click', function() {
    $('#btnBone15').hide()
    moon._boneClicked(15)
})
//$('#tile36').on('click', () => {
//    $('#tile36').hide()
//    moon._boneClicked(15)
//})
$('#btnBone16').on('click', function() {
    $('#btnBone16').hide()
    moon._boneClicked(16)
})
//$('#tile44').on('click', () => {
//    $('#tile44').hide()
//    moon._boneClicked(16)
//})
$('#btnBone17').on('click', function() {
    $('#btnBone17').hide()
    moon._boneClicked(17)
})
//$('#tile45').on('click', () => {
//    $('#tile45').hide()
//    moon._boneClicked(17)
//})
$('#btnBone18').on('click', function() {
    $('#btnBone18').hide()
    moon._boneClicked(18)
})
//$('#tile46').on('click', () => {
//    $('#tile46').hide()
//    moon._boneClicked(18)
//})
$('#btnBone19').on('click', function() {
    $('#btnBone19').hide()
    moon._boneClicked(19)
})
//$('#tile55').on('click', () => {
//    $('#tile55').hide()
//    moon._boneClicked(19)
//})
$('#btnBone20').on('click', function() {
    $('#btnBone20').hide()
    moon._boneClicked(20)
})
//$('#tile56').on('click', () => {
//    $('#tile56').hide()
//    moon._boneClicked(20)
//})
$('#btnBone21').on('click', function() {
    $('#btnBone21').hide()
    moon._boneClicked(21)
})
//$('#tile66').on('click', () => {
//    $('#tile66').hide()
//    moon._boneClicked(21)
//})
class bonesClass {
    constructor(
    ) {
        this.pool = []   // array of shuffled dominoes
        this.bonepoolMoon = [  // complete pool of 22 dominoes for MOON (const)
            '00', // '01','02','03','04','05','06',
            '11','12','13','14','15','16',
            '22','23','24','25','26',
            '33','34','35','36',
            '44','45','46',
            '55','56',
            '66'
        ]
        this.x = [
                160,
                260,
                360,
                60,
                160,
                260,
                360,
                460,
                10,
                110,
                210,
                310,
                410,
                510,
                60,
                160,
                260,
                360,
                460,
                160,
                260,
                360,
        ]
        this.y = [
                170,
                170,
                170,
                220,
                220,
                220,
                220,
                220,
                270,
                270,
                270,
                270,
                270,
                270,
                320,
                320,
                320,
                320,
                320,
                370,
                370,
                370,
        ]       
        this.faceup = {}
        let bone = {faceup:false, owner:'', boneStr:''}
        for (let i=0; i<this.bonepoolMoon.length; i++) {
            this.pool.push(bone)
            this.faceup[this.bonepoolMoon[i]] = false
            $('#tile' + this.bonepoolMoon[i]).on('click', () => {
                moon._boneClicked(moon.clickBoneId[this.bonepoolMoon[i]])
            })
        }
    }

    display(
        enabled,
    ) {
        for (let k in this.faceup) {
            this.faceup[k] = false
        }
    	let yhand = 460
    	let xhand = 100
        let x = xhand
        let y = yhand
        let x2 = 0 // showing tricks played in the past
        let y2 = [160,160,160,160,160,160,160]
        let y3 = 160 // showing dominos played for current trick
        for (let i=0; i<this.pool.length; i++) {
            let bone = this.pool[i]
            if (bone.faceup) {
                $('#btnBone' + i).hide()
                $('#btnBone' + i).prop("disabled",true)
                if (bone.owner == '') {
                    this.faceup[bone.boneStr] = true
                    if (bone.played) {
                        $('#tile' + bone.boneStr).css("left",600)
                        $('#tile' + bone.boneStr).css("top",y3)
                        y3 += 60
                    }
                    else {
                        $('#tile' + bone.boneStr).css("left",$('#btnBone' + i).css("left"))
                        $('#tile' + bone.boneStr).css("top",$('#btnBone' + i).css("top"))
                    }
                    moon.clickBoneId[bone.boneStr] = -3 // signals illegal play
                }
                else if (bone.owner == moon.socket.id) {
                    //console.log(`${bone.boneStr} matches owner`)
                    //console.log(bone.owner)
                    //console.log(moon.socket.id)
                    this.faceup[bone.boneStr] = true
                    if (bone.trick) {
                        $('#tile' + bone.boneStr).css("left",x2 + (bone.trick-1)*100)
                        $('#tile' + bone.boneStr).css("top",y2[bone.trick-1])
                        y2[bone.trick-1] += 60
                        moon.clickBoneId[bone.boneStr] = -2 // signals illegal play
                    }
                    else {
                        $('#tile' + bone.boneStr).css("left",x)
                        $('#tile' + bone.boneStr).css("top",y)
                        if (bone.valid) {
                            moon.clickBoneId[bone.boneStr] = i
                            $('#tile' + bone.boneStr).show()
                        }
                        else {
                            moon.clickBoneId[bone.boneStr] = -1 // signals illegal play
                        }
                        x += 110
                        if ((y == yhand) && (x > xhand + 2*110)) {
                            x = xhand - 60
                            y += 60
                        }
                    }
                }
            }
            else {
                if (bone.discarded) {
                    $('#btnBone' + i).show()
                    $('#btnBone' + i).prop("disabled",true)
                    $('#btnBone' + i).css("left", 700)
                    $('#btnBone' + i).css("top", 400)   
                }
                else {
                    $('#btnBone' + i).show()
                    $('#btnBone' + i).prop("disabled",!enabled)
                    $('#btnBone' + i).css("left", this.x[i])
                    $('#btnBone' + i).css("top", this.y[i])
                }
            }
        }
        for (let k in this.faceup) {
            if (this.faceup[k]) {
                $('#tile' + k).show()
            }
            else {
                $('#tile' + k).hide()
            }
        }
    }


} // class
var bones = new bonesClass()

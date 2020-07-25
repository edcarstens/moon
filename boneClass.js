class boneClass {
    constructor(
        boneStr
    ) {
        this.boneStr = boneStr
        this.lo = +boneStr[0]
        this.hi = +boneStr[1]
        this.faceup = false
        this.owner = '' // socket.id or '' if unowned
        this.trick = 0 // which trick (1-7) caught this bone
        this.played = false
        this.discarded = false
        this.valid = true
        //            0  1  2  3  4  5  6  Doubles
        this.suits = [0, 0, 0, 0, 0, 0, 0, 0]
        this.suits[this.lo] = 1
        this.suits[this.hi] = 1
        if (this.lo == this.hi) {
            this.suits[7] = 1 // double
        }
        this.suit = -1  // no suit yet
        this.trump = -1 // special category for initial draw to see who shakes
    }

    setTrump(
        trump
    ) {
        this.trump = trump // 0-6, 7=Doubles, 8=NoTrump
    }

    setSuit(
        suit
    ) {
        this.suit = suit
    }

    value(
    ) {
        if ((this.trump < 0) || (this.suit < 0)) {
            return this.lo + this.hi
        }
        else {
            // sort the two number based on trump and suit
            let lo = this.lo
            let hi = this.hi
            if ((this.trump < 7) && (lo == this.trump))  {
                lo = hi
                hi = this.lo
            }
            else if ((this.suit < 7) && (lo == this.suit)) {
                lo = hi
                hi = this.lo
            }
            let rv = 0
            if (this.trump < 8) {
                rv += this.suits[this.trump]*100
            }
            rv += this.suits[this.suit]*10
            if (rv) {
                if ((lo == hi) && (this.suit != 7)) {
                    rv += 9 // double is highest (except when suit is doubles)
                }
                else {
                    rv += lo
                }
            }
            return rv
        }
    }
        
    ov_gt(
        other
    ) {
        return (this.value() > other.value())
    }

    ov_lt(
        other
    ) {
        return (this.value() < other.value())
    }
    
    ov_eq(
        other
    ) {
        return (this.value() == other.value())
    }

}

module.exports = boneClass

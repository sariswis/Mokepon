const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

const players = new Map()
var enemies

class Player {
    constructor(id=''){
        this.id = id
        this.mokepon = null
    }
    updatePosition(x, y){
        this.mokepon.x = x
        this.mokepon.y = y
    }
    updateIdMokepon(id){
        this.mokepon.id = id
    }
}

app.get('/join', (req, res) => {
    const id = `${Math.random()}`.replace('0.', '')
    const player = new Player(id)
    players.set(id, player)
    console.log('Id', id)
    /* res.setHeader("Access-Control-Allow-Origin","*") */
    res.send(id)
})

app.post('/mokepon/:idPlayer', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const mokepon = req.body.mokepon || null
    const player = players.get(idPlayer)
    if (player != undefined){
        player.mokepon = mokepon
        player.updateIdMokepon(idPlayer)
    }
    console.log(players)
    res.end()
})

app.post('/mokepon/:idPlayer/position', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const x = req.body.x || 0
    const y = req.body.y || 0
    const player = players.get(idPlayer)
    if (player != undefined){
        player.updatePosition(x, y)
    }
    enemies = Array.from(players.values()).filter((player) => player.id != idPlayer)
    res.send({enemies})
})

app.listen(8080, () => {
    console.log('Server running...')
})
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

const players = new Map()

class Player {
    constructor(id){
        this.id = id
        this.mokepon = ''
    }
    updatePosition(x, y){
        this.x = x
        this.y = y
    }
}

class Mokepon {
    constructor(name){
        this.name = name
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
    const name = req.body.mokepon || ''
    const mokepon = new Mokepon(name)
    const player = players.get(idPlayer)
    if (player != undefined){
        player.mokepon = mokepon
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
    console.log(player)
    res.end()
})

app.listen(8080, () => {
    console.log('Server running...')
})
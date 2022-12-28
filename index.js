const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.static('public'))
app.use(express.json())

const players = new Map()
var count = 0

class Player {
    constructor(id){
        this.id = id
        this.mokepon = null
        this.on = false
        this.onMap = false
        this.info_e_attack = null
        this.info_p_attack = null
    }
    addMokepon(mokepon){
        this.mokepon = mokepon
        this.on = true
        this.onMap = true
    }
    updatePosition(x, y){
        this.mokepon.x = x
        this.mokepon.y = y
    }
    updateAttack(info_p_attack){
        this.info_e_attack = info_p_attack
        this.info_p_attack = info_p_attack
    }
}

app.get('/join', (req, res) => {
    count++
    const idPlayer = `${count}` || ''
    const player = new Player(idPlayer)
    players.set(idPlayer, player)
    console.log('Id', idPlayer)
    /* res.setHeader("Access-Control-Allow-Origin","*") */
    res.send(idPlayer)
})

app.post('/mokepon/:idPlayer', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const player = players.get(idPlayer)
    const mokepon = req.body.mokepon || null
    if (player != undefined){
        player.addMokepon(mokepon)
    }
    res.end()
})

app.post('/map/:idPlayer', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const player = players.get(idPlayer)
    const x = req.body.x || 0
    const y = req.body.y || 0
    if (player != undefined){
        player.updatePosition(x, y)
    }
    enemies = Array.from(players.values()).filter((player) => 
        player.id != idPlayer && player.mokepon != null && player.onMap == true)
    res.send({enemies})
})

app.delete('/disable/:idPlayer/:idEnemy', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const idEnemy = req.params.idEnemy || ''
    const player = players.get(idPlayer)
    const enemy = players.get(idEnemy)
    if (player != undefined){
        player.on = false
    }
    if (player.on == enemy.on){
        player.onMap = false
        enemy.onMap = false
    }
    res.end()
})

app.post('/send-attacks/:idPlayer', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const player = players.get(idPlayer)
    const info_p_attack = req.body.info_p_attack || null
    if (player != undefined){
        player.updateAttack(info_p_attack)
    }
    console.log('Sent', info_p_attack)
    res.end()
})

app.get('/get-attacks/:idPlayer/:idEnemy', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const idEnemy = req.params.idEnemy || ''
    const player = players.get(idPlayer)
    const enemy = players.get(idEnemy)
    const info_p_attack = player.info_p_attack
    const info_e_attack = enemy.info_e_attack
    console.log('Receive', info_e_attack)
    res.send({info_p_attack, info_e_attack})
    if (info_e_attack != null){
        enemy.info_e_attack = null
    }
})

app.listen(8080, () => {
    console.log('Server running...')
})
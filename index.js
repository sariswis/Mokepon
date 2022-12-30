const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.static('public'))
app.use(express.json())

const dict_mokepones = new Map(), players = new Map()
var cards = '', count = 0

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
        this.lives = mokepon.lives
    }
    updatePosition(x, y){
        this.mokepon.x = x
        this.mokepon.y = y
    }
    updateAttack(info_p_attack){
        this.info_p_attack = info_p_attack
        this.info_e_attack = info_p_attack
    }
}

app.get('/join', (req, res) => {
    count++
    const id = `${count}` || ''
    const player = new Player(id)
    players.set(id, player)
    console.log('Id', id)
    res.send({id, cards})
})

app.get('/mokepon/:idPlayer/:name', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const name = req.params.name || ''
    const m = dict_mokepones.get(name)
    if (m != undefined){
        m.id = idPlayer
    }
    res.send({m})
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
    const x = req.body.x || player.x
    const y = req.body.y || player.y
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
    console.log('Sent', info_p_attack.name)
    res.end()
})

app.get('/get-attacks/:idPlayer/:idEnemy', (req, res) => {
    const idPlayer = req.params.idPlayer || ''
    const idEnemy = req.params.idEnemy || ''
    const player = players.get(idPlayer)
    const enemy = players.get(idEnemy)
    const info_p_attack = player.info_p_attack
    const info_e_attack = enemy.info_e_attack
    var result = null
    console.log('Receive', info_e_attack.name)

    if (info_e_attack != null){
        enemy.info_e_attack = null
        const player_attack = info_p_attack['real_name']
        const enemy_attack = info_e_attack['real_name']
        const player_special = info_p_attack['special']
        const enemy_special = info_e_attack['special']

        if ((player_attack == enemy_attack)){
            result = `It's a tie!`
        } else if ((player_attack == 'Fire 🔥' && enemy_attack == 'Soil 🌱') || 
        (player_attack == 'Water 💧' && enemy_attack == 'Fire 🔥') || 
        (player_attack == 'Soil 🌱' && enemy_attack == 'Water 💧')){
            result = `You win!`
            enemy.lives--
        } else {
            result = `You've lost!`
            player.mokepon.lives--
        }

        //Special attacks
        if (player_special || enemy_special){
            if (result == `You win!` && enemy.lives > 0){
                enemy.lives--
            } else if (result == `You've lost!` && player.mokepon.lives > 0){
                player.mokepon.lives--
            }
        } 
    }
    res.send({info_p_attack, info_e_attack, result, player_lives:player.mokepon.lives, enemy_lives:enemy.lives})
})

app.listen(8080, () => {
    loadData()
    console.log('Server running...')
})

function loadData(){
    class Mokepon {
        constructor (name, type, lives, attacks, id) {
            this.id = id || null
            this.name = name
            this.type = type
            this.attacks = attacks
            this.lives = lives
            this.image = `assets/${name}.png`
    }}

    cattie_attacks = [{'name':'Ball 🧶', 'id':'btn_ball', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':true},
                        {'name':'Fish 🐟', 'id':'btn_fish', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    doggito_attacks = [{'name':'Bone 🦴', 'id':'btn_bone', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':true},
                        {'name':'Bark 🐶', 'id':'btn_bark', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    lapinette_attacks = [{'name':'Carrot 🥕', 'id':'btn_carrot', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':true},
                        {'name':'Teeth 🦷', 'id':'btn_teeth', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    cheftle_attacks = [{'name':'Pan 🍳', 'id':'btn_pan', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':true},
                        {'name':'Fog ☁️', 'id':'btn_fog', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    lolito_attacks = [{'name':'Peck 🦆', 'id':'btn_peck', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':true},
                        {'name':'Splash 💦', 'id':'btn_splash', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    roundi_attacks = [{'name':'Cookie 🍪', 'id':'btn_cookie', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':true},
                        {'name':'Claws 🐾', 'id':'btn_claws', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    cattie = new Mokepon('Cattie', '🔥', 7, cattie_attacks)
    doggito = new Mokepon('Doggito', '💧', 7, doggito_attacks)
    lapinette = new Mokepon('Lapinette', '🌱', 7, lapinette_attacks)
    cheftle = new Mokepon('Cheftle', '🔥💧', 6, cheftle_attacks)
    lolito = new Mokepon('Lolito', '🌱💧', 6, lolito_attacks)
    roundi = new Mokepon('Roundi', '🔥🌱', 6, roundi_attacks)
    lt_mokepones = [cattie, doggito, lapinette, cheftle, lolito, roundi]

    lt_mokepones.forEach((mokepon) => {
        cards += `<input type='radio' name='pet' id=${mokepon.name}>
                <label class='pet_card' for=${mokepon.name}>
                <p>${mokepon.name} ${mokepon.type}</p>
                <img src=${mokepon.image} alt=${mokepon.name}>
                </label>`
        dict_mokepones.set(mokepon.name, mokepon)
    })
}
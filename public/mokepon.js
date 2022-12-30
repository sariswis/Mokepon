const select_pet = document.getElementById('select_pet')
const pet_cards = document.getElementById('pet_cards')
const input_pets = document.getElementsByName('pet')
const btn_select_pet = document.getElementById('btn_select_pet')

const show_map = document.getElementById('show_map')
const sp_player_pet = document.getElementById('sp_player_pet')
const move_buttons = document.getElementsByClassName('move_btn')
const canvas = document.getElementById('canvas')
const map = canvas.getContext('2d')

const select_attack = document.getElementById('select_attack')
const attack_buttons = document.getElementById('attack_buttons')
const attacks = document.getElementsByClassName('btn_attack')
const messages = document.getElementById('messages')
const message = document.getElementById('message')
const btn_restart = document.getElementById('btn_restart')

const info_card_p = document.getElementById('info_card_p')
const info_card_e = document.getElementById('info_card_e')
const p_player_lives = document.getElementById('p_player_lives')
const p_enemy_lives = document.getElementById('p_enemy_lives')
const player_logo = document.getElementById('player_logo')
const enemy_logo = document.getElementById('enemy_logo')
const p_player_pet = document.getElementById('p_player_pet')
const p_enemy_pet = document.getElementById('p_enemy_pet')
const history_player = document.getElementById('history_player')
const history_enemy = document.getElementById('history_enemy')

class Mokepon {
    constructor (name, type, lives, attacks, id, x, y, width, height) {
        this.id = id || null
        this.name = name
        this.type = type
        this.attacks = attacks
        this.lives = lives
        this.image = `assets/${name}.png`
        this.logo = new Image()
        this.logo.src = `assets/${name}Logo.png`
        this.width = width || 40
        this.height = height || 50
        this.x = x || random(1, canvas.width - this.width)
        this.y = y || random(1, canvas.height - this.height)
        this.vel_x = 0
        this.vel_y = 0
    }
    drawMokepon(){
        map.drawImage(this.logo, this.x, this.y, this.width, this.height)
    }
    stopMokepon(){
        this.vel_x = 0, this.vel_y = 0
    }
}

var player, enemy, player_i, enemy_i, player_lives, enemy_lives
var p_attack, e_attack, info_p_attacks = new Map()
var map_width_i, map_height_i, map_width_f, map_height_f, max_map_width = 630
var interval, idPlayer, idEnemy, lt_enemies = []

window.addEventListener('load', loadGame)

function loadGame(){
    show_map.style.display = 'none'
    select_attack.style.display = 'none'
    btn_restart.style.display = 'none'

    joinGame()
    btn_select_pet.addEventListener('click', () => {
        for(pet of input_pets){
            if (pet.checked){
                player = pet.id
                getMokepon()
            }
        }
    })
}

function joinGame(){
    fetch('http://192.168.0.10:8080/join')
        .then(function (res){
            if (res.ok){
                res.json()
                    .then(function ({id, cards}){
                        idPlayer = id
                        pet_cards.innerHTML = cards
                    })
            }
        })
}

function getMokepon() {
    fetch(`http://192.168.0.10:8080/mokepon/${idPlayer}/${player}`)
        .then(function (res){
            if (res.ok){
                res.json()
                    .then(function({m}){
                        player_i = new Mokepon(m.name, m.type, m.lives, m.attacks, m.id)
                        player_lives = player_i.lives
                        sp_player_pet.innerHTML = `${player}`
                        setMap()

                        select_pet.style.display = 'none'
                        show_map.style.display = 'flex'
                        
                        interval = setInterval(drawMap, 50)
                        window.addEventListener('resize', setMap)
                        window.addEventListener('keydown', move)
                        window.addEventListener('keyup', () => {player_i.stopMokepon()})
                        for (move_btn of move_buttons){
                            move_btn.addEventListener('mousedown', move)
                            move_btn.addEventListener('touchstart', move)
                            move_btn.addEventListener('mouseup', () => {player_i.stopMokepon()})
                            move_btn.addEventListener('touchend', () => {player_i.stopMokepon()})
                        }
                        shareMokepon()
                    })
            }
        })
}

function setMap(){
    map_width_i = canvas.width
    map_height_i = canvas.height
    map_width_f = Math.floor(window.innerWidth - 20)
    if (map_width_f > max_map_width){map_width_f = max_map_width - 20}
    map_height_f = Math.floor(map_width_f * 325 / 638)
    canvas.width = map_width_f
    canvas.height = map_height_f

    x_percent = Math.floor(map_width_f / map_width_i)
    y_percent = Math.floor(map_height_f / map_height_i)
    player_i.x = Math.floor(player_i.x * x_percent)
    player_i.y = Math.floor(player_i.y * y_percent)
}

function shareMokepon() {
    fetch(`http://192.168.0.10:8080/mokepon/${idPlayer}`, {
        method: 'post',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({mokepon: player_i})
    })
}

function drawMap(){
    player_i.x += player_i.vel_x
    player_i.y += player_i.vel_y
    if (player_i.x < 0){player_i.x = 1} 
    else if (player_i.x > canvas.width - player_i.width){player_i.x = canvas.width - player_i.width}
    if (player_i.y < 0){player_i.y = 1} 
    else if (player_i.y > canvas.height - player_i.height){player_i.y = canvas.height - player_i.height}
    
    
    map.clearRect(0, 0, canvas.width, canvas.height)
    player_i.drawMokepon()
    sharePosition(player_i.x, player_i.y)
    lt_enemies.forEach((enemy) => {
        enemy.drawMokepon()
        checkColision(enemy)
    })
}

function sharePosition(x, y){
    fetch(`http://192.168.0.10:8080/map/${idPlayer}`, {
        method: 'post',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({x, y})
    })
        .then(function (res){
            if (res.ok){
                res.json()
                    .then(function({enemies}){
                            lt_enemies = enemies.map((e) => {
                                return new Mokepon(e.mokepon.name, e.mokepon.type, e.mokepon.lives, e.mokepon.attacks, e.mokepon.id, e.mokepon.x, e.mokepon.y)
                            })
                    })
            }
        })
}

function move(event){
    movement = Math.floor(canvas.width / 50)
    if (event.type == 'keydown'){event_type = event.key} else {event_type = event.target.id}
    switch (event_type) {
        case 'ArrowUp': player_i.vel_y = -movement
            break;
        case 'ArrowDown': player_i.vel_y = movement
            break;
        case 'ArrowLeft': player_i.vel_x = -movement
            break;
        case 'ArrowRight': player_i.vel_x = movement
            break;
    }
}

function checkColision(mokepon){
    e_top = mokepon.y
    e_bottom = mokepon.y + mokepon.height
    e_left = mokepon.x
    e_right = mokepon.x + mokepon.width
    p_top = player_i.y
    p_bottom = player_i.y + player_i.height
    p_left = player_i.x
    p_right = player_i.x + player_i.width

    if (!(p_bottom < e_top || e_bottom < p_top || p_right < e_left || e_right < p_left)) {
        clearInterval(interval)
        window.removeEventListener('resize', setMap)
        window.removeEventListener('keydown', move)
        window.addEventListener('keyup', () => {player_i.stopMokepon()})
        for (move_btn of move_buttons){
            move_btn.removeEventListener('mousedown', move)
            move_btn.removeEventListener('touchstart', move)
            move_btn.removeEventListener('mouseup', () => {player_i.stopMokepon()})
            move_btn.removeEventListener('touchend', () => {player_i.stopMokepon()})
        }
        enemy_i = mokepon, idEnemy = enemy_i.id
        enemy = enemy_i.name, enemy_lives = enemy_i.lives
        startAttack()
    }
}

function startAttack(){
    fetch(`http://192.168.0.10:8080/disable/${idPlayer}/${idEnemy}`, {
        method: 'delete',
        body: null
    })
        .then(function(res){
            if (res.ok){
                putAttacks()
            }
        })
}

function putAttacks(){
    player_i.attacks.forEach((attack) => {
        attack_buttons.innerHTML += `<button id=${attack.id} class='btn_attack' name=${attack.real_name}>${attack.name}</button>`
        info_p_attacks.set(attack.name, {'name':attack.name, 'real_name':attack.real_name, 'color':attack.color, 'special':attack.special})
    })

    p_player_lives.innerHTML = player_lives
    p_enemy_lives.innerHTML = enemy_lives
    p_player_pet.innerHTML = `${player} ${player_i.type}`
    p_enemy_pet.innerHTML = `${enemy} ${enemy_i.type}`
    player_logo.src = `${player_i.image}`, player_logo.alt = player
    enemy_logo.src = `${enemy_i.image}`, enemy_logo.alt = enemy

    show_map.style.display = 'none'
    select_attack.style.display = 'flex'
    for(attack of attacks){
        attack.addEventListener('click', shareAttack)
    }
}

function shareAttack(event){
    p_attack = event.target.innerHTML
    info_p_attack = info_p_attacks.get(p_attack)
    fetch(`http://192.168.0.10:8080/send-attacks/${idPlayer}`, {
        method: 'post',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({info_p_attack})
    })
    for(attack of attacks){
        attack.disabled = true
    }
    interval = setInterval(getAttacks, 50)
}

function getAttacks(){
    fetch(`http://192.168.0.10:8080/get-attacks/${idPlayer}/${idEnemy}`)
        .then(function (res){
            if (res.ok){
                res.json()
                .then(function ({info_p_attack, info_e_attack, result, player_lives, enemy_lives}){
                    if (result != null){
                        clearInterval(interval)
                        fight(info_p_attack, info_e_attack, result, player_lives, enemy_lives)
                        for(attack of attacks){
                            attack.disabled = false
                        }
                    }
                })
            }
        })

}

function fight(info_p_attack, info_e_attack, result, player_lives, enemy_lives){
    e_attack = info_e_attack['name']
    info_card_p.style.boxShadow = `0px 0px 25px ${info_p_attack['color']}`
    info_card_e.style.boxShadow = `0px 0px 25px ${info_e_attack['color']}`
    p_enemy_lives.innerHTML = enemy_lives
    p_player_lives.innerHTML = player_lives
    createMessage(result)
    checkLives()
}

function createMessage(result){
    new_player_a = document.createElement('p')
    new_enemy_a = document.createElement('p')

    message.innerHTML = result
    new_player_a.innerHTML = p_attack
    new_enemy_a.innerHTML = e_attack
    
    history_player.appendChild(new_player_a)
    history_enemy.appendChild(new_enemy_a)
    history_player.scrollTop = history_player.scrollHeight
    history_enemy.scrollTop = history_enemy.scrollHeight
}

function checkLives(){
    if (p_enemy_lives.innerHTML == 0){
        endGame(`Good game! YOU WIN! 🎉🎉`)
    } else if (p_player_lives.innerHTML == 0){
        endGame(`Oh! GAME OVER! 🎮👾`)
    }
}

function endGame(final){
    message.innerHTML = final
    for(attack of attacks){
        attack.disabled = true
    }

    btn_restart.style.display = 'block'
    btn_restart.addEventListener('click', () => {location.reload()})
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min)
}
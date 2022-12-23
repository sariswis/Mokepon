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
    constructor (name, type, lives, attacks, x, y, width=40, height=50, id=null) {
        this.id = id
        this.name = name
        this.type = type
        this.attacks = attacks
        this.lives = lives
        this.image = `assets/${name}.png`
        this.logo_src = `assets/${name}Logo.png`
        this.width = width
        this.height = height
        this.x = x || random(0, canvas.width - this.width)
        this.y = y || random(0, canvas.height - this.height)
        this.vel_x = 0
        this.vel_y = 0
}
copyMokepon(){
    return new Mokepon(this.name, this.type, this.lives, this.attacks, this.x, this.y)
}
drawMokepon(){
    let logo = new Image()
    logo.src = this.logo_src
    map.drawImage(logo, this.x, this.y, this.width, this.height)
}
stopMokepon(){
    this.vel_x = 0, this.vel_y = 0
}
}

const lt_mokepones = [], dict_mokepones = new Map(), max_map_width = 630
const info_p_attacks = new Map(), info_e_attacks = new Map()
var player, enemy, player_i, enemy_i, player_lives, enemy_lives
var p_attack, e_attack, player_attack, enemy_attack
var map_width_i, map_height_i, map_width_f, map_height_f
var interval, can_attack = true
var idPlayer
window.addEventListener('load', loadGame)

function loadGame(){
    show_map.style.display = 'none'
    select_attack.style.display = 'none'
    btn_restart.style.display = 'none'
    loadData()

    lt_mokepones.forEach((mokepon) => {
        pet_cards.innerHTML += `<input type='radio' name='pet' id=${mokepon.name}>
                                <label class='pet_card' for=${mokepon.name}>
                                <p>${mokepon.name} ${mokepon.type}</p>
                                <img src=${mokepon.image} alt=${mokepon.name}>
                                </label>`
        dict_mokepones.set(mokepon.name, mokepon)
    })

    btn_select_pet.addEventListener('click', selectPet)
    joinGame()
}

function joinGame(){
    fetch('http://localhost:8080/join')
        .then(function (res){
            if (res.ok){
                res.text()
                    .then(function (response){
                        console.log(response)
                        idPlayer = response
                    })
            }
        })
}

function selectPet(){
    for(pet of input_pets){
        if (pet.checked){
            player = pet.id
            player_i = dict_mokepones.get(player).copyMokepon()
            player_lives = player_i.lives
            sp_player_pet.innerHTML = `${player}`
            setMap()

            select_pet.style.display = 'none'
            show_map.style.display = 'flex'
            
            interval = setInterval(drawMap, 50)
            window.addEventListener('resize', setMap)
            window.addEventListener('keydown', move)
            window.addEventListener('keyup', function(){player_i.stopMokepon()})
            for (move_btn of move_buttons){
                move_btn.addEventListener('mousedown', move)
                move_btn.addEventListener('touchstart', move)
                move_btn.addEventListener('mouseup', () => {player_i.stopMokepon()})
                move_btn.addEventListener('touchend', () => {player_i.stopMokepon()})
            }
            shareMokepon(player)
        }
    }
}

function shareMokepon(player) {
    fetch(`http://localhost:8080/mokepon/${idPlayer}`, {
        method: 'post',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({mokepon: player_i})
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

    x_percent = map_width_f / map_width_i
    y_percent = map_height_f / map_height_i
    player_i.x = player_i.x * x_percent
    player_i.y = player_i.y * y_percent
    lt_mokepones.forEach((mokepon) => {
        mokepon.x = mokepon.x * x_percent
        mokepon.y = mokepon.y * y_percent
    })
}

function drawMap(){
    player_i.x += player_i.vel_x
    player_i.y += player_i.vel_y
    
    if (player_i.x < 0){player_i.x = 0} 
    else if (player_i.x > canvas.width - player_i.width){player_i.x = canvas.width - player_i.width}
    if (player_i.y < 0){player_i.y = 0} 
    else if (player_i.y > canvas.height - player_i.height){player_i.y = canvas.height - player_i.height}
    
    
    map.clearRect(0, 0, canvas.width, canvas.height)
    player_i.drawMokepon()
    sharePosition(player_i.x, player_i.y)
    //checkColision()
}

function sharePosition(x, y){
    fetch(`http://localhost:8080/mokepon/${idPlayer}/position`, {
        method: 'post',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({x, y})
    })
        .then(function (res){
            if (res.ok){
                res.json()
                    .then(function({enemies}){
                        enemies.forEach((e) => {
                            if (e.mokepon != null){
                                const enemy = new Mokepon(
                                    e.mokepon.name, e.mokepon.type, e.mokepon.lives, e.mokepon.attacks, e.mokepon.x, e.mokepon.y
                                )
                                enemy.drawMokepon()
                            }
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

function checkColision(){
    p_top = player_i.y
    p_bottom = player_i.y + player_i.height
    p_left = player_i.x
    p_right = player_i.x + player_i.width

    lt_mokepones.forEach((mokepon) => {
        e_top = mokepon.y
        e_bottom = mokepon.y + mokepon.height
        e_left = mokepon.x
        e_right = mokepon.x + mokepon.width

        if (!(p_bottom < e_top || e_bottom < p_top || p_right < e_left || e_right < p_left) && can_attack) {
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
            enemy_i = mokepon, enemy = enemy_i.name, enemy_lives = enemy_i.lives
            putAttacks()
        }
    })
}

function putAttacks(){
    can_attack = false
    player_i.attacks.forEach((attack) => {
        attack_buttons.innerHTML += `<button id=${attack.id} class='btn_attack' name=${attack.real_name}>${attack.name}</button>`
        info_p_attacks.set(attack.name, {'real_name':attack.real_name, 'color':attack.color, 'special':attack.special})
    })
    enemy_i.attacks.forEach((attack) => {
        info_e_attacks.set(attack.name, {'real_name':attack.real_name, 'color':attack.color, 'special':attack.special})
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
        attack.addEventListener('click', fight)
    }
}

function fight(event){
    p_attack = event.target.innerHTML
    e_attack = enemy_i.attacks[random(0, enemy_i.attacks.length - 1)].name
    info_p_attack = info_p_attacks.get(p_attack), info_e_attack = info_e_attacks.get(e_attack)
    player_attack = info_p_attack['real_name'], enemy_attack = info_e_attack['real_name']
    info_card_p.style.boxShadow = `0px 0px 25px ${info_p_attack['color']}`;
    info_card_e.style.boxShadow = `0px 0px 25px ${info_e_attack['color']}`;

    if ((player_attack == enemy_attack)){
        result = `It's a tie!`
    } else if ((player_attack == 'Fire 🔥' && enemy_attack == 'Soil 🌱') || 
    (player_attack == 'Water 💧' && enemy_attack == 'Fire 🔥') || 
    (player_attack == 'Soil 🌱' && enemy_attack == 'Water 💧')){
        result = `You win!`
        enemy_lives--
        p_enemy_lives.innerHTML = enemy_lives
    } else {
        result = `You've lost!`
        player_lives--
        p_player_lives.innerHTML = player_lives
    }

    createMessage(result)
    checkLives()

    if (info_p_attack['special'] || info_e_attack['special']){
        specialAttack(result)
    } 
}

function specialAttack(result){
    if (result == `You win!` && enemy_lives > 0){
        enemy_lives--
        p_enemy_lives.innerHTML = enemy_lives
        checkLives()
    } else if (result == `You've lost!` && player_lives > 0){
        player_lives--
        p_player_lives.innerHTML = player_lives
        checkLives()
    }
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
    if (enemy_lives == 0){
        end_game(`Good game! YOU WIN! 🎉🎉`)
    } else if (player_lives == 0){
        end_game(`Oh! GAME OVER! 🎮👾`)
    }
}

function end_game(final){
    message.innerHTML = final
    for(attack of attacks){
        attack.disabled = true
    }

    btn_restart.style.display = 'block'
    btn_restart.addEventListener('click', reload)
}

function reload(){
    location.reload()
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function loadData(){
    let cattie_attacks = [{'name':'Ball 🧶', 'id':'btn_ball', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':true},
                        {'name':'Fish 🐟', 'id':'btn_fish', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    let doggito_attacks = [{'name':'Bone 🦴', 'id':'btn_bone', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':true},
                        {'name':'Bark 🐶', 'id':'btn_bark', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    let lapinette_attacks = [{'name':'Carrot 🥕', 'id':'btn_carrot', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':true},
                        {'name':'Teeth 🦷', 'id':'btn_teeth', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    let cheftle_attacks = [{'name':'Pan 🍳', 'id':'btn_pan', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':true},
                        {'name':'Fog ☁️', 'id':'btn_fog', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    let lolito_attacks = [{'name':'Peck 🦆', 'id':'btn_peck', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':true},
                        {'name':'Splash 💦', 'id':'btn_splash', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    let roundi_attacks = [{'name':'Cookie 🍪', 'id':'btn_cookie', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':true},
                        {'name':'Claws 🐾', 'id':'btn_claws', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':true},
                        {'name':'Fire 🔥', 'id':'btn_fire', 'real_name':'Fire 🔥', 'color':'#f8af41', 'special':false},
                        {'name':'Water 💧', 'id':'btn_water', 'real_name':'Water 💧', 'color':'#4fd7d5', 'special':false},
                        {'name':'Soil 🌱', 'id':'btn_soil', 'real_name':'Soil 🌱', 'color':'#88dd67', 'special':false}]

    let cattie = new Mokepon('Cattie', '🔥', 7, cattie_attacks)
    let doggito = new Mokepon('Doggito', '💧', 7, doggito_attacks)
    let lapinette = new Mokepon('Lapinette', '🌱', 7, lapinette_attacks)
    let cheftle = new Mokepon('Cheftle', '🔥💧', 6, cheftle_attacks)
    let lolito = new Mokepon('Lolito', '🌱💧', 6, lolito_attacks)
    let roundi = new Mokepon('Roundi', '🔥🌱', 6, roundi_attacks)
    lt_mokepones.push(cattie, doggito, lapinette, cheftle, lolito, roundi)
}
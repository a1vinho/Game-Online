import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const form_container = document.querySelector('.form-container');
const form_login = document.querySelector('.form-login');
const input_login = form_login.querySelector('input');

const container_rect = document.querySelector('.container-rect');
const message_register = document.querySelector('.new-players');

const colors = [
    "red",
    'blue',
    'green',
    '#3a0e06',
    'pink',
    'black',
    "orange",
    "#111338",
    "#1a1833",
    "#12125e"
];

const user = {
    x: 0,
    y: 0,
    id: Date.now(),
    div: document.createElement('div'),
    life: 100
};

const RandomPosition = () => {
    const x = Math.floor(Math.random() * 400);
    const y = Math.floor(Math.random() * 50);
    return { x, y };
};
const RandomColor = () => {
    const random = Math.floor(Math.random() * colors.length);
    if (!colors[random]) random = 5;
    return colors[random];
};

const CreateRect = () => {
    const { x, y } = RandomPosition();
    const background = RandomColor();
    console.log(background);
    user.div.id = user.id;
    user.div.classList.add("rect");
    user.div.style.background = background;

    user.x = x;
    user.y = y;
    user.div.style.top = y
    user.div.style.left = x

    return user
};

let socket;
let rectDiv = CreateRect();

const rectData = {
    id: rectDiv.div.id,
    innerHTML: rectDiv.div.innerHTML,
    classList: [...rectDiv.div.classList],
    style: rectDiv.div.style.cssText,
    username: '',
    x: rectDiv.x,
    y: rectDiv.y,
    life: rectDiv.life
};

form_login.addEventListener('submit', event => {
    event.preventDefault();
    socket = io('http://localhost:8080');
    localStorage.username = input_login.value;
    form_container.style.display = 'none';
    container_rect.style.display = 'block';
    rectData.username = input_login.value;
    socket.emit("rects", rectData);
    console.log(rectData);
    
   DrawRects();
});

function DrawRects() {
    socket.on('rects-players', (data) => {

        const rectSocket = document.createElement('div');
        const life = document.createElement('div');
        const username = document.createElement('span');

        for (const rect of data) {
            
            rectSocket.id = rect.id;
            rectSocket.innerHTML = rect.innerHTML;
            rectSocket.style.cssText = rect.style;
            rectSocket.classList.add('rect');
            console.log(rect);
            life.classList.add("life");
            life.style.background = window.getComputedStyle(rectSocket).background;
            
            username.textContent = rect.username;
            username.classList.add('username');
            username.style.color = window.getComputedStyle(rectSocket).background;

            rectSocket.appendChild(username);
            rectSocket.appendChild(life);
            container_rect.appendChild(rectSocket);
        };
    });
    new_players();
    // irá conecta a animação logo após o usuario se conecta,permitindo um fluxo continuo e eficiente
    ListenerEvent();
    MovementAttack();
    
}
function new_players() {
    socket.on('new-players',data => {
        const message = document.createElement('div');

        message.textContent = data.message;
        message_register.appendChild(message);
    });
};
function Attack(player) {
    if (player) {
        const attacks = player.querySelectorAll('.attack');

        if (attacks.length >= 0) {
            attacks.forEach(attack => player.removeChild(attack));
        };

        const attack = document.createElement('span');
        const background = window.getComputedStyle(player).background;

        attack.classList.add('attack');
        attack.style.background = background;

        player.appendChild(attack);
    };
};
function ListenerEvent() {
    socket.on('update-position', data => {
        const player = document.getElementById(data.id);
        if (player) {
            player.style.left = `${data.left}px`;
            player.style.top = `${data.top}px`;
        };
    });
    socket.on('attack-rect', data => {
        // criar um sistema de attack
        const player = document.getElementById(data.id);
        Attack(player);
    });
};

document.body.addEventListener('keydown', function (event) {
    const key = event.key;
    let moveX = 0;
    let moveY = 0;

    let attack = false;

    switch (key) {
        case 'ArrowRight':
            moveX = 3;
            break;
        case 'ArrowLeft':
            moveX = -3;
            break;
        case 'ArrowUp':
            moveY = -3;
            break;
        case 'ArrowDown':
            moveY = 3;
            break;
        case 'x': {
            attack = true;

            socket.emit("attack-rect", { id: rectDiv.div.id, attack, Attack });
            
        }
        default:
            return;
    };
    rectDiv.x += moveX;
    rectDiv.y += moveY;

    socket.emit('move', {
        id: rectDiv.div.id,
        top: rectDiv.y,
        left: rectDiv.x
    });
    // chama a função Animation() aqui dentro iria sobrecarrega a pilha stack,sem conta que não estária 100% sincronizado
});

document.body.addEventListener('keypress',function() {
    
})

function isColliding(rect1, rect2) {
    const rect1Bounds = rect1.getBoundingClientRect();
    const rect2Bounds = rect2.getBoundingClientRect();

    return (
        rect1Bounds.left < rect2Bounds.left + rect2Bounds.width &&
        rect1Bounds.left + rect1Bounds.width > rect2Bounds.left &&
        rect1Bounds.top < rect2Bounds.top + rect2Bounds.height &&
        rect1Bounds.height + rect1Bounds.top > rect2Bounds.top
    );
};

function UpdateLife (player) {
    socket.emit('update-life', user);
    socket.on('update-life', data => {
        data.life -= 10;
        
        const life = player.querySelector('.life');
        life.style.width = `${data.life}px`;
    });
};

function CollisionAttack(data) {
    const rects = document.querySelectorAll('.rect');

    
};

function MovementAttack() {
    const PlayersIds = [];
    let contador = 0;

    socket.on('attack-rect-movement', data => {
        const Player = document.getElementById(data.id);
        if (Player) {
            const attack = Player.querySelector('.attack');
            if (attack) {
                attack.style.left = `${data.movement}%`;
                CollisionAttack(data);
            };
        };
    });
    socket.on('attack-rect-you',data => {
        console.log(data);
    })
    function UpdateMovement() {
        const player = document.getElementById(rectDiv.div.id);
        let x_attack;
        let y_attack;
        if (player) {
            const attack = player.querySelector('.attack');
            if (attack) {
                contador += 3;
                x_attack = window.getComputedStyle(attack).left;
                y_attack = window.getComputedStyle(attack).top;
            };
            socket.emit('attack-rect-movement', {
                id: player.id,
                x_attack,
                y_attack,
                movement: contador,
                PlayersIds
            });
        };
        requestAnimationFrame(UpdateMovement);
    };
    UpdateMovement();
};
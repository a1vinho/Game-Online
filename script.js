import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const form_container = document.querySelector('.form-container');
const form_login = document.querySelector('.form-login');
const input_login = form_login.querySelector('input');

const container_rect = document.querySelector('.container-rect');
const colors = [
    "red",
    'blue',
    'green',
    'yellow',
    'pink',
    'black'
];

const user = {
    username: '',
    x: 0,
    y: 0,
    id: Date.now(),
    div: document.createElement('div'),
};

const RandomPosition = () => {
    const x = Math.floor(Math.random() * 400);
    const y = Math.floor(Math.random() * 50);
    return { x, y };
};
const RandomColor = () => {
    const random = Math.floor(Math.random() * colors.length);
    return colors[random];
};

const CreateRect = () => {
    user.div.id = user.id;
    user.div.classList.add("rect");
    user.div.style.background = RandomColor();
    const y = RandomPosition().y;
    const x = RandomPosition().x;
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
    x: rectDiv.x,
    y: rectDiv.y,
};

form_login.addEventListener('submit', event => {
    event.preventDefault();
    if (input_login.value < 4) {
        return alert('Seu nome de usuario precisa ter 4 caracteres');
    };

    socket = io('whole-adapted-dingo.ngrok-free.app');
    localStorage.username = input_login.value;
    form_container.style.display = 'none';
    container_rect.style.display = 'block';

    socket.emit("rects", rectData);

    socket.on('rects-players', (data) => {

        const rectSocket = document.createElement('div');

        for (const rect of data) {
            rectSocket.id = rect.id;
            rectSocket.innerHTML = rect.innerHTML;
            rectSocket.style.cssText = rect.style;
            rectSocket.classList.add('rect');
            container_rect.appendChild(rectSocket);
        };
    });
});

function Animation(key) {
    socket.on('update-position', data => {
        const player = document.getElementById(data.id);
        
        if (player) {
            player.style.left = `${data.left}px`;
        };
    });
    requestAnimationFrame(Animation);
};

document.body.addEventListener('keydown', function (event) {
    const key = event.key;
    let moveX = 0;
    let moveY = 0;

    switch (event.key) {
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
        default:
            return; 
    };
    rectDiv.x += moveX;
    rectDiv.y += moveY;

    socket.emit('move-x', {
        id: rectDiv.div.id,
        right: rectDiv.x,
        left: rectDiv.x 
    });
    Animation(key)
});

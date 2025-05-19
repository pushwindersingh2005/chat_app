document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:8001');
    const form = document.getElementById('send-container');
    const messageInp = document.getElementById('messageInp');
    const messageContainer = document.querySelector(".container");
    const userCountElement = document.getElementById('userCount');
    const notificationSound = document.getElementById('notificationSound');

    // Play notification sound
    const playNotification = () => {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(e => console.log("Audio play failed:", e));
    };

    // Function to append messages
    const appendMessage = (message, position, sender = null) => {
        const messageElement = document.createElement('div');
        
        if (sender) {
            playNotification(); // Play sound for new messages
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messageElement.innerHTML = `
                ${sender ? `<span class="sender">${sender}</span>` : ''}
                ${message}
                <span class="time">${time}</span>
            `;
        } else {
            // For notifications (user joined/left)
            playNotification(); // Play sound for notifications
            messageElement.innerText = message;
            messageElement.classList.add('notification');
            messageContainer.append(messageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
            return;
        }
        
        messageElement.classList.add('message', position);
        messageContainer.append(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    // Connect to socket
    socket.on('connect', () => {
        const name = prompt("Enter your name to join:");
        if (name && name.trim() !== '') {
            socket.emit('new-user-joined', name.trim());
            appendMessage(`You joined the chat`, 'right');
        } else {
            alert('You must enter a name to chat!');
            window.location.reload();
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInp.value.trim();
        if (message) {
            appendMessage(message, 'right', 'You');
            socket.emit('send', message);
            messageInp.value = '';
        }
    });

    // Socket events
    socket.on('user-joined', name => {
        appendMessage(`${name} joined the chat`, null);
    });

    socket.on('receive', data => {
        appendMessage(data.message, 'left', data.name);
    });

    socket.on('user-left', name => {
        appendMessage(`${name} left the chat`, null);
    });

    socket.on('user-count', count => {
        userCountElement.textContent = `${count} online`;
    });

    // Error handling
    socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        appendMessage('Could not connect to chat server. Please refresh.', 'right');
    });
});
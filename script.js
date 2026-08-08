
const userInput =
    document.getElementById("userInput");

const sendBtn =
    document.getElementById("sendBtn");

const chatBox =
    document.getElementById("chatBox");

const newChatBtn =
    document.getElementById("newChatBtn");

const clearBtn =
    document.getElementById("clearBtn");

const recentChats =
    document.getElementById("recentChats");


const API_URL = "/api/chat";


let chats =
    JSON.parse(localStorage.getItem("chats")) || [];

let currentChatId = null;


function saveChats() {

    localStorage.setItem(
        "chats",
        JSON.stringify(chats)
    );

}


function getCurrentChat() {

    return chats.find(
        chat => chat.id === currentChatId
    );

}


function createNewChat() {

    const newChat = {

        id: Date.now(),

        title: "New Chat",

        messages: []

    };


    chats.unshift(newChat);

    currentChatId = newChat.id;

    saveChats();

    renderRecentChats();

    renderCurrentChat();

}


function renderRecentChats() {

    recentChats.innerHTML = "";


    chats.forEach(chat => {

        const button =
            document.createElement("button");


        button.className =
            "recent-chat";

        button.textContent =
            chat.title;


        if (
            chat.id === currentChatId
        ) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            () => {

                currentChatId =
                    chat.id;

                renderRecentChats();

                renderCurrentChat();

            }
        );


        recentChats.appendChild(
            button
        );

    });

}


function renderCurrentChat() {

    const chat =
        getCurrentChat();


    chatBox.innerHTML = "";


    if (
        !chat ||
        chat.messages.length === 0
    ) {

        showWelcome();

        return;

    }


    chat.messages.forEach(
        message => {

            if (
                message.role === "user"
            ) {

                showUserMessage(
                    message.content
                );

            } else {

                showBotMessage(
                    message.content
                );

            }

        }
    );

}


function showWelcome() {

    chatBox.innerHTML = `

        <div class="welcome">

            <div class="robot">
                🤖
            </div>

            <h2>
                How can I help you?
            </h2>

            <p>
                Ask me anything and I'll
                try my best to help you.
            </p>

        </div>

    `;

}


function showUserMessage(message) {

    const div =
        document.createElement("div");

    div.className =
        "user-message";


    const p =
        document.createElement("p");

    p.textContent =
        "👤 " + message;


    div.appendChild(p);

    chatBox.appendChild(div);

    scrollToBottom();

}


function showBotMessage(message) {

    const div =
        document.createElement("div");

    div.className =
        "bot-message";


    const p =
        document.createElement("p");

    p.textContent =
        "🤖 " + message;


    const copyBtn =
        document.createElement("button");

    copyBtn.className =
        "copy-btn";

    copyBtn.textContent =
        "Copy";


    div.appendChild(p);

    div.appendChild(copyBtn);

    chatBox.appendChild(div);

    scrollToBottom();

}


async function sendMessage() {

    const message =
        userInput.value.trim();


    if (!message) {
        return;
    }


    if (!currentChatId) {
        createNewChat();
    }


    const chat =
        getCurrentChat();


    const welcome =
        chatBox.querySelector(
            ".welcome"
        );


    if (welcome) {
        welcome.remove();
    }


    showUserMessage(message);


    chat.messages.push({

        role: "user",

        content: message

    });


    if (
        chat.title === "New Chat"
    ) {

        chat.title =
            message.length > 30
                ? message.substring(
                    0,
                    30
                ) + "..."
                : message;

    }


    saveChats();

    renderRecentChats();


    userInput.value = "";


    const loading =
        document.createElement("div");

    loading.className =
        "bot-message";

    loading.id =
        "loading";

    loading.innerHTML =
        "<p>🤖 Thinking...</p>";

    chatBox.appendChild(
        loading
    );

    scrollToBottom();


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "API request failed"
            );

        }


        loading.remove();


        const answer =
            data.answer;


        if (!answer) {

            throw new Error(
                "No answer received"
            );

        }


        showBotMessage(
            answer
        );


        chat.messages.push({

            role: "bot",

            content: answer

        });


        saveChats();


    } catch (error) {

        loading.remove();


        showBotMessage(
            "❌ Something went wrong. Please try again."
        );


        console.error(
            "Chat Error:",
            error
        );

    }

}


function clearCurrentChat() {

    const index =
        chats.findIndex(
            chat =>
                chat.id === currentChatId
        );


    if (index === -1) {
        return;
    }


    chats.splice(
        index,
        1
    );


    saveChats();


    if (chats.length === 0) {

        currentChatId = null;

        recentChats.innerHTML = "";

        showWelcome();

        return;

    }


    currentChatId =
        chats[0].id;


    renderRecentChats();

    renderCurrentChat();

}


chatBox.addEventListener(
    "click",
    async event => {

        if (
            event.target.classList.contains(
                "copy-btn"
            )
        ) {

            const paragraph =
                event.target
                    .parentElement
                    .querySelector("p");


            const message =
                paragraph.textContent
                    .replace(
                        "🤖 ",
                        ""
                    );


            await navigator.clipboard
                .writeText(message);


            event.target.textContent =
                "Copied!";


            setTimeout(
                () => {

                    event.target.textContent =
                        "Copy";

                },
                1500
            );

        }

    }
);


userInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            sendMessage();

        }

    }
);


sendBtn.addEventListener(
    "click",
    sendMessage
);


newChatBtn.addEventListener(
    "click",
    createNewChat
);


clearBtn.addEventListener(
    "click",
    clearCurrentChat
);


function scrollToBottom() {

    chatBox.scrollTop =
        chatBox.scrollHeight;

}


function startApp() {

    if (chats.length === 0) {

        createNewChat();

    } else {

        currentChatId =
            chats[0].id;

        renderRecentChats();

        renderCurrentChat();

    }

}


startApp();
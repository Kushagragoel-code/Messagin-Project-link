// --- 1. DATA & STATE ---
const contacts = ["Rahul", "Priya", "Aman"];
const colors = ["#ff5722", "#4caf50", "#2196f3", "#9c27b0"];
const chatHistory = { "Rahul": [], "Priya": [], "Aman": [] };
const blockedList = [];
let activeUser = ""; 

// --- 2. SELECTORS ---
const contactList = document.querySelector("#contact-list");
const msgDisplay = document.querySelector("#message-display");
const msgInput = document.querySelector("#msg-input");

// --- 3. CORE RENDERING ---
const renderSidebar = (filter = "") => {
    contactList.innerHTML = "";
    for (let i = 0; i < contacts.length; i++) {
        let name = contacts[i];
        if (name.toLowerCase().includes(filter.toLowerCase())) {
            const color = colors[i % colors.length];
            const div = document.createElement("div");
            div.className = `contact-item ${name === activeUser ? "active" : ""}`;
            
            const isBlocked = blockedList.includes(name);
            const status = isBlocked ? " <small style='color:red;'>(Blocked)</small>" : "";

            div.innerHTML = `
                <div class="avatar-circle" style="background:${color}">${name[0]}</div> 
                <strong style="margin-left:15px">${name}${status}</strong>
            `;
            
            div.onclick = () => {
                activeUser = name;
                document.querySelector("#welcome-screen").classList.add("hidden");
                document.querySelector("#chat-screen").classList.remove("hidden");
                document.querySelector("#active-name").textContent = name;
                document.querySelector("#active-avatar").textContent = name[0];
                document.querySelector("#active-avatar").style.background = color;
                
                checkBlockStatus();
                drawMessages();
                renderSidebar(document.querySelector("#search-input").value);
            };
            contactList.appendChild(div);
        }
    }
};

const drawMessages = () => {
    msgDisplay.innerHTML = "";
    const logs = chatHistory[activeUser];
    for (const m of logs) {
        const b = document.createElement("div");
        b.className = `bubble ${m.type}`;
        if (m.isImg) {
            const img = document.createElement("img");
            img.src = m.text;
            b.appendChild(img);
        } else {
            b.textContent = m.text;
        }
        msgDisplay.appendChild(b);
    }
    // AUTOMATIC SCROLL
    msgDisplay.scrollTop = msgDisplay.scrollHeight;
};

// --- 4. BUTTON INTERACTIONS ---
document.querySelector("#send-btn").onclick = () => {
    const text = msgInput.value.trim();
    if (text !== "" && activeUser !== "") {
        chatHistory[activeUser].push({ text: text, type: "sent", isImg: false });
        msgInput.value = "";
        drawMessages();
    }
};

document.querySelector("#add-contact-btn").onclick = () => {
    const n = prompt("New Contact Name:");
    if (n && n.trim() !== "") {
        const cleanName = n.trim();
        if (!contacts.includes(cleanName)) {
            contacts.push(cleanName);
            chatHistory[cleanName] = [];
            renderSidebar();
        }
    }
};

const checkBlockStatus = () => {
    const isB = blockedList.includes(activeUser);
    document.querySelector("#input-section").classList.toggle("hidden", isB);
    document.querySelector("#blocked-banner").classList.toggle("hidden", !isB);
    document.querySelector("#block-btn").classList.toggle("hidden", isB);
};

document.querySelector("#block-btn").onclick = () => {
    if (confirm(`Block ${activeUser}?`)) {
        blockedList.push(activeUser);
        checkBlockStatus();
        renderSidebar();
    }
};

document.querySelector("#unblock-link").onclick = () => {
    const index = blockedList.indexOf(activeUser);
    if (index > -1) blockedList.splice(index, 1);
    checkBlockStatus();
    renderSidebar();
};

// --- 5. MODAL LOGIC (PROFILE/SETTINGS) ---
document.querySelector("#settings-btn").onclick = () => {
    document.querySelector("#settings-modal").classList.remove("hidden");
};

document.querySelector("#save-profile").onclick = () => {
    const newName = document.querySelector("#my-name-input").value.trim();
    if (newName) {
        document.querySelector("#my-avatar").textContent = newName[0];
        document.querySelector("#my-avatar").style.backgroundImage = document.querySelector("#my-preview-avatar").style.backgroundImage;
        if (document.querySelector("#my-avatar").style.backgroundImage) {
            document.querySelector("#my-avatar").textContent = "";
        }
    }
    document.querySelector("#settings-modal").classList.add("hidden");
};


document.querySelector("#header-profile-trigger").onclick = (e) => {
    if (e.target.tagName !== "BUTTON") {
        document.querySelector("#view-name").textContent = activeUser;
        document.querySelector("#view-avatar").textContent = activeUser[0];
        document.querySelector("#view-avatar").style.background = document.querySelector("#active-avatar").style.background;
        document.querySelector("#profile-modal").classList.remove("hidden");
    }
};

document.querySelectorAll(".close-modal").forEach(btn => {
    btn.onclick = () => {
        document.querySelector("#settings-modal").classList.add("hidden");
        document.querySelector("#profile-modal").classList.add("hidden");
    };
});

// --- 6. UTILITIES (SEARCH/ATTACH/EMOJI) ---
document.querySelector("#search-input").oninput = (e) => renderSidebar(e.target.value);

document.querySelector("#attach-btn").onclick = () => document.querySelector("#file-input").click();
document.querySelector("#file-input").onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        chatHistory[activeUser].push({ text: ev.target.result, type: "sent", isImg: true });
        drawMessages();
    };
    reader.readAsDataURL(e.target.files[0]);
};

document.querySelector("#emoji-btn").onclick = () => document.querySelector("#emoji-menu").classList.toggle("hidden");
document.querySelectorAll(".emoji-menu span").forEach(s => {
    s.onclick = () => {
        msgInput.value += s.textContent;
        document.querySelector("#emoji-menu").classList.add("hidden");
    };
});

document.querySelector("#clear-btn").onclick = () => {
    if (confirm("Clear this chat?")) {
        chatHistory[activeUser] = [];
        drawMessages();
    }
};

msgInput.onkeypress = (e) => { if (e.key === "Enter") document.querySelector("#send-btn").click(); };

// INIT
renderSidebar();
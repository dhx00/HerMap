function stripMarkdown(text) {
        return text
            .replace(/^#+\s*/gm, '')           // 移除标题的 # 符号
            .replace(/\*\*(.*?)\*\*/g, '$1')   // 移除 **加粗**
            .replace(/\*(.*?)\*/g, '$1')       // 移除 *斜体*
            .replace(/`([^`]+)`/g, '$1')       // 移除 `代码`
            .replace(/^\s*[-*]\s+/gm, '• ')    // 把 - / * 列表符替换成圆点
            .replace(/^\d+\.\s+/gm, match => match.trim()); // 保留编号
}

export class InfoPanelManager {
    constructor() {
        this.infoPanel = document.getElementById('info-panel');
        this.infoPanelClose = document.getElementById('info-panel-close');
        
        if (!this.infoPanel || !this.infoPanelClose) {
            console.error('Info panel elements not found!');
            return;
        }
        
        this._setupInfoPanelClose();
    }

    _setupInfoPanelClose() {
        this.infoPanelClose.addEventListener('click', () => {
            console.log('Closing info panel');
            this.hidePanel();
        });
    }

    showPanel(position) {
        if (!this.infoPanel) return;
        this.messages = []; // 每次点击一个 marker 都重置对话历史
        
        this.infoPanel.style.display = 'block';
        this.infoPanel.offsetHeight;
        this.infoPanel.classList.add('show');
        console.log('Showing info panel:', position);
    }

    hidePanel() {
        if (!this.infoPanel) return;
        
        this.infoPanel.classList.remove('show');
        
        setTimeout(() => {
            if (!this.infoPanel.classList.contains('show')) {
                this.infoPanel.style.display = 'none';
            }
        }, 300); 
        
        console.log('Hiding info panel');
    }

    setPosition(position) {
        if (!this.infoPanel) return;
        
        if (position === 'right') {
            this.infoPanel.classList.remove('left');
            this.infoPanel.classList.add('right');
        } else {
            this.infoPanel.classList.remove('right');
            this.infoPanel.classList.add('left');
        }
    }

    async loadAIResponse({ summary, time, country }) {
        const panelContent = document.getElementById('info-panel-content');
        if (!panelContent) return;

        panelContent.innerHTML = `<strong>Event:</strong><br>${summary}<br><em>AI is thinking...</em>`;

        //const prompt = `Please describe the following historical event in detail, including its background and impact: Country: ${country} Year: ${time} Event: ${summary}`;

        this.messages = [
            {
            role: "user",
            content: `Please describe the following historical event in detail, including its background and impact:\n\nCountry: ${country}\nYear: ${time}\nEvent: ${summary}`
            }
        ];

        try {
            const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer sk-7f70a36d9f814c629b6f67c1d66fca63"
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: this.messages,
                    temperature: 0.7
                })
            });

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "No AI response.";
            const cleanReply = stripMarkdown(reply);
            this.messages.push({ role: "assistant", content: reply });
            panelContent.innerHTML += `<br><strong>AI:</strong> ${cleanReply}`;
        } catch (error) {
            console.error("AI fetch error:", err);
            panelContent.innerHTML += `<br><span style="color:red;">Error contacting AI.</span>`;
        }

        document.getElementById("chat-send-btn").onclick = async () => {
            const input = document.getElementById("chat-user-input");
            const userInput = input.value.trim();
            if (!userInput) return;

            input.value = "";
            const panelContent = document.getElementById("info-panel-content");
            panelContent.innerHTML += `<br><strong style="color: blue;">You:</strong> <span style="color: blue;">${userInput}</span><br><em>AI is thinking...</em>`;

            this.messages.push({ role: "user", content: userInput });

            try {
                const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer sk-7f70a36d9f814c629b6f67c1d66fca63"
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: this.messages,
                    temperature: 0.7
                })
                });

                const data = await res.json();
                const reply = data.choices?.[0]?.message?.content || "No AI response.";
                const cleanReply = stripMarkdown(reply);
                this.messages.push({ role: "assistant", content: reply });

                panelContent.innerHTML += `<br><strong>AI:</strong> ${cleanReply}`;
                panelContent.scrollTop = panelContent.scrollHeight;
            } catch (err) {
                panelContent.innerHTML += `<br><span style="color:red;">(Error contacting AI)</span>`;
                console.error("AI fetch error:", err);
            }
        };
    }

} 
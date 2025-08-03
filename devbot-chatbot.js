class DevBot {
  constructor(apiKey, title) {
    this.apiKey = apiKey;
    this.title = title;
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
    this.showScrollButton = false;

    this.createStyles();
    this.createChatWidget();
    this.attachEventListeners();
  }

  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .devbots-chat-widget {
  display: flex;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: Arial, sans-serif;
}
      .devbots-chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #27272a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}
      .devbots-chat-button:hover {
        background-color: #3f3f46;
        transform: scale(1.1);
      }
      .devbots-chat-window {
        width: 320px;
        height: 500px;
        background-color: white;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: translateY(100%);
        opacity: 0;
        transition: all 0.3s;
      }
      .devbots-chat-window.open {
        transform: translateY(0);
        opacity: 1;
      }
      .devbots-chat-header {
        background-color: #f3f4f6;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb;
      }
      .devbots-chat-title {
        font-weight: bold;
      }
      .devbots-chat-close {
        cursor: pointer;
        background: none;
        border: none;
        font-size: 20px;
      }
      .devbots-chat-messages {
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
      }
      .devbots-message {
        max-width: 80%;
        width: fit-content;
        margin-bottom: 10px;
        padding: 8px 12px;
        border-radius: 18px;
        line-height: 1.4;
      }
      .devbots-message-assistant {
        background-color: #f3f4f6;
        align-self: flex-start;
      }
      .devbots-message-user {
        background-color: #27272a;
        color: white;
        align-self: flex-end;
        margin-left: auto;
      }
      .devbots-chat-input {
        display: flex;
        padding: 10px;
        border-top: 1px solid #e5e7eb;
      }
      .devbots-chat-input input {
        flex-grow: 1;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        margin-right: 8px;
      }
      .devbots-chat-input button {
        background-color:rgb(8, 12, 20);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
      }
      .devbots-chat-input button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .devbots-scroll-button {
        position: absolute;
        bottom: 70px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #27272a;
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .devbots-powered-by {
        text-align: center;
        font-size: 10px;
        margin-top: -6px;
        margin-bottom: 8px;
      }
      .devbots-powered-by a {
        color: #2563eb;
        text-decoration: none;
      }
      .devbots-powered-by a:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  createChatWidget() {
    this.widget = document.createElement('div');
    this.widget.className = 'devbots-chat-widget';
    this.widget.innerHTML = `
      <div class="devbots-chat-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div class="devbots-chat-window">
        <div class="devbots-chat-header">
          <div class="devbots-chat-title">${this.title}</div>
          <button class="devbots-chat-close">&times;</button>
        </div>
        <div class="devbots-chat-messages"></div>
         <div class="devbots-chat-input">
    <input type="text" placeholder="Ask something...">
    <button type="submit">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-forward"><polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg>
    </button>
  </div>
        <div class="devbots-powered-by">
          Powered by <a href="https://devbots.vercel.app" target="_blank">DevBots</a>
        </div>
      </div>
      <button class="devbots-scroll-button" style="display: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
      </button>
    `;
    document.body.appendChild(this.widget);

    this.chatButton = this.widget.querySelector('.devbots-chat-button');
    this.chatWindow = this.widget.querySelector('.devbots-chat-window');
    this.closeButton = this.widget.querySelector('.devbots-chat-close');
    this.messagesContainer = this.widget.querySelector('.devbots-chat-messages');
    this.input = this.widget.querySelector('input');
    this.sendButton = this.widget.querySelector('button[type="submit"]');
    this.scrollButton = this.widget.querySelector('.devbots-scroll-button');
  }

  attachEventListeners() {
    this.chatButton.addEventListener('click', () => this.toggleChat());
    this.closeButton.addEventListener('click', () => this.toggleChat());
    this.sendButton.addEventListener('click', () => this.handleSubmit());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSubmit();
    });
    this.messagesContainer.addEventListener('scroll', () => this.handleScroll());
    this.scrollButton.addEventListener('click', () => this.scrollToBottom());
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.chatWindow.classList.toggle('open', this.isOpen);
    this.chatButton.style.display = this.isOpen ? 'none' : 'flex';
    if (this.isOpen) this.scrollToBottom();
  }

  handleSubmit() {
    const message = this.input.value.trim();
    if (!message || this.isLoading) return;

    this.addMessage('user', message);
    this.input.value = '';
    this.sendMessage(message);
  }

  async sendMessage(message) {
    this.isLoading = true;
    this.updateSendButtonState();

    try {
      const response = await fetch('https://devbots-server.vercel.app/api/chatbots/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: this.apiKey,
          query: message,
          history: this.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      // Add assistant message placeholder
      const assistantMsg = { role: 'assistant', content: '' };
      this.messages.push(assistantMsg);
      this.renderMessages();
      this.scrollToBottom();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        assistantMsg.content = fullText;
        this.renderMessages();
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      this.addMessage('assistant', 'Sorry, something went wrong. Please try again later.');
    } finally {
      this.isLoading = false;
      this.updateSendButtonState();
    }
  }


  addMessage(role, content) {
    this.messages.push({ role, content });
    this.renderMessages();
    this.scrollToBottom();
  }

  renderMessages() {
    this.messagesContainer.innerHTML = this.messages.map(msg => `
      <div class="devbots-message devbots-message-${msg.role}">
        ${msg.content}
      </div>
    `).join('');
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
    this.showScrollButton = scrollHeight - scrollTop - clientHeight > 100;
    this.scrollButton.style.display = this.showScrollButton ? 'flex' : 'none';
  }

  updateSendButtonState() {
    this.sendButton.disabled = this.isLoading;
    this.sendButton.innerHTML = this.isLoading
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader spin"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-forward"><polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg>`;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
      }
      .spin {
      animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

window.DevBot = DevBot;
class DevBotsChat {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isOpen = false;
    this.messages = [{ role: 'assistant', content: '👋🏻 Greetings! DevBot at your Service.' }];
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
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: Arial, sans-serif;
      }
      .devbots-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #27272a;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      .devbots-chat-button:hover {
        background-color: #3f3f46;
      }
      .devbots-chat-window {
        width: 320px;
        height: 500px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s;
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
        background-color: #2563eb;
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
        margin-top: -16px;
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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M21 12H3M12 3v18"/></svg>
      </div>
      <div class="devbots-chat-window" style="display: none;">
        <div class="devbots-chat-header">
          <div class="devbots-chat-title">DevBots Support</div>
          <button class="devbots-chat-close">&times;</button>
        </div>
        <div class="devbots-chat-messages"></div>
        <div class="devbots-chat-input">
          <input type="text" placeholder="Ask something...">
          <button type="submit">Send</button>
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
    this.chatWindow.style.display = this.isOpen ? 'flex' : 'none';
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
        body: JSON.stringify({ apiKey: this.apiKey, query: message }),
      });

      const data = await response.json();
      this.addMessage('assistant', data.response || 'Sorry, something went wrong.');
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
    this.sendButton.textContent = this.isLoading ? 'Sending...' : 'Send';
  }
}

// Make the class available globally
window.DevBotsChat = DevBotsChat;
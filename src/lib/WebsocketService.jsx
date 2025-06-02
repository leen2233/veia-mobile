import ReconnectingWebSocket from 'react-native-reconnecting-websocket';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
  }

  connect() {
    if (this.socket) return;

    const options = {
      connectionTimeout: 1000,
      maxRetries: 10,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000 + Math.random() * 4000,
    };

    this.socket = new ReconnectingWebSocket('', [], options);

    this.socket.addEventListener('message', event => {
      this.listeners.forEach(cb => cb(event.data));
    });

    this.socket.addEventListener('open', () => {
      console.log('WebSocket connected');
      this.statusCallback?.({state: false});
    });

    this.socket.addEventListener('close', () => {
      console.log('WebSocket closed');
      this.statusCallback?.({state: true});
    });

    this.socket.addEventListener('error', error => {
      this.statusCallback?.({state: true});
    });
  }

  send(data) {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(data));
    }
  }

  addListener(cb) {
    this.listeners.push(cb);
  }

  removeListener(cb) {
    this.listeners = this.listeners.filter(fn => fn !== cb);
  }

  setStatusCallback(cb) {
    this.statusCallback = cb;
  }
}

export default new WebSocketService();

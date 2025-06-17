import { $http } from ".";

interface PushOptions {
    heartbeat?: number;
    pingTimeout?: number;
    url?: string;
    app_key?: string;
    auth?: string;
}

interface Channel {
    subscribed: boolean;
    channelName: string;
    subscribeCb: (() => void) | null;
    queue: Array<() => void>;
    on: (eventName: string, callback: (data: any) => void, context?: any) => void;
    off: (eventName: string, callback: (data: any) => void, context?: any) => void;
    emit: (eventName: string, data: any) => void;
}

interface Connection {
    state: 'initialized' | 'connecting' | 'connected' | 'disconnected';
    socket_id?: string;
    doNotConnect: number;
    reconnectInterval: number;
    connection: WebSocket | null;
    reconnectTimer: NodeJS.Timeout | undefined;
    on: (eventName: string, callback: (data: any) => void, context?: any) => void;
    off: (eventName: string, callback: (data: any) => void, context?: any) => void;
    emit: (eventName: string, data: any) => void;
}

interface Dispatcher {
    callbacks: CallbackRegistry;
    global_callbacks: Array<(eventName: string, data: any) => void>;
    failThrough?: (eventName: string, data: any) => void;
}

interface CallbackRegistry {
    _callbacks: { [key: string]: Array<{ fn: (data: any) => void; context?: any }> };
}


export class Push {
    public config: PushOptions;
    public channels: { [key: string]: Channel };
    public connection: Connection | null;
    public pingTimeoutTimer: NodeJS.Timeout | undefined;
    static instances: Push[] = [];

    constructor(options: PushOptions) {
        options = options || {};
        options.heartbeat = options.heartbeat || 25000;
        options.pingTimeout = options.pingTimeout || 10000;
        this.config = options;
        this.channels = {};
        this.connection = null;
        this.pingTimeoutTimer = undefined;
        Push.instances.push(this);
        this.createConnection();
    }

    checkoutPing(): void {
        setTimeout(() => {
            if (this.connection?.state === 'connected') {
                this.connection.send('{"event":"pusher:ping","data":{}}');
                if (this.pingTimeoutTimer) {
                    clearTimeout(this.pingTimeoutTimer);
                    this.pingTimeoutTimer = undefined;
                }
                this.pingTimeoutTimer = setTimeout(() => {
                    if (this.connection) {
                        this.connection.closeAndClean();
                        if (!this.connection.doNotConnect) {
                            this.connection.waitReconnect();
                        }
                    }
                }, this.config.pingTimeout);
            }
        }, this.config.heartbeat);
    }

    channel(name: string): Channel | undefined {
        return this.channels[name];
    }

    allChannels(): Channel[] {
        return Object.values(this.channels);
    }

    createConnection(): void {
        if (this.connection) {
            throw new Error('Connection already exist');
        }

        const url = this.config.url;
        if (!url || !this.config.app_key) {
            throw new Error('Please set url in config');
        }
        const updateSubscribed = () => {
            for (const i in this.channels) {
                this.channels[i].subscribed = false;
            }
        };

        this.connection = new Connection({
            url: url,
            app_key: this.config.app_key,
            onOpen: () => {
                if (this.connection) {
                    this.connection.state = 'connecting';
                    this.checkoutPing();
                }
            },
            onMessage: (params: MessageEvent) => {
                if (this.pingTimeoutTimer) {
                    clearTimeout(this.pingTimeoutTimer);
                    this.pingTimeoutTimer = undefined;
                }

                const data = JSON.parse(params.data);
                const event = data.event;
                const channel_name = data.channel;

                if (event === 'pusher:pong') {
                    this.checkoutPing();
                    return;
                }
                if (event === 'pusher:error') {
                    throw new Error(data.data.message);
                }

                const parsedData = JSON.parse(data.data);
                let channel: Channel | undefined;

                if (event === 'pusher_internal:subscription_succeeded') {
                    channel = this.channels[channel_name];
                    if (channel) {
                        channel.subscribed = true;
                        channel.processQueue();
                        channel.emit('pusher:subscription_succeeded', {});
                    }
                    return;
                }

                if (event === 'pusher:connection_established') {
                    if (this.connection) {
                        this.connection.socket_id = parsedData.socket_id;
                        this.connection.state = 'connected';
                        this.subscribeAll();
                    }
                }

                if (event.indexOf('pusher_internal') !== -1) {
                    console.log("Event '" + event + "' not implement");
                    return;
                }

                channel = this.channels[channel_name];
                if (channel) {
                    channel.emit(event, parsedData);
                }
            },
            onClose: () => {
                updateSubscribed();
            },
            onError: () => {
                updateSubscribed();
            }
        });
    }

    disconnect(): void {
        if (this.connection) {
            this.connection.doNotConnect = 1;
            this.connection.close();
        }
    }

    subscribeAll(): void {
        if (this.connection?.state !== 'connected') {
            return;
        }
        for (const channel_name in this.channels) {
            this.channels[channel_name].processSubscribe();
        }
    }

    unsubscribe(channel_name: string): void {
        if (this.channels[channel_name]) {
            delete this.channels[channel_name];
            if (this.connection?.state === 'connected') {
                this.connection.send(JSON.stringify({ event: "pusher:unsubscribe", data: { channel: channel_name } }));
            }
        }
    }

    unsubscribeAll(): void {
        const channels = Object.keys(this.channels);
        if (channels.length) {
            if (this.connection?.state === 'connected') {
                for (const channel_name in this.channels) {
                    this.unsubscribe(channel_name);
                }
            }
        }
        this.channels = {};
    }

    subscribe(channel_name: string): Channel {
        if (this.channels[channel_name]) {
            return this.channels[channel_name];
        }
        if (channel_name.indexOf('private-') === 0) {
            return createPrivateChannel(channel_name, this);
        }
        if (channel_name.indexOf('presence-') === 0) {
            return createPresenceChannel(channel_name, this);
        }
        return createChannel(channel_name, this);
    }
}
const createChannel = (channel_name: string, push: Push): Channel => {
    const channel = new Channel(push.connection, channel_name);
    push.channels[channel_name] = channel;
    channel.subscribeCb = () => {
        if (push.connection) {
            push.connection.send(JSON.stringify({ event: "pusher:subscribe", data: { channel: channel_name } }));
        }
    };
    channel.processSubscribe();
    return channel;

}

const createPrivateChannel=(channel_name: string, push: Push): Channel =>{
    const channel = new Channel(push.connection, channel_name);
    push.channels[channel_name] = channel;
    channel.subscribeCb = () => {
        $http.post(push.config.auth || '', { channel_name: channel_name, socket_id: push.connection?.socket_id })
            .then((data: any) => {
                data.channel = channel_name;
                if (push.connection) {
                    push.connection.send(JSON.stringify({ event: "pusher:subscribe", data: data }));
                }
            }).catch((e: any) => {
                throw new Error(e.toString());
            });
    };
    channel.processSubscribe();
    return channel;
}

const createPresenceChannel=(channel_name: string, push: Push): Channel =>{
    return createPrivateChannel(channel_name, push);
}

class Connection implements Connection {
    public state: 'initialized' | 'connecting' | 'connected' | 'disconnected';
    public socket_id?: string;
    public doNotConnect: number;
    public reconnectInterval: number;
    public connection: WebSocket | null;
    public reconnectTimer: NodeJS.Timeout | undefined;
    private dispatcher: Dispatcher;
    private options: {
        url: string;
        app_key: string;
        onOpen?: (res: Event) => void;
        onMessage?: (params: MessageEvent) => void;
        onClose?: (res: CloseEvent) => void;
        onError?: (res: Event) => void;
    };

    constructor(options: {
        url: string;
        app_key: string;
        onOpen?: (res: Event) => void;
        onMessage?: (params: MessageEvent) => void;
        onClose?: (res: CloseEvent) => void;
        onError?: (res: Event) => void;
    }) {
        this.dispatcher = new Dispatcher();
        Object.assign(this, this.dispatcher);
        this.on=this.dispatcher.on;
        this.off=this.dispatcher.off;
        this.emit=this.dispatcher.emit;
        this.options = options;
        this.state = 'initialized';
        this.doNotConnect = 0;
        this.reconnectInterval = 1;
        this.connection = null;
        this.reconnectTimer = undefined;
        this.connect();
    }

    updateNetworkState(state: string): void {
        const old_state = this.state;
        this.state = state as 'initialized' | 'connecting' | 'connected' | 'disconnected';
        if (old_state !== state) {
            this.emit('state_change', { previous: old_state, current: state });
        }
    }

    connect(): void {
        this.doNotConnect = 0;
        if (this.state === 'connected') {
            console.log('networkState is "' + this.state + '" and do not need connect');
            return;
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }

        this.closeAndClean();

        const websocket = new WebSocket(this.options.url + '/app/' + this.options.app_key);

        this.updateNetworkState('connecting');

        websocket.onopen = (res: Event) => {
            this.reconnectInterval = 1;
            if (this.doNotConnect) {
                this.updateNetworkState('disconnected');
                websocket.close();
                return;
            }
            if (this.options.onOpen) {
                this.options.onOpen(res);
            }
        };

        if (this.options.onMessage) {
            websocket.onmessage = this.options.onMessage;
        }

        websocket.onclose = (res: CloseEvent) => {
            websocket.onmessage = websocket.onopen = websocket.onclose = websocket.onerror = null;
            this.updateNetworkState('disconnected');
            if (!this.doNotConnect) {
                this.waitReconnect();
            }
            if (this.options.onClose) {
                this.options.onClose(res);
            }
        };

        websocket.onerror = (res: Event) => {
            this.close();
            if (!this.doNotConnect) {
                this.waitReconnect();
            }
            if (this.options.onError) {
                this.options.onError(res);
            }
        };
        this.connection = websocket;
    }

    closeAndClean(): void {
        if (this.connection) {
            const websocket = this.connection;
            websocket.onmessage = websocket.onopen = websocket.onclose = websocket.onerror = null;
            try {
                websocket.close();
            } catch (e) { }
            this.updateNetworkState('disconnected');
        }
    }

    waitReconnect(): void {
        if (this.state === 'connected' || this.state === 'connecting') {
            return;
        }
        if (!this.doNotConnect) {
            this.updateNetworkState('connecting');
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
            }
            this.reconnectTimer = setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
            if (this.reconnectInterval < 1000) {
                this.reconnectInterval = 1000;
            } else {
                this.reconnectInterval = this.reconnectInterval * 2;
            }
            if (this.reconnectInterval > 2000 && navigator.onLine) {
                this.reconnectInterval = 2000;
            }
        }
    }

    send(data: string): void {
        if (this.state !== 'connected') {
            console.trace('networkState is "' + this.state + '", can not send ' + data);
            return;
        }
        if (this.connection) {
            this.connection.send(data);
        }
    }

    close(): void {
        this.updateNetworkState('disconnected');
        if (this.connection) {
            this.connection.close();
        }
    }
}

class Channel implements Channel {
    public subscribed: boolean;
    public channelName: string;
    public subscribeCb: (() => void) | null;
    public queue: Array<() => void>;
    private dispatcher: Dispatcher;
    private connection: Connection | null;

    constructor(connection: Connection | null, channel_name: string) {
        this.subscribed = false;
        this.dispatcher = new Dispatcher();
        this.connection = connection;
        this.channelName = channel_name;
        this.subscribeCb = null;
        this.queue = [];
        Object.assign(this, this.dispatcher);
        this.on=this.dispatcher.on;
        this.off=this.dispatcher.off;
        this.emit=this.dispatcher.emit;
    }

    processSubscribe(): void {
        if (this.connection?.state !== 'connected') {
            return;
        }
        if (this.subscribeCb) {
            this.subscribeCb();
        }
    }

    processQueue(): void {
        if (this.connection?.state !== 'connected' || !this.subscribed) {
            return;
        }
        for (const i in this.queue) {
            this.queue[i]();
        }
        this.queue = [];
    }

    trigger(event: string, data: any): void {
        if (event.indexOf('client-') !== 0) {
            throw new Error("Event '" + event + "' should start with 'client-'");
        }
        this.queue.push(() => {
            if (this.connection) {
                this.connection.send(JSON.stringify({ event: event, data: data, channel: this.channelName }));
            }
        });
        this.processQueue();
    }
}

class Dispatcher implements Dispatcher {
    public callbacks: CallbackRegistry;
    public global_callbacks: Array<(eventName: string, data: any) => void>;
    public failThrough?: (eventName: string, data: any) => void;

    constructor(failThrough?: (eventName: string, data: any) => void) {
        this.callbacks = new CallbackRegistry();
        this.global_callbacks = [];
        this.failThrough = failThrough;
    }

    on(eventName: string, callback: (data: any) => void, context?: any): this {
        this.callbacks.add(eventName, callback, context);
        return this;
    }

    on_global(callback: (eventName: string, data: any) => void): this {
        this.global_callbacks.push(callback);
        return this;
    }

    off(eventName: string, callback: (data: any) => void, context?: any): this {
        this.callbacks.remove(eventName, callback, context);
        return this;
    }

    emit(eventName: string, data: any): this {
        for (let i = 0; i < this.global_callbacks.length; i++) {
            this.global_callbacks[i](eventName, data);
        }
        const callbacks = this.callbacks.get(eventName);
        if (callbacks && callbacks.length > 0) {
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i].fn.call(callbacks[i].context || window, data);
            }
        } else if (this.failThrough) {
            this.failThrough(eventName, data);
        }
        return this;
    }
}

class CallbackRegistry implements CallbackRegistry {
    public _callbacks: { [key: string]: Array<{ fn: (data: any) => void; context?: any }> };

    constructor() {
        this._callbacks = {};
    }

    get(name: string): Array<{ fn: (data: any) => void; context?: any }> | undefined {
        return this._callbacks[prefix(name)];
    }

    add(name: string, callback: (data: any) => void, context?: any): void {
        const prefixedEventName = prefix(name);
        this._callbacks[prefixedEventName] = this._callbacks[prefixedEventName] || [];
        this._callbacks[prefixedEventName].push({
            fn: callback,
            context: context
        });
    }

    remove(name: string, callback: (data: any) => void, context?: any): void {
        if (!name && !callback && !context) {
            this._callbacks = {};
            return;
        }
        const names = name ? [prefix(name)] : Object.keys(this._callbacks);
        if (callback || context) {
            this.removeCallback(names, callback, context);
        } else {
            this.removeAllCallbacks(names);
        }
    }

    removeCallback(names: string[], callback: (data: any) => void, context?: any): void {
        names.forEach((name) => {
            this._callbacks[name] = (this._callbacks[name] || []).filter((oning) => {
                return (callback && callback !== oning.fn) ||
                    (context && context !== oning.context);
            });
            if (this._callbacks[name].length === 0) {
                delete this._callbacks[name];
            }
        });
    }

    removeAllCallbacks(names: string[]): void {
        names.forEach((name) => {
            delete this._callbacks[name];
        });
    }
}

function prefix(name: string): string {
    return "_" + name;
}


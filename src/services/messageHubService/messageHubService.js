const loging = true;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class MessageHubService{
    constructor(reconnection_delay=1){
        this.reconnection_delay = reconnection_delay;

        this.websocket = null;
        this.connected = false;
        this.openEventHandlers = [];
        this.closeEventHandlers = [];
        this.errorEventHandlers = [];
        this.fatalCloseEventHandlers = [];

        this.sendedActions = [];

        this.responseFuncById = {};
        this.actionEventHandlers = {};
    }

    connect(url){
        this.url = url;

        this.last_connection = new Date();
        this.websocket = new WebSocket(url);
        this.setUpHandlers(this.websocket);
    }

    async reConnect(){
        if (new Date() - this.last_connection> this.reconnection_delay * 1000) {
            this.last_connection = new Date();
            this.websocket = new WebSocket(this.url);
            this.setUpHandlers(this.websocket);
        } else{
            await sleep(this.reconnection_delay * 1000); 
        }
    }

    setUpHandlers(ws){
        ws.onopen = this.onOpenHandler.bind(this);
        ws.onclose = this.onCloseHandler.bind(this);
        ws.onerror = this.onErrorHandler.bind(this);
        ws.onmessage = this.onMessageHandler.bind(this);
    }

    async onOpenHandler (event) {
        if (loging) console.log("WebSocket connection opened:", event);
    
        this.connected = true;
    
        for (let item in this.openEventHandlers){
            if (this.openEventHandlers[item].constructor.name === "AsyncFunction"){
                await this.openEventHandlers[item](event);
            } else{
                this.openEventHandlers[item](event);
            }
        }

        this.reSendActions();
    }

    async onCloseHandler (event) {
        if (loging)  console.log("WebSocket connection closed:", event);
    
        this.connected = false;
    
        if (event.code === 1008) {
            // Ошибка логина
            for (let item in this.fatalCloseEventHandlers){
                if (this.fatalCloseEventHandlers[item].constructor.name === "AsyncFunction"){
                    await this.fatalCloseEventHandlers[item](event);
                } else{
                    this.fatalCloseEventHandlers[item](event);
                }
            }
        }
        else{
            for (let item in this.closeEventHandlers){
                if (this.closeEventHandlers[item].constructor.name === "AsyncFunction"){
                    await this.closeEventHandlers[item](event);
                } else{
                    this.closeEventHandlers[item](event);
                }
            }
            await this.reConnect();
        }
    }

    async onErrorHandler (event) {
        if (loging) console.log("WebSocket connection error:", event);
    
        this.connected = false;
    
        for (let item in this.closeEventHandlers){
            if (this.closeEventHandlers[item].constructor.name === "AsyncFunction"){
                await this.closeEventHandlers[item](event);
            } else{
                this.closeEventHandlers[item](event);
            }
        }
        await this.reConnect();
    }

    sendAction (action) {
        if (loging) console.log("WebSocket action send:", action);
        this.sendedActions.push(action);
        if (this.connected) this.websocket.send(JSON.stringify(action));
    }

    reSendActions(){
        for (let item in this.sendedActions){
            if (loging) console.log("WebSocket action resend:", this.sendedActions[item]);
            if (this.connected) this.websocket.send(JSON.stringify(this.sendedActions[item]));
        }
    }

    async onMessageHandler (event) {
        if (loging) console.log("WebSocket connection message:", event);
        try{
            let action_res = JSON.parse(event.data);
            if ("id" in action_res) this.sendedActions=this.sendedActions.filter((item)=>{return item.id!=action_res.id});
    
            if (action_res.id in this.responseFuncById){
                this.responseFuncById[action_res.id](action_res);
            } 
            else{
                if (action_res.name in this.actionEventHandlers){
                    this.actionEventHandlers[action_res.name](action_res);
                } else{
                    console.log("Not resolve actionEventHandler", action_res);
                }
            }
        } 
        catch (e){
            console.log(e);
        }
    }

    actionRequest(action){
        return new Promise((function (resolve, reject) {
            this.responseFuncById[action.id] = (action_res) =>{
                if (action_res.status_code==200){
                    resolve(action_res);
                }
                else{
                    reject(action_res);
                }
            }
            this.sendAction(action);
        }).bind(this));
    }
}
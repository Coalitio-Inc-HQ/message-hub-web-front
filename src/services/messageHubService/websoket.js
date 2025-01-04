// import { uuidv4 } from "@/utilities/uuid";
import { ref, } from 'vue';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const loging = true;

const WS_URL = process.env.VUE_APP_WS_URL;
const reconnection_delay = 30;

let reconnect = false;
let last_connection = null;
let websocket = null;
let websocket_token = null;

export let openEventHandlers = [resendMessages,
    // ()=>{
    //     actionRequest({
    //         id: uuidv4(),
    //         name: 'get_user_info',
    //         body: {}
    //     }).then((res)=>{
    //         console.log("asd",res);
    //     })
    // }
];
export let closeEventHandlers = [retrue];
export let errorEventHandlers = [retrue];
export let fatalCloseEventHandlers = [];
export let connected = ref(false);

let sendedActions = [];
let responseFuncById = {};
export let actionEventHandlers = {};

export function connect(token, reconnected = true){
    reconnect = reconnected;
    last_connection = new Date();
    websocket_token = token;
    websocket = new WebSocket(WS_URL + "?token=" + token);
    setUpHandler(websocket);
}

async function retrue(){
    if (reconnect && (new Date() - last_connection)> reconnection_delay * 1000) {
        websocket = new WebSocket(WS_URL + "?token=" + websocket_token);
        setUpHandler(websocket);
    } else{
        await sleep(reconnection_delay * 1000); 
    }
}

function resendMessages(){
    for (let item in sendedActions){
        sendMessage(sendedActions[item]);
    }
}

function setUpHandler(websocket){
    websocket.onclose = onCloseHandler;
    websocket.onopen = onOpenHandler;
    websocket.onerror = onErrorHandler;
    websocket.onmessage = onMessageHandler;
}

async function onOpenHandler (event) {
    if (loging) console.log("WebSocket connection opened:", event);

    connected.value = true;

    for (let item in openEventHandlers){
        if (openEventHandlers[item].constructor.name === "AsyncFunction"){
            await openEventHandlers[item](event);
        } else{
            openEventHandlers[item](event);
        }
    }
}

async function onCloseHandler (event) {
    if (loging)  console.log("WebSocket connection closed:", event);

    connected.value = false;

    for (let item in closeEventHandlers){
        if (closeEventHandlers[item].constructor.name === "AsyncFunction"){
            await closeEventHandlers[item](event);
        } else{
            closeEventHandlers[item](event);
        }
    }
}

async function onErrorHandler (event) {
    if (loging) console.log("WebSocket connection error:", event);

    connected.value = false;

    for (let item in closeEventHandlers){
        if (closeEventHandlers[item].constructor.name === "AsyncFunction"){
            await closeEventHandlers[item](event);
        } else{
            closeEventHandlers[item](event);
        }
    }
}

async function onMessageHandler (event) {
    if (loging) console.log("WebSocket connection message:", event);
    try{
        let action_res = JSON.parse(event.data);
        if ("id" in action_res) sendedActions=sendedActions.filter((item)=>{return item.id!=action_res.id});

        if (action_res.id in responseFuncById){
            responseFuncById[action_res.id](action_res);
        } 
        else{
            if (action_res.name in actionEventHandlers){
                actionEventHandlers[action_res.name](action_res);
            } else{
                console.log("Not resolve actionEventHandler", action_res);
            }
        }
    } 
    catch (e){
        console.log(e);
    }
}

async function sendMessage (action) {
    if (loging) console.log("WebSocket action send:", action);
    sendedActions.push(action);
    if (connected.value) websocket.send(JSON.stringify(action));
}

export function actionRequest(action){
    return new Promise(function (resolve, reject) {
        responseFuncById[action.id] = (action_res) =>{
            if (action_res.status_code==200){
                resolve(action_res);
            }
            else{
                reject(action_res);
            }
        }
        sendMessage(action);
    });
}
import { uuidv4 } from '@/utilities/uuid';
import {ref} from 'vue';

const loging = false;

class MessageHubServiceWebsocket{
    /**
     * 
     * @param {*} reconnection_delay Задержка переподключения при null отсутвует.
     */
    constructor(reconnection_delay=1){
        this.reconnection_delay = reconnection_delay; // Задержка переподключения
        this.reconnection_temer = null; // Таймер переподключения

        this.url = null; // Url подключения
        this.websocket = null; // Websocket
        this.connected = ref(false); // Реактивное состояние подключения. Только для UI. Для логики нужно брать из websocket.

        this.openEventHandlers = []; // Реакция на открытие сокета. Активируется и при переподключении
        this.reconnect = false; // Флаг переподключения
        this.reOpenEventHandlers = []; // Реакция на переоткрытие сокета.
        this.messageEventHandlers = []; // Обработчики сообщений
        this.closeEventHandlers = []; // Реакции на закрытие сокета
        this.errorEventHandlers = []; // Реакции на ошибки
    }

    /**
    * Подключение к url
    */
    connect(url){
        this.url = url;

        this.last_connection = new Date();
        this.websocket = new WebSocket(url);
        this.setUpHandlers(this.websocket);
    }

    /**
    * Служебный метод установки обработчиков событий websocket.
    */
    setUpHandlers(ws){
        ws.onopen = this.onOpenHandler.bind(this);
        ws.onmessage = this.onMessageHandler.bind(this);
        ws.onclose = this.onCloseHandler.bind(this);
        ws.onerror = this.onErrorHandler.bind(this);
    }

    /**
    * Функция вызова обработчиков открытия сокета.
    * В случае this.reconnect ещё вызывает обработчики переподключения.
    */
    async onOpenHandler (event) {
        if (loging) console.log("WebSocket connection opened:", event);
    
        this.connected.value = true;
    
        for (let item in this.openEventHandlers){
            if (this.openEventHandlers[item].constructor.name === "AsyncFunction"){
                await this.openEventHandlers[item](event);
            } else{
                this.openEventHandlers[item](event);
            }
        }

        if (this.reconnect){
            for (let item in this.reOpenEventHandlers){
                if (this.reOpenEventHandlers[item].constructor.name === "AsyncFunction"){
                    await this.reOpenEventHandlers[item](event);
                } else{
                    this.reOpenEventHandlers[item](event);
                }
            }
        }
    }

    /**
    * Функция вызова обработчиков сообщений сокета.
    */
    async onMessageHandler (event) {
        if (loging) console.log("WebSocket connection new messge:", event);
    
        for (let item in this.messageEventHandlers){
            if (this.messageEventHandlers[item].constructor.name === "AsyncFunction"){
                await this.messageEventHandlers[item](event);
            } else{
                this.messageEventHandlers[item](event);
            }
        }
    }

    /**
    * Функция вызова обработчиков закрытия сокета.
    * Вызывает автоматическое переподключение.
    */
    async onCloseHandler (event) {
        if (loging) console.log("WebSocket connection closed:", event);
    
        this.connected.value = false;
    
        for (let item in this.closeEventHandlers){
            if (this.closeEventHandlers[item].constructor.name === "AsyncFunction"){
                await this.closeEventHandlers[item](event);
            } else{
                this.closeEventHandlers[item](event);
            }
        }

        if (this.reconnection_delay) this.reConnect();
    }

    /**
    * Функция вызова обработчиков ошибок сокета.
    * Вызывает автоматическое переподключение.
    */
    async onErrorHandler (event) {
        if (loging) console.log("WebSocket connection error:", event);
    
        this.connected.value = false;
    
        for (let item in this.closeEventHandlers){
            if (this.closeEventHandlers[item].constructor.name === "AsyncFunction"){
                await this.closeEventHandlers[item](event);
            } else{
                this.closeEventHandlers[item](event);
            }
        }

        if (this.reconnection_delay) this.reConnect();
    }

    /**
    * Функция переподключения сокета.
    * Служебная функция.
    */
    reConnect(){
        if (this.reconnection_timer) return;
        
        this.reconnection_timer = setTimeout(() => {
            if (loging) console.log("Reconnecting WebSocket...");
            this.connect(this.url);
            this.reconnection_timer = null;
        }, this.reconnection_delay * 1000);
    }

    /**
    * Функция отправки сообщения.
    * @param {*} message_any луюой объект, будет преобразован в JSON.
    */
    sendAction (message_any) {
        if (loging) console.log("WebSocket action send:", message_any);
        this.websocket.send(JSON.stringify(message_any));
    }
}


/**
* Абстрактный класс маршрутизатора событий.
*/
export class MessageHubServiceEventRouterBase{
    /**
    * @param {*} distributor распределитель. Осуществляет маршрутизацию событий. Сигнатура: (event, tempEvantData)
    */
    constructor(distributor){
        this.middlewares = [];
        this.distributor = distributor;
    }

    /**
    * Вызов события.
    * @param {*} event собыитие.
    * @param {*} tempEvantData временные данные при вызове события.
    */
    call(event, tempEvantData){
        this.call_middleware(event, tempEvantData, this.middlewares.length-1);
    }
    
    /**
    * Вызов middleware с последующим вызовом распределителя.
    * @param {*} event собыитие.
    * @param {*} tempEvantData временные данные при вызове события.
    */
    call_middleware(event, tempEvantData, num){
        if (num === -1){
            this.distributor(event, tempEvantData);
        }
        else{
            this.middlewares[num](event, tempEvantData, this.call_middleware(event, tempEvantData, num-1));
        }
    }

    /**
    * Добовляет middleware.
    * @param {*} middleware middleware сигнатура: (event, tempEvantData, next). next - следующий обработчик.
    */
    use(middleware){
        this.middlewares.push(middleware);
    }
}

/**
* Класс маршрутизатора событий по полю.
*/
export class MessageHubServiceEventRouterByAttribute extends MessageHubServiceEventRouterBase{
    /**
     * 
     * @param {*} routedAttribute Атрибут маршрутизации.
     */
    constructor(routedAttribute){
        super((event, tempEvantData)=>{
            let obj = event;
            this.routedPath.forEach(element => {
                obj = obj[element];
                if (obj===undefined) throw new Error(`Недопустимый путь ${this.routedAttribute} для события: ${JSON.stringify(event)}`);
            });

            let handler = this.routedMap.get(obj);
            if (handler){
                handler(event, tempEvantData);
            }
            else{
                if (this.defaultHandler) this.defaultHandler(event, tempEvantData);
                else if (loging) console.log(`Не найден обработчик для события ${JSON.stringify(event)}`);
            }
        });

        this.routedAttribute = routedAttribute;
        this.routedPath = routedAttribute.split(".");
        this.routedMap = new Map();
        this.defaultHandler = null;
    }

    /**
     * Добавляет маршрут.
     * @param {*} handler обработчик события. Моежт быть другой MessageHubServiceEventRouterBase.call(). Или собственный с сигнатурой (event, tempEvantData).
     * @param {*} key ключ по которому определяется обработчик.
     */
    addRoute(key, handler){
        this.routedMap.set(key, handler);
    }
}


export class MessageHubService extends MessageHubServiceWebsocket{
    /**
     * 
     * @param {MessageHubServiceEventRouterBase} eventRouter Маршутизатор событий класса MessageHubServiceEventRouterBase.
     * @param {Function} authGetTokenFunc Функция получения токена аутентификации.
     * @param {Function} authRetryFunc Функция обновления токена аутентификации.
     * @param {Number} reconnection_delay Задержка переподключения. Если не нужно переподключение - null.
     */
    constructor(eventRouter, authGetTokenFunc, authRetryFunc, reconnection_delay=1){
        super(reconnection_delay);
        this.openEventHandlers.push(this.onOpenHandler);

        this.eventRouter = eventRouter; // Маршутизатор событий.
        this.authGetTokenFunc = authGetTokenFunc; // Функция получения токена
        this.authRetryFunc = authRetryFunc; // Обновления токена

        this.changeAuthPermissionsEventHandlers = []; // Обработчики изменения разрашений
        this.failAuthEventHandlers = []; // Обработчики события ошибки аутентификации.
        this.failSincEventHandlers = []; // Обработчики события ошибки синхронизации состояния.

        this.sendedActions = new Map(); // Отправленные сообщения.
        this.sendedActionsRetryse = new Map(); // колличество попыток переаутентификации для запроса
        this.retryseCountToFailAuthEvent = 2; // колличество попыток переаутентификации до вызова события failAuthEventHandlers
        this.responseFuncById = new Map(); // Функции возращения ответов на запросы.

        this.sincEventId = false; // Индентификатор ответа, ожидаемого для снхранизации событий.
        this.sincEventArray = [] // Хранилище событий, произощедших во время синхранизации.
        this.lastEventId = null; // Последнее полученное событие

        // this.ignoreMessageIds = new Set(); // Индентификаторы событий которые нужно игнорировать.
    }

    /**
    * Функция отправки сообщения. Автоматически подстовляет токен.
    * @param {*} message_any луюой объект, будет преобразован в JSON.
    */
    sendAction(action){
        action.token = this.authGetTokenFunc();
        super.sendAction(action);
    }

    /**
     * Отправляет запрос на MH
     * @param {*} action Действие
     * @param {*} save указывает гарантировать ли отправку сообщения
     */
    actionRequest(action, save = true){
        return new Promise(
            (function (resolve, reject) 
            {
                this.responseFuncById.set(action.id, 
                        (action_res) =>{
                        if (save) this.sendedActions.delete(action.id);
                        if (action_res.status_code>=200 && action_res.status_code<300){
                            resolve(action_res);
                        }
                        else{
                            reject(action_res);
                        }

                        this.responseFuncById.delete(action.id);
                    }
                )
                if (save) this.sendedActions.set(action.id, action);
                if (!save && this.sincEventId || this.websocket.readyState === WebSocket.OPEN){
                    this.sendAction(action);
                }
            }
        ).bind(this));
    }


    async onOpenHandler (event) {
        const sincId = uuidv4();
        this.sincEventId = sincId;

        let response = await this.actionRequest(
            {
                id: sincId,
                type: 'Request',
                obj:{
                    name: 'events.sinc',
                    body: {
                        last_event_id: this.lastEventId,
                    }
                }
            }
            ,false);
        
        if (response.status_code===200){
            let body = response.body;
            if (this.lastEventId===null){
                // инициация, известных событий нет
                this.lastEventId=body.last_event_id;

                // Обработка накопленных событий
                this.sincEventArray.forEach(element => {
                    this.lastEventId=element.event_id;
                    this.eventRouter.call(element, {});
                });
                this.sincEventArray= [];
            } else{
                if (body.find_event){
                    // Синхронизация состояния
                    this.lastEventId=body.last_event_id;

                    // Устранение дублей событий
                    const mergedEvents = new Map([...body.events, ...this.sincEventArray].map(event => [event.event_id, event]));

                    // Обработка накопленных событий
                    for (const [key, value] of mergedEvents){
                        void key
                        this.lastEventId=value.event_id;
                        this.eventRouter.call(value, {});
                    }
                    this.sincEventArray= [];
                }
                else {
                    // Ошибка синхронизации состояния
                    for (let item in this.failSincEventHandlers){
                        if (this.failSincEventHandlers[item].constructor.name === "AsyncFunction"){
                            await this.failSincEventHandlers[item](event);
                        } else{
                            this.failSincEventHandlers[item](event);
                        }
                    }
                    return;
                }
            }
        }
        this.sincEventId = null;
        this.reSendActions();
    }


    reSendActions(){
        for (const [key, value] of this.sendedActions) {
            void key
            if (loging) console.log("WebSocket action resend:", value);
            this.sendAction(value);
        }
    }


    async onMessageHandler (msg) {
        if (loging) console.log("WebSocket message:", msg);

        try{
            let action_res = JSON.parse(msg.data);

            if (this.sincEventId){
                if (action_res.id===this.sincEventId){
                    this.responseFuncById.get(action_res.id)(action_res.obj);
                    this.responseFuncById.delete(action_res.id);
                } else{
                    if (action_res.type==='Event') this.sincEventArray.push(action_res.obj);
                }
            }
            else{
                if (action_res.type==='Response'){
                    // Ошибка аутентификации
                    if (action_res.obj.status_code===401){
                        let retruse = this.sendedActionsRetryse.get(action_res.id);
                        if (retruse>this.retryseCountToFailAuthEvent){
                            for (let item in this.failAuthEventHandlers){
                                if (this.failAuthEventHandlers[item].constructor.name === "AsyncFunction"){
                                    await this.failAuthEventHandlers[item]();
                                } else{
                                    this.failAuthEventHandlers[item]();
                                }
                            }
                            return;
                        } else{
                            if (this.authRetryFunc.constructor.name === "AsyncFunction"){
                                await this.authRetryFunc();
                            } else{
                                this.authRetryFunc();
                            }
                            this.sendedActionsRetryse.set(action_res.id,(retruse?retruse:0)+1);
                        }
                    }


                    this.responseFuncById.get(action_res.id)(action_res.obj);
                    this.responseFuncById.delete(action_res.id);
                    this.sendedActionsRetryse.delete(action_res.id);


                    //Если иземнились разрещения пользователя
                    if (action_res.obj.permisions){
                        for (let item in this.changeAuthPermissionsEventHandlers){
                            if (this.changeAuthPermissionsEventHandlers[item].constructor.name === "AsyncFunction"){
                                await this.changeAuthPermissionsEventHandlers[item](action_res.obj.permisions);
                            } else{
                                this.changeAuthPermissionsEventHandlers[item](action_res.obj.permisions);
                            }
                        }
                    }
                }
                else if(action_res.type==='Event'){
                    this.lastEventId = action_res.obj.event_id;
                    this.eventRouter.call(action_res.obj, {});
                } else{
                    if (loging) console.log("Not resolve actionEventHandler", action_res);
                }
            }    
        }
        catch (e){
            console.log(e);
        }
    }
}


    /*
        {
            id: sincId,
            type: 'Response',
            obj: {
                name: 'sinc_events',
                status_code: ...,
                body: {
                    find_event: bool,
                    events: [],
                    last_event_id: uuid | null,
                },
                error: ...,
            }
        }
    */


    /*
        {
            id: uuidv4(),
            type: 'Request',
            obj:{
                name: 'get_last_evant_id',
                body: {}
            }
            
            token: ...,
        }

        {
            id: uuidv4(),
            type: 'Response',
            obj: {
                name: 'get_last_evant_id',
                status_code: ...,
                body: {},
                error: ...,
                permisions: {} | null,
            }
        }
        
        {
            id: uuidv4(),
            type: 'Event',
            obj:{
                event_id: uuidv4(),
                name: '...',
                body: {}
            }
        }
    */
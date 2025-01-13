let sendedActions = [];

export function resendActions(context){
    for (let item in sendedActions){
        context.connection.send(JSON.stringify(sendedActions[item]));
    }
    sendedActions = [];
}

export function addAction(action){
    sendedActions.push(action);
}

export function removeAction(id){
    let index = sendedActions.findIndex((item)=>id == item.id);
    if (index>-1){
        sendedActions.splice(index, 1);
    }
}
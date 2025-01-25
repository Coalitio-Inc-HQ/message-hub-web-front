import { uuidv4 } from '@/utilities/uuid';

const loging = true;
/*
user{
    loaded: bool
    name: str
    id: int
}
*/

export function refreshUser(context, MessageHubService){
    context.user.loaded = false;
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'get_user_info',
            body: {}
        }
    ).then((action_res)=>{
        context.user.name = action_res.body.user_info.name;
        context.user.id = action_res.body.user_info.id;
        context.user.loaded = true;
        if (loging) console.log("refreshUser", context.user);
    })
}
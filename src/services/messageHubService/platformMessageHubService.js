import { uuidv4 } from '@/utilities/uuid';

const loging = true;
/*
platforms{
    loaded: bool,
    platforms:{
        id: {
            id: int,
            name: str
        }
    }
}
*/

export function refreshPlatforms(context, MessageHubService){
    context.platforms.loaded = false;
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'get_platforms',
            body: {}
        }
    ).then((action_res)=>{
        let platforms = action_res.body.platforms; 
        let pl = {};
        platforms.forEach((item)=>{
            pl[item.id] = item
        })

        context.platforms.platforms = pl;
        context.platforms.loaded = true;
        if (loging) console.log("refreshPlatforms", context.platforms);
    })
}

// import { uuidv4 } from '@/utilities/uuid';

// const loging = true;
/*
user{
    loaded: bool
    name: str
    id: int
}
*/

// export function refreshUser(context, MessageHubService){
//     context.user.loaded = false;
//     MessageHubService.actionRequest(
//         {
//             id: uuidv4(),
//             name: 'get_user_info',
//             body: {}
//         }
//     ).then((action_res)=>{
//         context.user.name = action_res.body.user_info.name;
//         context.user.id = action_res.body.user_info.id;
//         context.user.is_completed_tutorial = action_res.body.user_info.is_completed_tutorial;
//         context.user.loaded = true;
//         if (loging) console.log("refreshUser", context.user);
//     })
// }

// export function setIsCompletedTutorialUser(context, MessageHubService){
//     MessageHubService.actionRequest(
//         {
//             id: uuidv4(),
//             name: 'set_is_completed_tutorial',
//             body: {
//                 "is_completed_tutorial": true,
//             }
//         }
//     ).then((action_res)=>{
//         if (loging) console.log("set_is_completed_tutorial", action_res);
//     })
// }
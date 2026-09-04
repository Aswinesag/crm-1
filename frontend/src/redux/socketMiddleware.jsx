// import {setUsers} from './userSlice.jsx'
import {setLogs} from './logSclice.jsx'
import {setLeads} from './leadSlice.jsx'
import {
    // userSocket,
    leadSocket,logSocket} from '../api/socketIO.jsx'

const socketMiddleware = (store) => {
    // const me = store.getState().users.currentUser
    // const uSocket = userSocket({userId: me?._id})

    // uSocket.on('update',(users)=>{
    //     store.dispatch(setUsers(users))
    // });
    leadSocket.on('update',(leads)=>{
        store.dispatch(setLeads(leads))
    });
    logSocket.on('update',(logs)=>{
        console.log(logs)
        store.dispatch(setLogs(logs))
    });
    return (next) => (action) => {
        return next(action);
    };
}

export default socketMiddleware;
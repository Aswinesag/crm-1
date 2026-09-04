import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice.jsx'
import leadReducer from './leadSlice.jsx'
import logReducer from './logSclice.jsx'
import remainderReducer from './remainderSlice.jsx'
// import socketMiddleware from './socketMiddleware.jsx'

const store = configureStore({
    reducer: {
        users: userReducer,
        leads: leadReducer,
        logs: logReducer ,
        remainders: remainderReducer,
    },
    // middleware: (getDefaultMiddleware) => 
    //     getDefaultMiddleware().concat(socketMiddleware)
})

export default store;
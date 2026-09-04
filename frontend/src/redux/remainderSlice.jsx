import { createSlice } from '@reduxjs/toolkit'


const RemainderSlice = createSlice({
    name: "remainders",
    initialState: {
        remainders: []
    },
    reducers: {
        setRemainders: (state,action) => {
            state.remainders = action.payload;
        },
        addReminder: (state, action) => {
            state.remainders.push(action.payload);
        }
    }
})

export const {setRemainders,addReminder} = RemainderSlice.actions;

export default RemainderSlice.reducer;
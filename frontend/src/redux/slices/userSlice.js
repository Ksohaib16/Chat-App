import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {
        id: '',
        token: '',
        name: '',
        email: '',
        number: '',
        status: '',
    },
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user.id = action.payload.id;
            state.user.token = action.payload.token;
            state.user.name = action.payload.name;
            state.user.email = action.payload.email;
            state.user.number = action.payload.number;
            state.user.status = action.payload.status;
        },
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;

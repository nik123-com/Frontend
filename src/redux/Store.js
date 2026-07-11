import {configureStore} from '@reduxjs/toolkit'
import Reducer from './Reducer'
const Store = configureStore({
    reducer: {
        counter: Reducer
    },
})

export default Store
const intialState = {
    count: 0
}

export default function Reducer(state = intialState, action){

    if(action.type == "inc"){
        return{...state,count: state.count + 1 }
    }
    if(action.type == "dec"){
        return{...state,count: state.count - 1 }
    }else
    {
        return state
    }
}
import { createContext, useContext, useState } from "react";
// import axios = require("axios");
import axios from "axios";
// const { useNavigate } = require("react-router-dom");
import { useNavigate } from "react-router-dom";
import {status} from "http-status";
// import { param } from "../../../backend/src/routes/userRoutes";
// const {status} = require("http-status");
import server from "../../environment";
 const AuthContext = createContext({});

const client = axios.create({
    baseURL : `${server}/users`
});

const AuthProvider = ({children}) => {
    const authContext = useContext(AuthContext);

    const [userData , setUserData] = useState(authContext);


    const router = useNavigate();

    const handleRegister = async (name,userName,password) => {
        try {
            let request = await client.post("/register" , {
                name,
                userName,
                password
            });

            if(request.status === status.CREATED){
                return request.data.message;
            }

        } catch (error) {
            throw error;
        }
    };

    const handleLogin = async (userName,password) => {

        try {
            let request = await client.post("/login" , {
                userName,
                password
            });

            if(request.status === status.OK){
                localStorage.setItem("token",request.data.token);
                router("/home");
                // return request.data.message
            }else if(request.status === status.UNAUTHORIZED){
                return request.data.message;
            }
        } catch (error) {
            throw error;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params :{
                    token :localStorage.getItem("token"),

                }
            });
            return request.data
        } catch (error) {
            throw error
        }
    }


    const addUserHistory = async (meetingCode) => {
        try{
            const request = await client.post("/add_to_activity" , {
                token : localStorage.getItem("token"),
                meeting_code : meetingCode
            });
            return request;

        }catch (e) {
            throw e;
        }
    }


    const data = {
        userData , setUserData , getHistoryOfUser, addUserHistory ,  handleRegister ,handleLogin
    }
    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};

export  {AuthProvider , AuthContext} ;
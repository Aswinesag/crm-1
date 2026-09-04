import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import axiosInstance from "../api/axiosInstance.jsx";
import { postLogin } from "../redux/userSlice.jsx";
import { useDispatch } from "react-redux";
import { setLogs } from "../redux/logSclice.jsx";
import { fetchEngineersWithTaskCount, fetchLeads } from "../api/fetchdata.jsx";
import { setEngineerTaskCounts, setLeads } from "../redux/leadSlice.jsx";
import { setUsers } from "../redux/userSlice.jsx";
import { fetchRemindersApi } from "../api/fetchdata.jsx";
import { setRemainders } from "../redux/remainderSlice.jsx";
// import {initSockets} from "../api/socketIO.jsx";
// import { useSelector } from 'react-redux'
// import { io } from 'socket.io-client'
// import { deleteUser, postUser, putUser, setOnlineStatus, setUsers } from '../redux/userSlice.jsx'
// import { setLeads } from '../redux/leadSlice.jsx'

const Layout = () => {
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // const me = useSelector((state) => state.users.currentUser)

  // useEffect(()=>{
  //   if(!me?._id) return;
  //   const userSocket = io('http://localhost:5000/user',{query: {userId: me?._id},withCredentials: true})

  //   userSocket.on('connect_error', (error) => {
  //     console.error('Socket connection failed:', error)
  //   })
  //   userSocket.on('connect', () => {
  //     console.log('Socket connected successfully with userId:', me._id)
  //   })
  //   userSocket.on('status_update',(data)=> {
  //     console.log(`your status: ${data}`)
  //   })
  //   userSocket.on('user_online',(data)=>{
  //     console.log(`user came online : ${data.userId}`)
  //     dispatch(setOnlineStatus({userId: data.userId,status: 'Online'}))
  //   })
  //   userSocket.on('user_offline',(data)=>{
  //     console.log(`user went offline : ${data.userId}`)
  //     dispatch(setOnlineStatus({userId: data.userId,status: 'Offline'}))
  //   })
  //   userSocket.on('user_created',(newUser)=>{
  //     console.log(`new user created : ${newUser}`)
  //     dispatch(postUser({data: newUser}))
  //   })
  //   userSocket.on('user_updated',(updatedUser)=>{
  //     console.log(`user updated : ${updatedUser}`)
  //     dispatch(putUser({data: updatedUser}))
  //   })
  //   userSocket.on('user_deleted',(data)=>{
  //     console.log(`user deleted : ${data.userId}`)
  //     dispatch(deleteUser({ data: {_id : data.userId} }))
  //   })
  //   userSocket.on('disconnect',(reason)=>{
  //     console.log(`user socket disconnected : ${reason}`)
  //     dispatch(setOnlineStatus({userId: me?._id,status: 'Offline'}))
  //   })
  //   return () => {
  //     userSocket.disconnect()
  //   }
  // },[me?._id,dispatch])

  // useEffect(()=>{
  // const logSocket = io('http://localhost:5000/log',{withCredentials: true})
  // const leadsSocket = io('http://localhost:5000/lead',{withCredentials: true})
  // logSocket.on('update',(logs)=> {
  //   dispatch(setLogs(logs))
  // })
  // leadsSocket.on('update',(leads)=> {
  //   dispatch(setLeads(leads))
  // })
  // return () => {
  //   logSocket.disconnect()
  //   leadsSocket.disconnect()
  // }
  // },[])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leads = await fetchLeads();
        dispatch(setLeads(leads));

        const engineersWithTaskCount = await fetchEngineersWithTaskCount();
        dispatch(setEngineerTaskCounts(engineersWithTaskCount));

        const remainders = await fetchRemindersApi();
        console.log("Remainders:", remainders);
        dispatch(setRemainders(remainders));

        const fetchUsers = async () => {
          try {
            const { data } = await axiosInstance.get("/users");
            dispatch(setUsers(data.data));
            

          } catch (err) {
            console.log(`Fetching all users error : ${err.message}`);
          }
        };
        fetchUsers();
      } catch (err) {
        console.log(`fetching all data error : ${err}`);
      }
    };
    fetchData();
    const fetchActivityLogs = async()=> {
      try{
        const {data} = await axiosInstance.get('/logs')
        dispatch(setLogs(data.data))
      }catch(err){
        console.log(`Fetching logs error : ${err.message}`)
      }
    }
    fetchActivityLogs()
  }, [dispatch]);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} sidebarExpanded={sidebarExpanded}      setSidebarExpanded={setSidebarExpanded}/>

      <div className="flex flex-col flex-1">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <main className="flex-1 p-4 bg-gray-100 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

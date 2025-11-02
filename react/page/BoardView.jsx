import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GET_POST = import.meta.env.VITE_GET_POST;
const SET_APPROVE = import.meta.env.VITE_SET_APPROVE;



const BoardView = () => {
  const { postnum } = useParams();
  const [post, setPost] = useState([]);
  const nav = useNavigate();

  const authContext = useAuth();

  useEffect(()=>{
    axios.get(GET_POST, {params : {postnum}})
    .then((res)=>{
      const [result] = res.data;
      
      setPost(result)
    })
    .catch((err)=>{
      console.log(err);
    })

  }, [])

  const setApprove = async () => {
    axios.patch(SET_APPROVE, {postnum : postnum})
    .then((res)=>{})
    .catch((err)=>{
      console.log(err);
    })
    alert("승인됨");
    nav('/board');
  }

  return (
    <div>
      <div>

        <h2>{post.title}</h2>
        <hr></hr>

        <div>
        <p>{post.text}</p>
        </div>

        {(authContext.isLoggedIn && authContext.type == "admin" ) && <Button onClick = { setApprove }>승인하기</Button>}
      </div>
    </div>
  )
}

export default BoardView
import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate,useLocation } from "react-router-dom";
import { Button } from "@mui/material";


function EditAll() {
    const location=useLocation()
    const data=location.state;
    
    const [controller] = useMaterialUIController();
    const { miniSidenav } = controller;
    const navigate = useNavigate();
    const [name, setName] = useState('');

    useEffect(()=>{
        setName(data.Attribute_name)
    },[])

    const SaveValue=async()=>{
        try{
            if(!name){
                alert('Invalid Name')
                return;
            }
            const result=await fetch(`https://node-m8jb.onrender.com/update-attribute/${data._id}`,{
                method:'PUT',
                body:JSON.stringify({
                    Attribute_name:name
                }),
                headers: { 'Content-Type': 'application/json' }
            })

            if(result.status===200){
                alert('Updated Success')
                navigate(-1)
            }
        }
        catch(err){
            console.log(err);      
        }
    }
    return (
        <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
            <div className="container">
               
                <div className="inner-div" style={{width:'100%'}}>
                    <div className="form-header">UPDATE ITEM ATTRIBUTE</div>

                    <div >
                        <div >
                            <label> Name</label>
                            <input type="text" placeholder="Insert Attribute Name" 
                            value={name}
                            onChange={(e)=>setName(e.target.value)} style={{ marginTop: '10px' }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: 'center', alignItems: 'center', gap: '30px', marginTop: '40px' }}>
                        <Button style={{ backgroundColor: "#00c853", color: "white", width: '100px', height: '35px', borderRadius: '15px', fontSize: '15px', }}
                         onClick={SaveValue}
                        >
                            SAVE
                        </Button>
                        <Button style={{ backgroundColor: "#00c853", color: "white", width: '100px', height: '35px', borderRadius: '15px', fontSize: '15px' }}
                        onClick={()=>navigate(-1)}
                        >
                            BACK
                        </Button>
                    </div>
                </div>
            </div>
        </MDBox>
    );
}

export default EditAll;
import React, { useEffect, useState } from "react";
import "../../Categories/Addcategories.css";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const AddStoreCat = () => {

    const navigate = useNavigate();
    const [mainCategories, setMainCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [data, setData] = useState([])
     const [storeId, setStoreId] = useState('');

    const [controller] = useMaterialUIController();
    const { miniSidenav } = controller;


    useEffect(() => {
        const id = localStorage.getItem('storeId')
        setStoreId(id)
      }, [])

    useEffect(() => {
        const getMainCategory = async () => {
            try {
                const data = await fetch(`${process.env.REACT_APP_API_URL}/getMainCategory`);
                if (data.status === 200) {
                    const result = await data.json();
                    setMainCategories(result.result);
                    //   const allSubCategories = result.result.flatMap(cat => cat.subcat || []);
                    //   setSubCategories(allSubCategories);
                    // console.log("Sub", allSubCategories);
                } else {
                    console.log('Something Wrong');
                }
            } catch (err) {
                console.log(err);
            }
        };
        getMainCategory();
    }, []);


    const handleCategory = (e) => {
        const catId = e.target.value;
        if (catId === "---Select Categories---" || data.some(cat => cat._id === catId)) return;

        const categoryObj = mainCategories.find(cat => cat._id === catId);
        if (categoryObj) {
            setData([...data, categoryObj]);
        }
    }

    const handleRemoveCategory = (id) => {
        setData(data.filter(cat => cat._id !== id));
    };


    const handleSubmit=async()=>{

        const formdata=new FormData();
         const categoryIds = data.map(cat => cat._id);
        try{
           const result=await fetch(`${process.env.REACT_APP_API_URL}/addCategoryInStore/${storeId}`,{
            method:"PUT",
             body: JSON.stringify({ Category: categoryIds }),
             headers:{
                "Content-Type":"application/json"
             }
           })

           if(result.status===200){
            alert('Category Added Successfully')
            navigate(-1)
           }
           else{
            alert('Something Wrong')
           }
        }
        catch(err){
            console.log(err);          
        }
    }

    return (
        <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "20px" }}>
            <div style={{
                width: "85%",
                margin: "0 auto",
                borderRadius: "10px",
                padding: "10px",
                border: '1px solid gray',
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
            }}>
                <h2 style={{ textAlign: "center", marginBottom: "30px", fontWeight: 'bold', color: 'green' }}>ADD CATEGORY TO STORE</h2>
                <div>
                    <label>Select Category</label>
                    <select
                        value={selectedCategory}
                        onChange={handleCategory}
                    >
                        <option>---Select Categories---</option>
                        {
                            mainCategories.map((item, index) => (
                                <option key={item._id} value={item._id}>{item.name}</option>
                            ))
                        }
                    </select>
                </div>
                {/* Render selected categories as tags */}
                <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {data.map((cat) => (
                        <div
                            key={cat._id}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "white",
                                borderRadius: "20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "14px",
                                boxShadow: "1px 2px 6px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            {cat.name}
                            <button
                                onClick={() => handleRemoveCategory(cat._id)}
                                style={{
                                    background: "red",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px"
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "center", marginTop: '30px' }}>
                    <Button onClick={handleSubmit} style={{ backgroundColor: "#00c853", color: "white", marginRight: "20px" }}>SAVE</Button>
                    <Button onClick={() => navigate(-1)} style={{ backgroundColor: "#00c853", color: "white" }}>BACK</Button>
                </div>
            </div>
        </MDBox>
    );
};

export default AddStoreCat;
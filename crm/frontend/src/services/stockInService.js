import axios from "axios";

const API_URL="http://localhost:5002/api/stock-ins";

const getToken=()=>{
return localStorage.getItem("token");
};

const getConfig=()=>{
return{
headers:{
Authorization:`Bearer ${getToken()}`
}
};
};

export const createStockIn=async(stockInData)=>{
const response=await axios.post(
API_URL,
stockInData,
getConfig()
);
return response.data;
};

export const getStockIns=async(
page=1,
limit=10,
search=""
)=>{
const response=await axios.get(
`${API_URL}?page=${page}&limit=${limit}&search=${search}`,
getConfig()
);
return response.data;
};

export const getStockInById=async(id)=>{
const response=await axios.get(
`${API_URL}/${id}`,
getConfig()
);
return response.data;
};

export const updateStockIn=async(
id,
stockInData
)=>{
const response=await axios.put(
`${API_URL}/${id}`,
stockInData,
getConfig()
);
return response.data;
};

export const activateStockIn=async(id)=>{
const response=await axios.patch(
`${API_URL}/${id}/activate`,
{},
getConfig()
);
return response.data;
};

export const deactivateStockIn=async(id)=>{
const response=await axios.patch(
`${API_URL}/${id}/deactivate`,
{},
getConfig()
);
return response.data;
};

export const deleteStockIn=async(id)=>{
const response=await axios.delete(
`${API_URL}/${id}`,
getConfig()
);
return response.data;
};
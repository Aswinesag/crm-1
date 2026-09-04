import axiosInstance
from "./axiosInstance";


// AUTO GENERATE PR

export const autoGeneratePR = async () => {

    const response =
        await axiosInstance.get(
            "/procurement/auto-pr"
        );

    return response.data;
};



// GET ALL PR

export const getAllPR = async () => {

    const response =
        await axiosInstance.get(
            "/procurement/all-pr"
        );

    return response.data;
};



// APPROVE PR

export const approvePR = async (id) => {

    const response =
        await axiosInstance.put(
            `/procurement/approve-pr/${id}`
        );

    return response.data;
};
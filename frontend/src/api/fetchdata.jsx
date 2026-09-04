// src/utils/fetchLeads.js
import axiosInstance from '../api/axiosInstance'; // adjust path per your project

// Helper function to convert date fields in a lead object to ISO strings
const convertDatesToStrings = (lead) => {
  return {
    ...lead,
    failedDate: lead.failedDate ? new Date(lead.failedDate).toISOString() : null,
    createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : null,
    updatedAt: lead.updatedAt ? new Date(lead.updatedAt).toISOString() : null,
    // add any other date fields here as needed
  };
};

// Main fetch function
export const fetchLeads = async () => {
  try {
    const {data} = await axiosInstance.get('/leads');
    // Convert dates for all leads
    const leaddata = data.data; // assuming the response structure is { data: { data: [...] } }
    
    const leadsWithDatesFixed = leaddata.map(convertDatesToStrings);
    
    return leadsWithDatesFixed;
  } catch (error) {
    console.error('Error fetching leads:', error.message);
    throw error; // rethrow so caller can handle if needed
  }
};

// src/api/leadApi.js


export const updateLeadStatus = async (leadId, changes) => {
  console.log("Updating lead:", leadId, "with changes:", changes);
  const response = await axiosInstance.put(`/leads/${leadId}`, changes);
  
  // backend responds with: { success: true, data: lead }
  return response.data.data;
};


export const updateAssignedToapi = async (leadId, newAssignedTo) => {
  console.log("Updating lead:", leadId, "to", { assignedTo: newAssignedTo.assignedTo, engineer_id: newAssignedTo.engineer_id
 });
  const response = await axiosInstance.put(`/leads/update-assigned-to/${leadId}`, { assignedTo: newAssignedTo.assignedTo, engineer_id: newAssignedTo.engineer_id
 });
  // backend responds with: { success: true, data: lead }
  return response.data.data;
};

export const addNoteToLeadApi = async (leadId, note) => {
  const response = await axiosInstance.post(`/leads/${leadId}/notes`, { text: note });
  // backend returns updated lead object
  return response.data.data; 
};

export const fetchEngineersWithTaskCount = async () => {
  try {
    const response = await axiosInstance.get('/leads/engineers-with-task-count');
    return response.data.data; // assuming the response structure is { data: [...] }
  } catch (error) {
    console.error('Error fetching engineers with task count:', error.message);
    throw error; // rethrow so caller can handle if needed
  }
};

export const addReminderApi = async (reminderData) => {
  try {
    const response = await axiosInstance.post('/remainders/addReminder', reminderData);
    return response.data.reminder; // assuming the response structure is { message: '...', reminder: {...} }
  } catch (error) {
    console.error('Error adding reminder:', error.message);
    throw error; // rethrow so caller can handle if needed
  }
};

export const fetchRemindersApi = async () => {
  try {
    const response = await axiosInstance.get('/remainders');
    return response.data.data // assuming the response structure is { reminders: [...] }
  } catch (error) {
    console.error('Error fetching reminders:', error.message);
    throw error; // rethrow so caller can handle if needed
  }
}

export const markAllLogsAsReadApi = async () => {
  try {
    const response = await axiosInstance.put('/logs/mark-all-read');
    return response.data; // { success: true, message: "...", modifiedCount: N }
  } catch (error) {
    console.error("Error marking logs as read:", error.message);
    throw error;
  }
};
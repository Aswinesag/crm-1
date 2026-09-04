export const leadViewConfig = {
  enquiry: {
    title: "Enquiry Information",
    noteTitle: "Enquiry Notes",
    updateButton: "Update Enquiry",
    sectionName: "Enquiry",

    editableFields: [
      "assignedTo",
    ],

    showLostSection: true,

    statusOptions: [],
  },

  quotation: {
    title: "Quotation Information",
    noteTitle: "Quotation Notes",
    updateButton:
      "Update Quotation",

    sectionName:
      "Quotation",

    editableFields: [
      "status",
      "assignedTo",
       "email",
    ],

    showLostSection: false,

    statusOptions: [
      "Quotation",
      "Quotation Sent",
      "Converted",
      "Follow-up",
      "Lost",
    ],
  },

  opportunity: {
    title:
      "Opportunity Information",

    noteTitle:
      "Opportunity Notes",

    updateButton:
      "Update Opportunity",

    sectionName:
      "Opportunity",

    editableFields: [
      "assignedTo",
      "status",
    ],

    showLostSection: true,

    statusOptions: [
      "Quotation",
      "Quotation Sent",
      "Converted",
      "Follow-up",
      "Lost",
    ],

    showQuotationButton: true,
  },

  lead: {
  title: "Lead Information",

  noteTitle: "Lead Notes",

  updateButton: "Update Lead",

  sectionName: "Leads",

  editableFields: [
    "assignedTo",
    "status",
  ],

  showLostSection: true,

  statusOptions: [
    "Lead",
    "Follow-up",
    "Opportunity",
    "Lost",
  ],
},

followup: {
  title: "Follow-up Information",

  noteTitle: "Follow-up Notes",

  updateButton:
    "Update Follow-up",

  sectionName:
    "Follow-up",

  editableFields: [
    "assignedTo",
    "status",
  ],

  showLostSection: true,

  statusOptions: [
    "Follow-up",
    "Opportunity",
    "Quotation",
    "Lost",
  ],
},

delivery: {
  title:
    "Delivery Information",

  noteTitle:
    "Delivery Notes",

  updateButton:
    "Update Delivery",

  sectionName:
    "Delivery",

  editableFields: [
    "assignedTo",
    "status",
  ],

  showLostSection: false,

  statusOptions: [
    "Delivery",
    "Completed",
  ],
},

};
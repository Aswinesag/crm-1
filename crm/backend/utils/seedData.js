require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');

const statuses = [
  'Work In Progress',
  'Opportunity',
  'Enquiry',
  'Quotation',
  'Follow-up',
  'Converted',
  'Lost'
];

const priorities = ['Low', 'Medium', 'High'];

const sources = [
  'IndiaMart', 'Facebook', 'JustDial', 'LinkedIn', 'Website',
  'Instagram', 'Email', 'Referral', 'Other'
];

const cities = ['Coimbatore', 'Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const states = ['Tamil Nadu', 'Karnataka', 'Telangana', 'Maharashtra', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];
const countries = ['India'];

const companyTypes = ['Pvt Ltd', 'Ltd', 'LLP', 'Industries', 'Solutions', 'Technologies', 'Services', 'Enterprises', 'Systems', 'Group'];

const firstNames = [
  'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Kavya', 'Ravi', 'Deepika', 'Sanjay', 'Meera',
  'Arjun', 'Nisha', 'Karthik', 'Pooja', 'Suresh', 'Divya', 'Manish', 'Shreya', 'Arun', 'Anita',
  'Vishal', 'Swati', 'Rohit', 'Neha', 'Ashish', 'Simran', 'Naveen', 'Ritika', 'Rakesh', 'Tanya',
  'Varun', 'Shweta', 'Nikhil', 'Preeti', 'Manoj', 'Sonali', 'Rahul', 'Madhuri', 'Sachin', 'Geeta',
  'Anil', 'Sunita', 'Vinod', 'Rekha', 'Sunil', 'Seema', 'Ajay', 'Kiran', 'Deepak', 'Asha'
];

const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Agarwal', 'Jain', 'Mehta', 'Shah', 'Verma',
  'Yadav', 'Mishra', 'Tiwari', 'Pandey', 'Joshi', 'Saxena', 'Srivastava', 'Chandra', 'Prasad', 'Reddy',
  'Nair', 'Pillai', 'Menon', 'Krishnan', 'Iyer', 'Rao', 'Bhat', 'Kulkarni', 'Desai', 'Thakur'
];

const companyNames = [
  'Tech Innovators', 'Digital Solutions', 'Global Systems', 'Smart Technologies', 'Future Enterprises',
  'Apex Industries', 'Prime Services', 'Elite Solutions', 'Dynamic Systems', 'Vertex Technologies',
  'Phoenix Industries', 'Stellar Solutions', 'Quantum Systems', 'Matrix Technologies', 'Omega Services',
  'Alpha Industries', 'Beta Solutions', 'Gamma Systems', 'Delta Technologies', 'Epsilon Services',
  'Zenith Industries', 'Pinnacle Solutions', 'Summit Systems', 'Peak Technologies', 'Crest Services',
  'Wave Industries', 'Flow Solutions', 'Stream Systems', 'Current Technologies', 'Tide Services',
  'Nova Industries', 'Spark Solutions', 'Flame Systems', 'Blaze Technologies', 'Fire Services',
  'Crystal Industries', 'Diamond Solutions', 'Gem Systems', 'Pearl Technologies', 'Gold Services',
  'Silver Industries', 'Platinum Solutions', 'Bronze Systems', 'Steel Technologies', 'Iron Services',
  'Cloud Industries', 'Sky Solutions', 'Air Systems', 'Wind Technologies', 'Storm Services'
];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Lead.deleteMany();
    await ActivityLog.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Create 20 users with diverse roles
    const usersData = [
      // 1 Super Admin
      {
        name: 'ramya',
        email: 'ramya@smiv.in',
        password: 'R@3ya@smiv.in',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        isWork: true,
        phoneNum: '9876543210',
        location: 'Coimbatore',
        active: 'Online',
        tasksAssigned: 0,
        leadsCreated: 0,
        lastLogin: new Date(),
        userDeleted: false,
      },
      // 3 Admins
      {
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        password: 'password123',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        isWork: true,
        phoneNum: '9876543211',
        location: 'Chennai',
        active: 'Online',
        tasksAssigned: 0,
        leadsCreated: 0,
        lastLogin: new Date(),
        userDeleted: false,
      },
      {
        name: 'Michael Davis',
        email: 'michael@company.com',
        password: 'password123',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        isWork: true,
        phoneNum: '9876543212',
        location: 'Bangalore',
        active: 'Offline',
        tasksAssigned: 0,
        leadsCreated: 0,
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        userDeleted: false,
      },
      {
        name: 'Emily Wilson',
        email: 'emily@company.com',
        password: 'password123',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        isWork: true,
        phoneNum: '9876543213',
        location: 'Mumbai',
        active: 'Online',
        tasksAssigned: 0,
        leadsCreated: 0,
        lastLogin: new Date(),
        userDeleted: false,
      }
    ];

    // Add 6 Coordinators
    for (let i = 1; i <= 6; i++) {
      const firstName = randomPick(firstNames);
      const lastName = randomPick(lastNames);
      usersData.push({
        name: `${firstName} ${lastName}`,
        email: `coordinator${i}@company.com`,
        password: 'password123',
        role: 'Coordinator',
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150`,
        isWork: true,
        phoneNum: `987654321${i + 3}`,
        location: randomPick(cities),
        active: Math.random() > 0.3 ? 'Online' : 'Offline',
        tasksAssigned: 0,
        leadsCreated: 0,
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        userDeleted: false,
      });
    }

    // Add 10 Engineers
    for (let i = 1; i <= 10; i++) {
      const firstName = randomPick(firstNames);
      const lastName = randomPick(lastNames);
      usersData.push({
        name: `${firstName} ${lastName}`,
        email: `engineer${i}@company.com`,
        password: 'password123',
        role: 'Engineer',
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150`,
        isWork: true,
        phoneNum: `987654321${i + 9}`,
        location: randomPick(cities),
        active: Math.random() > 0.4 ? 'Online' : 'Offline',
        tasksAssigned: 0,
        leadsCreated: 0,
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        userDeleted: false,
      });
    }

    const users = await User.create(usersData);
    console.log(`✅ Created ${users.length} users`);

    // Get users by role for lead assignment
    const coordinators = users.filter(u => u.role === 'Coordinator');
    const engineers = users.filter(u => u.role === 'Engineer');
    const admins = users.filter(u => u.role === 'Admin');

    // Generate 50 leads distributed over 12 months (about 4-5 per month)
    const leadsData = [];
    const now = new Date();
    let leadCounter = 1;

    for (let month = 0; month < 12; month++) {
      // Calculate date for this month (going back from current month)
      const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - month + 1, 1);
      
      // Generate 4-5 leads for this month
      const leadsThisMonth = month % 3 === 0 ? 5 : 4; // Every 3rd month gets 5 leads, others get 4
      
      for (let i = 0; i < leadsThisMonth && leadCounter <= 50; i++) {
        // Random date within the month
        const createdAt = new Date(monthDate.getTime() + Math.random() * (nextMonthDate.getTime() - monthDate.getTime()));
        
        const status = randomPick(statuses);
        const priority = randomPick(priorities);
        const source = randomPick(sources);
        const city = randomPick(cities);
        const state = randomPick(states);
        const country = randomPick(countries);
        
        // Randomly assign coordinator and engineer
        const assignedEngineer = randomPick(engineers);
        const coordinatorUser = randomPick([...coordinators, ...admins]); // Admins can also create leads
        
        const firstName = randomPick(firstNames);
        const lastName = randomPick(lastNames);
        const companyName = randomPick(companyNames);
        const companyType = randomPick(companyTypes);

        const lead = {
          name: `${firstName} ${lastName}`,
          firstName: firstName,
          lastName: lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${leadCounter}@${companyName.toLowerCase().replace(/ /g, '')}.com`,
          phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          city,
          state,
          country,
          source,
          address: `${Math.floor(Math.random() * 999) + 1}, ${randomPick(['MG Road', 'Anna Salai', 'Brigade Road', 'Commercial Street', 'Park Street'])}, ${city}`,
          status,
          assignedTo: assignedEngineer.name,
          engineer_id: assignedEngineer._id,
          createdBy: coordinatorUser.name,
          coordinator_id: coordinatorUser._id,
          priority,
           // ✅ ADD THIS BLOCK
          products: [
            {
              productName: randomPick([
                'Pump Model X',
                'Motor Y',
                'Valve Z',
                'Compressor A',
                'Generator B'
              ]),
              serialNumbers: `SN-${Math.floor(Math.random() * 100000)}`,
              qty: Math.floor(Math.random() * 5) + 1,
              invoiceNo: `INV-${Math.floor(Math.random() * 10000)}`
            }
          ],

          // delivery
          dispatchNo: `DIS-${Math.floor(Math.random() * 10000)}`,
          company: `${companyName} ${companyType}`,
          description: `Interested in our ${randomPick(['software solutions', 'IT services', 'digital transformation', 'cloud services', 'mobile apps', 'web development', 'consulting services'])}. ${randomPick(['Looking for immediate implementation', 'Budget approved', 'Comparing multiple vendors', 'Initial inquiry stage', 'Ready to proceed'])}`,
          createdAt,
          updatedAt: createdAt,
          quoteAmount: Math.floor(Math.random() * 500000) + 50000, // 50K to 5L
          notes: [],
        };

        // Add failure details if status is Failed
        if (status === 'Lost') {
          const failedDate = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Failed within 30 days
          lead.failedDate = failedDate;
          lead.failedReason = randomPick([
            'Went with competitor',
            'Budget constraints',
            'Timeline mismatch',
            'Requirements changed',
            'Lost contact',
            'Not interested',
            'Internal solution preferred'
          ]);
          lead.failedMessage = randomPick([
            'Lost due to pricing',
            'Could not meet timeline',
            'Technical requirements mismatch',
            'Budget approval delayed',
            'Competitor had better offer',
            'Client postponed project',
            'Management decision'
          ]);
        }

        // Add conversion details if status is Converted
        if (status === 'Converted') {
          lead.convertedDate = new Date(createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000); // Converted within 60 days
          lead.finalAmount = Math.floor(lead.quoteAmount * (0.8 + Math.random() * 0.4)); // 80% to 120% of quote
        }

        leadsData.push(lead);
        leadCounter++;
      }
    }

    // Create leads in batches to avoid memory issues
    const batchSize = 10;
    const createdLeads = [];
    
    for (let i = 0; i < leadsData.length; i += batchSize) {
      const batch = leadsData.slice(i, i + batchSize);
      const batchLeads = await Lead.create(batch);
      createdLeads.push(...batchLeads);
      console.log(`📝 Created leads batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(leadsData.length/batchSize)}`);
    }

    console.log(`✅ Created ${createdLeads.length} leads distributed over 12 months`);

    // Create activity logs for each lead creation
    console.log('📊 Creating activity logs...');
    const activityLogs = [];
    
    for (const lead of createdLeads) {
      activityLogs.push({
        type: 'lead_created',
        description: `Lead '${lead.name}' from '${lead.company}' created and assigned to ${lead.assignedTo}`,
        user: lead.createdBy,
        userId: users.find(u => u.name === lead.createdBy)._id,
        leadId: lead._id,
        createdAt: lead.createdAt,
        details: {
          leadName: lead.name,
          company: lead.company,
          assignedTo: lead.assignedTo,
          status: lead.status,
          priority: lead.priority,
          source: lead.source
        },
      });

      // Add status change activity if converted or failed
      if (lead.status === 'Converted' && lead.convertedDate) {
        activityLogs.push({
          type: 'lead_converted',
          description: `Lead '${lead.name}' converted successfully. Final amount: ₹${lead.finalAmount?.toLocaleString()}`,
          user: lead.assignedTo,
          userId: lead.engineer_id,
          leadId: lead._id,
          createdAt: lead.convertedDate,
          details: {
            leadName: lead.name,
            company: lead.company,
            finalAmount: lead.finalAmount,
            originalQuote: lead.quoteAmount
          },
        });
      }

      if (lead.status === 'Lost' && lead.failedDate) {
        activityLogs.push({
          type: 'lead_failed',
          description: `Lead '${lead.name}' marked as failed. Reason: ${lead.failedReason}`,
          user: lead.assignedTo,
          userId: lead.engineer_id,
          leadId: lead._id,
          createdAt: lead.failedDate,
          details: {
            leadName: lead.name,
            company: lead.company,
            failedReason: lead.failedReason,
            failedMessage: lead.failedMessage
          },
        });
      }
    }

    // Create activity logs in batches
    for (let i = 0; i < activityLogs.length; i += batchSize) {
      const batch = activityLogs.slice(i, i + batchSize);
      await ActivityLog.create(batch);
    }

    console.log(`✅ Created ${activityLogs.length} activity log entries`);

    // Update user statistics
    console.log('📈 Updating user statistics...');
    
    for (const user of users) {
      const userLeads = createdLeads.filter(lead => lead.assignedTo === user.name);
      const createdLeads2 = createdLeads.filter(lead => lead.createdBy === user.name);
      
      await User.updateOne(
        { _id: user._id },
        {
          tasksAssigned: userLeads.length,
          leadsCreated: createdLeads2.length
        }
      );
    }

    // Print summary statistics
    console.log('\n🎉 DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log('\n📊 SUMMARY:');
    console.log(`👥 Users created: ${users.length}`);
    console.log(`   • Super Admin: 1`);
    console.log(`   • Admin: 3`);
    console.log(`   • Coordinator: 6`);
    console.log(`   • Engineer: 10`);
    console.log(`\n📋 Leads created: ${createdLeads.length}`);
    
    // Status distribution
    const statusDistribution = {};
    createdLeads.forEach(lead => {
      statusDistribution[lead.status] = (statusDistribution[lead.status] || 0) + 1;
    });
    
    console.log(`\n📈 Lead Status Distribution:`);
    Object.entries(statusDistribution).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} (${Math.round((count/createdLeads.length)*100)}%)`);
    });

    // Monthly distribution
    console.log(`\n📅 Monthly Distribution (last 12 months):`);
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - month + 1, 1);
      const monthLeads = createdLeads.filter(lead => 
        lead.createdAt >= monthDate && lead.createdAt < nextMonthDate
      );
      const monthName = monthDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      console.log(`   • ${monthName}: ${monthLeads.length} leads`);
    }

    console.log(`\n🔗 Activity logs: ${activityLogs.length}`);
    console.log(`\n✅ All data seeded successfully! You can now test your reports.`);
    
    process.exit();
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
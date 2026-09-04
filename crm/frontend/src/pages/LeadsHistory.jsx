import React, { useState, useMemo, useEffect } from 'react';
import { FaFilter, FaChevronUp, FaChevronDown, FaTimes, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../api/axiosInstance.jsx'
import { setLeads } from '../redux/leadSlice';
import { Link } from 'react-router-dom';

const LeadsHistory = () => {

  const dispatch = useDispatch()

  useEffect(()=>{
    const fetchLeads = async() => {
      try{
        const {data} = await axiosInstance.get('/leads')
        dispatch(setLeads(data.data))
      }catch(err){
        console.log(`Fetching all leads error : ${err.message}`)
      }
    }
    fetchLeads()
  },[])
  
  const leads = useSelector((state) => state.leads.leads);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allStatuses = useMemo(() => [...new Set(leads.map(lead => lead.status))], [leads]);

  const allMonths = useMemo(() => {
    const monthsSet = new Set();
    leads.forEach(lead => {
      const d = new Date(lead.createdAt);
      const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      monthsSet.add(monthKey);
    });
    const monthArr = Array.from(monthsSet);
    monthArr.sort((a, b) => (a < b ? 1 : -1));
    return monthArr;
  }, [leads]);

  const formatMonthYear = (ym) => {
    const [year, month] = ym.split('-');
    const date = new Date(year, parseInt(month, 10) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    const d = new Date(lead.createdAt);
    const leadMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const matchesMonth = monthFilter === 'all' || leadMonth === monthFilter;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const columns = [
    {
      key: 'name',
      label: 'Lead Name',
      sortable: true,
      render: (text, lead) => (
        <Link
          className="text-blue-600 hover:underline text-left"
          to='/leadsHistoryView'
          state={{historyObj: lead}}
        >
          {text}
        </Link>
      )
    },
    {
      key: 'narrative',
      label: 'Lead History',
      sortable: false,
      render: (_, lead) => {
        const createdDate = new Date(lead.createdAt).toLocaleDateString();
        const modifiedDate = new Date(lead.updatedAt).toLocaleDateString();
        const daysSinceCreated = Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));

        return (
          <div>
            <p className="font-medium text-gray-900">
              {isMobileView ? (
                <>
                  <span className="block">{lead.name}</span>
                  <span className="text-sm font-normal">Created by {lead.createdBy}{lead?.assignedTo ? `, assigned to ${lead.assignedTo}` : '' } </span>
                </>
              ) : (
                `Lead "${lead.name}" was created by coordinator ${lead.createdBy} ${lead?.assignedTo ? `and assigned to engineer ${lead.assignedTo}` : ``} on ${createdDate} (${daysSinceCreated} days ago).`
              )}
            </p>
            <p className="text-gray-600 mt-1">
              Status: <span className="font-medium">{lead.status}</span>. 
              {!isMobileView && (
                <>
                  {' '}Last modified: {modifiedDate}.
                  {lead.quoteAmount && (
                    <> {' '}Quote: <span className="text-green-600 font-medium">${lead.quoteAmount.toLocaleString()}</span></>
                  )}
                </>
              )}
            </p>
            {!isMobileView && (
              <p className="text-gray-500 text-xs mt-1">
                Source: {lead.source} • Priority: {lead.priority} • Company: {lead.company}
                {lead.notes && lead.notes.length > 0 && <> • {lead.notes.length} note{lead.notes.length !== 1 ? 's' : ''}</>}
              </p>
            )}
          </div>
        );
      }
    },
    ...(isMobileView ? [] : [{
      key: 'status',
      label: 'Status',
      sortable: true,
      render: status => (
        <span className={`status-badge status-${status.toLowerCase().replace(/[- ]/g,'')}`}>
          {status}
        </span>
      )
    }])
  ];

  // DataTable Logic
  // const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobileView ? 5 : 10;

  // const tableData = filteredLeads.filter(item =>
  //   columns.some(column => {
  //     const value = item[column.key];
  //     return value && value.toString().toLowerCase().includes(tableSearch.toLowerCase());
  //   })
  // );

  const sortedData = [...filteredLeads].sort((a, b) => {
    if (sortField) {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Leads History</h1>
          <p className="text-gray-600 text-sm sm:text-base">Complete timeline of all leads in the system</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters - Mobile */}
      {showFilters && (
        <div className="sm:hidden bg-white rounded-lg p-4 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search leads..."
                  className="input-field w-full pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Statuses</option>
                {allStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Created Month</label>
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Months</option>
                {allMonths.map(monthKey => (
                  <option key={monthKey} value={monthKey}>{formatMonthYear(monthKey)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filters - Desktop */}
      <div className="hidden sm:block bg-white rounded-lg p-4 md:p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <FaFilter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search leads..."
                className="input-field w-full pl-10 p-2 rounded-md border border-gray-300  focus:outline-hidden"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field w-full p-2 rounded-md border border-gray-300  focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              {allStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Created Month</label>
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="input-field w-full p-2 rounded-md border border-gray-300  focus:outline-hidden"
            >
              <option value="all">All Months</option>
              {allMonths.map(monthKey => (
                <option key={monthKey} value={monthKey}>{formatMonthYear(monthKey)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search table..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="input-field w-full pl-10 focus:outline-none"
            />
          </div>
        </div> */}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortField === column.key && (
                        sortDirection === 'asc'
                          ? <FaChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          : <FaChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td 
                        key={column.key} 
                        className="px-3 sm:px-4 md:px-6 py-4 whitespace-normal text-sm text-gray-900"
                      >
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                    No leads found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-3 sm:px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-gray-600">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default LeadsHistory;
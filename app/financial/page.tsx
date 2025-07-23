'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Calendar,
  Download,
  Eye,
  Send,
  Users,
  Calculator,
  PieChart
} from 'lucide-react';

export default function FinancialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock financial data
  const financialMetrics = {
    totalRevenue: 48750,
    monthlyRevenue: 12180,
    outstandingInvoices: 8420,
    expenses: 3240,
    profit: 8940,
    profitMargin: 18.3
  };

  // Mock payroll data
  const payrollMetrics = {
    totalPayroll: 18450,
    employeeCount: 8,
    avgHourlyRate: 28.50,
    totalHours: 324,
    overtimeHours: 18,
    benefits: 2240
  };

  const employees = [
    { id: 1, name: 'Mike Rodriguez', role: 'Lead Technician', hourlyRate: 35, hoursWorked: 42, overtime: 2, grossPay: 1540 },
    { id: 2, name: 'Sarah Chen', role: 'HVAC Specialist', hourlyRate: 32, hoursWorked: 40, overtime: 0, grossPay: 1280 },
    { id: 3, name: 'John Davis', role: 'Apprentice', hourlyRate: 22, hoursWorked: 40, overtime: 4, grossPay: 1012 },
    { id: 4, name: 'Lisa Wilson', role: 'Plumber', hourlyRate: 30, hoursWorked: 38, overtime: 0, grossPay: 1140 },
    { id: 5, name: 'Tom Anderson', role: 'Electrician', hourlyRate: 33, hoursWorked: 40, overtime: 8, grossPay: 1584 }
  ];

  const invoices = [
    { id: 'INV-001', client: 'Johnson Residence', amount: 2850, status: 'paid', date: '2024-06-15', dueDate: '2024-06-30' },
    { id: 'INV-002', client: 'Smith Commercial', amount: 4200, status: 'pending', date: '2024-06-12', dueDate: '2024-06-27' },
    { id: 'INV-003', client: 'Davis HVAC Repair', amount: 1650, status: 'overdue', date: '2024-06-08', dueDate: '2024-06-23' },
    { id: 'INV-004', client: 'Wilson Plumbing', amount: 3100, status: 'pending', date: '2024-06-10', dueDate: '2024-06-25' },
    { id: 'INV-005', client: 'Brown Electric', amount: 1890, status: 'paid', date: '2024-06-14', dueDate: '2024-06-29' }
  ];

  const recentTransactions = [
    { id: 1, type: 'income', description: 'Johnson Residence - HVAC Service', amount: 2850, date: '2024-06-15' },
    { id: 2, type: 'expense', description: 'Parts & Materials - HVAC Supply Co', amount: -450, date: '2024-06-14' },
    { id: 3, type: 'income', description: 'Brown Electric - Emergency Call', amount: 1890, date: '2024-06-14' },
    { id: 4, type: 'expense', description: 'Fuel & Vehicle Maintenance', amount: -280, date: '2024-06-13' },
    { id: 5, type: 'expense', description: 'Insurance Payment', amount: -520, date: '2024-06-12' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your revenue, expenses, payroll, and cash flow</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <PieChart className="w-4 h-4 mr-2" />
                Financial Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payroll'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Payroll & Employees
              </div>
            </button>
          </nav>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${financialMetrics.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${financialMetrics.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8.2% from last month
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-gray-900">${financialMetrics.outstandingInvoices.toLocaleString()}</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      3 overdue invoices
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-gray-900">${financialMetrics.profit.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {financialMetrics.profitMargin}% margin
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Invoices Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {invoice.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {invoice.client}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${invoice.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(invoice.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  <Send className="w-4 h-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {transaction.type === 'income' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* QuickBooks Integration */}
                <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">QuickBooks Integration</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Ready to Connect</h3>
                      <p className="text-xs text-gray-600 mb-4">
                        Sync your financial data with QuickBooks for automated bookkeeping
                      </p>
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Connect QuickBooks
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Last sync: Never (Demo Mode)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payroll Tab Content */}
        {activeTab === 'payroll' && (
          <>
            {/* Payroll Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                    <p className="text-2xl font-bold text-gray-900">${payrollMetrics.totalPayroll.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 flex items-center mt-1">
                      This pay period
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{payrollMetrics.employeeCount}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +2 this quarter
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Hourly Rate</p>
                    <p className="text-2xl font-bold text-gray-900">${payrollMetrics.avgHourlyRate}</p>
                    <p className="text-xs text-gray-600 flex items-center mt-1">
                      Across all employees
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{payrollMetrics.overtimeHours}</p>
                    <p className="text-xs text-yellow-600 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Monitor closely
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Payroll Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Employee Payroll - Current Period</h2>
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Process Payroll
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Export Timesheet
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hourly Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours Worked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overtime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Pay
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${employee.hourlyRate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.hoursWorked}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.overtime > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {employee.overtime}h OT
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${employee.grossPay.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payroll Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Benefits & Deductions</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Health Insurance</span>
                      <span className="text-sm font-medium text-gray-900">$1,240</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">401(k) Contributions</span>
                      <span className="text-sm font-medium text-gray-900">$680</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Workers' Comp</span>
                      <span className="text-sm font-medium text-gray-900">$320</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-900">Total Benefits</span>
                        <span className="text-gray-900">${payrollMetrics.benefits.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Payroll Calendar</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Next Pay Date</p>
                        <p className="text-xs text-gray-600">Bi-weekly schedule</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">June 28, 2024</p>
                        <p className="text-xs text-gray-500">5 days remaining</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Period</span>
                        <span className="text-sm font-medium text-gray-900">Jun 15 - Jun 28</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">Timesheet Deadline</span>
                        <span className="text-sm font-medium text-red-600">June 26, 2024</span>
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      View Full Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
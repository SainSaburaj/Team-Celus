/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

/************************************************************************************************ 
 *  
 * JJIT-8710 : DEV | Frontend Development - Project Creation Page
 * 
************************************************************************************************* 
 * 
 * Author: Jobin and Jismi IT Services 
 * 
 * Date Created : 23-November-2025 
 * 
 * Description : Develop the user interface for the Project Creation Page in the SE portal. The page will allow users (Sales team members) to create new projects in NetSuite, with necessary fields for project information.
 * 
 * REVISION HISTORY
 *
 * @version 1.0 : 23-November-2025 :  The initial build was created by JJ0419
 * 
*************************************************************************************************/ 


define(['N/file', 'N/log', 'N/search', 'N/ui/serverWidget', 'N/record'],
    /**
 * @param{file} file
 * @param{log} log
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{record} record
 */
    (file, log, search, serverWidget, record) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                if (scriptContext.request.method === 'GET') {
                    let html = file.load({
                        id: './projectCreateForm.html'
                    }).getContents();

                    const employees = getEmployees();
                    const statuses = getStatusValues();
                    const priorities = getPriorityValues();
                    const issues = getIssueValues();
                    const customers = getAllCustomers();

                    html = html
                        .replace('%%EMPLOYEES%%', JSON.stringify(employees))
                        .replace('%%STATUSES%%', JSON.stringify(statuses))
                        .replace('%%PRIORITIES%%', JSON.stringify(priorities))
                        .replace('%%ISSUES%%', JSON.stringify(issues))
                        .replace('%%CUSTOMERS%%', JSON.stringify(customers));

                    scriptContext.response.write(html);
                    return;
                }

                if (scriptContext.request.method === 'POST') {
                    let data = JSON.parse(scriptContext.request.body);
                    const job = createJobRecord(data);

                    try {
                        const jobId = job.save();
                        scriptContext.response.write(JSON.stringify({
                            success: true,
                            message: "Project (Job) Created Successfully!",
                            jobId: jobId
                        }));
                    }
                    catch (e) {
                        log.error('Error Creating Job', e);
                        scriptContext.response.write(JSON.stringify({
                            success: false,
                            message: "Error Creating Job.",
                            error: e.message
                        }));
                    }
                };
            }
            catch (error) {
                log.error('Error in onRequest', error);
                scriptContext.response.write(JSON.stringify({
                    success: false,
                    message: "An error occurred.",
                    error: error.message
                }));
            }
        }

        /**
         * Fetch all active employees.
         *
         * @function getEmployees
         * @returns {Array<Object>} Array of employee objects: [{id, name}]
         */
        function getEmployees() {
            let list = [];

            search.create({
                type: "employee",
                filters: [['isinactive', 'is', 'F']],
                columns: ['internalid', 'firstname', 'lastname']
            }).run().each(res => {
                list.push({
                    id: res.getValue('internalid'),
                    name: res.getValue('firstname') + " " + res.getValue('lastname')
                });
                return true;
            });
            return list;
        }

        /**
         * Fetch all status values from custom status record.
         *
         * @function getStatusValues
         * @returns {Array<Object>} Array of status values: [{id, name}]
         */
        function getStatusValues() {
            let values = [];

            let results = search.create({
                type: 'customrecord_jj_jira_status_record',
                filters: [['isinactive', 'is', 'F']],
                columns: ['internalid', 'custrecord_jj_status_name']
            }).run();

            results.each(res => {
                values.push({
                    id: res.getValue('internalid'),
                    name: res.getValue('custrecord_jj_status_name')
                });
                return true;
            });
            return values;
        }
        
        /**
         * Fetch all priority values from custom priority record.
         *
         * @function getPriorityValues
         * @returns {Array<Object>} Array of priority values: [{id, name}]
         */
        function getPriorityValues() {
            let values = [];

            let results = search.create({
                type: 'customrecord_jj_jira_priority_record',
                filters: [['isinactive', 'is', 'F']],
                columns: ['internalid', 'custrecord_jj_priority_name']
            }).run();

            results.each(res => {
                values.push({
                    id: res.getValue('internalid'),
                    name: res.getValue('custrecord_jj_priority_name')
                });
                return true;
            });
            return values;
        }
        
         /**
         * Fetch all issue type values from custom issue type record.
         *
         * @function getIssueValues
         * @returns {Array<Object>} Array of issue type values: [{id, name}]
         */
        function getIssueValues() {
            let values = [];

            let results = search.create({
                type: 'customrecord_jj_jira_issue_type_record',
                filters: [['isinactive', 'is', 'F']],
                columns: ['internalid', 'custrecord_jj_issue_type_name']
            }).run();

            results.each(res => {
                values.push({
                    id: res.getValue('internalid'),
                    name: res.getValue('custrecord_jj_issue_type_name')
                });
                return true;
            });
            return values;
        }

        /**
         * Fetch all customers having project names (custentity_jj_jira_project_name).
         *
         * @function getAllCustomers
         * @returns {Array<Object>} Array of customers: [{id, name}]
         */
        function getAllCustomers() {
            const customers = [];
            const searchObj = search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['custentity_jj_jira_project_name', 'isnotempty', '']
                ],
                columns: [
                    'entityid',
                    'companyname',
                    'firstname',
                    'lastname'
                ]
            });

            searchObj.run().each(function (result) {
                const companyName = result.getValue('companyname');
                const firstName = result.getValue('firstname');
                const lastName = result.getValue('lastname');

                let finalName = '';
                if (companyName && companyName.trim() !== '') {
                    finalName = companyName;
                }
                else if ((firstName && firstName.trim() !== '') || (lastName && lastName.trim() !== '')) {
                    const fn = firstName ? firstName : '';
                    const ln = lastName ? lastName : '';
                    finalName = `${fn} ${ln}`.trim();
                } 
                else {
                    finalName = result.getValue('entityid');
                }
                customers.push({
                    id: result.id,
                    name: finalName
                });
                return true;
            });
            return customers;
        }

        /**
         * Format a date object into YYYY/MM/DD format.
         *
         * @function formatDate
         * @param {Date} dateObj - The date object to be formatted
         * @returns {string} The formatted date string
         */
        function formatDate(dateObj) {
            const month = dateObj.getMonth() + 1; // Month is 0-indexed
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();
            return `${year}/${month}/${day}`;
        }

        /**
         * Create a new Job record with provided data.
         *
         * @function createJobRecord
         * @param {Object} data - Data for creating the Job record
         * @returns {Record} The created Job record
         */
        function createJobRecord(data) {
            const job = record.create({
                type: record.Type.JOB,
                isDynamic: false
            });

            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);

            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);

            job.setValue({
                fieldId: 'companyname',
                value: data.projectName
            });
            job.setValue({
                fieldId: 'parent',
                value: data.customer
            });
            job.setValue({
                fieldId: 'custentity_jj_jira_start_date',
                value: new Date(formattedStartDate)
            });
            job.setValue({
                fieldId: 'custentity_jj_jira_due_date',
                value: new Date(formattedEndDate)
            });
            job.setValue({
                fieldId: 'custentity_jj_jira_status',
                value: data.status || 1
            });
            job.setValue({
                fieldId: 'custentity_jj_jira_issue_type',
                value: data.issue
            });
            job.setValue({
                fieldId: 'custentity_jj_jira_epic_assignee',
                value: data.assignee
            });
            job.setValue({
                fieldId: 'custentity_jj_jira_epic_reporter',
                value: data.reporter
            });
            job.setValue({
                fieldId: 'custentity_jj_jira_priority',
                value: data.priority
            });
            job.setValue({
                fieldId: 'custentity_jj_jira_task_description',
                value: data.description
            });
            job.setValue({
                fieldId: 'subsidiary',
                value: 1
            });
            job.setValue({
                fieldId: 'projectexpensetype',
                value: 1
            });

            return job;
        }

        return {onRequest}

    });

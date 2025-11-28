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
                    const action = scriptContext.request.parameters.action;

                    if (action === 'getDropdownData') {
                        const dropdownData = {
                            statuses: getStatusValues(),
                            priorities: getPriorityValues(),
                            issues: getIssueValues(),
                            employees: getEmployees(),
                            customers: getAllCustomers()
                        };

                        scriptContext.response.write(JSON.stringify(dropdownData));
                        return;
                    }

                    let html = file.load({
                        id: './projectCreateForm.html'
                    }).getContents();
                    scriptContext.response.write(html);
                    return;
                }

                if (scriptContext.request.method === 'POST') {
                    let data = JSON.parse(scriptContext.request.body);
                    const job = createJobRecord(data, scriptContext);

                    if (job === null) {
                        return;
                    }

                    try {
                        const jobId = job.save();
                        log.audit("Job Successfully Created", `Job ID: ${jobId}`);

                        let jiraLink = "";
                        try {
                            const savedJob = record.load({
                                type: record.Type.JOB,
                                id: jobId
                            });

                            jiraLink = savedJob.getValue("custentity_jj_jira_task_link") || "";
                        }
                        catch (linkErr) {
                            log.error("Error fetching Jira link", linkErr);
                        }

                        scriptContext.response.write(JSON.stringify({
                            success: true,
                            message: "New Epic Created in Jira! Please navigate to Jira and add the description to the newly created Epic task.",
                            jobId: jobId,
                            jiraLink: jiraLink
                        }));
                    } 
                    catch (e) {
                        log.error('Error in job.save()', e);
                        scriptContext.response.write(JSON.stringify({
                            success: false,
                            message: "Error Creating Job.",
                            error: e.message
                        }));
                    }
                }
            } 
            catch (error) {
                log.error('Error in onRequest', error);
                scriptContext.response.write(JSON.stringify({
                    success: false,
                    message: "An internal error occurred.",
                    error: error.message
                }));
            }
        };

        /**
         * Fetches all active employees from NetSuite.
         *
         * @function getEmployees
         * @returns {Array<Object>} Array of employee objects: [{id, name}]
         */
        function getEmployees() {
            try {
                let list = [];

                search.create({
                    type: "employee",
                    filters: [
                        ['isinactive', 'is', 'F'],
                        'AND',
                        ['subsidiary', 'anyof', '1']
                    ],
                    columns: ['internalid', 'firstname', 'lastname']
                }).run().each(res => {
                    list.push({
                        id: res.getValue('internalid'),
                        name: `${res.getValue('firstname')} ${res.getValue('lastname')}`
                    });
                    return true;
                });
                return list;
            } 
            catch (e) {
                log.error('Error in getEmployees', e);
                return [];
            }
        }

        /**
         * Fetches all active customers who have a Jira project name associated.
         *
         * @function getAllCustomers
         * @returns {Array<Object>} Array of status values: [{id, companyName, firstName, lastName}] 
         */
        function getAllCustomers() {
            try {
                const customers = [];

                const searchObj = search.create({
                    type: search.Type.CUSTOMER,
                    filters: [
                        ['isinactive', 'is', 'F'],
                        'AND',
                        ['subsidiary', 'anyof', '1'],
                        'AND',
                        ['custentity_jj_jira_project_name', 'isnotempty', '']
                    ],
                    columns: ['entityid', 'companyname', 'firstname', 'lastname']
                });

                searchObj.run().each(result => {
                    const companyName = result.getValue('companyname');
                    const firstName = result.getValue('firstname');
                    const lastName = result.getValue('lastname');

                    let finalName = companyName || `${firstName} ${lastName}`.trim();
                    if (!finalName) finalName = result.getValue('entityid');

                    customers.push({ id: result.id, name: finalName });
                    return true;
                });
                return customers;
            } 
            catch (e) {
                log.error('Error in getAllCustomers', e);
                return [];
            }
        }

        /**
         * Fetch all status values from custom status record.
         * @function getStatusValues
         * @returns {Array<Object>} Array of status values: [{id, name}] 
         */
        function getStatusValues() {
            try {
                let values = [];

                search.create({
                    type: 'customrecord_jj_jira_status_record',
                    filters: [['isinactive', 'is', 'F']],
                    columns: ['internalid', 'custrecord_jj_status_name']
                }).run().each(res => {
                    values.push({
                        id: res.getValue('internalid'),
                        name: res.getValue('custrecord_jj_status_name')
                    });
                    return true;
                });
                return values;
            } 
            catch (e) {
                log.error('Error in getStatusValues', e);
                return [];
            }
        }



        /** 
         * Fetch all priority values from custom priority record.
         * @function getPriorityValues
         * @returns {Array<Object>} Array of priority values: [{id, name}] 
         */
        function getPriorityValues() {
            try {
                let values = [];

                search.create({
                    type: 'customrecord_jj_jira_priority_record',
                    filters: [['isinactive', 'is', 'F']],
                    columns: ['internalid', 'custrecord_jj_priority_name']
                }).run().each(res => {
                    values.push({
                        id: res.getValue('internalid'),
                        name: res.getValue('custrecord_jj_priority_name')
                    });
                    return true;
                });
                return values;
            } 
            catch (e) {
                log.error('Error in getPriorityValues', e);
                return [];
            }
        }

        /** 
         * Fetch all issue type values from custom issue type record. 
         * @function getIssueValues
         * @returns {Array<Object>} Array of issue type values: [{id, name}]  
         */
        function getIssueValues() {
            try {
                let values = [];

                search.create({
                    type: 'customrecord_jj_jira_issue_type_record',
                    filters: [['isinactive', 'is', 'F']],
                    columns: ['internalid', 'custrecord_jj_issue_type_name']
                }).run().each(res => {
                    values.push({
                        id: res.getValue('internalid'),
                        name: res.getValue('custrecord_jj_issue_type_name')
                    });
                    return true;
                });
                return values;
            } 
            catch (e) {
                log.error('Error in getIssueValues', e);
                return [];
            }
        }

        /**
         * Formats a JS Date object into YYYY/MM/DD format.
         *
         * @function formatDate
         * @param {Date} dateObj - JavaScript date object
         * @returns {string} Formatted date string (YYYY/MM/DD)
         */
        function formatDate(dateObj) {
            try {
                const formatted = `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                return formatted;
            } 
            catch (e) {
                log.error('Error in formatDate', e);
                return '';
            }
        }

        /** 
         * Validate that the end date is not before the start date.
         * @function validateDates
         * @param {Date} startDate - The project start date
         * @param {Date} endDate - The project end date
         * @param {ServerResponse} response - The response object to write errors to
         * @returns {boolean} True if dates are valid, false otherwise
         */
        function validateDates(startDate, endDate, response) {
            if (endDate < startDate) {
                response.write(JSON.stringify({
                    success: false,
                    message: "Error: End date cannot be before start date."
                }));
                return false;
            }
            return true;
        }

        /** 
         * Create a new Job record with provided data. 
         * @function createJobRecord
         * @param {Object} data - Data for creating the Job record
         * @param {Object} scriptContext - The Suitelet script context
         * @returns {Record|null} The created Job record or null in case of error
         */
        function createJobRecord(data, scriptContext) {
            try {
                const job = record.create({
                    type: record.Type.JOB,
                    isDynamic: false
                });

                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);

                if (!validateDates(startDate, endDate, scriptContext.response)) {
                    return null;
                }

                const formattedStart = formatDate(startDate);
                const formattedEnd = formatDate(endDate);

                job.setValue({ fieldId: 'companyname', value: data.projectName });
                job.setValue({ fieldId: 'parent', value: data.customerId });
                job.setValue({ fieldId: 'custentity_jj_jira_start_date', value: new Date(formattedStart) });
                job.setValue({ fieldId: 'custentity_jj_jira_due_date', value: new Date(formattedEnd) });
                job.setValue({ fieldId: 'custentity_jj_jira_status', value: data.status || 1 });
                job.setValue({ fieldId: 'custentity_jj_jira_priority', value: data.priority });
                job.setValue({ fieldId: 'custentity_jj_jira_issue_type', value: data.issue });
                job.setValue({ fieldId: 'custentity_jj_jira_epic_assignee', value: data.assigneeId });
                job.setValue({ fieldId: 'custentity_jj_jira_epic_reporter', value: data.reporterId });
                job.setValue({ fieldId: 'subsidiary', value: 1 });
                job.setValue({ fieldId: 'projectexpensetype', value: 1 });

                return job;
            } 
            catch (e) {
                log.error('Error in createJobRecord', e);
                return null;
            }
        }

        return {onRequest}

    });

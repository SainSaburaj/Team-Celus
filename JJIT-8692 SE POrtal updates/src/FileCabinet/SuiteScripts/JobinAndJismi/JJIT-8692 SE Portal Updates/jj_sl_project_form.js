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


define(['N/file', 'N/log', 'N/search', 'N/ui/serverWidget'],
    /**
 * @param{file} file
 * @param{log} log
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (file, log, search, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                let html = file.load({
                    id: './projectCreateForm.html'
                }).getContents();

                const employees = getEmployees();
                const statuses = getStatusListValues();
                const issues = getIssueListValues();
                const customers = getAllCustomers();

                html = html
                    .replace('%%EMPLOYEES%%', JSON.stringify(employees))
                    .replace('%%STATUSES%%', JSON.stringify(statuses))
                    .replace('%%ISSUES%%', JSON.stringify(issues))
                    .replace('%%CUSTOMERS%%', JSON.stringify(customers));

                scriptContext.response.write(html);
                return;
            }
            if (scriptContext.request.method === 'POST') {
                
            }
        }

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

        function getStatusListValues() {
            let values = [];

            let results = search.create({
                type: 'customlist_jj_jira_status',
                filters: [['isinactive', 'is', 'F']],
                columns: ['internalid', 'name']
            }).run();

            results.each(res => {
                values.push({
                    id: res.getValue('internalid'),
                    name: res.getValue('name')
                });
                return true;
            });
            return values;
        }
        
        function getIssueListValues() {
            let values = [];

            let results = search.create({
                type: 'customlist_jj_jira_issue_type',
                filters: [['isinactive', 'is', 'F']],
                columns: ['internalid', 'name']
            }).run();

            results.each(res => {
                values.push({
                    id: res.getValue('internalid'),
                    name: res.getValue('name')
                });
                return true;
            });
            return values;
        }

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

        return {onRequest}

    });

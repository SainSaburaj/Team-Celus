/**
 * @NApiVersion 2.1
 */
/**************************************************************************************************************************************
* 
* 
* Custom page designing for implementation of Project Costing tool in NetSuite
*
* ************************************************************************************************************************************
* Author : Jobin and Jismi IT Services
*
* Date Created : 21-February-2024
*
* Description : This script is to design custom page designing for implementation of Project Costing tool
* REVISION HISTORY
* Version 1.0.0 : 21-February-2024 : Created the initial build by JJ0149
**************************************************************************************************************************************/
define(['N/search', 'N/query', 'N/record'],
    /**
 * @param{search} search
 * @param{query} query
 * @param{record} record
 */
    (search, query, record) => {
        function replaceSpecialCharacters(str) {
            try {
                return str.replace(/[><\-&\[\]\(\)]/g, ' ');
            } catch (error) {
                log.error("Error in replaceSpecialCharacters", error);
                return str;
            }

        }
        return model = {
            /**
             * 
             * @param {*} email 
             * @param {*} otp 
             * @returns 
             */
            getCredential(email, otp) {
                try {
                    let filterArray = [];
                    if (otp) {
                        filterArray.push("AND",
                            ["custrecord_jj_request_otp", "is", otp],)
                    }
                    let credentialRecordId;
                    const credentialSearchObj = search.create({
                        type: "customrecord_jj_order_request_credential",
                        filters:
                            [
                                ["custrecord_jj_request_email", "is", email],
                                "AND",
                                ["isinactive", "is", "F"],
                                ...filterArray
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" })
                            ]
                    });
                    credentialSearchObj.run().each(function (result) {
                        credentialRecordId = result.getValue({ name: "internalid", label: "Internal ID" })
                        return false;
                    });
                    return credentialRecordId;
                } catch (error) {
                    log.error("Error @getCredential", error);
                    return false;
                }
            },
            /**
            * Retrieves the customer details based on the provided ID.
            * @param {string} id 
            * @returns 
            */
            fetchCustomerDetails(id, customer) {
                try {
                    let filters = [["custrecord_jj_opp_creation_credential", "anyof", id], "AND", ["isinactive", "is", "F"]];
                    filters.push("AND", ["custrecord_jj_allocated_lead", "anyof", "@NONE@"]);
                    if (customer) {
                        filters.push("AND", ["custrecord_jj_opp_creation_customer", "anyof", customer]);
                    }

                    log.debug("Fetching Customer Details for ID:", id);

                    let customerDetails = [];
                    const customerSearchObj = search.create({
                        type: "customrecord_jj_sales_rep_cust_mapping",
                        filters: filters,
                        columns: [
                            search.createColumn({ name: "custrecord_jj_opp_creation_customer", label: "Customer Name" }),
                            search.createColumn({ name: "custrecord_jj_department_mapping", label: "Department" }),
                            search.createColumn({ name: "custrecord_jj_class_mapping", label: "Class" }),
                            search.createColumn({ name: "custrecord_jj_subsidiary_mapping", label: "Subsidiary" }),
                            search.createColumn({ name: "custrecord_jj_sales_rep_cust_location", label: "Location" }),
                            //search.createColumn({ name: "custrecord_jj_sales_rep_sales_type", label: "SalesType" }),
                        ]
                    });

                    let searchResultCount = customerSearchObj.runPaged().count;
                    log.debug("Customer Mapping Search Result Count", searchResultCount);

                    customerSearchObj.run().each((result) => {
                        customerDetails.push({
                            id: result.getValue({ name: "custrecord_jj_opp_creation_customer" }),
                            name: result.getText({ name: "custrecord_jj_opp_creation_customer" }),
                            department: result.getValue({ name: "custrecord_jj_department_mapping" }),
                            salesRepClass: result.getValue({ name: "custrecord_jj_class_mapping" }),
                            subsidiary: result.getValue({ name: "custrecord_jj_subsidiary_mapping" }),
                            location: result.getValue({ name: "custrecord_jj_sales_rep_cust_location" }),
                            //salesType: result.getValue({ name: "custrecord_jj_sales_rep_sales_type" }),
                        });
                        return true; // Continue iterating
                    });

                    log.debug("Fetched Customer Details:", customerDetails);

                    return {
                        success: true,
                        data: customerDetails
                    };

                } catch (error) {
                    log.error("Error in fetchCustomerDetails", error);
                    return {
                        success: false,
                        data: [],
                        error: error.message
                    };
                }
            },
            /**
             * to fetch customer status list
             * @returns 
             */
            fetchCustomerStatusList() {
                try {
                    const customerStatusList = [];
                    const customlist_customer_statusSearchObj = search.create({
                        type: "customlist_customer_status",
                        filters:
                            [
                                ["isinactive", "is", "F"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "name", label: "Name" }),
                                search.createColumn({ name: "internalid", label: "Internal ID" })
                            ]
                    });
                    const searchResultCount = customlist_customer_statusSearchObj.runPaged().count;
                    log.debug("customlist_customer_statusSearchObj result count", searchResultCount);
                    customlist_customer_statusSearchObj.run().each(function (result) {
                        let temp = {}
                        temp.name = result.getValue({ name: "name" }) || ' ';
                        temp.id = result.getValue({ name: "internalid" }) || ' ';
                        customerStatusList.push(temp);
                        return true;
                    });

                    return {
                        success: true,
                        data: customerStatusList
                    };

                } catch (error) {
                    log.error("Error in fetchCustomerStatusList", error);
                    return {
                        success: false,
                        data: [],
                        error: error.message
                    };
                }

            },
            /**
             * To fetch leads for a solution engineer
             * @param {*} id
             * @returns 
             */
            fetchLeadList(id) {
                try {
                    log.debug("fetchLeadList", "Solution Engineer ID: " + id);
                    const leadList = [];
                    const leadSearchObj = search.create({
                        type: "lead",
                        filters:
                            [
                                ["stage", "anyof", "LEAD"],
                                "AND",
                                ["salesteammember", "anyof", id]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({ name: "companyname", label: "Company Name" }),
                                search.createColumn({ name: "email", label: "Email" }),
                                search.createColumn({ name: "phone", label: "Phone" }),
                                search.createColumn({ name: "entitystatus", label: "Status" }),
                                search.createColumn({ name: "custentity_jj_customer_status", label: "Customer Status" }),
                                search.createColumn({ name: "comments", label: "Comments" }),
                                search.createColumn({ name: "custentity24", label: "Next Steps" })
                            ]
                    });
                    const searchResultCount = leadSearchObj.runPaged().count;
                    log.debug("leadSearchObj result count", searchResultCount);
                    leadSearchObj.run().each(function (result) {
                        let temp = {}
                        temp.internalId = result.getValue({ name: "internalid" }) || ' ';
                        temp.companyName = result.getValue({ name: "companyname" }) || ' ';
                        temp.email = result.getValue({ name: "email" }) || ' ';
                        temp.phone = result.getValue({ name: "phone" }) || ' ';
                        temp.status = result.getText({ name: "entitystatus" }) || ' ';
                        temp.customerStatus = result.getText({ name: "custentity_jj_customer_status" }) || ' ';
                        temp.comments = result.getValue({ name: "comments" }) || ' ';
                        temp.nextSteps = result.getValue({ name: "custentity24" }) || ' ';
                        leadList.push(temp);
                        return true;
                    });

                    return {
                        success: true,
                        data: leadList
                    };

                } catch (error) {
                    log.error("Error in fetchLeadList", error);
                    return {
                        success: false,
                        data: [],
                        error: error.message
                    };
                }
            },
            /**
             * 
             * @param {*} solutionEngineer 
             * @returns 
             */
            fetchOpportunityHistory(solutionEngineer, documentNumber, fromDate, toDate) {
                try {
                    log.debug("fetchOpportunityHistory", "solutionEngineer: " + solutionEngineer + ", documentNumber: " + documentNumber + ", fromDate: " + fromDate + ", toDate: " + toDate);
                    const filters = [
                        ["custbody_jj_opp_creation_se", "anyof", solutionEngineer],
                        "AND",
                        ["lineitem", "noneof", "@NONE@"],
                        "AND",
                        ["linememo", "isnot", "VAT"]
                    ];
                    if (documentNumber) {
                        filters.push("AND",
                            ["numbertext", "is", documentNumber]);
                    }
                    if (fromDate && toDate) {
                        filters.push("AND", ["date", "within", fromDate, toDate]);
                    }

                    const opportunityHistory = {};
                    const opportunityHistoryArray = [];
                    const opportunitySearchObj = search.create({
                        type: "opportunity",
                        filters: filters,
                        columns:
                            [
                                search.createColumn({ name: "trandate", label: "Date" }),
                                search.createColumn({ name: "internalid", label: "InternalId" }),
                                search.createColumn({ name: "tranid", label: "Document Number" }),
                                search.createColumn({ name: "entity", label: "Customer" }),
                                search.createColumn({ name: "title", label: "Title" }),
                                search.createColumn({ name: "entitystatus", label: "Opportunity Status" }),
                                search.createColumn({ name: "item", label: "Line Item" }),
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "{linememo}",
                                    label: "Formula (Text)"
                                }),
                                search.createColumn({ name: "quantity", label: "Line Quantity" }),
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "{lineitem.id}",
                                    label: "Formula (Text)"
                                })
                            ]
                    });
                    const searchResultCount = opportunitySearchObj.runPaged().count;
                    log.debug("opportunitySearchObj result count", searchResultCount);
                    opportunitySearchObj.run().each(function (result) {
                        let temp = {}
                        temp.internalId = result.getValue({ name: "internalid" }) || ' ';
                        temp.date = result.getValue({ name: "trandate" }) || ' ';
                        temp.tranId = result.getValue({ name: "tranid" }) || ' ';
                        temp.entity = result.getText({ name: "entity" }) || ' ';

                        temp.title = result.getValue({ name: "title" }) || ' ';
                        temp.status = result.getText({ name: "entitystatus" }) || ' ';
                        temp.item = result.getText({ name: "item" }) || ' ';
                        temp.description = replaceSpecialCharacters(result.getValue(result.columns[7]))
                        temp.hour = result.getValue({ name: "quantity" }) || ' ';
                        temp.itemId = result.getValue({
                            name: "formulatext",
                            formula: "{lineitem.id}",
                            label: "Formula (Text)"
                        })
                        opportunityHistoryArray.push(temp);

                        // if (!opportunityHistory[internalId]) {
                        //     opportunityHistory[internalId] = {
                        //         tranDate: result.getValue({ name: "trandate" }),
                        //         tranId: result.getValue({ name: "tranid" }),
                        //         entity: result.getText({ name: "entity" }),
                        //         memo: result.getValue({ name: "memo" }),
                        //         title: result.getValue({ name: "title" }),
                        //         status: result.getText({ name: "entitystatus" }),
                        //         lines: []
                        //     };
                        // }

                        // opportunityHistory[internalId].lines.push({
                        //     item: result.getText({ name: "item" }),
                        //     quantity: result.getValue({ name: "quantity" }),
                        //     memo: result.getValue({ name: "memo", join: "item" })
                        // });

                        return true;
                    });

                    //return opportunityHistory;
                    log.debug("opportunityHistoryArray", opportunityHistoryArray)
                    return opportunityHistoryArray;
                } catch (error) {
                    log.error("Error @fetchOpportunityHistory", error);
                    //return {};
                    return []
                }
            },
            /**
             * To fetch employee data
             * @returns {Object} employeeDetails
             */
            fetchEmployeeDetails() {
                const employeeDetails = {};
                try {
                    const employeeSearchObj = search.create({
                        type: "employee",
                        filters:
                            [
                                ["isinactive", "is", "F"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({ name: "entityid", label: "ID" })
                            ]
                    });
                    const searchResultCount = employeeSearchObj.runPaged().count;
                    log.debug("employeeSearchObj result count", searchResultCount);
                    employeeSearchObj.run().each(function (result) {
                        employeeDetails[result.getValue({ name: "internalid" })] = result.getValue({ name: "entityid" });
                        return true;
                    });
                    return {
                        success: true,
                        data: employeeDetails
                    };
                } catch (error) {
                    log.error("Error @fetchEmployeeDetails", error);
                    return {
                        success: false,
                        data: employeeDetails
                    };
                }

            },

            // /**
            //  * Function to retrieve and sort only the qualified and unqualified leads from a customers using SuiteQL.
            //  * @param {object} leadField - The field object containing lead criteria.
            //  */
            // fetchLeadDetails(leadField) {
            //     try {
            //         let suiteQl = `SELECT c.id, c.fullName, c.entityStatus FROM customer c WHERE c.entityStatus IN (6,7) ORDER BY c.fullName`;
            //         let leadResults = query.runSuiteQL({ query: suiteQl }).asMappedResults();
            //         let resultArray = []
            //         for (i = 0; i < leadResults.length; i++) {
            //             let result = leadResults[i];
            //             resultArray.push({
            //                 id: result.id,
            //                 name: result.fullname,
            //             });
            //         }
            //            return resultArray;

            //     } catch (e) {
            //         log.error("Error in leadFilter", e);
            //     }
            // }
            fetchLeadDetails(id, entityid) {
                try {
                    let filters = [["custrecord_jj_opp_creation_credential", "anyof", id], "AND", ["isinactive", "is", "F"]];
                    if (entityid) {
                        filters.push("AND", ["custrecord_jj_allocated_lead", "anyof", entityid]);
                    }

                    filters.push("AND", ["custrecord_jj_opp_creation_customer", "anyof", "@NONE@"]);

                    log.debug("Fetching Customer Details for ID:", id);

                    let customerDetails = [];
                    const customerSearchObj = search.create({
                        type: "customrecord_jj_sales_rep_cust_mapping",
                        filters: filters,
                        columns: [
                            search.createColumn({ name: "custrecord_jj_allocated_lead", label: "Lead Name" }),
                            search.createColumn({
                                name: "altname",
                                join: "CUSTRECORD_JJ_ALLOCATED_LEAD",
                                label: "Name"
                            }),
                            search.createColumn({ name: "custrecord_jj_department_mapping", label: "Department" }),
                            search.createColumn({ name: "custrecord_jj_class_mapping", label: "Class" }),
                            search.createColumn({ name: "custrecord_jj_subsidiary_mapping", label: "Subsidiary" }),
                            search.createColumn({ name: "custrecord_jj_sales_rep_cust_location", label: "Location" }),
                            search.createColumn({
                                name: "type",
                                join: "CUSTRECORD_JJ_ALLOCATED_LEAD",
                                label: "Type"
                            })
                            //search.createColumn({ name: "custrecord_jj_sales_rep_sales_type", label: "SalesType" }),
                        ]
                    });

                    let searchResultCount = customerSearchObj.runPaged().count;
                    log.debug("Customer Mapping Search Result Count", searchResultCount);

                    customerSearchObj.run().each((result) => {
                        customerDetails.push({
                            id: result.getValue({ name: "custrecord_jj_allocated_lead" }),
                            name: result.getValue({
                                name: "altname",
                                join: "CUSTRECORD_JJ_ALLOCATED_LEAD",
                                label: "Name"
                            }),
                            department: result.getValue({ name: "custrecord_jj_department_mapping" }),
                            salesRepClass: result.getValue({ name: "custrecord_jj_class_mapping" }),
                            subsidiary: result.getValue({ name: "custrecord_jj_subsidiary_mapping" }),
                            location: result.getValue({ name: "custrecord_jj_sales_rep_cust_location" }),
                            entityType: result.getValue({
                                name: "type",
                                join: "CUSTRECORD_JJ_ALLOCATED_LEAD",
                                label: "Type"
                            })
                            //salesType: result.getValue({ name: "custrecord_jj_sales_rep_sales_type" }),
                        });
                        return true; // Continue iterating
                    });

                    log.debug("Fetched Customer Details:", customerDetails);

                    return {
                        success: true,
                        data: customerDetails
                    };

                } catch (error) {
                    log.error("Error in fetchCustomerDetails", error);
                    return {
                        success: false,
                        data: [],
                        error: error.message
                    };
                }

            },
            /**
             * 
             * @returns 
             */
            getMonthlyOrders(id) {

                try {

                    let resultArr = [];

                    let transactionSearch = search.create({
                        type: search.Type.TRANSACTION,
                        filters: [
                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["opportunity.custbody_jj_opp_creation_se", "anyof", id],
                            "AND",
                            ["mainline", "is", "F"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "formulatext",
                                summary: "GROUP",
                                formula: "TO_CHAR({datecreated}, 'Mon YYYY')",
                                label: "Month",
                            }),
                            search.createColumn({
                                name: "formulanumeric",
                                summary: "GROUP",
                                formula: "TO_NUMBER(TO_CHAR({datecreated}, 'YYYYMM'))",
                                sort: search.Sort.ASC,
                                label: "Month Sort",
                            }),
                            search.createColumn({
                                name: "quantity",
                                summary: "SUM",
                                label: "Quantity"
                            }),
                        ],

                    });

                    transactionSearch.run().each(function (result) {

                        const month = result.getValue({
                            name: "formulatext",
                            summary: search.Summary.GROUP,
                        });

                        const count = result.getValue({
                            name: "quantity",
                            summary: "SUM",
                            label: "Quantity"
                        });

                        resultArr.push({ month, count });
                        return true;

                    });

                    const labels = resultArr.map(function (data) {
                        return data.month.trim();
                    });

                    const countData = resultArr.map(function (data) {
                        return parseInt(data.count, 10);
                    });

                    return {
                        labels: labels,
                        countData: countData,
                    };

                } catch (error) {
                    log.error("error", error.message);
                }

            },

            getCustomerConversion(id) {

                try {
                    let convCustomerSearch = search.create({
                        type: "transaction",
                        filters: [
                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["mainline", "is", "F"],
                            "AND",
                            ["opportunity", "noneof", "@NONE@"],
                            "AND",
                            ["opportunity.custbody_jj_opp_creation_se", "anyof", id],

                        ],
                        columns: [
                            // search.createColumn({
                            //     name: "salesrep",
                            //     summary: "GROUP",
                            //     label: "Sales Rep",
                            // }),
                            // search.createColumn({
                            //     name: "entityid",
                            //     join: "customerMain",
                            //     summary: "GROUP",
                            //     label: "Name",
                            // }),
                            // search.createColumn({
                            //     name: "formulanumeric",
                            //     summary: "SUM",
                            //     formula: "CASE WHEN {opportunity} IS NOT NULL THEN 1 ELSE 0 END",
                            //     label: "Formula (Numeric)",
                            // }),
                            search.createColumn({
                                name: "entity",
                                summary: "GROUP",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "quantity",
                                summary: "SUM",
                                label: "Quantity"
                            })
                        ],
                    });

                    let resultData = [];

                    convCustomerSearch.run().each(function (result) {
                        const salesRep = result.getText({
                            name: "entity",
                            summary: "GROUP",
                            label: "Name"
                        });

                        const customer = result.getValue({
                            name: "entity",
                            summary: "GROUP",
                            label: "Name"
                        });

                        const count = parseInt(
                            result.getValue({
                                name: "quantity",
                                summary: "SUM",
                                label: "Quantity"
                            }),
                            10
                        );

                        resultData.push({ salesRep, customer, count });
                        return true;

                    });

                    const salesRepSet = new Set();
                    const customerMap = {};

                    for (let i = 0; i < resultData.length; i++) {
                        const { salesRep, customer, count } = resultData[i];
                        salesRepSet.add(salesRep);
                        customerMap[customer] = { salesRep, count };
                    }

                    const salesReps = Array.from(salesRepSet);
                    const datasets = [];
                    const colorPalette = ["#2177b1", "#db5624", "#359638", "#b22222", "#fddb00ff"];
                    let colorIndex = 0;

                    for (const customer in customerMap) {

                        const { salesRep, count } = customerMap[customer];
                        const dataArray = [];

                        for (let i = 0; i < salesReps.length; i++) {
                            dataArray.push(salesReps[i] === salesRep ? count : null);
                        }

                        datasets.push({
                            label: customer,
                            data: dataArray,
                            backgroundColor: colorPalette[colorIndex % colorPalette.length],
                            barThickness: 15,
                        });

                        colorIndex++;

                    }

                    const salesRepLabels = salesReps;
                    const datasetStrings = datasets;

                    return {
                        salesRepLabels: salesRepLabels,
                        datasetStrings: datasetStrings,
                    };

                } catch (error) {
                    log.error("error", error.message);
                }
            },

            getConversionSummary(id) {

                try {

                    let conversionSearch = search.create({
                        type: "transaction",
                        filters: [
                            ["type", "anyof", "SalesOrd", "Opprtnty"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            [["opportunity.custbody_jj_opp_creation_se", "anyof", id], "OR", ["custbody_jj_opp_creation_se", "anyof", id]]
                        ],
                        columns: [
                            search.createColumn({
                                name: "type",
                                summary: "GROUP",
                                label: "Type",
                            }),
                            search.createColumn({
                                name: "internalid",
                                summary: "COUNT",
                                label: "Total Count",
                            }),
                            search.createColumn({
                                name: "formulanumeric",
                                summary: "SUM",
                                formula: "CASE WHEN {opportunity} IS NOT NULL THEN 1 ELSE 0 END",
                                label: "SO Created",
                            }),
                            search.createColumn({
                                name: "formulatext",
                                summary: "GROUP",
                                formula: "TO_CHAR({datecreated}, 'Mon YYYY')",
                                label: "Year",
                            }),
                            search.createColumn({
                                name: "formuladate",
                                summary: "GROUP",
                                formula: "TRUNC({datecreated}, 'MM')",
                                sort: search.Sort.ASC,
                                label: "Sorted Date",
                            }),
                        ],

                    });

                    let resultObj = {};

                    conversionSearch.run().each(function (result) {

                        const year = result.getValue({
                            name: "formulatext",
                            summary: search.Summary.GROUP,
                        });

                        const type = result.getValue({
                            name: "type",
                            summary: search.Summary.GROUP,
                        });

                        const opportunityCount = parseInt(result.getValue({
                            name: "internalid",
                            summary: search.Summary.COUNT,
                        })) || 0;

                        const convertedCount = parseInt(result.getValue({
                            name: "formulanumeric",
                            summary: search.Summary.SUM,
                        })) || 0;

                        if (!resultObj[year]) {
                            resultObj[year] = { opportunity: 0, converted: 0 };
                        }

                        if (type === "Opprtnty") {
                            resultObj[year].opportunity = opportunityCount;
                        } else if (type === "SalesOrd") {
                            resultObj[year].converted = convertedCount;
                        }

                        return true;

                    });

                    const yearData = Object.keys(resultObj).map(function (data) {
                        return data.trim();
                    });

                    const opportunityData = Object.values(resultObj).map(function (data) {
                        return data.opportunity;
                    });

                    const convertedData = Object.values(resultObj).map(function (data) {
                        return data.converted;
                    });

                    return {
                        yearData: yearData,
                        opportunityData: opportunityData,
                        convertedData: convertedData,
                    };

                } catch (error) {
                    log.error("error", error.message);
                }

            },

            /**
             * Fetches all active employees from NetSuite.
             * @returns {Array<Object>} Array of employee objects: [{id, name}]
             */
            getAllEmployees() {
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
            },

            /**
             * Fetches all active customers with Jira project name.
             * @returns {Array<Object>} Array of customers: [{id, name}]
             */
            getAllCustomers() {
                try {
                    const customers = [];
                    search.create({
                        type: search.Type.CUSTOMER,
                        filters: [
                            ['isinactive', 'is', 'F'],
                            'AND',
                            ['subsidiary', 'anyof', '1'],
                            'AND',
                            ['custentity_jj_jira_project_name', 'isnotempty', '']
                        ],
                        columns: ['entityid', 'companyname', 'firstname', 'lastname']
                    }).run().each(result => {
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
            },

            /**
             * Fetch all status values from custom status record.
             * @returns {Array<Object>} Array of status values: [{id, name}]
             */
            getStatusValues() {
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
            },

            /**
             * Fetch all priority values from custom priority record.
             * @returns {Array<Object>} Array of priority values: [{id, name}]
             */
            getPriorityValues() {
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
            },

            /**
             * Fetch all issue type values from custom issue type record.
             * @returns {Array<Object>} Array of issue type values: [{id, name}]
             */
            getIssueValues() {
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
            },

            /**
             * Get job list + current job assigned to the estimate
             * @param {string|number} estimateId 
             * @returns {Object} { jobs:[], selectedJobId:"", selectedJobName:"" }
             */
            jobDetails(estimateId) {
                const resultData = {
                    jobs: [],
                    selectedJobId: "",
                    selectedJobName: ""
                };

                try {
                    if (!estimateId) return resultData;

                    // Load the estimate to get customer
                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const customerId = estRecord.getValue("entity") || "";
                    const selectedJobId = estRecord.getValue("job") || "";
                    resultData.selectedJobId = selectedJobId;

                    // Search for jobs linked to this customer
                    const jobSearch = search.create({
                        type: "job",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["customer", "anyof", customerId]
                        ],
                        columns: ["internalid", "altname"] // entityid is the job name
                    });

                    jobSearch.run().each(r => {
                        const jobId = r.getValue("internalid");
                        let jobName = r.getValue("altname");

                        // Ensure jobName is a string (sometimes may be returned as number)
                        if (jobName !== null && jobName !== undefined) {
                            jobName = String(jobName);
                        } else {
                            jobName = '';
                        }

                        resultData.jobs.push({
                            id: jobId,   // value of <option>
                            name: jobName // text of <option>
                        });
                        return true;
                    });

                    // Get selected job name
                    if (selectedJobId) {
                        const lookup = search.lookupFields({
                            type: "job",
                            id: selectedJobId,
                            columns: ["altname", "entityid"]
                        });

                        const selectedName = lookup?.altname || "";
                        resultData.selectedJobName = String(selectedName);
                    }

                } catch (e) {
                    log.error("jobDetails Error", e);
                }

                return resultData;
            },

            leadSourceDetails(estimateId) {
                const resultData = {
                    leadSources: [],
                    selectedLeadSourceId: "",
                    selectedLeadSourceName: ""
                };

                try {
                    if (!estimateId) return resultData;

                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const selectedLeadSourceId = estRecord.getValue("leadsource") || "";
                    resultData.selectedLeadSourceId = selectedLeadSourceId;

                    const leadSourceSearch = search.create({
                        type: "campaign",
                        filters: [["isinactive", "is", "F"]],
                        columns: ["campaignid", "title"]
                    });

                    leadSourceSearch.run().each(r => {
                        const campaignId = r.getValue("campaignid") || r.id; // fallback to internal id
                        let title = r.getValue("title") || "";

                        resultData.leadSources.push({
                            id: campaignId,
                            title: String(title)
                        });

                        return true;
                    });

                    if (selectedLeadSourceId) {
                        const lookup = search.lookupFields({
                            type: "campaign",
                            id: selectedLeadSourceId,
                            columns: ["title"]
                        });
                        resultData.selectedLeadSourceName = lookup?.title ? String(lookup.title) : "";
                    }

                } catch (e) {
                    log.error("leadSourceDetails Error", e);
                }

                return resultData;
            },

            partnerDetails(estimateId) {
                const resultData = {
                    partners: [],
                    selectedPartnerId: "",
                    selectedPartnerName: ""
                };

                try {
                    if (!estimateId) return resultData;

                    // Load Estimate to read selected partner
                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const selectedPartnerId = estRecord.getValue("partner") || "";
                    resultData.selectedPartnerId = selectedPartnerId;

                    // Search all active Partners
                    const partnerSearch = search.create({
                        type: "partner",
                        filters: [["isinactive", "is", "F"]],
                        columns: ["internalid", "companyname"]
                    });

                    partnerSearch.run().each(r => {
                        resultData.partners.push({
                            id: r.getValue("internalid"),
                            name: String(r.getValue("companyname") || "")
                        });
                        return true;
                    });

                    // Fetch selected partner name
                    if (selectedPartnerId) {
                        const lookup = search.lookupFields({
                            type: "partner",
                            id: selectedPartnerId,
                            columns: ["companyname"]
                        });

                        resultData.selectedPartnerName = lookup?.companyname || "";
                    }

                }
                catch (err) {
                    log.error("partnerDetails Error", err);
                }

                return resultData;
            },

            classDetails(estimateId) {
                const resultData = {
                    classes: [],
                    selectedClassId: "",
                    selectedClassName: ""
                };

                try {
                    if (!estimateId) return resultData;

                    // Load estimate to get subsidiary + class
                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const subsidiaryId = estRecord.getValue("subsidiary") || "";
                    const selectedClassId = estRecord.getValue("class") || "";

                    resultData.selectedClassId = selectedClassId;

                    // Search for all classes under this subsidiary
                    const classSearch = search.create({
                        type: "classification",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["subsidiary", "anyof", subsidiaryId]
                        ],
                        columns: ["internalid", "name"]
                    });

                    classSearch.run().each(r => {
                        resultData.classes.push({
                            id: r.getValue("internalid"),
                            name: r.getValue("name")
                        });
                        return true;
                    });

                    // Lookup selected class name
                    if (selectedClassId) {
                        const lookup = search.lookupFields({
                            type: "classification",
                            id: selectedClassId,
                            columns: ["name"]
                        });

                        resultData.selectedClassName = lookup?.name || "";
                    }

                }
                catch (e) {
                    log.error("classDetails Error", e);
                }

                return resultData;
            },

            departmentDetails(estimateId) {
                const resultData = {
                    departments: [],
                    selectedDepartmentId: "",
                    selectedDepartmentName: ""
                };

                try {
                    if (!estimateId) return resultData;

                    // Load estimate to get subsidiary + department
                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const subsidiaryId = estRecord.getValue("subsidiary") || "";
                    const selectedDepartmentId = estRecord.getValue("department") || "";

                    resultData.selectedDepartmentId = selectedDepartmentId;

                    // Search all departments linked to the subsidiary
                    const depSearch = search.create({
                        type: "department",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["subsidiary", "anyof", subsidiaryId]
                        ],
                        columns: ["internalid", "name"]
                    });

                    depSearch.run().each(r => {
                        resultData.departments.push({
                            id: r.getValue("internalid"),
                            name: r.getValue("name")
                        });
                        return true;
                    });

                    // Lookup selected department name
                    if (selectedDepartmentId) {
                        const lookup = search.lookupFields({
                            type: "department",
                            id: selectedDepartmentId,
                            columns: ["name"]
                        });

                        resultData.selectedDepartmentName = lookup?.name || "";
                    }

                } catch (e) {
                    log.error("departmentDetails Error", e);
                }

                return resultData;
            },

            locationDetails(estimateId) {
                const resultData = {
                    locations: [],
                    selectedLocationId: "",
                    selectedLocationName: ""
                };

                try {
                    if (!estimateId) return resultData;

                    // Load record to get subsidiary + location
                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const subsidiaryId = estRecord.getValue("subsidiary") || "";
                    const selectedLocationId = estRecord.getValue("location") || "";

                    resultData.selectedLocationId = selectedLocationId;

                    // Search all locations linked to this subsidiary
                    const locSearch = search.create({
                        type: "location",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["subsidiary", "anyof", subsidiaryId]
                        ],
                        columns: ["internalid", "name"]
                    });

                    locSearch.run().each(r => {
                        resultData.locations.push({
                            id: r.getValue("internalid"),
                            name: r.getValue("name")
                        });
                        return true;
                    });

                    // Lookup selected location name
                    if (selectedLocationId) {
                        const lookup = search.lookupFields({
                            type: "location",
                            id: selectedLocationId,
                            columns: ["name"]
                        });

                        resultData.selectedLocationName = lookup?.name || "";
                    }

                } catch (error) {
                    log.error("locationDetails Error", error);
                }

                return resultData;
            },

            itemList(estimateId) {
                const result = { items: [] };

                try {
                    // Validate input
                    if (!estimateId) {
                        log.error("itemList", "No estimateId provided");
                        return result;
                    }

                    // Load estimate to get subsidiary
                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const subsidiaryId = estRecord.getValue("subsidiary");

                    if (!subsidiaryId) {
                        log.error("itemList", `No subsidiary found for estimate ${estimateId}`);
                        return result;
                    }

                    // Item Search
                    const itemSearch = search.create({
                        type: search.Type.ITEM,
                        filters: [
                            ["isinactive", "is", "F"], "AND",
                            ["subsidiary", "anyof", subsidiaryId]
                        ],
                        columns: [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: "itemid" })
                        ]
                    });

                    itemSearch.run().each(resultRow => {
                        result.items.push({
                            id: resultRow.getValue("internalid"),
                            name: resultRow.getValue("itemid")
                        });
                        return true; // continue iteration
                    });

                } catch (e) {
                    log.error("itemList error", JSON.stringify(e));
                }

                return result;
            },

            salesRepList() {
                const result = { reps: [] };

                try {
                    const repSearch = search.create({
                        type: search.Type.EMPLOYEE,
                        filters: [
                            ["isinactive", "is", "F"]
                        ],
                        columns: [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: "firstname" }),
                            search.createColumn({ name: "lastname" })
                        ]
                    });

                    repSearch.run().each(r => {
                        result.reps.push({
                            id: r.getValue("internalid"),
                            name: `${r.getValue("firstname")} ${r.getValue("lastname")}`.trim()
                        });
                        return true;
                    });

                } catch (e) {
                    log.error("salesRepList error", JSON.stringify(e));
                }

                return result;
            },

            classList(estimateId) {
                const result = { classes: [] };

                try {
                    if (!estimateId) return result;

                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const itemCount = estRecord.getLineCount({ sublistId: "item" });
                    const itemIds = new Set();

                    // Collect item internal IDs from estimate lines
                    for (let i = 0; i < itemCount; i++) {
                        const itemId = estRecord.getSublistValue({
                            sublistId: "item",
                            fieldId: "item",
                            line: i
                        });
                        if (itemId) itemIds.add(itemId);
                    }

                    if (itemIds.size === 0) return result;

                    const classIds = new Set();

                    // Fetch class for each item
                    search.create({
                        type: "item",
                        filters: [
                            ["internalid", "anyof", Array.from(itemIds)]
                        ],
                        columns: [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: "class" })
                        ]
                    }).run().each(row => {
                        const classId = row.getValue("class");
                        if (classId) classIds.add(classId);
                        return true;
                    });

                    if (classIds.size === 0) return result;

                    // Fetch class names for the collected classIds
                    search.create({
                        type: "classification",
                        filters: [
                            ["internalid", "anyof", Array.from(classIds)]
                        ],
                        columns: ["internalid", "name"]
                    }).run().each(row => {
                        result.classes.push({
                            id: row.getValue("internalid"),
                            name: row.getValue("name")
                        });
                        return true;
                    });

                } catch (e) {
                    log.error("classList error", e);
                }

                return result;
            },

            departmentList(estimateId) {
                const result = { departments: [] };

                try {
                    if (!estimateId) return result;

                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const itemCount = estRecord.getLineCount({ sublistId: "item" });
                    const itemIds = new Set();

                    // Collect item IDs from estimate lines
                    for (let i = 0; i < itemCount; i++) {
                        const itemId = estRecord.getSublistValue({
                            sublistId: "item",
                            fieldId: "item",
                            line: i
                        });
                        if (itemId) itemIds.add(itemId);
                    }

                    if (itemIds.size === 0) return result;

                    const deptIds = new Set();

                    // Search department values for items
                    search.create({
                        type: "item",
                        filters: [
                            ["internalid", "anyof", Array.from(itemIds)]
                        ],
                        columns: [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: "department" })
                        ]
                    }).run().each(row => {
                        const deptId = row.getValue("department");
                        if (deptId) deptIds.add(deptId);
                        return true;
                    });

                    if (deptIds.size === 0) return result;

                    // Fetch department names
                    search.create({
                        type: "department",
                        filters: [
                            ["internalid", "anyof", Array.from(deptIds)]
                        ],
                        columns: ["internalid", "name"]
                    }).run().each(row => {
                        result.departments.push({
                            id: row.getValue("internalid"),
                            name: row.getValue("name")
                        });
                        return true;
                    });

                } catch (e) {
                    log.error("departmentList error", e);
                }

                return result;
            },

            unitList(estimateId) {
                const result = { units: {} }; // itemId → [abbreviation]

                try {
                    if (!estimateId) return result;

                    const estRecord = record.load({
                        type: record.Type.ESTIMATE,
                        id: estimateId
                    });

                    const itemCount = estRecord.getLineCount({ sublistId: "item" });
                    const itemIds = new Set();

                    // Collect item IDs from estimate
                    for (let i = 0; i < itemCount; i++) {
                        const itemId = estRecord.getSublistValue({
                            sublistId: "item",
                            fieldId: "item",
                            line: i
                        });
                        if (itemId) itemIds.add(itemId);
                    }

                    if (itemIds.size === 0) return result;

                    const unitTypeMap = {}; // itemId → unitTypeId

                    // STEP 1: Get each item's unitstype
                    search.create({
                        type: "item",
                        filters: [
                            ["internalid", "anyof", Array.from(itemIds)]
                        ],
                        columns: [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: "unitstype" })
                        ]
                    }).run().each(row => {
                        const itemId = row.getValue("internalid");
                        const unitTypeId = row.getValue("unitstype");
                        if (unitTypeId) unitTypeMap[itemId] = unitTypeId;
                        return true;
                    });

                    // STEP 2: For each unit type, get its subunits (only abbreviation)
                    for (const [itemId, unitTypeId] of Object.entries(unitTypeMap)) {
                        const abbreviations = [];

                        search.create({
                            type: "unitstype",
                            filters: [
                                ["internalid", "anyof", unitTypeId],
                                "AND",
                                ["isinactive", "is", "F"]
                            ],
                            columns: [
                                search.createColumn({ name: "abbreviation" })
                            ]
                        }).run().each(row => {
                            const abbr = row.getValue({ name: "abbreviation" });
                            if (abbr) abbreviations.push(abbr);
                            return true;
                        });

                        result.units[itemId] = abbreviations;
                    }

                } catch (e) {
                    log.error("unitList error", e);
                }

                return result;
            },

            salesRoleList() {
                const result = { salesRoles: [] };

                try {
                    // Search all active Sales Roles
                    search.create({
                        type: "salesrole",
                        filters: [
                            ["isinactive", "is", "F"]
                        ],
                        columns: [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: "name" })
                        ]
                    })
                        .run()
                        .each(role => {
                            result.salesRoles.push({
                                id: role.getValue({ name: "internalid" }),
                                name: role.getValue({ name: "name" })
                            });
                            return true;
                        });
                } catch (e) {
                    log.error("salesRoleList error", e);
                }

                return result;
            },

            soClassDetails(salesOrderId) {
                const resultData = {
                    classes: [],
                    selectedClassId: "",
                    selectedClassName: ""
                };

                try {
                    if (!salesOrderId) return resultData;

                    // Load estimate to get subsidiary + class
                    const soRecord = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    const subsidiaryId = soRecord.getValue("subsidiary") || "";
                    const selectedClassId = soRecord.getValue("class") || "";

                    resultData.selectedClassId = selectedClassId;

                    // Search for all classes under this subsidiary
                    const classSearch = search.create({
                        type: "classification",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["subsidiary", "anyof", subsidiaryId]
                        ],
                        columns: ["internalid", "name"]
                    });

                    classSearch.run().each(r => {
                        resultData.classes.push({
                            id: r.getValue("internalid"),
                            name: r.getValue("name")
                        });
                        return true;
                    });

                    // Lookup selected class name
                    if (selectedClassId) {
                        const lookup = search.lookupFields({
                            type: "classification",
                            id: selectedClassId,
                            columns: ["name"]
                        });

                        resultData.selectedClassName = lookup?.name || "";
                    }

                } 
                catch (e) {
                    log.error("classDetails Error", e);
                }

                return resultData;
            },

            soDepartmentDetails(salesOrderId) {
                const resultData = {
                    departments: [],
                    selectedDepartmentId: "",
                    selectedDepartmentName: ""
                };

                try {
                    if (!salesOrderId) return resultData;

                    // Load estimate to get subsidiary + department
                    const soRecord = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    const subsidiaryId = soRecord.getValue("subsidiary") || "";
                    const selectedDepartmentId = soRecord.getValue("department") || "";

                    resultData.selectedDepartmentId = selectedDepartmentId;

                    // Search all departments linked to the subsidiary
                    const depSearch = search.create({
                        type: "department",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["subsidiary", "anyof", subsidiaryId]
                        ],
                        columns: ["internalid", "name"]
                    });

                    depSearch.run().each(r => {
                        resultData.departments.push({
                            id: r.getValue("internalid"),
                            name: r.getValue("name")
                        });
                        return true;
                    });

                    // Lookup selected department name
                    if (selectedDepartmentId) {
                        const lookup = search.lookupFields({
                            type: "department",
                            id: selectedDepartmentId,
                            columns: ["name"]
                        });

                        resultData.selectedDepartmentName = lookup?.name || "";
                    }

                } catch (e) {
                    log.error("departmentDetails Error", e);
                }

                return resultData;
            },

            soLocationDetails(salesOrderId) {
                const resultData = {
                    locations: [],
                    selectedLocationId: "",
                    selectedLocationName: ""
                };

                try {
                    if (!salesOrderId) return resultData;

                    // Load record to get subsidiary + location
                    const soRecord = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    const subsidiaryId = soRecord.getValue("subsidiary") || "";
                    const selectedLocationId = soRecord.getValue("location") || "";

                    resultData.selectedLocationId = selectedLocationId;

                    // Search all locations linked to this subsidiary
                    const locSearch = search.create({
                        type: "location",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["subsidiary", "anyof", subsidiaryId]
                        ],
                        columns: ["internalid", "name"]
                    });

                    locSearch.run().each(r => {
                        resultData.locations.push({
                            id: r.getValue("internalid"),
                            name: r.getValue("name")
                        });
                        return true;
                    });

                    // Lookup selected location name
                    if (selectedLocationId) {
                        const lookup = search.lookupFields({
                            type: "location",
                            id: selectedLocationId,
                            columns: ["name"]
                        });

                        resultData.selectedLocationName = lookup?.name || "";
                    }

                } catch (error) {
                    log.error("locationDetails Error", error);
                }

                return resultData;
            },

            /**
             * Get job list + current job assigned to the estimate
             * @param {string|number} salesOrderId
             * @returns {Object} { jobs:[], selectedJobId:"", selectedJobName:"" }
             */
            soJobDetails(salesOrderId) {
                const resultData = {
                    jobs: [],
                    selectedJobId: "",
                    selectedJobName: ""
                };

                try {
                    if (!salesOrderId) return resultData;

                    // Load the estimate to get customer
                    const soRecord = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    const customerId = soRecord.getValue("entity") || "";
                    const selectedJobId = soRecord.getValue("job") || "";
                    resultData.selectedJobId = selectedJobId;

                    // Search for jobs linked to this customer
                    const jobSearch = search.create({
                        type: "job",
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["customer", "anyof", customerId]
                        ],
                        columns: ["internalid", "altname"] // entityid is the job name
                    });

                    jobSearch.run().each(r => {
                        const jobId = r.getValue("internalid");
                        let jobName = r.getValue("altname");

                        // Ensure jobName is a string (sometimes may be returned as number)
                        if (jobName !== null && jobName !== undefined) {
                            jobName = String(jobName);
                        } else {
                            jobName = '';
                        }

                        resultData.jobs.push({
                            id: jobId,   // value of <option>
                            name: jobName // text of <option>
                        });
                        return true;
                    });

                    // Get selected job name
                    if (selectedJobId) {
                        const lookup = search.lookupFields({
                            type: "job",
                            id: selectedJobId,
                            columns: ["altname", "entityid"]
                        });

                        const selectedName = lookup?.altname || "";
                        resultData.selectedJobName = String(selectedName);
                    }

                } catch (e) {
                    log.error("jobDetails Error", e);
                }

                return resultData;
            },

            soPartnerDetails(salesOrderId) {
                const resultData = {
                    partners: [],
                    selectedPartnerId: "",
                    selectedPartnerName: ""
                };

                try {
                    if (!salesOrderId) return resultData;

                    // Load Estimate to read selected partner
                    const soRecord = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    const selectedPartnerId = soRecord.getValue("partner") || "";
                    resultData.selectedPartnerId = selectedPartnerId;

                    // Search all active Partners
                    const partnerSearch = search.create({
                        type: "partner",
                        filters: [["isinactive", "is", "F"]],
                        columns: ["internalid", "companyname"]
                    });

                    partnerSearch.run().each(r => {
                        resultData.partners.push({
                            id: r.getValue("internalid"),
                            name: String(r.getValue("companyname") || "")
                        });
                        return true;
                    });

                    // Fetch selected partner name
                    if (selectedPartnerId) {
                        const lookup = search.lookupFields({
                            type: "partner",
                            id: selectedPartnerId,
                            columns: ["companyname"]
                        });

                        resultData.selectedPartnerName = lookup?.companyname || "";
                    }

                }
                catch (err) {
                    log.error("partnerDetails Error", err);
                }

                return resultData;
            },

            soLeadSourceDetails(salesOrderId) {
                const resultData = {
                    leadSources: [],
                    selectedLeadSourceId: "",
                    selectedLeadSourceName: ""
                };

                try {
                    if (!salesOrderId) return resultData;

                    const soRecord = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    const selectedLeadSourceId = soRecord.getValue("leadsource") || "";
                    resultData.selectedLeadSourceId = selectedLeadSourceId;

                    const leadSourceSearch = search.create({
                        type: "campaign",
                        filters: [["isinactive", "is", "F"]],
                        columns: ["campaignid", "title"]
                    });

                    leadSourceSearch.run().each(r => {
                        const campaignId = r.getValue("campaignid") || r.id; // fallback to internal id
                        let title = r.getValue("title") || "";

                        resultData.leadSources.push({
                            id: campaignId,
                            title: String(title)
                        });

                        return true;
                    });

                    if (selectedLeadSourceId) {
                        const lookup = search.lookupFields({
                            type: "campaign",
                            id: selectedLeadSourceId,
                            columns: ["title"]
                        });
                        resultData.selectedLeadSourceName = lookup?.title ? String(lookup.title) : "";
                    }

                } catch (err) {
                    log.error("leadSourceDetails Error", err);
                }

                return resultData;
            },

            soItemList(salesOrderId) {
                const result = { items: [] };

                try {
                    // Validate input
                    if (!salesOrderId) {
                        log.error("itemList", "No estimateId provided");
                        return result;
                    }

                    // Load estimate to get subsidiary
                    const soRecord = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    const subsidiaryId = soRecord.getValue("subsidiary");

                    if (!subsidiaryId) {
                        log.error("itemList", `No subsidiary found for estimate ${salesOrderId}`);
                        return result;
                    }

                    // Item Search
                    const itemSearch = search.create({
                        type: search.Type.ITEM,
                        filters: [
                            ["isinactive", "is", "F"], "AND",
                            ["subsidiary", "anyof", subsidiaryId]
                        ],
                        columns: [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: "itemid" })
                        ]
                    });

                    itemSearch.run().each(resultRow => {
                        result.items.push({
                            id: resultRow.getValue("internalid"),
                            name: resultRow.getValue("itemid")
                        });
                        return true; // continue iteration
                    });

                } catch (e) {
                    log.error("itemList error", JSON.stringify(e));
                }

                return result;
            },

            soOpportunityDetails(salesOrderId) {
                const resultData = {
                    opportunities: [],
                    selectedOpportunityId: "",
                    selectedOpportunityName: ""
                };

                try {
                    if (!salesOrderId) return resultData;

                    // Load Estimate to read selected partner
                    const soRecord = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    const selectedOpportunityId = soRecord.getValue("opportunity") || "";
                    resultData.selectedOpportunityId = selectedOpportunityId;

                    // Search all active Partners
                    const opportunitySearch = search.create({
                        type: "opportunity",
                        filters: [["isinactive", "is", "F"]],
                        columns: ["internalid", "title"]
                    });

                    opportunitySearch.run().each(r => {
                        resultData.opportunities.push({
                            id: r.getValue("internalid"),
                            name: String(r.getValue("title") || "")
                        });
                        return true;
                    });

                    // Fetch selected partner name
                    if (selectedPartnerId) {
                        const lookup = search.lookupFields({
                            type: "opportunity",
                            id: selectedOpportunityId,
                            columns: ["title"]
                        });

                        resultData.selectedOpportunityName = lookup?.title || "";
                    }

                }
                catch (err) {
                    log.error("partnerDetails Error", err);
                }

                return resultData;
            },

            getItemDetails(itemId) {
                const result = {
                    units: [],
                    defaultUnit: "",
                    description: "",
                    rate: 0,
                    classId: "",
                    departmentId: ""
                };

                try {
                    if (!itemId) return { success: false };

                    let unitTypeId = "";

                    // STEP 1: Get item details
                    search.create({
                        type: "item",
                        filters: [["internalid", "anyof", itemId]],
                        columns: [
                            "salesdescription",
                            "baseprice",
                            "unitstype",
                            "class",
                            "department"
                        ]
                    }).run().each(row => {
                        unitTypeId = row.getValue("unitstype");
                        result.description = row.getValue("salesdescription") || "";
                        result.rate = parseFloat(row.getValue("baseprice")) || 0;
                        result.classId = row.getValue("class") || "";
                        result.departmentId = row.getValue("department") || "";
                        return false;
                    });

                    if (!unitTypeId) {
                        return { success: true, data: result };
                    }

                    // STEP 2: Fetch units + default
                    let firstUnit = "";

                    search.create({
                        type: "unitstype",
                        filters: [
                            ["internalid", "anyof", unitTypeId],
                            "AND",
                            ["isinactive", "is", "F"]
                        ],
                        columns: ["abbreviation"]
                    }).run().each((row, i) => {
                        const abbr = row.getValue("abbreviation");
                        if (abbr) {
                            result.units.push(abbr);
                            if (!firstUnit) firstUnit = abbr; // first = default
                        }
                        return true;
                    });

                    // ✅ DEFAULT UNIT = abbreviation
                    result.defaultUnit = firstUnit;

                    return { success: true, data: result };

                } catch (e) {
                    log.error("getItemDetails error", e);
                    return { success: false };
                }
            }




        }

    });

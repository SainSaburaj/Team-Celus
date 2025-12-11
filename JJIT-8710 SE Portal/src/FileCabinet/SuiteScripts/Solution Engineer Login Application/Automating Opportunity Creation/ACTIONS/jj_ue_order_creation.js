/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
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
* Description : This script is to add send rest password link button and to create opportunity 
* REVISION HISTORY
* Version 1.0.0 : 21-February-2024 : Created the initial build by JJ0149
**************************************************************************************************************************************/
define(['N/record', 'N/search',],
    /**
 * @param{file} file
 */
    (record, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (context) => {
            try {
                if (context.newRecord.type === 'customrecord_jj_order_request_credential' && context.type === context.UserEventType.VIEW) {
                    const form = context.form;
                    form.clientScriptModulePath = './jj_cs_send_rest_password_email.js';
                    form.addButton({
                        id: 'custpage_send_email',
                        label: 'Send Password Reset Email',
                        functionName: 'sendPasswordResetEmail(' + context.newRecord.id + ')'
                    });
                }

            } catch (error) {
                log.error("Error @beforeLoad", error)
            }

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            try {
                if (scriptContext.newRecord.type === 'customrecord_jj_order_request_credential') {
                   
                    log.debug("emailValue", emailValue)
                    scriptContext.newRecord.setValue({
                        fieldId: 'externalid', 
                        value: emailValue,

                    });
                }
            } catch (error) {
                log.error("Error @beforeSubmit", error)
            }
        }
        /**
         * Function to get opportunity data
         * @param {object} newRecord 
         * @returns 
         */
        function getOpportunityData(newRecord) {
            let entity = getEntityFromEmail(newRecord.getValue('custrecord_jj_from_address'));
            log.debug("entity", entity)
            return {
                entity: entity,
                title: newRecord.getValue('custrecord_jj_title'),
                targetCategory: '23',
                emailBodyText: newRecord.getValue('custrecord_jj_description'),
                amount: newRecord.getValue('custrecord_jj_order_total'),
                orderRequestId: newRecord.id
            };
        }
        /**
         * Fucntion to get entity from the email domain provided. If more than one entity is there it will be fetching first one.
         * @param {string} email 
         * @returns 
         */
        function getEntityFromEmail(email) {
            if (!email) {
                return null;
            }

            const domain = email.split('@')[1];
            if (!domain) {
                return null;
            }

            let entityId = null;
            const customerSearch = search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['email', 'contains', domain]
                ],
                columns: ['internalid']
            });

            customerSearch.run().each(function (result) {
                entityId = result.getValue('internalid');
                return false; // Stop after the first result
            });

            return entityId;
        }
        /**
         * To create opportunity record.
         * @param {object} opportunityData 
         * @returns 
         */
        function createOpportunity(opportunityData) {
            const opportunityRecord = record.create({
                type: record.Type.OPPORTUNITY,
                isDynamic: true
            });
            try {
                setOpportunityFields(opportunityRecord, opportunityData);
                return opportunityRecord.save();
            } catch (error) {
                log.error("Error @createOpportunity", error);
                opportunityRecord.setValue({
                    fieldId: 'custrecord_jj_error',
                    value: JSON.stringify(error.message)
                });
                return opportunityRecord.save();
            }

        }
        /**
         * set opportunity fields
         * @param {object} opportunityRecord 
         * @param {object} opportunityData 
         */
        function setOpportunityFields(opportunityRecord, opportunityData) {
            opportunityRecord.setValue({
                fieldId: 'entity',
                value: opportunityData.entity
            });

            opportunityRecord.setValue({
                fieldId: 'title',
                value: opportunityData.title
            });

            opportunityRecord.setValue({
                fieldId: 'custbody_cs_target_category_form',
                value: opportunityData.targetCategory
            });

            opportunityRecord.setValue({
                fieldId: 'custbody2',
                value: opportunityData.emailBodyText
            });

            opportunityRecord.setValue({
                fieldId: 'projectedtotal',
                value: opportunityData.amount
            });
            opportunityRecord.setValue({
                fieldId: 'custbody_jj_order_request',
                value: opportunityData.orderRequestId
            });
        }
        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (context) => {
            if (context.newRecord.type === 'customrecord_jj_order_request_credential') {
                try {
                    const emailValue = context.newRecord.getValue({ fieldId: 'custrecord_jj_request_email' });
                    const id = context.newRecord.id
                    record.submitFields({
                        type: 'customrecord_jj_order_request_credential',
                        id: id,
                        values: {
                            externalid: emailValue
                        }
                    });

                } catch (e) {
                    log.error('Error creating Opportunity', e.message);
                }
            }


        }

        return { beforeLoad, afterSubmit }

    });

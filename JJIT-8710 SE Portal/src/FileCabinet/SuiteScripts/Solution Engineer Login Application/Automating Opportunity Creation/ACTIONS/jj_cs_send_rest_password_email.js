/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
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
* Description : This script is to send reset password link email
* REVISION HISTORY
* Version 1.0.0 : 21-February-2024 : Created the initial build by JJ0149
**************************************************************************************************************************************/
define(['N/email', 'N/record', 'N/runtime', 'N/ui/message', 'N/search'],
    /**
     * 
     * @param {object} email 
     * @param {object} record 
     * @param {object} runtime 
     * @param {object} url 
     * @param {object} message 
     * @param {object} search 
     * @returns 
     */
    function (email, record, runtime, message, search) {

        const BASE_URL = 'https://5742736.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1024&deploy=1&compid=5742736&ns-at=AAEJ7tMQL9Tri5JLG_3XFKpOSabc7UkdR9r2XF1NZtmKg6MmUjY'
        /**
         * Sends a password reset email to the user associated with the given record ID.
         * @param {number|string} recordId - The internal ID of the custom record containing the user's email.
         */
        function sendPasswordResetEmail(recordId) {
            try {
                const lookupFields = search.lookupFields({
                    type: 'customrecord_jj_order_request_credential',
                    id: recordId,
                    columns: ['custrecord_jj_request_email']
                });
                const userEmail = lookupFields.custrecord_jj_request_email;
                const userName = 'User'
                const resetPasswordLink = generateResetPasswordLink(userEmail);
                const otp = generateOTP();
                otp && record.submitFields({
                    id : recordId,
                    type: 'customrecord_jj_order_request_credential',
                    values: {
                        custrecord_jj_request_otp: otp
                    }
                })
                const loginLink = `${BASE_URL}&action=login`;
                const emailSubject = 'Password Reset Request';
                const emailBody = getEmailBodyTemplate(userName, resetPasswordLink, otp, loginLink);
                email.send({
                    author: runtime.getCurrentUser().id,
                    recipients: userEmail,
                    subject: emailSubject,
                    body: emailBody
                });
                message.create({
                    title: "Success",
                    message: "Password reset email sent successfully.",
                    type: message.Type.CONFIRMATION,
                    duration: 5000
                }).show();
            } catch (e) {
                log.error('Error sending password reset email', e);
                message.create({
                    title: "Error",
                    message: "Failed to send password reset email.",
                    type: message.Type.ERROR,
                    duration: 5000
                }).show();
            }
        }
        /**
         * Generates a password reset link for the given email address. 
         * @param {string} email - The user's email address.
         * @returns {string} The password reset link.
         */
        function generateResetPasswordLink(email) {
            return `${BASE_URL}&email=${encodeURIComponent(email)}&action=reset`;
        }
        /**
         * Generates a one-time password (OTP).
         * @returns {string} A 6-digit OTP.
         */
        function generateOTP() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }
        /**
         * Generates the email body for the password reset email.
         * 
         * @param {string} userName - The name of the user.
         * @param {string} resetPasswordLink - The password reset link.
         * @param {string} otp - The one-time password.
         * @param {string} loginLink - The login link.
         * @returns {string} The HTML content of the email.
         */
        function getEmailBodyTemplate(userName, resetPasswordLink, otp, loginLink) {
            return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #0E4C92;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                .content p {
                    margin: 1em 0;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    background-color: #f4f4f4;
                    color: #777;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 20px;
                    margin: 10px 0;
                    color: white;
                    background-color: #0E4C92;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 16px;
                }
                .signature {
                    margin-top: 20px;
                    text-align: center;
                }
                .signature img {
                    max-width: 150px;
                    height: auto;
                    display: block;
                    margin: 10px auto;
                }
                @media (max-width: 600px) {
                    .container {
                        border-radius: 0;
                    }
                    .header, .footer {
                        padding: 15px;
                        font-size: 20px;
                    }
                    .content {
                        padding: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    Password Reset Request
                </div>
                <div class="content">
                    <p>Dear ${userName},</p>
                    <p>You have requested to reset your password. Please use the following details to reset your password and log in to your account.</p>
                    <p><strong>Reset Password Link:</strong> <a href="${resetPasswordLink}" class="button">Reset Password</a></p>
                    <p><strong>One-Time Password (OTP):</strong> ${otp}</p>
                    <p><strong>Login Link:</strong> <a href="${loginLink}">Login to Your Account</a></p>
                    <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
                    <p>Thank you,</p>
                    <p>Jobin and Jismi</p>
                </div>
                <div class="footer">
                    &copy; 2024 Jobin and Jismi. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `;
        }

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            // console.log("pageinit")
            // let nameField = scriptContext.currentRecord.getField({
            //     fieldId: 'name'
            // });
            // nameField.isDisabled = true;
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            try {
                const currentRecord = scriptContext.currentRecord;
                const fieldId = scriptContext.fieldId;
                console.log("fieldId", fieldId)
                if (fieldId === 'custrecord_jj_request_email') {
                    const emailValue = currentRecord.getValue({ fieldId: 'custrecord_jj_request_email' });

                    currentRecord.setValue({
                        fieldId: 'externalid',
                        value: emailValue,
                        ignoreFieldChange: true 
                    });
                }
            } catch (error) {
                log.error("Error @fieldChanged", error)
            }
        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

        }

        return {
            pageInit: pageInit,
            sendPasswordResetEmail: sendPasswordResetEmail,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord
        };

    });

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NAmdConfig /SuiteScripts/Solution Engineer Login Application/Automating Opportunity Creation/LIBRARY/cryptoJS_path_specifier.json
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
define(['N/file', 'crypto', 'N/crypto', 'N/record', '../MODEL/jj_cm_model.js', 'N/email', 'N/search', 'N/runtime'],
    (file, crypto, nscrypto, record, model, mail, search, runtime) => {
        const FOLDER_ID = 165218;
        const XORCipher = {
            encode: function encode(key, data) {
                data = this.xor_encrypt(key, data);
                return this.b64_encode(data);
            },
            decode: function decode(key, data) {
                data = this.b64_decode(data);
                return this.xor_decrypt(key, data);
            },
            b64_table: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            b64_encode: function b64_encode(data) {
                let o1,
                    o2,
                    o3,
                    h1,
                    h2,
                    h3,
                    h4,
                    bits,
                    r,
                    i = 0,
                    enc = "";
                if (!data) {
                    return data;
                }
                do {
                    o1 = data[i++];
                    o2 = data[i++];
                    o3 = data[i++];
                    bits = o1 << 16 | o2 << 8 | o3;
                    h1 = bits >> 18 & 0x3f;
                    h2 = bits >> 12 & 0x3f;
                    h3 = bits >> 6 & 0x3f;
                    h4 = bits & 0x3f;
                    enc += this.b64_table.charAt(h1) + this.b64_table.charAt(h2) + this.b64_table.charAt(h3) + this.b64_table.charAt(h4);
                } while (i < data.length);
                r = data.length % 3;
                return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
            },
            b64_decode: function b64_decode(data) {
                let o1,
                    o2,
                    o3,
                    h1,
                    h2,
                    h3,
                    h4,
                    bits,
                    i = 0,
                    result = [];
                if (!data) {
                    return data;
                }
                data += "";
                do {
                    h1 = this.b64_table.indexOf(data.charAt(i++));
                    h2 = this.b64_table.indexOf(data.charAt(i++));
                    h3 = this.b64_table.indexOf(data.charAt(i++));
                    h4 = this.b64_table.indexOf(data.charAt(i++));
                    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
                    o1 = bits >> 16 & 0xff;
                    o2 = bits >> 8 & 0xff;
                    o3 = bits & 0xff;
                    result.push(o1);
                    if (h3 !== 64) {
                        result.push(o2);
                        if (h4 !== 64) {
                            result.push(o3);
                        }
                    }
                } while (i < data.length);
                return result;
            },
            keyCharAt: function keyCharAt(key, i) {
                return key.charCodeAt(Math.floor(i % key.length));
            },
            xor_encrypt: function xor_encrypt(key, data) {
                let rta = [];
                for (let i = 0; i < data.length; i++) {
                    let c = data[i];
                    rta.push(c.charCodeAt(0) ^ this.keyCharAt(key, i));
                }
                return rta;
            },
            xor_decrypt: function xor_decrypt(key, data) {
                let rta = [];
                for (let i = 0; i < data.length; i++) {
                    let c = data[i];
                    rta.push(String.fromCharCode(c ^ this.keyCharAt(key, i)));
                }

                return rta.join("");
            }
        };

        /**
        * Opportunity status dropdown options
        * @type {Array<Object>}
        */
        const opportunityStatuses = [
            { id: '17', name: 'Qualified Prospect' },
            { id: '8', name: 'In Discussion' },
            { id: '10', name: 'Proposal' },
            { id: '11', name: 'In Negotiation' },
            { id: '12', name: 'Purchasing' },
            { id: '13', name: 'Closed Won' },
            { id: '14', name: 'Closed Lost' },
            { id: '15', name: 'Renewal' },
            { id: '16', name: 'Lost Customer' },
            { id: '9', name: 'Identified Decision Makers' }
        ];

        /**
         * Forecast type dropdown options
         * @type {Array<Object>}
         */
        const forecastTypes = [
            { id: '0', name: 'Omitted' },
            { id: '1', name: 'Worst Case' },
            { id: '2', name: 'Most Likely' },
            { id: '3', name: 'Upside' }
        ];

        /**
         * Sales type dropdown options
         * @type {Array<Object>}
         */
        const salesTypes = [
            { id: '1', name: 'New Business' },
            { id: '2', name: 'Renewal' },
            { id: '3', name: 'Upsell' }
        ];

        const opportunityForms = [
        ];

        const USER_AUTH = {
            BASE_URL: 'https://5742736.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1024&deploy=1&compid=5742736&ns-at=AAEJ7tMQL9Tri5JLG_3XFKpOSabc7UkdR9r2XF1NZtmKg6MmUjY',
            /**
             * Generates a random string of the specified length.
             * 
             * @param {number} [length = 8] - The length of the random string to generate. Default is 8.
             * @returns {string} The generated random string.
             */
            getRandomString(length = 8) {
                // Declare all characters
                let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                // Pick characers randomly
                let str = '';
                for (let i = 0; i < length; i++) {
                    str += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                return str;

            },
            /**
             * Decrypts the password using AES decryption.
             * 
             * @param {Object} requestBody - The request body containing the encrypted password data.
             * @param {string} requestBody.newPassword - The encrypted password in Base64 format.
             * @param {string} requestBody.iv - The initialization vector in Hex format.
             * @param {string} requestBody.timeStamp - The timestamp used for generating the encryption key.
             * @returns {string|boolean} The decrypted password if successful, or false if decryption fails.
             */
            decryptPassword(requestBody) {
                try {
                    const { newPassword, iv, timeStamp } = requestBody;
                    if (newPassword && iv && timeStamp) {
                        const keyString = crypto.SHA256(timeStamp).toString(crypto.enc.Hex).substring(0, 32);
                        const key = crypto.enc.Utf8.parse(keyString);
                        const base64_data = crypto.enc.Base64.parse(newPassword);
                        const ivWordArray = crypto.enc.Hex.parse(iv);
                        const decryptedBytes = crypto.AES.decrypt({ ciphertext: base64_data }, key, {
                            iv: ivWordArray,
                            padding: crypto.pad.Pkcs7,
                            mode: crypto.mode.CBC
                        });
                        return decryptedBytes.toString(crypto.enc.Utf8);
                    } else {
                        return false;
                    }
                } catch (error) {
                    log.error("Error @decryptPassword", error);
                    return false;
                }
            },
            /**
             * Resets the user's password using the provided OTP and email.
             * 
             * @param {Object} requestBody - The request body containing the OTP and email.
             * @param {string} requestBody.otp - The one-time password provided by the user.
             * @param {string} requestBody.email - The email address of the user.
             * @returns {Object} The response object indicating success or failure and the corresponding message.
             */
            resetPassword(requestBody) {
                const { otp, email } = requestBody;
                if (otp && email) {
                    const credentialRecordId = model.getCredential(email, otp);
                    let response;
                    if (credentialRecordId) {
                        const decryptedPassword = this.decryptPassword(requestBody);
                        if (decryptedPassword) {
                            record.submitFields({
                                type: 'customrecord_jj_order_request_credential',
                                id: credentialRecordId,
                                values: {
                                    custrecord_jj_request_password: decryptedPassword,
                                    custrecord_jj_request_otp: "",
                                    custrecord_jj_is_default_pass_changed: true
                                }
                            });
                            response = {
                                success: true,
                                message: 'Password updated successfully.'
                            };
                        } else {
                            response = {
                                success: false,
                                message: 'Password decryption failed.'
                            };
                        }
                    } else {
                        response = {
                            success: false,
                            message: 'Invalid Email Id or OTP'
                        };
                    }
                    return response;
                } else {
                    return {
                        success: false,
                        message: 'Invalid Email Id or OTP'
                    };
                }
            },
            /**
             * Stores the session token in the specified record.
             * 
             * @param {string} token - The session token to store.
             * @param {number|string} credentialRecordId - The internal ID of the custom record to store the token in.
             */
            storeSessionToken(token, credentialRecordId) {
                record.submitFields({
                    type: 'customrecord_jj_order_request_credential',
                    id: credentialRecordId,
                    values: {
                        custrecord_jj_session_token_id: token
                    }
                })
            },
            /**
             * Authenticates the user and generates a session token if successful.
             * 
             * @param {Object} requestBody - The request body containing the email and encrypted password.
             * @param {string} requestBody.email - The email address of the user.
             * @returns {Object} The response object indicating success or failure, and the corresponding message and token.
             */
            login(requestBody) {
                const email = requestBody.email;
                const credentialRecordId = model.getCredential(email, false);
                let response;
                if (credentialRecordId) {
                    const decryptedPassword = this.decryptPassword(requestBody);
                    if (decryptedPassword) {

                        const options = {
                            recordType: 'customrecord_jj_order_request_credential',
                            recordId: Number(credentialRecordId),
                            fieldId: 'custrecord_jj_request_password',
                            value: decryptedPassword
                        };
                        if (nscrypto.checkPasswordField(options)) {
                            const token = this.getRandomString(32);
                            let key = 'tdgakweufjgjh'
                            const encryptedToken = XORCipher.encode(key, token);
                            this.storeSessionToken(token, credentialRecordId);
                            response = {
                                success: true,
                                message: 'Success',
                                token: encryptedToken,
                                recordId: XORCipher.encode(key, credentialRecordId)
                            };
                        } else {
                            response = {
                                success: false,
                                message: 'Invalid credential',
                                token: ''
                            };
                        }
                    } else {
                        response = {
                            success: false,
                            message: 'Something went wrong. Please contact administrator',
                            token: ''
                        };
                    }
                } else {
                    response = {
                        success: false,
                        message: 'Invalid Email Id',
                        token: ''
                    };
                }
                return response;
            },


            /**
             * Creates a new order request with the provided information and file.
             * 
             * @param {Object} request - The request object containing the order details and file.
             * @returns {Object} The response object indicating success or failure and the corresponding message.
             */
            createOrder(request, parameters) {
                log.debug("request", request);
                log.debug("parameters", parameters);
                let file = request.file;
                const { title, description, customer, fileData, recordId } = parameters;
                log.debug("fileData", fileData);
                let fileDataArray = JSON.parse(fileData);
                log.debug("fileDataArray", fileDataArray);
                let fileId;
                // if (file) {
                //     fileId = saveFile(file);
                // }

                let oppId = createOpportunity(fileId, title, description, customer, fileDataArray, recordId);

                if (oppId) {
                    let documentNumberObject = search.lookupFields({
                        id: oppId,
                        type: 'opportunity',
                        columns: ['tranid']
                    });
                    let documentNumber = documentNumberObject.tranid
                    return {
                        success: true,
                        message: 'Opportunity: ' + documentNumber
                    }
                } else
                    return {
                        success: false,
                        message: 'Order Request failed'
                    }

            },
            /**
             * Generates a secure reset password link for the given email address.
             * 
             * @param {string} email - The email address to generate the reset link for.
             * @returns {string} The generated reset password link.
             */
            generateResetPasswordLink(email) {
                // Generate a secure reset password link
                return `${this.BASE_URL}&email=${encodeURIComponent(email)}&action=reset`;
            },
            /**
             * Generates a random 6-digit one-time password (OTP).
             * 
             * @returns {string} The generated OTP.
             */
            generateOTP() {
                // Generate a random 6-digit OTP
                return Math.floor(100000 + Math.random() * 900000).toString();
            },
            /**
             * Generates the HTML email body for a password reset email.
             * 
             * @param {string} userName - The name of the user.
             * @param {string} resetPasswordLink - The reset password link.
             * @param {string} otp - The one-time password.
             * @param {string} loginLink - The login link.
             * @returns {string} The HTML email body content.
             */
            getEmailBodyTemplate(userName, resetPasswordLink, otp, loginLink) {
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
            },
            /**
             * Sends a password reset email to the user with the provided email address.
             * 
             * @param {Object} requestBody - The request body containing the email address.
             * @param {string} requestBody.email - The email address of the user.
             * @returns {Object} The response object indicating success or failure and the corresponding message.
             */
            sendPasswordResetEmail(requestBody) {
                try {
                    const email = requestBody.email;
                    let recordId = model.getCredential(email, false);
                    if (recordId) {
                        const lookupFields = search.lookupFields({
                            type: 'customrecord_jj_order_request_credential',
                            id: recordId,
                            columns: ['custrecord_jj_request_email']
                        });
                        const userEmail = lookupFields.custrecord_jj_request_email;
                        const userName = 'User'
                        const resetPasswordLink = this.generateResetPasswordLink(userEmail);
                        const otp = this.generateOTP();
                        otp && record.submitFields({
                            id: recordId,
                            type: 'customrecord_jj_order_request_credential',
                            values: {
                                custrecord_jj_request_otp: otp
                            }
                        })
                        const loginLink = `${this.BASE_URL}&action=login`;
                        const emailSubject = 'Password Reset Request';
                        const emailBody = this.getEmailBodyTemplate(userName, resetPasswordLink, otp, loginLink);
                        mail.send({
                            author: -5,
                            recipients: userEmail,
                            subject: emailSubject,
                            body: emailBody
                        });
                        return {
                            success: true,
                            message: 'Check you Email. Reset link is succsessfully sent.'
                        };

                    } else {
                        return {
                            success: false,
                            message: 'Invalid Email'
                        };
                    }

                }
                catch (error) {
                    log.error("Error @sendPasswordResetEmail", error);
                    return {
                        success: false,
                        message: 'Something went wrong. Please contact Administrator'
                    };
                }
            },
            /**
             * Validates the session token for the given user.
             * 
             * @param {Object} requestBody - The request body containing the session token and record ID.
             * @param {string} requestBody.token - The encrypted session token.
             * @param {string} requestBody.recordId - The encrypted record ID.
             * @returns {Object} The response object indicating whether the session is valid or not.
             */
            isValidSession(requestBody) {
                let { token, recordId } = requestBody
                if (token && recordId) {
                    let key = 'tdgakweufjgjh'
                    let decryptedToken = XORCipher.decode(key, token);
                    //log.debug("decrypted token", decryptedToken);
                    let decryptedRecordId = XORCipher.decode(key, recordId);
                    // log.debug("decrypted recordId", decryptedRecordId);
                    let nsToken = search.lookupFields({
                        type: 'customrecord_jj_order_request_credential',
                        id: decryptedRecordId,
                        columns: 'custrecord_jj_session_token_id'
                    });
                    //log.debug("nsToken", nsToken.custrecord_jj_session_token_id);
                    //log.debug("token", decryptedToken)
                    if (nsToken.custrecord_jj_session_token_id === decryptedToken) {
                        return {
                            success: true,
                            message: 'Valid session'
                        }
                    } else {
                        return {
                            success: false,
                            message: 'inValid session'
                        }
                    }
                } else {
                    return {
                        success: false,
                        message: 'inValid session'
                    }
                }

            },
            /**
             *  Retrieves the customer details based on the provided ID.
             * @param {object} request 
             * @returns 
             */
            getCustomerDetails(request) {
                try {
                    let key = 'tdgakweufjgjh'
                    let id = XORCipher.decode(key, request.id);
                    log.debug(" decoded id", id);
                    return model.fetchCustomerDetails(id, false);
                } catch (error) {
                    log.error("Error @getCustomerDetails", error);
                    return {
                        success: false,
                        data: []
                    };
                }
            }
        };

        /**
        * Get customers by email from custom record
        * @param {string} email - Email address to search
        * @returns {Object} customersObj - Map of customerId: customerName
         */
        function getCustomersByEmail(email) {
            const customersObj = {};

            try {
                const customrecordSearch = search.create({
                    type: "customrecord_jj_order_request_credential",
                    filters: [["custrecord_jj_request_email", "is", email]],
                    columns: [
                        search.createColumn({
                            name: "custrecord_jj_opp_creation_customer",
                            join: "CUSTRECORD_JJ_OPP_CREATION_CREDENTIAL",
                            label: "Customer"
                        })
                    ]
                });

                customrecordSearch.run().each(result => {
                    const fieldConfig = {
                        name: "custrecord_jj_opp_creation_customer",
                        join: "CUSTRECORD_JJ_OPP_CREATION_CREDENTIAL"
                    };

                    const customerId = result.getValue(fieldConfig);
                    const customerName = result.getText(fieldConfig);

                    if (customerId) {
                        customersObj[String(customerId)] = customerName || `Customer ${customerId}`;
                    }
                    return true;
                });

                log.debug("Customer id-name object", customersObj);
            } catch (error) {
                log.error("Error in getCustomersByEmail", error);
            }

            return customersObj;
        }



        /**
         * Get internal ID of employee
         *
         * @param {string} emailId - The email address to filter by
         * @returns internal ID using email
         */
        function getEmployeeIdByEmail(emailId) {
            try {
                const employeeSearch = search.create({
                    type: search.Type.EMPLOYEE,
                    filters: [
                        ['email', 'is', emailId]
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' })
                    ]
                });

                const results = employeeSearch.run().getRange({ start: 0, end: 1 });

                if (results && results.length > 0) {
                    return results[0].getValue({ name: 'internalid' });
                }
            }
            catch (error) {
                log.error("Error in getEmployeeIdByEmail", error);
            }

            return null;
        }

        /**
         * Modifies the folder property of the provided file object and saves it.
         * @param {Object} fileObj - The file object to be saved.
         * @returns {string|boolean} - The ID of the saved file object if successful, otherwise false.
         */
        function saveFile(fileObj) {
            fileObj.folder = FOLDER_ID;
            let newName = fileObj.name + (new Date().getTime());
            fileObj.name = newName;
            return fileObj.save();
        }
        /**
         * Function to check if logged in employee is sales manager
         */
        function checkIfSalesManager(userEmail) {
            try {
                const result = search.create({
                    type: "customrecord_jj_order_request_credential",
                    filters: [
                        ["custrecord_jj_request_email", "is", userEmail] // use your email field ID
                    ],
                    columns: [
                        "custrecord_jj_sales_manager"
                    ]
                }).run().getRange({ start: 0, end: 1 });

                const isSalesManager = result && result.length > 0
                    ? result[0].getValue("custrecord_jj_sales_manager") === true || result[0].getValue("custrecord_jj_sales_manager") === "T"
                    : false;

                log.debug("isSalesManager", isSalesManager);
                return isSalesManager;

            }
            catch (err) {
                log.error("Error in checkIfSalesManager", err);
                return false;
            }
        }



        /**
         * Creates an order request record with the given parameters and attaches a file to it.
         * @param {number} fileId - The ID of the file to be attached to the order request.
         * @param {string} title - The title of the order request.
         * @param {string} description - The description of the order request.
         * @param {string} email - The email address associated with the order request.
         * @param {number} orderTotal - The total amount of the order.
         * @returns {string|boolean} - The ID of the created order request record if successful, otherwise false.
         */
        function createOpportunity(fileId, title, description, customer, fileData, recordId) {
            try {

                const key = 'tdgakweufjgjh';
                //const employeeData = model.fetchEmployeeDetails();
                log.debug("recordId", recordId)
                const credentialRecordId = XORCipher.decode(key, recordId);
                log.debug(" credentialRecordId", credentialRecordId);
                const customerDetail = model.fetchCustomerDetails(credentialRecordId, customer);
                const rateObject = search.lookupFields({
                    type: record.Type.CUSTOMER,
                    id: customer,
                    columns: ['custentity4']
                });
                let rate = rateObject.custentity4;
                let customerDetails = customerDetail.data
                log.debug("customerDetails.salesrepClass", customerDetails[0].salesRepClass);
                log.debug("customerDetails.subsidiary", customerDetails[0].subsidiary);
                try {
                    const opportunity = record.create({
                        type: record.Type.OPPORTUNITY,
                        isDynamic: true
                    });
                    opportunity.setValue({ fieldId: 'entity', value: customer });
                    opportunity.setValue({ fieldId: 'title', value: title });
                    opportunity.setValue({ fieldId: 'subsidiary', value: customerDetails[0].subsidiary });
                    opportunity.setValue({ fieldId: 'class', value: customerDetails[0].salesRepClass });
                    opportunity.setValue({ fieldId: 'department', value: customerDetails[0].department });
                    opportunity.setValue({ fieldId: 'location', value: customerDetails[0].location });
                    //opportunity.setValue({ fieldId: 'cseg_jj_sales_type', value: customerDetails.salesType });
                    opportunity.setValue({ fieldId: 'memo', value: description });
                    opportunity.setValue({ fieldId: 'custbody_jj_opp_creation_se', value: credentialRecordId });
                    let newRate = parseFloat(rate.replace(/,/g, ''))

                    if (fileData && fileData.length > 0) {
                        opportunity.selectNewLine({ sublistId: 'item' });
                        fileData.forEach(function (item) {
                            log.debug("item", item);
                            log.debug(typeof (rate), newRate);
                            log.debug(typeof (rate), rate);
                            if (item.Item) {
                                opportunity.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: item.Item });
                                opportunity.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: item.Hours });
                                opportunity.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: item.Task });


                                opportunity.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: newRate });
                                opportunity.setCurrentSublistValue({ sublistId: 'item', fieldId: 'class', value: customerDetails[0].salesRepClass });
                                opportunity.commitLine({ sublistId: 'item' });
                            }

                        });
                    }

                    const opportunityId = opportunity.save({
                        ignoreMandatoryFields: true
                    });
                    log.debug('Opportunity Created', 'Opportunity ID: ' + opportunityId);
                    return opportunityId;
                } catch (e) {
                    log.error('Error Creating Opportunity', e);
                    throw e;
                }

                // Attach the file to the custom record
                // fileId && record.attach({
                //     record: {
                //         type: 'file',
                //         id: fileId
                //     },
                //     to: {
                //         type: 'customrecord_jj_order_request',
                //         id: recordId
                //     }
                // });

                // log.debug('Record Created and File Attached', 'Record ID: ' + recordId);
                // return recordId;
            } catch (error) {
                log.error("Error @createOpportunity", error);
                return false
            }
        }
        /**
         * Returns the file path based on the provided action.
         * @param {string} action - The action for which the file path is required ('reset', 'upload', 'forgot', or any other).
         * @returns {string} - The file path corresponding to the provided action.
         */
        function
            getPageFilePath(action) {
            switch (action) {
                case 'reset':
                    return '../VIEW/jj_home_page.html';
                case 'upload':
                    return '../VIEW/jj_home_page.html';
                case 'forgot':
                    return '../VIEW/jj_home_page.html';
                case 'home':
                    return '../VIEW/jj_home_page.html';
                // case 'opportunityform':
                //     return '../VIEW/jj_home_page.html';
                case 'editopp':
                    return '../VIEW/jj_home_page.html';
                case 'help':
                    return '../VIEW/jj_home_page.html';
                case 'report':
                    return '../VIEW/jj_home_page.html';
                case 'implementation':
                    return '../VIEW/jj_add_imp_details.html';
                case 'leaddetails':
                    return '../VIEW/jj_home_page.html';
                case 'opportunityform':
                    return '../VIEW/jj_opportunity_layouts.html';
                case 'kanbanBoard':
                    return '../VIEW/jj_sales_process_kanban_board.html';

                case 'getKanbanEstimateDetails':
                    return '../VIEW/jj_estimate_details.html';
                case 'getKanbanOpportunityDetails':
                    return '../VIEW/jj_opportunity_details.html';
                case 'getKanbanSalesOrderDetails':
                    return '../VIEW/jj_salesorder_details.html';

                case 'createepic':
                    return '../VIEW/jj_create_epic_view.html';
                case 'listestimate':
                    return '../VIEW/jj_list_estimates.html';

                case 'approveso':
                    return '../VIEW/jj_approve_sales_order.html';

                default:
                    return '../VIEW/jj_login_page.html';
            }
        }
        /**
         * 
         * @param {*} request
         * @returns 
         */
        function getHistory(request) {
            try {
                log.debug("getHistory request", request);
                let key = 'tdgakweufjgjh'
                let id = XORCipher.decode(key, request.id);
                let tranid = request.tranid;
                let fromDate = request.fromDate;
                let toDate = request.toDate;

                log.debug(" decoded id", id);
                let history = model.fetchOpportunityHistory(id, tranid, fromDate, toDate);
                log.debug("history", history)
                return {
                    success: true,
                    data: history || []

                }

            } catch (error) {
                log.error("Error @getHistory", error)
            }
        }
        /**
         * 
         * @param {*} leadId 
         * @param {*} request 
         */
        function updateLeadRecord(leadId, request) {
            try {
                log.debug("updateLeadRecord request", request);
                log.debug("leadId", leadId);
                let key = 'tdgakweufjgjh'

                let recordId = request.recordId;
                let id = XORCipher.decode(key, recordId);
                let leadRecordData = model.fetchLeadDetails(id, leadId);
                log.debug("leadRecordData", leadRecordData);
                if (leadId !== null && leadId !== '') {
                    let leadRecord = record.submitFields({
                        id: leadId,
                        type: 'entity',
                        values: {
                            custentity13: request.coreProcesses,
                            custentity14: request.processPainPoints,
                            custentity15: request.departmentSpecificNeeds,
                            custentity16: request.customizationRequests,
                            custentity17: request.dataMigration,
                            custentity18: request.integrationNeeds,
                            custentity19: request.userRolePermissions,
                            custentity20: request.reportingRequirements,
                            custentity21: request.workflowRequirements,
                            custentity22: request.complianceRequirements,
                            custentity23: request.futureNeeds
                        }
                    });
                    log.debug("Lead Record Updated Successfully", leadRecord);
                }
                return {
                    success: true,
                    message: 'Lead Record Updated Successfully'
                }
            } catch (error) {
                log.error("Error @updateLeadRecord", error);
            }
        }
        /**
         * fetchLeadDetails
         * @returns 
         */
        function fetchLeadDetails(request) {
            try {
                let key = 'tdgakweufjgjh'
                let id = XORCipher.decode(key, request.id);
                log.debug(" decoded id", id);
                let leadDetails = model.fetchLeadDetails(id, false)
                return {
                    success: true,
                    data: leadDetails || []
                }
            } catch (error) {
                log.error("Error @fetchLeadDetails", error);
                return {
                    success: false,
                    data: []
                }
            }
        }

        /**
         * 
         * @param {*} request 
         * @returns 
         */
        function updateOpportunityLines(request) {
            try {

                let id = request.internalId;
                let lines = request.lines;
                log.debug("updateOpportunityLines", lines);
                log.debug("id", id);
                if (id && lines && lines.length > 0) {
                    const opportunity = record.load({
                        type: record.Type.OPPORTUNITY,
                        id: id,
                        isDynamic: true
                    });
                    const customer = opportunity.getValue({ fieldId: 'entity' });
                    const rateObject = search.lookupFields({
                        type: record.Type.CUSTOMER,
                        id: customer,
                        columns: ['custentity4']
                    });
                    let rate = rateObject.custentity4;
                    let salesRepClass = opportunity.getValue({ fieldId: 'class' });
                    log.debug(typeof (rate), rate);
                    let newRate = parseFloat(rate.replace(/,/g, ''))
                    log.debug("newRate", newRate);
                    let lineCount = opportunity.getLineCount({ sublistId: 'item' });
                    log.debug("lineCount", lineCount);
                    for (let i = lineCount - 1; i >= 0; i--) {
                        opportunity.removeLine({ sublistId: 'item', line: i });
                    }
                    let lineCountAfter = opportunity.getLineCount({ sublistId: 'item' });
                    log.debug("lineCountAfter", lineCountAfter);
                    lines.forEach(function (item, index) {
                        log.debug("item", item);
                        if (item.item) {
                            opportunity.selectLine({ sublistId: 'item', line: index });

                            opportunity.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: item.item
                            });

                            opportunity.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: item.hour
                            });

                            opportunity.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'description',
                                value: item.description
                            });

                            opportunity.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: newRate
                            });

                            opportunity.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'class',
                                value: salesRepClass
                            });

                            opportunity.commitLine({ sublistId: 'item' });
                        }
                    });

                    const oppId = opportunity.save({
                        ignoreMandatoryFields: true
                    });
                    log.debug('Opportunity Updated', 'Opportunity ID: ' + oppId);
                    return {
                        success: true,
                        message: 'Opportunity updated successfully.'
                    };

                } else {
                    return {
                        success: false,
                        message: 'Invalid Opportunity ID or lines data'
                    };
                }
            } catch (error) {
                log.error("Error @updateOpportunityLines", error);
                return {
                    success: false,
                    message: 'Something went wrong. Please contact Administrator'
                };
            }
        }
        function getReportData(request) {
            try {
                let key = 'tdgakweufjgjh'
                let id = XORCipher.decode(key, request.id);
                log.debug(" decoded id", id);
                const responseData = {
                    monthlyOrders: model.getMonthlyOrders(id),
                    conversionSummary: model.getConversionSummary(id),
                    customerConversion: model.getCustomerConversion(id)
                };
                return responseData;
            } catch (error) {
                log.error("Error @getReportData", error);
                return {};
            }
        }


        /**
         * Converts a date string from 'YYYY-MM-DD' to 'M/D/YYYY' format.
         *
         * @param {string} dateStr - The date string in 'YYYY-MM-DD' format.
         * @returns {string} - The formatted date string in 'M/D/YYYY' format.
         */
        function dateFormatter(dateStr) {
            try {
                if (!dateStr) {
                    log.error("Invalid date string", dateStr);
                    return null;
                }
                const [year, month, day] = dateStr.split('-');
                return `${parseInt(month)}/${parseInt(day)}/${year}`;
            } catch (error) {
                log.error('Error @ dateFormatter', error);
            }
        }

        /**
         * Fetches Kanban dashboard data including transaction records and summary totals.
         *
         * @function fetchKanbanData
         * @param {string} startDate - The start date for filtering records (ISO format or NetSuite-compatible).
         * @param {string} endDate - The end date for filtering records (ISO format or NetSuite-compatible).
         * @param {string|number} userId - The unique identifier of the user requesting the data.
         * @returns {KanbanData|undefined} An object containing transaction records and summary totals,
         *                                or `undefined` if an error occurs.
         *
         * @typedef {Object} KanbanData
         * @property {Array<Object>} data - List of filtered transaction records for the Kanban board.
         * @property {Object|null} recordTypeTotal - Summary totals by record type (opportunity, estimate, salesorder),
         *                                           or `null` if the user is not authorized to view totals.
         *
         * @throws {Error} Logs an error if fetching data fails.
         */
        function fetchKanbanData(startDate, endDate, userId) {
            try {
                return {
                    data: getRecords(startDate, endDate, userId),
                    recordTypeTotal: salesSummaryByType(startDate, endDate, userId),
                };
            } catch (error) {
                log.error('Error @ fetchKanbanData', error);
            }
        }

        /**
         * Fetches transaction records (Opportunity, Sales Order, Estimate) within a date range.
         *
         * @param {Date|string} startDate - Start date for the search.
         * @param {Date|string} endDate - End date for the search.
         * @param {string} [userId] - User identifier for filtering by sales team member.
         * @returns {Object[]} Array of transaction records with id, transactionNumber, stage, date,
         *                     desc, status, entity, amount, probability, entityStatus, and currency.
         */
        function getRecords(startDate, endDate, userId) {

            const resultRow = [];

            try {

                let formattedStartDate = '';

                let formattedEndDate = '';
                if (userId) {
                    employeeId = getEmployeeIdByEmail(userId);
                    log.debug('kanban - Employee ID for filtering', employeeId);
                } else {
                    log.debug('kanban - No userId available, returning all pending approval orders');
                }
                if (startDate && endDate) {
                    formattedStartDate = dateFormatter(startDate);
                    formattedEndDate = dateFormatter(endDate);
                    if (formattedStartDate && formattedEndDate) {
                        const filters = [
                            ["type", "anyof", "Opprtnty", "SalesOrd", "Estimate"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["trandate", "within", formattedStartDate, formattedEndDate],
                            "AND",
                            ["status", "noneof", "Opprtnty:C", "Estimate:C", "Estimate:X", "Estimate:B", "Estimate:V", "Opprtnty:D", "Opprtnty:B", "SalesOrd:G", "SalesOrd:C", "SalesOrd:H", "SalesOrd:D", "SalesOrd:F", "SalesOrd:E", "SalesOrd:B"]
                        ]
                        if (employeeId) {
                            filters.push("AND", ["salesteammember", "anyof", employeeId]);
                        }
                        const transactionSearchObj = search.create({
                            type: "transaction",
                            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                            filters: filters,
                            columns:
                                [
                                    search.createColumn({ name: "transactionnumber", label: "Transaction Number" }),
                                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                                    search.createColumn({ name: "recordtype", label: "Record Type" }),
                                    search.createColumn({ name: "trandate", label: "Date" }),
                                    search.createColumn({ name: "memomain", label: "Memo (Main)" }),
                                    search.createColumn({ name: "type", label: "Type" }),
                                    search.createColumn({
                                        name: "formulatext",
                                        formula: "CASE WHEN {type}='Opportunity' THEN 'opportunity' WHEN {type}='Sales Order' THEN 'salesorder' WHEN {type}='Quote' THEN 'estimate' ELSE {recordtype} END",
                                        label: "Formula (Text)"
                                    }),
                                    search.createColumn({
                                        name: "formulatext",
                                        formula: "NVL({title}, {tranid})",
                                        label: "Formula (Text)"
                                    }),
                                    search.createColumn({ name: "statusref", label: "Status" }),
                                    search.createColumn({
                                        name: "formulatext",
                                        formula: "{entitystatus}",
                                        label: "Formula (Text)"
                                    }),
                                    search.createColumn({ name: "entity", label: "Name" }),
                                    search.createColumn({ name: "amount", label: "Amount" }),
                                    search.createColumn({ name: "probability", label: "Probability" }),
                                    search.createColumn({ name: "currency", label: "Currency" })
                                ]

                        });
                        const pagedSearchData = transactionSearchObj.runPaged({
                            pagesize: 1000
                        });
                        pagedSearchData.pageRanges.forEach(function (pageRange) {
                            const currentPage = pagedSearchData.fetch({ index: pageRange.index });
                            currentPage.data.forEach(function (result) {
                                resultRow.push({
                                    id: result.getValue('internalid'),
                                    transactionNumber: result.getValue('transactionnumber'),
                                    stage: result.getValue(result.columns[6]), // Custom formula column for stage
                                    date: result.getValue('trandate'),
                                    desc: result.getValue('memomain'),
                                    status: result.getValue({ name: "statusref", label: "Status" }),
                                    entity: result.getText('entity'),
                                    amount: result.getValue('amount'),
                                    probability: result.getValue('probability'),
                                    entityStatus: result.getValue({
                                        name: "formulatext",
                                        formula: "{entitystatus}",
                                        label: "Formula (Text)"
                                    }),
                                    currency: result.getText('currency')
                                });
                            })
                        });
                        return resultRow;
                    } else {
                        log.debug('Formatted date is not available in the getRecord search');
                        return [];
                    }

                } else {

                    log.debug('Start date or end date did not available in getRecord');

                    return [];

                }

            } catch (e) {

                log.error('Error @ getRecords', e);

                return []

            }

        }


        /**
         * Calculates total amounts for Sales Orders, Estimates (Quotes), and Opportunities
         * within a specified date range using a NetSuite transaction search.
         *
         * @function salesSummaryByType
         * @param {Date|string} startDate - Start date for the search range.
         * @param {Date|string} endDate - End date for the search range.
         * @param {string} [userId] - Optional user identifier for filtering by sales team member.
         * @returns {{salesorderTotal: number, estimateTotal: number, opportunityTotal: number}|undefined}
         *          Object with summed totals for each transaction type, or `undefined` if an error occurs.
         * @throws {Error} Logs an error if the search fails.
         */
        function salesSummaryByType(startDate, endDate, userId) {
            try {
                const totals = {
                    salesorderTotal: 0,
                    estimateTotal: 0,
                    opportunityTotal: 0
                };
                let formattedStartDate = '';
                let formattedEndDate = '';
                if (startDate && endDate) {
                    formattedStartDate = dateFormatter(startDate);
                    formattedEndDate = dateFormatter(endDate);
                    if (userId) {
                        employeeId = getEmployeeIdByEmail(userId);
                        log.debug('kanban - Employee ID for filtering', employeeId);
                    } else {
                        log.debug('kanban - No userId available, returning all pending approval orders');
                    }

                    if (formattedStartDate && formattedEndDate) {
                        const filters = [
                            ["type", "anyof", "Opprtnty", "SalesOrd", "Estimate"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["trandate", "within", formattedStartDate, formattedEndDate],
                            "AND",
                            ["status", "noneof", "Opprtnty:C", "Estimate:C", "Estimate:X", "Estimate:B", "Estimate:V", "Opprtnty:D", "Opprtnty:B", "SalesOrd:G", "SalesOrd:C", "SalesOrd:H", "SalesOrd:D", "SalesOrd:F", "SalesOrd:E", "SalesOrd:B"]
                        ]
                        if (employeeId) {
                            filters.push("AND", ["salesteammember", "anyof", employeeId]);
                        }
                        const searchTotal = search.create({
                            type: "transaction",
                            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                            filters: filters,
                            columns:
                                [
                                    search.createColumn({
                                        name: "formulatext",
                                        summary: "GROUP",
                                        formula: "CASE  WHEN {type} = 'Opportunity' THEN 'opportunity'  WHEN {type} = 'Sales Order' THEN 'salesorder'  WHEN {type} = 'Quote' THEN 'estimate'  ELSE {recordtype}END",
                                        label: "Record Type"
                                    }),
                                    search.createColumn({
                                        name: "amount",
                                        summary: "SUM",
                                        label: "Amount"
                                    }),
                                ]
                        });
                        searchTotal.run().each(function (result) {
                            const recordType = result.getValue(result.columns[0]);
                            const totalAmount = parseFloat(result.getValue(result.columns[1])) || 0;
                            if (recordType === 'salesorder') {
                                totals.salesorderTotal = totalAmount;
                            } else if (recordType === 'estimate') {
                                totals.estimateTotal = totalAmount;
                            } else if (recordType === 'opportunity') {
                                totals.opportunityTotal = totalAmount;
                            }
                            return true;
                        });
                        return totals;
                    } else {
                        log.debug('Formatted date is not available in the salesSummaryByType search');
                        return totals;
                    }
                } else {
                    log.debug('Start date or end date did not available in salesSummaryByType');
                    return totals;
                }
            } catch (error) {
                log.error('Error @ salesSummaryByType', error.toString());
            }
        }

        /**
         * Retrieves the total transaction amounts for each record type (opportunity, estimate, salesorder)
         * within a specified date range using a NetSuite saved search.
         * Filters out closed or irrelevant statuses and returns grouped totals.
         *
         * @function
         * @param {string} startDate - The raw start date string (e.g., '2025-10-01').
         * @param {string} endDate - The raw end date string (e.g., '2025-10-30').
         * @returns {Object} totals - An object containing summed amounts by record type.
         * @property {number} totals.opportunityTotal - Total amount for opportunities.
         * @property {number} totals.estimateTotal - Total amount for estimates.
         * @property {number} totals.salesorderTotal - Total amount for sales orders.
         */
        function updateRecordStage(fromRecordType, toRecordType, fromId) {
            try {
                if (!fromRecordType || !toRecordType || !fromId) {
                    log.error('Missing parameters for updating record stage');
                    return false;
                }
                if (fromRecordType !== toRecordType) {
                    let transactionRecord = record.transform({
                        fromType: fromRecordType,
                        fromId: fromId,
                        toType: toRecordType,
                        isDynamic: true
                    });
                    transactionRecord.setValue({
                        fieldId: 'custbody_jj_skb_created_via_kanba',
                        value: true
                    });
                    let newRecordId = transactionRecord.save();
                    log.debug('Record transformed', `New ${toRecordType} ID: ${newRecordId}`);
                    return true;
                }
            } catch (e) {
                log.error('Error updating record stage', e);
                return false;
            }
        }

        /**
         * Retrieves basic information about the currently logged-in NetSuite user.
         * Includes ID, name, role, email, and a timestamp for last login.
         *
         * @function
         * @returns {Object} userInfo - Object containing user details.
         * @property {number|string} userInfo.id - Internal ID of the user.
         * @property {string} userInfo.name - Full name of the user.
         * @property {string} userInfo.role - Role name or ID.
         * @property {string} userInfo.email - Email address of the user.
         * @property {string} userInfo.lastLogin - Localized timestamp of the current session.
         */
        function userInformation() {
            try {
                const userObj = runtime.getCurrentUser();
                return {
                    id: userObj.id,
                    name: userObj.name,
                    role: userObj.role,
                    email: userObj.email,
                    lastLogin: new Date().toLocaleString()
                };
            } catch (error) {
                log.error('Error @ userInformation');
            }
        }

        /**
         * Retrieves the three most recent transaction records created via the Kanban interface.
         * Filters by record type and a custom body field, and returns simplified metadata.
         *
         * @function
         * @returns {Object} resultSummary - Object containing recent records and count.
         * @property {Array<Object>} resultSummary.data - Array of recent record objects.
         * @property {string} resultSummary.data[].stage - Normalized record type ('opportunity', 'estimate', 'salesorder').
         * @property {string} resultSummary.data[].timestamp - Creation date of the record.
         * @property {string} resultSummary.data[].title - Title or transaction ID.
         * @property {number} resultSummary.noOfRecords - Total number of records returned.
         */
        function getRecentRecords() {
            const result = [];
            try {
                const transactionSearchObj = search.create({
                    type: "transaction",
                    settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                    filters:
                        [
                            ["type", "anyof", "Opprtnty", "Estimate", "SalesOrd"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["custbody_jj_skb_created_via_kanba", "is", "T"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "formulatext",
                                formula: "CASE WHEN {type}='Opportunity' THEN 'opportunity' WHEN {type}='Sales Order' THEN 'salesorder' WHEN {type}='Quote' THEN 'estimate' ELSE {recordtype} END",
                                label: "orderType"
                            }),
                            search.createColumn({ name: "datecreated", label: "Date Created", sort: search.Sort.DESC }),
                            search.createColumn({
                                name: "formulatext",
                                formula: "NVL({title}, {tranid})",
                                label: "title"
                            })
                        ]
                });
                let searchResult = transactionSearchObj.run().getRange({
                    start: 0,
                    end: 3
                });
                for (let i = 0; i < searchResult.length; i++) {
                    let resultRow = searchResult[i];
                    result.push({
                        stage: resultRow.getValue(resultRow.columns[0]),
                        timestamp: resultRow.getValue(resultRow.columns[1]),
                        title: resultRow.getValue(resultRow.columns[2])
                    });
                }
                return result;
            } catch (e) {
                log.error(`Error fetching ${recordType} records`, e);
            }
            return { data: result, noOfRecords: result.length };
        }


        /**
        * Returns all available status options for Quote (Estimate) as an object.
        * Keys = internal IDs, Values = display text
        */
        function getQuoteStatuses() {
            const statusMap = {};

            // Perform a search to get distinct entity statuses from Estimate transactions
            const estimateSearch = search.create({
                type: search.Type.ESTIMATE,
                columns: ['entitystatus'],
                filters: [] // No filters to apply
            });

            // Iterate through results to fetch distinct statuses
            estimateSearch.run().each(function (result) {
                const status = result.getValue({ name: 'entitystatus' });
                if (status && !statusMap[status]) {
                    const statusText = result.getText({ name: 'entitystatus' });
                    statusMap[status] = statusText;  // Map status id to status text
                }
                return true; // Continue iterating through results
            });

            return statusMap;
        }


        /**
         * Returns a list of Estimate records filtered by request parameters.
         */
        function getEstimatesList(email, selectedCustomerId, selectedStatusId) {
            const estimateArray = [];

            try {
                const searchInternalId = getEmployeeIdByEmail(email);
                log.debug("employee internalid", searchInternalId);

                const customerInternalObj = getCustomersByEmail(email);
                let customerInternalIds = Object.keys(customerInternalObj);

                let statusId = selectedStatusId || "10";
                if (selectedCustomerId) {
                    customerInternalIds = [selectedCustomerId];
                }

                const stringSearchInternalId = String(searchInternalId);
                log.debug("String internalid", stringSearchInternalId);

                const filters = [
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['salesteammember', 'anyof', stringSearchInternalId]
                ];

                if (customerInternalIds.length > 0) {
                    filters.push('AND', ['customersubof', 'anyof', customerInternalIds]);
                }
                if (statusId) {
                    filters.push('AND', ['entitystatus', 'anyof', statusId]);
                }

                const estimateSearch = search.create({
                    type: 'estimate',
                    filters: filters,
                    columns: [
                        search.createColumn({ name: 'tranid' }),
                        search.createColumn({ name: 'entity' }),
                        search.createColumn({ name: 'trandate' }),
                        search.createColumn({ name: 'entitystatus' }),
                        search.createColumn({ name: 'total' })
                    ]
                });

                estimateSearch.run().each(result => {
                    estimateArray.push({
                        id: result.id,
                        estimateNumber: result.getValue({ name: 'tranid' }),
                        customerName: result.getText({ name: 'entity' }),
                        date: result.getValue({ name: 'trandate' }),
                        status: result.getText({ name: 'entitystatus' }),
                        total: result.getValue({ name: 'total' })
                    });
                    return true;
                });

            }
            catch (error) {
                log.error('Error in getEstimatesList', error);
            }

            return estimateArray;
        }



        /**
         * Create a Job record (Epic) in NetSuite.
         * @param {Object} data Payload from front-end
         * @returns {Record|null} NetSuite Job record object or null on error
         */
        function createJobRecord(data) {
            try {
                const job = record.create({
                    type: record.Type.JOB,
                    isDynamic: false
                });

                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);

                if (endDate < startDate) {
                    return {
                        error: true,
                        message: 'End Date cannot be earlier than Start Date!'
                    };
                }

                job.setValue({ fieldId: 'companyname', value: data.projectName });
                job.setValue({ fieldId: 'parent', value: data.customerId });
                job.setValue({ fieldId: 'custentity_jj_jira_start_date', value: startDate });
                job.setValue({ fieldId: 'custentity_jj_jira_due_date', value: endDate });
                job.setValue({ fieldId: 'custentity_jj_jira_status', value: data.status });
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

        /**
         * Create an Epic with dropdown values.
         * @param {Object} data Payload from front-end
         * @returns {Object} Result object with success status and message
         */
        function createEpicWithDropdowns(data) {
            const job = createJobRecord(data);

            if (job && job.error) {
                return { success: false, message: job.message };
            }

            if (!job) {
                return { success: false, message: 'Failed to create Job record' };
            }

            try {
                const jobId = job.save();

                // Load job record to read Jira Task ID
                const savedJob = record.load({
                    type: record.Type.JOB,
                    id: jobId
                });

                const jiraCode = savedJob.getValue('custentity_jj_jira_task_id');
                const jiraURL = 'https://jobinandjismi.atlassian.net/browse/' + jiraCode;

                return {
                    success: true,
                    message: 'Epic created successfully',
                    jobId: jobId,
                    jiraLink: jiraURL
                };

            }
            catch (e) {
                log.error('Error saving Job record', e);
                return { success: false, message: 'Error saving Job record' };
            }
        }


        /**
         * Approve sales order(s)
         * @param {Object} req - Request object containing salesOrderId or salesOrderIds
         * @returns {Object} Result object with success status and message
         */
        // 

        function approveSo(req) {
            try {
                const { salesOrderId, salesOrderIds } = req;
                // Use userId from request if present; otherwise fall back to runtime current user email
                let userId = req.userId || null;
                if (!userId) {
                    try {
                        userId = runtime && runtime.getCurrentUser ? runtime.getCurrentUser().email : null;
                    } catch (e) {
                        userId = null;
                    }
                }
                log.debug('approveSo - Request received', JSON.stringify({ salesOrderId, salesOrderIds, userId }));

                // Case 1: No IDs provided → return pending approval orders filtered by sales team
                if (!salesOrderId && !salesOrderIds) {
                    const salesOrders = [];

                    // Get employee ID from userId (email)
                    let employeeId = null;
                    if (userId) {
                        employeeId = getEmployeeIdByEmail(userId);
                        log.debug('approveSo - Employee ID for filtering', employeeId);
                    } else {
                        log.debug('approveSo - No userId available, returning all pending approval orders');
                    }

                    // Build filters - include sales team filter if employee ID exists
                    const filters = [
                        ['mainline', 'is', 'T'],
                        'AND',
                        ['status', 'anyof', 'SalesOrd:A']
                    ];

                    // Add sales team member filter if employee ID is available
                    if (employeeId) {
                        filters.push('AND', ['salesteammember', 'anyof', employeeId]);
                    }

                    search.create({
                        type: search.Type.SALES_ORDER,
                        filters: filters,
                        columns: [
                            'tranid', 'entity', 'statusref', 'trandate', 'datecreated', 'memo',
                            'salesrep', 'currency', 'terms', 'shipdate', 'location', 'department',
                            'class', 'total', 'otherrefnum'
                        ]
                    }).run().each(result => {
                        salesOrders.push({
                            id: result.id,
                            tranid: result.getValue('tranid'),
                            customer: result.getText('entity'),
                            status: result.getText('statusref'),
                            date: result.getValue('trandate'),
                            created: result.getValue('datecreated'),
                            memo: result.getValue('memo'),
                            salesRep: result.getText('salesrep'),
                            currency: result.getText('currency'),
                            terms: result.getText('terms'),
                            shipDate: result.getValue('shipdate'),
                            location: result.getText('location'),
                            department: result.getText('department'),
                            class: result.getText('class'),
                            total: result.getValue('total'),
                            ponumber: result.getValue('otherrefnum')
                        });
                        return true;
                    });
                    return { success: true, data: salesOrders };
                }

                // Case 2: Approve given IDs
                const idsToApprove = salesOrderIds || [salesOrderId];
                const results = idsToApprove.map(id => {
                    try {
                        record.submitFields({
                            type: record.Type.SALES_ORDER,
                            id,
                            values: { orderstatus: 'B' },
                            options: { enableSourcing: true, ignoreMandatoryFields: true }
                        });
                        return { id, success: true, message: 'Approved' };
                    } catch (e) {
                        log.error(`Error approving Sales Order ${id}`, e);
                        return { id, success: false, message: e.message };
                    }
                });

                const successCount = results.filter(r => r.success).length;
                const failCount = results.length - successCount;

                return {
                    success: successCount > 0,
                    message: `Approved ${successCount} order(s). Failed: ${failCount}`,
                    results
                };

            } catch (e) {
                log.error('Error @ approveSo', e);
                return { success: false, message: 'Failed to process approval: ' + e.message };
            }
        }

        /**
         * Reject sales order(s) by closing all lines to cancel the order
         * @param {Object} req - Request object containing salesOrderId or salesOrderIds
         * @returns {Object} Result object with success status and message
         */
        function rejectSo(req) {
            try {
                const { salesOrderId, salesOrderIds } = req;

                if (!salesOrderId && !salesOrderIds) {
                    return { success: false, message: 'No sales order ID provided' };
                }

                // Reject given IDs by closing all lines
                const idsToReject = salesOrderIds || [salesOrderId];
                const results = idsToReject.map(id => {
                    try {
                        // Load the sales order
                        const soRecord = record.load({
                            type: record.Type.SALES_ORDER,
                            id: id,
                            isDynamic: true
                        });

                        // Close all item lines by setting isclosed to true
                        const lineCount = soRecord.getLineCount({ sublistId: 'item' });
                        for (let i = 0; i < lineCount; i++) {
                            soRecord.selectLine({ sublistId: 'item', line: i });
                            soRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'isclosed',
                                value: true
                            });
                            soRecord.commitLine({ sublistId: 'item' });
                        }

                        const savedId = soRecord.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

                        log.debug('Sales Order Rejected (Closed)', 'Sales Order ID: ' + savedId);
                        return { id, success: true, message: 'Rejected (Closed)' };
                    } catch (e) {
                        log.error(`Error rejecting Sales Order ${id}`, e);
                        return { id, success: false, message: e.message };
                    }
                });

                const successCount = results.filter(r => r.success).length;
                const failCount = results.length - successCount;

                return {
                    success: successCount > 0,
                    message: `Rejected ${successCount} order(s). Failed: ${failCount}`,
                    results
                };

            } catch (e) {
                log.error('Error @ rejectSo', e);
                return { success: false, message: 'Failed to process rejection: ' + e.message };
            }
        }

        /**
         * Get Kanban-style details for an Estimate.
         * @param {string|number} estimateId - Estimate internal ID
         * @param {string} userEmail - Logged-in user's email
         * @returns {Object} Kanban data including header, items, sales team, reps, and manager status
         */

        function getKanbanEstimateDetails(estimateId, userEmail) {
            try {
                if (!estimateId) {
                    return { success: false, message: "No Estimate ID provided." };
                }

                const estimateRecord = record.load({
                    type: record.Type.ESTIMATE,
                    id: estimateId,
                    isDynamic: false
                });

                const header = {
                    tranid: estimateRecord.getValue("tranid"),
                    trandate: estimateRecord.getText("trandate"),
                    entity: estimateRecord.getText("entity"),
                    statusRef: estimateRecord.getValue("statusRef"),
                    status: estimateRecord.getText("entitystatus"),
                    job: estimateRecord.getText("job"),
                    title: estimateRecord.getValue("title"),
                    expectedCloseDate: estimateRecord.getText("expectedclosedate"),
                    expirationDate: estimateRecord.getText("duedate"),
                    memo: estimateRecord.getValue("memo"),
                    projectSummary: estimateRecord.getValue("custbody_jj_project_summary_invo"),
                    salesRep: estimateRecord.getText("salesrep"),
                    salesRepId: estimateRecord.getValue("salesrep"),
                    opportunity: estimateRecord.getText("opportunity"),
                    forecastType: estimateRecord.getText("forecasttype"),
                    leadSource: estimateRecord.getText("leadsource"),
                    partner: estimateRecord.getText("partner"),
                    subsidiary: estimateRecord.getText("subsidiary"),
                    subsidiaryId: estimateRecord.getValue("subsidiary"),
                    department: estimateRecord.getText("department"),
                    class: estimateRecord.getText("class"),
                    location: estimateRecord.getText("location"),
                    jobDetails: {},
                    leadSourceDetails: {}
                };

                const items = [];
                const itemCount = estimateRecord.getLineCount("item");
                for (let i = 0; i < itemCount; i++) {
                    const itemId = estimateRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: "item",
                        line: i
                    });

                    let itemClassId = "", itemClassText = "";
                    let itemDeptId = "", itemDeptText = "";

                    try {
                        if (itemId) {
                            const itemFields = search.lookupFields({
                                type: "item",
                                id: itemId,
                                columns: ["class", "department"]
                            });

                            itemClassId = itemFields.class?.[0]?.value || "";
                            itemClassText = itemFields.class?.[0]?.text || "";

                            itemDeptId = itemFields.department?.[0]?.value || "";
                            itemDeptText = itemFields.department?.[0]?.text || "";
                        }
                    }
                    catch (err) {
                        log.error("Item Lookup Failed", { line: i, itemId, error: err });
                    }

                    items.push({
                        lineKey: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "lineuniquekey", line: i }),
                        itemId,
                        item: estimateRecord.getSublistText({ sublistId: "item", fieldId: "item", line: i }),
                        quantity: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "quantity", line: i }),
                        units: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "units", line: i }),
                        description: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "description", line: i }),
                        priceLevelId: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "price", line: i }),
                        rate: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "rate", line: i }),
                        amount: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "amount", line: i }),
                        classId: itemClassId,
                        class: itemClassText,
                        departmentId: itemDeptId,
                        department: itemDeptText
                    });
                }

                const salesTeam = [];
                const salesCount = estimateRecord.getLineCount("salesteam");
                for (let i = 0; i < salesCount; i++) {
                    salesTeam.push({
                        employee: estimateRecord.getSublistText({ sublistId: "salesteam", fieldId: "employee", line: i }),
                        employeeId: estimateRecord.getSublistValue({ sublistId: "salesteam", fieldId: "employee", line: i }),
                        salesRole: estimateRecord.getSublistText({ sublistId: "salesteam", fieldId: "salesrole", line: i }),
                        salesRoleId: estimateRecord.getSublistValue({ sublistId: "salesteam", fieldId: "salesrole", line: i }),   // ⭐ Added
                        primary: estimateRecord.getSublistValue({ sublistId: "salesteam", fieldId: "isprimary", line: i }) ? "Yes" : "No",
                        contribution: estimateRecord.getSublistValue({ sublistId: "salesteam", fieldId: "contribution", line: i }) || 0
                    });
                }

                const repListResult = model.salesRepList();
                const repList = repListResult.reps || [];
                const unitResult = model.unitList(estimateId);
                header.classList = model.classList(estimateId);
                header.departmentList = model.departmentList(estimateId);
                header.unitDetails = unitResult.units || [];
                header.priceLevelList = model.pricelevelList(estimateId);
                header.salesRoles = model.salesRoleList().salesRoles || [];
                const isSalesManager = checkIfSalesManager(userEmail);

                log.debug("Sales manager", isSalesManager );

                return {
                    success: true,
                    data: {
                        header,
                        items,
                        salesTeam,
                        repList,
                        isSalesManager
                    }
                };
            }
            catch (e) {
                log.error("Error @ getKanbanEstimateDetails", e);
                return { success: false, message: "Failed to load estimate details." };
            }
        }

        /**
         * Update an Estimate record including header fields, line items, and sales team.
         * @param {Object} req - Request object
         * @param {string|number} req.estimateId - Internal ID of the estimate
         * @param {Object} req.data - Payload containing header, line items, and sales team
         * @param {Object} [req.data.Header] - Header-level fields
         * @param {Array} [req.data.LineItems] - Line-level item details
         * @param {Array} [req.data.SalesTeam] - Line-level sales team details
         * @returns {Object} Result object with success status, message, and updated estimateId
         */
        function updateEstimateRecord(req) {
            try {
                if (!req || !req.estimateId || !req.data) {
                    return { success: false, message: "Invalid request data received." };
                }
                const estimateId = req.estimateId;
                const data = req.data;
                const header = data.Header || {};
                const items = data.LineItems || [];
                const salesTeam = data.SalesTeam || [];

                function safeSet(rec, fieldId, value, isDate = false, allowEmpty = true) {
                    try {
                        let finalValue = value;
                        if (!isDate && typeof value === "string" && value.match(/^\d+$/)) {
                            finalValue = parseInt(value, 10);
                        }

                        if (isDate && value) {
                            finalValue = new Date(value);
                            if (isNaN(finalValue.getTime())) {
                                return;
                            }
                        }

                        if ((value === undefined || value === null || value === "") && allowEmpty) {
                            finalValue = null;
                        }
                        else if (value === undefined || value === null || value === "") {
                            return;
                        }

                        rec.setValue({
                            fieldId: fieldId,
                            value: finalValue
                        });
                    }
                    catch (e) {
                        log.error(`❌ Failed to set field: ${fieldId}`, e);
                    }
                }

                const estRec = record.load({
                    type: record.Type.ESTIMATE,
                    id: estimateId,
                    isDynamic: true
                });

                const dropdownFields = ["class", "department", "location", "partner", "leadsource", "forecasttype"];
                dropdownFields.forEach(field => {
                    const keyNoSpace = field.replace(/\s+/g, '').toLowerCase();
                    const val = Object.keys(header).find(k => k.replace(/\s+/g, '').toLowerCase() === keyNoSpace);
                    safeSet(estRec, field, val ? header[val] : null);
                });

                safeSet(estRec, "memo", header.Memo);
                safeSet(estRec, "custbody_jj_project_summary_invo", header["Project Summary"]);
                safeSet(estRec, "title", header.Title);

                if (header.Status) {
                    let statusVal = header.Status;
                    if (!String(header.Status).match(/^\d+$/)) {
                        const stRes = search.create({
                            type: search.Type.ESTIMATE,
                            filters: [["entitystatus", "is", header.Status]],
                            columns: ["entitystatus"]
                        }).run().getRange({ start: 0, end: 1 });

                        if (stRes && stRes.length) {
                            statusVal = stRes[0].getValue("entitystatus");
                            log.debug("✔ Status text → internal id", statusVal);
                        }
                        else {
                            log.debug("⚠ Status lookup failed. Skipping.");
                            statusVal = null;
                        }
                    }
                    safeSet(estRec, "entitystatus", statusVal);
                }

                if (header.Job) {
                    if (String(header.Job).match(/^\d+$/)) {
                        safeSet(estRec, "job", parseInt(header.Job, 10));
                    }
                    else {
                        try {
                            const jobSearch = search.create({
                                type: search.Type.JOB,
                                filters: [["entityid", "is", header.Job]],
                                columns: ["internalid"]
                            }).run().getRange({ start: 0, end: 1 });

                            if (jobSearch && jobSearch.length) {
                                const jobInternal = jobSearch[0].getValue("internalid");
                                safeSet(estRec, "job", parseInt(jobInternal, 10));
                            }
                            else {
                                log.debug("Job text lookup failed.");
                            }
                        }
                        catch (e) {
                            log.error("Job lookup failed", e);
                        }
                    }
                }

                safeSet(estRec, "trandate", header["Transaction Date"] || header["Date"], true);
                safeSet(estRec, "expectedclosedate", header["Expected Close Date"], true);
                safeSet(estRec, "duedate", header["Expiration Date"], true);

                const existingLineCount = estRec.getLineCount({ sublistId: "item" });
                for (let i = existingLineCount - 1; i >= 0; i--) {
                    estRec.removeLine({
                        sublistId: "item",
                        line: i,
                        ignoreRecalc: true
                    });
                }

                items.forEach((line, idx) => {
                    try {
                        estRec.selectNewLine({ sublistId: "item" });

                        const itemId = parseInt(line["Item ID"], 10);
                        const qtyVal = parseFloat(line.Quantity) || 1;
                        const rateVal = parseFloat(line.Rate) || 0;
                        const amountVal =
                            line.Amount !== undefined && line.Amount !== null && line.Amount !== ""
                                ? parseFloat(line.Amount)
                                : parseFloat((qtyVal * rateVal).toFixed(2));

                        estRec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "item",
                            value: itemId
                        });

                        estRec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "quantity",
                            value: qtyVal
                        });

                        if (line.Units) {
                            estRec.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "units",
                                value: parseInt(line.Units, 10)
                            });
                        }

                        if (line.Description) {
                        estRec.setCurrentSublistValue({
                            sublistId: "item",
                                fieldId: "description",
                                value: line.Description
                        });
                        }

                        if (line.PriceLevel && String(line.PriceLevel) !== "-1") {
                            // Standard price level
                            estRec.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "price",
                                value: parseInt(line.PriceLevel, 10)
                            });
                        } 
                        else {
                            estRec.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "price",
                                value: -1
                            });
                        }

                        estRec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "rate",
                            value: rateVal
                        });
                        
                        estRec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "amount",
                            value: amountVal
                        });
                        
                        if (line.Class || line.Department) {
                            try {
                                const itemLookup = search.lookupFields({
                                    type: search.Type.ITEM,
                                    id: itemId,
                                    columns: ["recordtype"]
                                });

                                const itemType = itemLookup.recordtype;

                                if (itemType) {
                                    const itemRec = record.load({
                                        type: itemType,
                                        id: itemId,
                                        isDynamic: false
                                    });

                                    if (line.Class && itemRec.getField({ fieldId: "class" })) {
                                        itemRec.setValue({
                                            fieldId: "class",
                                            value: parseInt(line.Class, 10)
                                        });
                                    }

                                    if (line.Department && itemRec.getField({ fieldId: "department" })) {
                                        itemRec.setValue({
                                            fieldId: "department",
                                            value: parseInt(line.Department, 10)
                                        });
                                    }
                                    itemRec.save();
                                }
                            } 
                            catch (itemErr) {
                                log.error("❌ Item update failed", {
                                    itemId,
                                    error: itemErr
                                });
                            }
                        }
                        estRec.commitLine({ sublistId: "item" });
                    }
                    catch (e) {
                        log.error(`❌ Failed adding estimate line ${idx + 1}`, e);
                        throw e;
                    }
                });

                const stCount = estRec.getLineCount({ sublistId: "salesteam" });

                for (let i = 0; i < stCount; i++) {
                    estRec.selectLine({ sublistId: "salesteam", line: i });
                    const stData = salesTeam[i] || {};

                    if (!stData || Object.keys(stData).length === 0) {
                        estRec.commitLine({ sublistId: "salesteam" });
                        continue;
                    }

                    if (stData["Employee ID"]) {
                        estRec.setCurrentSublistValue({
                            sublistId: "salesteam",
                            fieldId: "employee",
                            value: parseInt(stData["Employee ID"], 10)
                        });
                    }

                    if (stData["Role ID"]) {
                        estRec.setCurrentSublistValue({
                            sublistId: "salesteam",
                            fieldId: "salesrole",
                            value: parseInt(stData["Role ID"], 10)
                        });
                    }

                    if (stData["Contribution %"] !== undefined) {
                        estRec.setCurrentSublistValue({
                            sublistId: "salesteam",
                            fieldId: "contribution",
                            value: parseFloat(stData["Contribution %"])
                        });
                    }

                    if (stData.Primary !== undefined) {
                        const isPrimary = stData.Primary === true || stData.Primary === "Yes" || stData.Primary === "true";
                        estRec.setCurrentSublistValue({
                            sublistId: "salesteam",
                            fieldId: "isprimary",
                            value: isPrimary
                        });
                    }
                    estRec.commitLine({ sublistId: "salesteam" });
                }
                const updatedId = estRec.save();
                return { success: true, message: "Estimate updated successfully", estimateId: updatedId };
            }
            catch (e) {
                log.error("Update Failed", e);
                return { success: false, message: e.message || "Error updating estimate" };
            }
        }

        function getKanbanOpportunityDetails(opportunityId) {
            try {
                if (!opportunityId) {
                    return { success: false, message: "No Opportunity ID provided." };
                }

                const opportunityRecord = record.load({
                    type: record.Type.OPPORTUNITY,
                    id: opportunityId,
                    isDynamic: false
                });

                const header = {
                    tranid: opportunityRecord.getValue('tranid'),
                    title: opportunityRecord.getValue('title'),
                    entity: opportunityRecord.getText('entity'),
                    details: opportunityRecord.getValue('memo'),
                    status: opportunityRecord.getText('entitystatus'),
                    probability: opportunityRecord.getValue('probability'),
                    expectedCloseDate: opportunityRecord.getText('expectedclosedate'),
                    projectedTotal: opportunityRecord.getValue('projectedtotal'),
                    forecastType: opportunityRecord.getText('forecasttype'),
                    rangelow: opportunityRecord.getValue('rangelow'),
                    rangehigh: opportunityRecord.getValue('rangehigh'),
                    subsidiary: opportunityRecord.getText('subsidiary'),
                    department: opportunityRecord.getText('department'),
                    class: opportunityRecord.getText('class'),
                    location: opportunityRecord.getText('location'),
                    salesType: opportunityRecord.getText('cseg_jj_sales_type')
                };

                const itemCount = opportunityRecord.getLineCount("item");
                const items = [];

                for (let i = 0; i < itemCount; i++) {
                    items.push({
                        item: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "item", line: i }),
                        description: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "description", line: i }),
                        class: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "class", line: i }),
                        department: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "department", line: i }),
                        quantity: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "quantity", line: i }),
                        rate: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "rate", line: i }),
                        amount: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "amount", line: i })
                    });
                }

                const salesTeamCount = opportunityRecord.getLineCount("salesteam");
                const salesTeam = [];

                for (let i = 0; i < salesTeamCount; i++) {
                    salesTeam.push({
                        salesRole: opportunityRecord.getSublistText({ sublistId: "salesteam", fieldId: "salesrole", line: i }) ||
                            opportunityRecord.getSublistText({ sublistId: "salesteam", fieldId: "role", line: i }),
                        employee: opportunityRecord.getSublistText({ sublistId: "salesteam", fieldId: "employee", line: i }),
                        isPrimary: opportunityRecord.getSublistValue({ sublistId: "salesteam", fieldId: "isprimary", line: i }) ? "Yes" : "No",
                        contribution: opportunityRecord.getSublistValue({ sublistId: "salesteam", fieldId: "contribution", line: i })
                    });
                }

                header.salesTeam = salesTeam;
                log.debug("Opportunity Details", { header, items, salesTeam });

                return {
                    success: true,
                    data: {
                        header,
                        items
                    }
                };

            } catch (e) {
                log.error("Error @ getKanbanOpportunityDetails", e);
                return { success: false, message: "Failed to load opportunity details." };
            }
        }

        /**
         * Populate Classification and Items fields with dropdown options
         */
        function setEditMode(isEdit) {
            const fields = document.querySelectorAll("input, select, textarea");
            fields.forEach(f => {
                f.disabled = !isEdit;
                // For classification and item fields, convert to dropdowns in edit mode
                if (isEdit && f.id === "so-subsidiary") {
                    f.replaceWith(createDropdown("subsidiaries", f.value));
                }
                if (isEdit && f.id === "so-class") {
                    f.replaceWith(createDropdown("classes", f.value));
                }
                if (isEdit && f.id === "so-location") {
                    f.replaceWith(createDropdown("locations", f.value));
                }
                if (isEdit && f.id === "so-department") {
                    f.replaceWith(createDropdown("departments", f.value));
                }
                if (isEdit && f.id === "so-item") {
                    f.replaceWith(createItemDropdown(f.value));
                }
            });

            // Toggle visibility of edit buttons
            document.getElementById("editButton").classList.toggle("hidden", isEdit);
            document.getElementById("editActions").classList.toggle("hidden", !isEdit);
        }

        /**
         * Utility to create a dropdown
         * 
         * @param {string} type - The type of dropdown (e.g., subsidiaries, classes, locations, departments)
         * @param {string} selectedValue - The pre-selected value in edit mode
         * @returns {HTMLSelectElement} - The dropdown element
         */
        function createDropdown(type, selectedValue) {
            const dropdown = document.createElement("select");
            dropdown.classList.add("border", "border-[#95a2a0]", "px-4", "py-3", "rounded-lg", "text-sm", "shadow-sm", "w-full");
            dropdown.id = `so-${type}`; // Set the ID to match the field in the form

            // Get the options for this dropdown
            const options = getDropdownOptions(type);

            // Create a default empty option
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = `Select ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            dropdown.appendChild(defaultOption);

            // Populate options dynamically
            options.forEach(option => {
                const opt = document.createElement("option");
                opt.value = option.id;
                opt.textContent = option.name;

                // Mark the selected option
                if (option.id === selectedValue) {
                    opt.selected = true;
                }

                dropdown.appendChild(opt);
            });

            return dropdown;
        }

        /**
         * Utility to create Item dropdown
         * 
         * @param {string} selectedValue - The pre-selected item ID
         * @returns {HTMLSelectElement} - The item dropdown element
         */
        function createItemDropdown(selectedValue) {
            const dropdown = document.createElement("select");
            dropdown.classList.add("border", "border-[#95a2a0]", "px-4", "py-3", "rounded-lg", "text-sm", "shadow-sm", "w-full");
            dropdown.id = "so-item"; // Set the ID to match the field in the form

            // Fetch item options (you may need to adjust this to match your NetSuite setup)
            const items = getDropdownOptions("item");

            // Create a default empty option
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Select Item";
            dropdown.appendChild(defaultOption);

            // Populate options dynamically
            items.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item.id;
                opt.textContent = item.name;

                // Mark the selected option
                if (item.id === selectedValue) {
                    opt.selected = true;
                }

                dropdown.appendChild(opt);
            });

            return dropdown;
        }

        /**
         * Fetch dropdown options from NetSuite
         */
        function getDropdownOptions(type) {
            const results = [];
            const searchObj = search.create({
                type: type,
                filters: [],
                columns: ['internalid', 'name']
            });

            searchObj.run().each(function (result) {
                results.push({
                    id: result.getValue('internalid'),
                    name: result.getValue('name')
                });
                return true;
            });

            return results;
        }


        /**
         * Function to fetch Sales Order details and populate data (unchanged)
         */
        function getKanbanSalesOrderDetails(salesOrderId, userEmail) {
            try {
                if (!salesOrderId) {
                    return { success: false, message: "No sales order ID provided." };
                }

                const salesOrderRecord = record.load({
                    type: record.Type.SALES_ORDER,
                    id: salesOrderId,
                    isDynamic: false
                });

                const header = {
                    tranid: salesOrderRecord.getValue('tranid'),
                    trandate: salesOrderRecord.getText('trandate'),
                    entity: salesOrderRecord.getText('entity'),
                    entityId: salesOrderRecord.getValue('entity'),
                    enddate: salesOrderRecord.getText('enddate'),
                    memo: salesOrderRecord.getValue('memo'),
                    status: salesOrderRecord.getText('status'),
                    po: salesOrderRecord.getValue('otherrefnum'),
                    job: salesOrderRecord.getText('job'),
                    startdate: salesOrderRecord.getText('startdate'),
                    total: salesOrderRecord.getText('total'),
                    opportunity: salesOrderRecord.getText('opportunity'),
                    partner: salesOrderRecord.getText('partner'),

                    salesrep: salesOrderRecord.getText('salesrep'),
                    saleseffectivedate: salesOrderRecord.getText('saleseffectivedate'),
                    leadsource: salesOrderRecord.getText('leadsource'),
                    subsidiary: salesOrderRecord.getText('subsidiary'),
                    class: salesOrderRecord.getText('class'),
                    location: salesOrderRecord.getText('location'),
                    department: salesOrderRecord.getText('department'),
                    projectsummary: salesOrderRecord.getValue('custbody_jj_project_summary_invo'),

                    items: [],
                    salesteam: [],
                    soClassDetails: {},
                    soDepartmentDetails: {},
                    soLocationDetails: {},
                    soJobDetails: {},
                    soPartnerDetails: {},
                    soLeadSourceDetails: {},
                    soOpportunityDetails: {},
                    soItemList: {},
                    soUnitList: {},
                    isSalesManager: checkIfSalesManager(userEmail)

                };

                // 🔑 Fetch price levels once
                const priceLevelData = getSalesOrderPriceLevels(salesOrderId);

                // Line items
                const itemLineCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
                for (let i = 0; i < itemLineCount; i++) {
                    const itemId = salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });

                    const lineData = {
                        item: salesOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }),
                        itemId,
                        quantity: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                        units: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'units', line: i }),
                        description: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }),
                        priceLevel: salesOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'price', line: i }),
                        priceLevelId: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'price', line: i }),
                        rate: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }),
                        amount: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i }),
                        location: salesOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'location', line: i }),
                        classId: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'class', line: i }),
                        departmentId: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'department', line: i }),
                        class: salesOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'class', line: i }),
                        department: salesOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'department', line: i }),

                        // ⭐ Attach price levels for this item
                        priceLevels: priceLevelData.priceLevels.map(pl => ({
                            id: pl.id,
                            name: pl.name,
                            rate: pl.rates[itemId] || null
                        }))
                    };

                    header.items.push(lineData);
                }

                // Sales team
                const salesTeamLineCount = salesOrderRecord.getLineCount({ sublistId: 'salesteam' });
                for (let i = 0; i < salesTeamLineCount; i++) {
                    const lineData = {
                        employee: salesOrderRecord.getSublistText({ sublistId: 'salesteam', fieldId: 'employee', line: i }),
                        employeeId: salesOrderRecord.getSublistValue({ sublistId: 'salesteam', fieldId: 'employee', line: i }),
                        salesRole: salesOrderRecord.getSublistText({ sublistId: 'salesteam', fieldId: 'salesrole', line: i }),
                        salesRoleId: salesOrderRecord.getSublistValue({ sublistId: 'salesteam', fieldId: 'salesrole', line: i }),
                        primary: salesOrderRecord.getSublistValue({ sublistId: 'salesteam', fieldId: 'isprimary', line: i }),
                        contribution: salesOrderRecord.getSublistValue({ sublistId: 'salesteam', fieldId: 'contribution', line: i })
                    };
                    header.salesteam.push(lineData);
                }

                return { success: true, data: header };

            } catch (e) {
                log.error("Error @ getKanbanSalesOrderDetails", e);
                return { success: false, message: "Failed to load sales order details." };
            }
        }

        /**
         * Get price levels for sales order items
         * @param {string} salesOrderId - Sales Order ID
         * @returns {Object} Price levels data
         */
        function getSalesOrderPriceLevels(salesOrderId) {
            const result = { priceLevels: [] };

            try {
                if (!salesOrderId) return result;

                const soRecord = record.load({
                    type: record.Type.SALES_ORDER,
                    id: salesOrderId
                });

                const itemCount = soRecord.getLineCount({ sublistId: "item" });
                const itemIds = new Set();

                // Get all item IDs from the sales order
                for (let i = 0; i < itemCount; i++) {
                    const itemId = soRecord.getSublistValue({
                        sublistId: "item",
                        fieldId: "item",
                        line: i
                    });
                    if (itemId) itemIds.add(itemId);
                }

                if (itemIds.size === 0) {
                    result.priceLevels.push({ id: "custom", name: "Custom", rates: [] });
                    return result;
                }

                // Step 1: Search pricing records for all items
                const pricingSearch = search.create({
                    type: "pricing",
                    filters: [
                        ["item", "anyof", Array.from(itemIds)]
                    ],
                    columns: [
                        "pricelevel",
                        "item",
                        "unitprice"
                    ]
                });

                const priceLevelMap = {};
                // { priceLevelId: { itemId: rate } }

                pricingSearch.run().each(row => {
                    const priceLevelId = row.getValue("pricelevel");
                    const itemId = row.getValue("item");
                    const rate = row.getValue("unitprice");

                    if (priceLevelId && itemId) {
                        if (!priceLevelMap[priceLevelId]) {
                            priceLevelMap[priceLevelId] = {};
                        }
                        priceLevelMap[priceLevelId][itemId] = rate;
                    }
                    return true;
                });

                const priceLevelIds = Object.keys(priceLevelMap);
                if (priceLevelIds.length > 0) {
                    // Step 2: Fetch price level names
                    search.create({
                        type: "pricelevel",
                        filters: [
                            ["internalid", "anyof", priceLevelIds]
                        ],
                        columns: ["internalid", "name"]
                    }).run().each(row => {
                        const id = row.getValue("internalid");
                        result.priceLevels.push({
                            id,
                            name: row.getValue("name"),
                            rates: priceLevelMap[id] || {}
                        });
                        return true;
                    });
                }

                // Always add Custom option
                result.priceLevels.push({
                    id: "-1",
                    name: "Custom",
                    rates: {}
                });

                log.debug("getSalesOrderPriceLevels",
                    `Fetched ${result.priceLevels.length} price levels with rates for items (including Custom)`);

            } catch (e) {
                log.error("getSalesOrderPriceLevels error", e);
            }

            return result;
        }


        /**
         * Update Sales Order with new values
         * @param {Object} requestData - Request data containing salesOrderId and field values
 * @returns {Object} Success/failure response
 */
        function updateSalesOrder(requestData) {
            try {
                if (!requestData.salesOrderId) {
                    return { success: false, message: "No sales order ID provided." };
                }

                log.debug("Updating Sales Order", requestData.salesOrderId);

                const salesOrderRecord = record.load({
                    type: record.Type.SALES_ORDER,
                    id: requestData.salesOrderId,
                    isDynamic: true
                });

                // Update header fields if provided
                if (requestData.trandate) {
                    salesOrderRecord.setValue({ fieldId: 'trandate', value: new Date(requestData.trandate) });
                }
                if (requestData.startdate) {
                    salesOrderRecord.setValue({ fieldId: 'startdate', value: new Date(requestData.startdate) });
                }
                if (requestData.enddate) {
                    salesOrderRecord.setValue({ fieldId: 'enddate', value: new Date(requestData.enddate) });
                }
                if (requestData.otherrefnum !== undefined) {
                    salesOrderRecord.setValue({ fieldId: 'otherrefnum', value: requestData.otherrefnum });
                }
                if (requestData.job) {
                    salesOrderRecord.setValue({ fieldId: 'job', value: requestData.job });
                }
                if (requestData.memo !== undefined) {
                    salesOrderRecord.setValue({ fieldId: 'memo', value: requestData.memo });
                }
                if (requestData.saleseffectivedate) {
                    salesOrderRecord.setValue({ fieldId: 'saleseffectivedate', value: new Date(requestData.saleseffectivedate) });
                }
                if (requestData.leadsource) {
                    salesOrderRecord.setValue({ fieldId: 'leadsource', value: requestData.leadsource });
                }
                if (requestData.opportunity) {
                    salesOrderRecord.setValue({ fieldId: 'opportunity', value: requestData.opportunity });
                }
                if (requestData.partner) {
                    salesOrderRecord.setValue({ fieldId: 'partner', value: requestData.partner });
                }
                if (requestData.class) {
                    salesOrderRecord.setValue({ fieldId: 'class', value: requestData.class });
                }
                if (requestData.department) {
                    salesOrderRecord.setValue({ fieldId: 'department', value: requestData.department });
                }
                if (requestData.location) {
                    salesOrderRecord.setValue({ fieldId: 'location', value: requestData.location });
                }
                if (requestData.projectsummary) {
                    salesOrderRecord.setValue({ fieldId: 'custbody_jj_project_summary_invo', value: requestData.projectsummary });
                }

                // ---------------- LINE ITEMS ----------------
                if (requestData.lineItems && Array.isArray(requestData.lineItems)) {
                    // Clear existing lines
                    const lineCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
                    for (let i = lineCount - 1; i >= 0; i--) {
                        salesOrderRecord.removeLine({ sublistId: 'item', line: i });
                    }

                    // Add new lines
                    requestData.lineItems.forEach(line => {
                        salesOrderRecord.selectNewLine({ sublistId: 'item' });

                        if (line.itemId) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: line.itemId });
                        }
                        if (line.quantity) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: parseFloat(line.quantity) });
                        }

                        // Handle price level vs custom
                        if (line.priceLevelId && line.priceLevelId !== "-1") {
                            // Standard price level: set the price level
                            log.debug("Setting standard price level", { itemId: line.itemId, priceLevelId: line.priceLevelId });
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: line.priceLevelId });
                        } else if (line.rate) {
                            // Custom price level: set price level to Custom (-1) first, then set rate and amount
                            log.debug("Setting custom price level", { itemId: line.itemId, rate: line.rate, amount: line.amount });
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: parseFloat(line.rate) });
                            // NetSuite requires amount to be set explicitly for custom price level
                        if (line.amount) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: parseFloat(line.amount) });
                        }
                        }

                        if (line.description) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: line.description });
                        }
                        if (line.classId) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'class', value: line.classId });
                        }
                        if (line.departmentId) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: line.departmentId });
                        }
                        if (line.unitId) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'units', value: line.unitId });
                        }

                        salesOrderRecord.commitLine({ sublistId: 'item' });
                    });
                }

                // ---------------- SALES TEAM ----------------
                if (requestData.salesTeam && Array.isArray(requestData.salesTeam)) {
                    // Clear existing sales team lines
                    const teamCount = salesOrderRecord.getLineCount({ sublistId: 'salesteam' });
                    for (let i = teamCount - 1; i >= 0; i--) {
                        salesOrderRecord.removeLine({ sublistId: 'salesteam', line: i });
                    }

                    // Add new sales team members
                    requestData.salesTeam.forEach(member => {
                        salesOrderRecord.selectNewLine({ sublistId: 'salesteam' });

                        if (member.employeeId) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'employee', value: member.employeeId });
                        }
                        if (member.salesRole) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'salesrole', value: member.salesRole });
                        }
                        if (member.primary !== undefined) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'isprimary', value: member.primary });
                        }
                        if (member.contribution) {
                            salesOrderRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'contribution', value: parseFloat(member.contribution) });
                        }

                        salesOrderRecord.commitLine({ sublistId: 'salesteam' });
                    });
                }

                const savedId = salesOrderRecord.save();
                log.debug("Sales Order Updated", savedId);

                return {
                    success: true,
                    message: "Sales Order updated successfully.",
                    salesOrderId: savedId
                };

            } catch (e) {
                log.error("Error @ updateSalesOrder", e);
                return {
                    success: false,
                    message: "Failed to update sales order: " + e.message
                };
            }
        }




        function getOpportunityFormData(requestData) {
            try {
                const opportunityFormData = model.getOpportunityFormData(requestData);
                return { success: true, data: opportunityFormData };
            } catch (error) {
                log.error("Error @getOpportunityFormData", error);
                return { success: false, message: "Failed to load opportunity form data." };
            }
        }
        function getItemPriceLevelsUsingSearch(itemId) {
            const result = { priceLevels: [] };
            try {
                if (!itemId) return result;
                const pricingSearch = search.create({
                    type: "pricing",
                    filters: [
                        ["item", "anyof", itemId]
                    ],
                    columns: [
                        "pricelevel",
                        "unitprice"
                    ]
                });
                const priceLevelMap = {};
                pricingSearch.run().each(row => {
                    const priceLevelId = row.getValue("pricelevel");
                    const rate = row.getValue("unitprice");
                    if (priceLevelId) {
                        priceLevelMap[priceLevelId] = rate;
                    }
                    return true;
                });
                const priceLevelIds = Object.keys(priceLevelMap);
                if (priceLevelIds.length === 0) return result;
                search.create({
                    type: "pricelevel",
                    filters: [
                        ["internalid", "anyof", priceLevelIds]
                    ],
                    columns: ["internalid", "name"]
                }).run().each(row => {
                    const id = row.getValue("internalid");
                    result.priceLevels.push({
                        id,
                        name: row.getValue("name"),
                        rate: priceLevelMap[id] || null
                    });
                    return true;
                });
                result.priceLevels.push({
                    id: "custom",
                    name: "Custom",
                    rate: null
                });

                log.debug("getItemPriceLevelsUsingSearch",
                    `Fetched ${result.priceLevels.length} price levels for item ${itemId}`);

            } catch (e) {
                log.error("getItemPriceLevelsUsingSearch error", e);
            }

            return result;
        }


        /**
             * Handles dropdown data request
             * @param {Object} response - The response object
             * @param {Object} search - The N/search module
             */
        function getOpportunityDropdowns() {
            try {
                const companies = getActiveCompanies(search);
                const statuses = getOpportunityStatuses();
                const forecastTypes = getForecastTypes();
                const departments = getActiveDepartments(search);
                const classes = getActiveClasses(search);
                const locations = getActiveLocations(search);
                const salesTypes = getActiveSalesTypes();
                const forms = getOpportunityForms();
                const employees = getActiveEmployees(search);
                const salesRoles = getActiveSalesRoles(search);

                return {
                    success: true,
                    companies,
                    statuses,
                    forecastTypes,
                    departments,
                    classes,
                    locations,
                    salesTypes,
                    forms,
                    employees,
                    salesRoles
                };
            } catch (e) {
                log.error('Error building dropdown JSON', e);
                return { success: false, error: e.message };
            }
        }


        /**
 * Retrieves dependent records for a given subsidiary.
 *
 * @param {Object} search - The N/search module reference.
 * @param {number|string} subsidiaryId - Internal ID of the subsidiary.
 * @returns {Object} An object containing departments, locations, classes, and items,
 * or an error object on failure.
 */
        function getSubsidiaryDependents(search, subsidiaryId) {
            try {
                return {
                    departments: getDepartmentsBySubsidiary(search, subsidiaryId),
                    locations: getLocationsBySubsidiary(search, subsidiaryId),
                    classes: getClassesBySubsidiary(search, subsidiaryId),
                    items: getItemsBySubsidiary(search, subsidiaryId)
                };
            } catch (e) {
                log.error('Error getting subsidiary dependents', e);
                return { success: false, error: e.message };
            }
        }

        /**
 * Loads an Opportunity record and returns all header, line, and sales team data.
 *
 * @param {number|string} opportunityId - Internal ID of the Opportunity to load.
 * @param {Object} response - Suitelet response object used to write JSON output.
 * @param {Object} record - N/record module reference.
 * @returns {void} Writes JSON directly to the response object.
 */
        function loadOpportunityForEdit(opportunityId, response, record) {
            try {
                if (!opportunityId) {
                    throw error.create({
                        name: 'MISSING_OPPORTUNITY_ID',
                        message: 'Opportunity ID is required'
                    });
                }
                const opportunityRecord = record.load({
                    type: record.Type.OPPORTUNITY,
                    id: opportunityId,
                    isDynamic: false
                });
                const formData = {
                    title: opportunityRecord.getValue({ fieldId: 'title' }),
                    projectSummary: opportunityRecord.getValue({ fieldId: 'custbody_jj_project_summary_invo' }),
                    details: opportunityRecord.getValue({ fieldId: 'memo' }),
                    company: opportunityRecord.getValue({ fieldId: 'entity' }),
                    status: opportunityRecord.getValue({ fieldId: 'entitystatus' }),
                    probability: opportunityRecord.getValue({ fieldId: 'probability' }),
                    expectedClose: formatDateForInput(opportunityRecord.getValue({ fieldId: 'expectedclosedate' })),
                    projectedTotal: opportunityRecord.getValue({ fieldId: 'projectedtotal' }),
                    subsidiary: opportunityRecord.getValue({ fieldId: 'subsidiary' }),
                    subsidiaryName: opportunityRecord.getText({ fieldId: 'subsidiary' }),
                    forecastType: opportunityRecord.getValue({ fieldId: 'forecasttype' }),
                    department: opportunityRecord.getValue({ fieldId: 'department' }),
                    departmentName: opportunityRecord.getText({ fieldId: 'department' }) || '',
                    class: opportunityRecord.getValue({ fieldId: 'class' }),
                    className: opportunityRecord.getText({ fieldId: 'class' }) || '',
                    location: opportunityRecord.getValue({ fieldId: 'location' }),
                    locationName: opportunityRecord.getText({ fieldId: 'location' }) || '',
                    opportunityNumber: opportunityRecord.getValue({ fieldId: 'tranid' }),
                    salesType: opportunityRecord.getValue({ fieldId: 'cseg_jj_sales_type' }),
                };
                const lineCount = opportunityRecord.getLineCount({ sublistId: 'item' });
                const lineItems = [];
                for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
                    lineItems.push({
                        itemId: opportunityRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: lineIndex }),
                        itemName: opportunityRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: lineIndex }),
                        desc: opportunityRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: lineIndex }) || '',
                        qty: opportunityRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: lineIndex }),
                        rate: opportunityRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: lineIndex }),
                        amount: opportunityRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: lineIndex }),
                        priceLevelId: opportunityRecord.getSublistValue({ sublistId: 'item', fieldId: 'price', line: lineIndex }),
                        classId: opportunityRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'class',
                            line: lineIndex
                        }),
                        departmentId: opportunityRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'department',
                            line: lineIndex
                        }),
                    });
                }
                formData.lines = lineItems;
                const stCount = opportunityRecord.getLineCount({ sublistId: 'salesteam' });
                const salesTeam = [];
                for (let s = 0; s < stCount; s++) {
                    salesTeam.push({
                        employeeId: opportunityRecord.getSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'employee',
                            line: s
                        }),
                        employeeText: opportunityRecord.getSublistText({
                            sublistId: 'salesteam',
                            fieldId: 'employee',
                            line: s
                        }) || '',
                        roleId: opportunityRecord.getSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'role',
                            line: s
                        }) || opportunityRecord.getSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'salesrole',
                            line: s
                        }),
                        roleText: opportunityRecord.getSublistText({
                            sublistId: 'salesteam',
                            fieldId: 'role',
                            line: s
                        }) || opportunityRecord.getSublistText({
                            sublistId: 'salesteam',
                            fieldId: 'salesrole',
                            line: s
                        }) || '',
                        contribution: opportunityRecord.getSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'contribution',
                            line: s
                        }) || 0,
                        isPrimary: !!opportunityRecord.getSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'isprimary',
                            line: s
                        })
                    });
                }
                formData.salesTeam = salesTeam;
                response.setHeader({ name: 'Content-Type', value: 'application/json' });
                response.write(JSON.stringify({ success: true, opportunity: formData }));
            } catch (e) {
                response.setHeader({ name: 'Content-Type', value: 'application/json' });
                response.write(JSON.stringify({ success: false, error: e.message }));
            }
        }

        /**
          * Formats a Date object into YYYY-MM-DD for input fields.
          *
          * @param {Date} dateObj - The date to format.
          * @returns {string} Formatted date string or empty string on error.
          */
        function formatDateForInput(dateObj) {
            try {
                if (!dateObj) return '';
                if (!(dateObj instanceof Date)) return '';
                return dateObj.toISOString().split('T')[0];
            } catch (e) {
                log.error('Error formatting date for input', e);
                return '';
            }
        }


        /**
         * Creates and populates an opportunity record
         * @param {Object} request - The request object containing form parameters
         * @param {Object} record - The N/record module
         * @returns {Object} The created opportunity record
         */
        function createOpportunityRecord(request, record) {
            try {
                const opp = record.create({
                    type: record.Type.OPPORTUNITY,
                    isDynamic: true
                });
                setRequiredOpportunityFields(opp, request);
                setOptionalOpportunityFields(opp, request);
                const id = opp.save();
                return {
                    success: true,
                    opportunityId: id,
                    message: "Opportunity created successfully"
                };
            } catch (e) {
                log.error('Error in createOpportunityRecord', e);
                throw e;
            }
        }

        /**
         * Sets required/core fields on opportunity record
         * @param {Object} opportunityRecord - The opportunity record
         * @param {Object} request - The request object containing form parameters
        */
        function setRequiredOpportunityFields(opportunityRecord, request) {
            try {
                const company = request.parameters.company ? String(request.parameters.company).trim() : '';
                const status = request.parameters.status ? String(request.parameters.status).trim() : '';
                const probability = request.parameters.probability ? String(request.parameters.probability).trim() : '';
                const projectedTotal = request.parameters.projectedTotal ? String(request.parameters.projectedTotal).trim() : '';
                const subsidiary = request.parameters.subsidiary ? String(request.parameters.subsidiary).trim() : '';
                const expectedCloseParam = request.parameters.expectedClose ? String(request.parameters.expectedClose).trim() : '';

                // Check required fields
                if (!company) throw new Error('Company is required');
                if (!status) throw new Error('Status is required');
                if (!probability) throw new Error('Probability is required');
                if (!projectedTotal) throw new Error('Projected Total is required');
                if (!subsidiary) throw new Error('Subsidiary is required');
                if (!expectedCloseParam) throw new Error('Expected Close Date is required');

                // Set Opportunity record values
                opportunityRecord.setValue({ fieldId: 'entity', value: company });
                opportunityRecord.setValue({ fieldId: 'entitystatus', value: status });
                opportunityRecord.setValue({ fieldId: 'probability', value: parseFloat(probability) });
                opportunityRecord.setValue({ fieldId: 'projectedtotal', value: parseFloat(projectedTotal) });
                opportunityRecord.setValue({ fieldId: 'subsidiary', value: subsidiary });
                const expectedCloseDate = formatDate(expectedCloseParam);
                if (expectedCloseDate) {
                    opportunityRecord.setValue({ fieldId: 'expectedclosedate', value: expectedCloseDate });
                }
                let items = [];
                try {
                    if (request.parameters.items) {
                        items = JSON.parse(request.parameters.items);
                    }
                } catch (parseErr) {
                    log.error("Error parsing items JSON", parseErr);
                    items = [];
                }
                items.forEach(line => {
                    if (!line.id) return;
                    const itemId = line.id;
                    const qtyVal = parseFloat(line.qty) || 1;
                    const rateVal = parseFloat(line.rate) || 0;
                    const amtVal = (line.amount !== undefined && line.amount !== null && line.amount !== '')
                        ? parseFloat(line.amount)
                        : parseFloat((qtyVal * rateVal).toFixed(2));
                    const descVal = line.desc || '';
                    const classVal = line.classId || '';
                    const departmentVal = line.departmentId || '';
                    const priceLevelVal = line.priceLevel || '';  // Get Price Level value from the form

                    // Add item to Opportunity
                    opportunityRecord.selectNewLine({ sublistId: 'item' });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: itemId });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'class', value: classVal || '' });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: departmentVal || '' });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: qtyVal });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: rateVal });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: amtVal });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: descVal });

                    if (String(priceLevelVal).toLowerCase() === 'custom' || priceLevelVal == -1) {

                        opportunityRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'price',
                            value: -1
                        });
                        opportunityRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: rateVal
                        });

                    } else {

                        opportunityRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'price',
                            value: priceLevelVal
                        });

                        opportunityRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: rateVal
                        });
                    }

                    opportunityRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        value: amtVal
                    });

                    try {
                        opportunityRecord.commitLine({ sublistId: 'item' });
                    } catch (commitErr) {
                        log.error("Error committing line " + itemId, commitErr);
                    }
                });

                let salesTeam = [];
                try {
                    if (request.parameters.salesTeam) {
                        salesTeam = JSON.parse(request.parameters.salesTeam);
                    }
                } catch (e) {
                    log.error("Invalid salesTeam JSON", e);
                    salesTeam = [];
                }
                if (salesTeam.length) {
                    const total = salesTeam.reduce((sum, m) => sum + (parseFloat(m.contribution) || 0), 0);
                    if (Math.abs(total - 100) > 0.01) {
                        throw new Error("Sales team contributions must total 100. Current total: " + total);
                    }
                }
                const existingSales = opportunityRecord.getLineCount({ sublistId: 'salesteam' }) || 0;
                for (let i = existingSales - 1; i >= 0; i--) {
                    opportunityRecord.removeLine({ sublistId: 'salesteam', line: i });
                }
                salesTeam.forEach(m => {
                    if (!m.employeeId) return;
                    opportunityRecord.selectNewLine({ sublistId: 'salesteam' });
                    opportunityRecord.setCurrentSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'employee',
                        value: Number(m.employeeId)
                    });
                    if (m.roleId) {
                        opportunityRecord.setCurrentSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'salesrole',
                            value: Number(m.roleId)
                        });
                    }
                    opportunityRecord.setCurrentSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'contribution',
                        value: Number(m.contribution) || 0
                    });
                    opportunityRecord.setCurrentSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'isprimary',
                        value: m.isPrimary ? true : false
                    });
                    opportunityRecord.commitLine({ sublistId: 'salesteam' });
                });
            } catch (e) {
                log.error("Error in setRequiredOpportunityFields", e);
                throw e;
            }
            log.debug("All request parameters", request.parameters);
        }

        /**
       * Formats date input to a valid Date object
       * @param {string|Date|number} dateInput - The input date in letious formats
       * @returns {Date|null} Formatted Date object or null if invalid
       */
        function formatDate(dateInput) {
            try {
                if (!dateInput) return null;
                if (dateInput instanceof Date) {
                    return isNaN(dateInput.getTime()) ? null : dateInput;
                }
                let parsedDate = null;
                if (typeof dateInput === 'string') {
                    const iso = dateInput.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
                    if (iso) {
                        const y = parseInt(iso[1], 10);
                        const m = parseInt(iso[2], 10) - 1;
                        const d = parseInt(iso[3], 10);
                        parsedDate = new Date(y, m, d);
                    } else {
                        parsedDate = new Date(dateInput);
                    }
                } else {
                    parsedDate = new Date(dateInput);
                }
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                    return parsedDate;
                }
                return null;
            } catch (e) {
                log.error('Error formatting date', e);
                return null;
            }
        }

        /**
     * Sets optional fields on opportunity record
     * @param {Object} opportunityRecord - The opportunity record
     * @param {Object} request - The request object containing form parameters
    */
        function setOptionalOpportunityFields(opportunityRecord, request) {
            try {
                if (request.parameters.title) {
                    opportunityRecord.setValue({ fieldId: 'title', value: request.parameters.title });
                }
                if (request.parameters.projectSummary) {
                    opportunityRecord.setValue({ fieldId: 'custbody_jj_project_summary_invo', value: request.parameters.projectSummary });
                }
                if (request.parameters.forecastType) {
                    opportunityRecord.setValue({ fieldId: 'forecasttype', value: request.parameters.forecastType });
                }
                if (request.parameters.department) {
                    opportunityRecord.setValue({ fieldId: 'department', value: request.parameters.department });
                }
                if (request.parameters.location) {
                    opportunityRecord.setValue({ fieldId: 'location', value: request.parameters.location });
                }
                if (request.parameters.details) {
                    opportunityRecord.setValue({ fieldId: 'memo', value: request.parameters.details });
                }
                if (request.parameters.class) {
                    opportunityRecord.setValue({ fieldId: 'class', value: request.parameters.class });
                }
                if (request.parameters.salesType) {
                    opportunityRecord.setValue({ fieldId: 'cseg_jj_sales_type', value: request.parameters.salesType });
                }
            } catch (e) {
                log.error("Error in setOptionalOpportunityFields", e);
            }
        }

        /**
       * Update an existing opportunity record: replace header values and rebuild item lines
       * @param {Object} request - Suitelet request
       * @param {Object} record - N/record module
       * @param {string|number} oppId - internal id of the opportunity to update
       * @returns {number} saved opportunity id
      */
        function updateOpportunityRecord(request, record, oppId) {
            try {
                let oppRecord = record.load({
                    type: record.Type.OPPORTUNITY,
                    id: parseInt(oppId, 10),
                    isDynamic: true
                });
                log.debug("Opportunity ", oppRecord)
                const originalCompany = oppRecord.getValue({ fieldId: 'entity' });
                setHeaderFieldsForUpdate(oppRecord, request);
                setOptionalOpportunityFields(oppRecord, request);
                ensureCompanyOnRecord(oppRecord, request, originalCompany);
                let items = [];
                try {
                    if (request.parameters.items) {
                        items = JSON.parse(request.parameters.items);
                    }
                } catch (parseErr) {
                    log.error("Error parsing items JSON", parseErr);
                    items = [];
                }
                try {
                    const existingCount = oppRecord.getLineCount({ sublistId: 'item' }) || 0;
                    for (let i = existingCount - 1; i >= 0; i--) {
                        try { oppRecord.removeLine({ sublistId: 'item', line: i }); } catch (remErr) { /* ignore */ }
                    }
                } catch (clearErr) {
                    log.debug('Could not clear existing item lines before update (continuing)', clearErr);
                }
                items.forEach(line => {
                    if (!line.id) return;

                    const itemId = line.id;
                    const qtyVal = parseFloat(line.qty) || 1;
                    const rateVal = parseFloat(line.rate) || 0;
                    const amtVal = (line.amount !== undefined && line.amount !== null && line.amount !== '')
                        ? parseFloat(line.amount)
                        : parseFloat((qtyVal * rateVal).toFixed(2));

                    const descVal = line.desc || '';
                    const classVal = line.classId || '';
                    const departmentVal = line.departmentId || '';
                    const priceLevelVal = line.priceLevel || '';

                    try {
                        oppRecord.selectNewLine({ sublistId: 'item' });

                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: parseInt(itemId, 10) });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'class', value: classVal });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: departmentVal });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: qtyVal });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: descVal });

                        if (String(priceLevelVal).toLowerCase() === 'custom' || priceLevelVal == -1) {
                            oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: -1 });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: rateVal });
                        } else {
                            oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'price', value: priceLevelVal });
                            oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: rateVal });
                        }

                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: amtVal });

                        oppRecord.commitLine({ sublistId: 'item' });
                        log.debug('Re-added item line (update)', { item: itemId, qty: qtyVal, rate: rateVal, amount: amtVal });
                    } catch (addErr) {
                        log.error('Error adding item line during update', addErr);
                    }
                });
                let salesTeamCount = oppRecord.getLineCount({ sublistId: 'salesteam' });
                log.debug('Existing sales team line count before update', salesTeamCount);
                updateSalesTeamLines(oppRecord, request);
                const savedId = oppRecord.save();
                return {
                    success: true,
                    opportunityId: savedId,
                    message: "Opportunity updated successfully"
                };
            } catch (e) {
                log.error('Error updating opportunity record', e);
                throw e;
            }
        }
        /**
     * Set header fields on an existing record during update without performing create-only validation
     * This avoids throwing errors if fields are missing and doesn't touch line items.
     * @param {Object} opportunityRecord
     * @param {Object} request
     */
        function setHeaderFieldsForUpdate(opportunityRecord, request) {
            try {
                const company = request.parameters.company;
                const status = request.parameters.status;
                const probability = request.parameters.probability;
                const projectedTotal = request.parameters.projectedTotal;
                const subsidiary = request.parameters.subsidiary;
                const expectedCloseParam = request.parameters.expectedClose;
                if (company !== undefined && company !== null && String(company).trim() !== '') {
                    opportunityRecord.setValue({ fieldId: 'entity', value: company });
                }
                if (status !== undefined && status !== null && String(status).trim() !== '') {
                    opportunityRecord.setValue({ fieldId: 'entitystatus', value: status });
                }
                if (probability !== undefined && probability !== null && String(probability).trim() !== '') {
                    opportunityRecord.setValue({ fieldId: 'probability', value: parseFloat(probability) });
                }
                if (projectedTotal !== undefined && projectedTotal !== null && String(projectedTotal).trim() !== '') {
                    opportunityRecord.setValue({ fieldId: 'projectedtotal', value: parseFloat(projectedTotal) });
                }
                if (subsidiary !== undefined && subsidiary !== null && String(subsidiary).trim() !== '') {
                    opportunityRecord.setValue({ fieldId: 'subsidiary', value: subsidiary });
                }
                if (expectedCloseParam !== undefined && expectedCloseParam !== null && String(expectedCloseParam).trim() !== '') {
                    const expectedCloseDate = formatDate(expectedCloseParam);
                    if (expectedCloseDate) {
                        opportunityRecord.setValue({ fieldId: 'expectedclosedate', value: expectedCloseDate });
                    }
                }
            } catch (e) {
                log.error('Error in setHeaderFieldsForUpdate', e);
            }
        }
        /**
        * Sets optional header fields on an Opportunity record based on request parameters.
        *
        * @param {Object} opportunityRecord - The loaded Opportunity record instance.
        * @param {Object} request - The Suitelet request object containing parameters.
        * @returns {void}
        */
        function setOptionalOpportunityFields(opportunityRecord, request) {
            try {
                if (request.parameters.title) {
                    opportunityRecord.setValue({ fieldId: 'title', value: request.parameters.title });
                }
                if (request.parameters.projectSummary) {
                    opportunityRecord.setValue({ fieldId: 'custbody_jj_project_summary_invo', value: request.parameters.projectSummary });
                }
                if (request.parameters.forecastType) {
                    opportunityRecord.setValue({ fieldId: 'forecasttype', value: request.parameters.forecastType });
                }
                if (request.parameters.department) {
                    opportunityRecord.setValue({ fieldId: 'department', value: request.parameters.department });
                }
                if (request.parameters.location) {
                    opportunityRecord.setValue({ fieldId: 'location', value: request.parameters.location });
                }
                if (request.parameters.details) {
                    opportunityRecord.setValue({ fieldId: 'memo', value: request.parameters.details });
                }
                if (request.parameters.class) {
                    opportunityRecord.setValue({ fieldId: 'class', value: request.parameters.class });
                }
                if (request.parameters.salesType) {
                    opportunityRecord.setValue({ fieldId: 'cseg_jj_sales_type', value: request.parameters.salesType });
                }
            } catch (e) {
                log.error("Error in setOptionalOpportunityFields", e);
            }
        }

        /**
        * Updates the Sales Team sublist on an Opportunity record.
        *
        * Parses the sales team JSON from the request, validates contribution totals,
        * clears existing sales team lines, and inserts the new ones.
        *
        * @param {Object} oppRecord - The loaded Opportunity record instance.
        * @param {Object} request - The Suitelet request object containing parameters.
        * @returns {void} Throws an error if contribution totals are invalid or update fails.
        */
        function updateSalesTeamLines(oppRecord, request) {
            try {
                let salesTeam = [];
                log.debug(`opportunity recordID ${oppRecord.id} & request ${request}`);
                log.debug('request.parameters', request.parameters)
                log.debug('request.parameters.salesTeam', request.parameters.salesTeam)
                if (request.parameters && request.parameters.salesTeam) {
                    try {
                        salesTeam = JSON.parse(request.parameters.salesTeam);
                    } catch (err) {
                        log.error("Error parsing salesTeam params", err);
                    }
                }
                if (!Array.isArray(salesTeam) || salesTeam.length === 0) {
                    log.debug('No sales team data provided, skipping update');
                    return;
                }
                const hasEmployee = salesTeam.some(m => m.employeeId);

                const totalContribution = salesTeam.reduce((sum, m) => {
                    if (m.employeeId) {
                        return sum + (parseFloat(m.contribution) || 0);
                    }
                    return sum;
                }, 0);
                if (hasEmployee && Math.abs(totalContribution - 100) > 0.01) {
                    throw new Error('Sales team contributions must total 100. Current total: ' + totalContribution);
                }

                const existingCount = oppRecord.getLineCount({ sublistId: 'salesteam' }) || 0;
                for (let i = existingCount - 1; i >= 0; i--) {
                    try {
                        oppRecord.removeLine({ sublistId: 'salesteam', line: i });
                    } catch (remErr) {
                    }
                }
                salesTeam.forEach(line => {
                    if (!line || !line.employeeId) return;
                    const empId = Number(line.employeeId) || null;
                    const roleId = line.roleId ? Number(line.roleId) : null;
                    const contribVal = Number(line.contribution) || 0;
                    const isPrimaryVal = ['T', '1', true].includes(line.isPrimary);
                    try {
                        oppRecord.selectNewLine({ sublistId: 'salesteam' });
                        oppRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'employee', value: empId });
                        if (roleId) {
                            oppRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'salesrole', value: roleId });
                        }
                        oppRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'contribution', value: contribVal });
                        try {
                            oppRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'isprimary', value: isPrimaryVal });
                        } catch (isPrimaryErr) {
                            try { oppRecord.setCurrentSublistValue({ sublistId: 'salesteam', fieldId: 'isprimary', value: isPrimaryVal === 'T' }); } catch (inner) { log.debug('isprimary set failed', inner); }
                        }
                        oppRecord.commitLine({ sublistId: 'salesteam' });
                    } catch (err) {
                        log.error('Error committing sales team line (update)', err);
                    }
                });
                log.debug('Sales team update complete', { count: salesTeam.length });
            } catch (e) {
                log.error('Error updating sales team lines', e);
                throw e;
            }
        }

        /**
        * Ensures the Opportunity record has a company (entity) set.
        * Attempts to read the company from request parameters using multiple possible keys.
        * Falls back to the original company if provided. Logs errors but does not throw.
        *
        * @param {Object} oppRecord - The loaded Opportunity record instance.
        * @param {Object} request - The Suitelet request object containing parameters.
        * @param {number|string|null} originalCompany - The original company ID to fall back to.
        * @returns {void}
        */
        function ensureCompanyOnRecord(oppRecord, request, originalCompany) {
            try {
                const companyOnRecord = oppRecord.getValue({ fieldId: 'entity' });
                if (companyOnRecord) return;
                const paramValOrArray = (k) => request.parameters[k] === undefined ? null : request.parameters[k];
                const toSingle = (v) => (v === null || v === undefined) ? null : (Array.isArray(v) ? v[0] : v);
                const candidateKeys = [
                    'company', 'entity', 'customer', 'customerId', 'entityid',
                    'custentity_company', 'company[]', 'entity[]'
                ];
                let companyParam = null;
                for (let k = 0; k < candidateKeys.length; k++) {
                    const raw = paramValOrArray(candidateKeys[k]);
                    const single = toSingle(raw);
                    if (single !== null && single !== undefined && String(single).trim() !== '') {
                        companyParam = single;
                        break;
                    }
                }
                if (companyParam && String(companyParam).trim() !== '') {
                    oppRecord.setValue({ fieldId: 'entity', value: companyParam });
                } else if (originalCompany) {
                    oppRecord.setValue({ fieldId: 'entity', value: originalCompany });
                } else {
                    throw new Error('Company is required');
                }
            } catch (e) {
                log.error('Error in ensureCompanyOnRecord', e);
            }
        }
        /**
     * Retrieves active customers, leads, and prospects
     * @param {Object} search - The N/search module
     * @returns {Array<Object>} Array of company objects with id, name, and type properties
     */
        function getActiveCompanies(search) {
            const companies = [];
            try {
                const entityTypes = [
                    { type: search.Type.CUSTOMER, label: 'customer' },
                    { type: search.Type.LEAD, label: 'lead' },
                    { type: search.Type.PROSPECT, label: 'prospect' }
                ];
                entityTypes.forEach(function (entityType) {
                    try {
                        const searchObj = search.create({
                            type: entityType.type,
                            filters: [['isinactive', 'is', 'F']],
                            columns: ['internalid', 'entityid']
                        });
                        searchObj.run().each(function (result) {
                            companies.push({ id: result.getValue('internalid'), name: result.getValue('entityid'), type: entityType.label });
                            return true;
                        });
                    } catch (innerErr) {
                        log.error('Error searching ' + entityType.label, innerErr);
                    }
                });
            } catch (e) {
                log.error('Error in getActiveCompanies', e);
            }
            return companies;

        }


        /**
    * Returns static list of opportunity statuses
    * @returns {Array<Object>} Array of status objects with id and name
    */
        function getOpportunityStatuses() {
            return opportunityStatuses;
        }

        /**
     * Returns available opportunity forms
     * @returns {Array<Object>} Array of form objects with id and name
     */
        function getOpportunityForms() {
            return opportunityForms;
        }



        /**
     * Retrieves active employees for populating sales team dropdowns
     * @param {Object} search - N/search module
     * @returns {Array<Object>} employees
     */
        function getActiveEmployees(search) {
            const results = [];
            try {
                const empSearch = search.create({
                    type: search.Type.EMPLOYEE,
                    filters: [['isinactive', 'is', 'F']],
                    columns: ['internalid', 'firstname', 'lastname', 'entityid']
                });
                empSearch.run().each(function (res) {
                    const id = res.getValue('internalid');
                    const fname = res.getValue({ name: 'firstname' }) || '';
                    const lname = res.getValue({ name: 'lastname' }) || '';
                    const display = ((fname + ' ' + lname).trim()) || res.getValue({ name: 'entityid' }) || '';
                    results.push({ id: id, name: display });
                    return true;
                });
            } catch (e) {
                log.debug('getActiveEmployees failed', e);
            }
            return results;
        }

        /**
     * Retrieves available sales roles for sales team lines
     * Tries common record types and falls back gracefully if not present.
     * @param {Object} search
     */
        function getActiveSalesRoles(search) {
            const results = [];
            try {
                try {
                    const roleSearch = search.create({
                        type: 'salesrole',
                        filters: [['isinactive', 'is', 'F']],
                        columns: ['internalid', 'name']
                    });
                    roleSearch.run().each(function (r) { results.push({ id: r.getValue('internalid'), name: r.getValue('name') }); return true; });
                } catch (err) {
                    try {
                        const roleSearch2 = search.create({
                            type: 'customrecord_salesrole',
                            filters: [['isinactive', 'is', 'F']],
                            columns: ['internalid', 'name']
                        });
                        roleSearch2.run().each(function (r2) { results.push({ id: r2.getValue('internalid'), name: r2.getValue('name') }); return true; });
                    } catch (inner) {
                        log.debug('getActiveSalesRoles: no salesrole record type found', inner);
                    }
                }
            } catch (e) {
                log.debug('getActiveSalesRoles failed', e);
            }
            return results;
        }

        /**
     * Returns static list of forecast types
     * @returns {Array<Object>} Array of forecast type objects with id and name
     */
        function getForecastTypes() {
            return forecastTypes;
        }

        /**
    * Retrieves all active departments
    * @param {Object} search - The N/search module
    * @returns {Array<Object>} Array of department objects with id and name
    */
        function getActiveDepartments(search) {
            const departments = [];
            try {
                const searchObj = search.create({
                    type: search.Type.DEPARTMENT,
                    filters: [
                        ['isinactive', 'is', 'F']
                    ],
                    columns: ['internalid', 'name']
                });
                searchObj.run().each(function (result) {
                    departments.push({ id: result.getValue('internalid'), name: result.getValue('name') });
                    return true;
                });
            } catch (e) {
                log.error('Error in getActiveDepartments', e);
            }
            return departments;
        }

        /**
     * Retrieves all active classifications
     * @param {Object} search - The N/search module
     * @returns {Array<Object>} Array of classification objects with id and name
     */
        function getActiveClasses(search) {
            const classes = [];
            try {
                const searchObj = search.create({
                    type: search.Type.CLASSIFICATION,
                    filters: [
                        ['isinactive', 'is', 'F']
                    ],
                    columns: ['internalid', 'name']
                });
                searchObj.run().each(function (result) {
                    classes.push({ id: result.getValue('internalid'), name: result.getValue('name') });
                    return true;
                });
            } catch (e) {
                log.error('Error in getActiveClasses', e);
            }
            return classes;
        }

        /**
    * Retrieves all active locations
    * @param {Object} search - The N/search module
    * @returns {Array<Object>} Array of location objects with id and name
    */
        function getActiveLocations(search) {
            const locations = [];
            try {
                const searchObj = search.create({
                    type: search.Type.LOCATION,
                    filters: [
                        ['isinactive', 'is', 'F']
                    ],
                    columns: ['internalid', 'name']
                });
                searchObj.run().each(function (result) {
                    locations.push({ id: result.getValue('internalid'), name: result.getValue('name') });
                    return true;
                });
            } catch (e) {
                log.error('Error in getActiveLocations', e);
            }
            return locations;
        }


        /**
        * Retrieves active departments for a given subsidiary.
        * @param {Object} search - The N/search module reference.
        * @param {number|string} subsidiaryId - Internal ID of the subsidiary.
        * @returns {Array<{id: string, name: string}>} List of department objects.
        */
        function getDepartmentsBySubsidiary(search, subsidiaryId) {
            const departments = [];
            try {
                const searchObj = search.create({
                    type: search.Type.DEPARTMENT,
                    filters: [
                        ['subsidiary', 'anyof', subsidiaryId],
                        'AND',
                        ['isinactive', 'is', 'F']
                    ],
                    columns: ['internalid', 'name']
                });
                searchObj.run().each(result => {
                    departments.push({
                        id: result.getValue('internalid'),
                        name: result.getValue('name')
                    });
                    return true;
                });
            } catch (e) {
                log.error('Error in getDepartmentsBySubsidiary', e);
            }
            return departments;
        }

        /**
        * Retrieves active classes for a given subsidiary.
        * @param {Object} search - The N/search module reference.
        * @param {number|string} subsidiaryId - Internal ID of the subsidiary.
        * @returns {Array<{id: string, name: string}>} List of class objects.
        */
        function getClassesBySubsidiary(search, subsidiaryId) {
            const classes = [];
            try {
                const searchObj = search.create({
                    type: search.Type.CLASSIFICATION,
                    filters: [
                        ['subsidiary', 'anyof', subsidiaryId],
                        'AND',
                        ['isinactive', 'is', 'F']
                    ],
                    columns: ['internalid', 'name']
                });
                searchObj.run().each(result => {
                    classes.push({
                        id: result.getValue('internalid'),
                        name: result.getValue('name')
                    });
                    return true;
                });
            } catch (e) {
                log.error('Error in getClassesBySubsidiary', e);
            }
            return classes;
        }

        /**
        * Retrieves active locations for a given subsidiary.
        * @param {Object} search - The N/search module reference.
        * @param {number|string} subsidiaryId - Internal ID of the subsidiary.
        * @returns {Array<{id: string, name: string}>} List of location objects.
        */
        function getLocationsBySubsidiary(search, subsidiaryId) {
            const locations = [];
            try {
                const searchObj = search.create({
                    type: search.Type.LOCATION,
                    filters: [
                        ['subsidiary', 'anyof', subsidiaryId],
                        'AND',
                        ['isinactive', 'is', 'F']
                    ],
                    columns: ['internalid', 'name']
                });
                searchObj.run().each(result => {
                    locations.push({
                        id: result.getValue('internalid'),
                        name: result.getValue('name')
                    });
                    return true;
                });
            } catch (e) {
                log.error('Error in getLocationsBySubsidiary', e);
            }
            return locations;
        }

        /**
        * Retrieves active items for a given subsidiary across multiple item types.
        * @param {Object} search - The N/search module reference.
        * @param {number|string} subsidiaryId - Internal ID of the subsidiary.
        * @returns {Array<{id: string, name: string, rate: number, type: string}>} List of item objects.
        */
        function getItemsBySubsidiary(search, subsidiaryId) {
            const items = [];
            try {
                const searchObj = search.create({
                    type: search.Type.INVENTORY_ITEM,
                    filters: [
                        ['subsidiary', 'anyof', subsidiaryId],
                        'AND',
                        ['isinactive', 'is', 'F']
                    ],
                    columns: ['internalid', 'itemid', 'baseprice']
                });

                searchObj.run().each(result => {
                    items.push({
                        id: result.getValue('internalid'),
                        name: result.getValue('itemid'),
                        rate: parseFloat(result.getValue('baseprice')) || 0,
                        type: 'Inventory'
                    });
                    return true;
                });

            } catch (e) {
                log.error('Error in getItemsBySubsidiary', e);
            }
            return items;
        }


        /**
    * Returns static list of sales types
    * @returns {Array<Object>} Array of sales type objects with id and name
    */
        function getActiveSalesTypes() {
            return salesTypes;
        }

        /**
    * Retrieves subsidiary information for a specific customer (only if active)
    * @param {Object} search - The N/search module
    * @param {number|string} customerId - The customer's internal ID
    * @returns {Object} Object containing subsidiaryId, subsidiaryName, and isActive flag
    */
        function getSubsidiaryForCustomer(search, customerId) {
            let resultObj = {
                hasSubsidiary: false,
                subsidiaryId: null,
                subsidiaryName: null,
                subsidiaryActive: false
            };
            if (!customerId) {
                return resultObj;
            }
            try {
                const entityRecordTypes = [search.Type.CUSTOMER, search.Type.PROSPECT];
                for (let recordType of entityRecordTypes) {
                    try {
                        const entitySearch = search.create({
                            type: recordType,
                            filters: [['internalid', 'is', customerId]],
                            columns: ['subsidiary']
                        });
                        const entityRow = entitySearch.run().getRange({ start: 0, end: 1 })[0];
                        if (!entityRow) continue;
                        const subsidiaryId = entityRow.getValue('subsidiary');
                        if (!subsidiaryId) break;
                        const subSearch = search.create({
                            type: search.Type.SUBSIDIARY,
                            filters: [
                                ['internalid', 'is', subsidiaryId],
                                'AND',
                                ['isinactive', 'is', 'F']
                            ],
                            columns: ['name', 'isinactive']
                        });
                        const subRow = subSearch.run().getRange({ start: 0, end: 1 })[0];
                        if (!subRow) break;
                        resultObj = {
                            hasSubsidiary: true,
                            subsidiaryId: subsidiaryId,
                            subsidiaryName: subRow.getValue('name') || subRow.getText('name'),
                            subsidiaryActive: true
                        };
                        break;
                    } catch (innerErr) {
                        log.debug(`getSubsidiaryForCustomer: search failed for type ${recordType}`, innerErr);
                    }
                }
            } catch (e) {
                log.error('Error in getSubsidiaryForCustomer', e);
            }
            return resultObj;
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            const { request, response } = scriptContext;
            const params = request.parameters;
            try {
                if (request.method === 'GET') {
                    try {
                        log.debug("params userid", params.userId)

                        const fileId = getPageFilePath(params.action);
                        try {
                            const pageContents = file.load({ id: fileId }).getContents();
                            const finalContent = pageContents.replace("{{USER_ID}}", params.userId || "");
                            response.write(finalContent || "OOPS.... SOMETHING WENT WRONG!");
                        }
                        catch (fileError) {
                            log.error("Error loading file", fileError);
                            response.write("OOPS.... SOMETHING WENT WRONG!");
                        }

                    }
                    catch (error) {
                        log.error("Error @onRequest-GET", error);
                        response.setHeader({ name: 'Content-Type', value: 'application/json' });
                        response.write(JSON.stringify({ success: false, message: "GET request failed" }));
                    }
                }

                else if (request.method === 'POST') {
                    response.setHeader({
                        name: 'Content-Type',
                        value: 'application/json'
                    });
                    log.debug("post request", response)
                    let req = null;
                    let action = request.parameters.action || null;
                    log.debug("intial ation 1", action)
                    if (action === 'createOpportunity' || action === 'updateOpportunity' || action === 'opportunityform') {
                        req = request.parameters;
                        action = req.action;
                        skipJsonParse = true;
                    }

                    if (action === 'upload') {
                        req = request.files;
                    }
                    else if (action === 'updateLead') {
                        req = request.parameters;
                    }
                    else if (
                        request.body &&
                        request.body.startsWith('{') &&
                        JSON.parse(request.body).action === 'kanbanBoard'
                    ) {
                        let reqBody = JSON.parse(request.body);
                        res = fetchKanbanData(reqBody.startDate, reqBody.endDate, reqBody.userId);

                    }
                    // else if (request.body.action === 'kanbanBoard') {
                    //     let reqBody = JSON.parse(request.body);
                    //     console.log('Kanban Board Request Body:', reqBody);
                    //     res = fetchKanbanData(reqBody.startDate, reqBody.endDate, reqBody.userId);
                    // }
                    else if (action === 'updateOpportunity') {
                        req = request.parameters;
                    }
                    else {
                        try {
                            if (request.body) req = JSON.parse(request.body);
                        }
                        catch (e) {
                            log.error("JSON body parse failed", e);
                            req = {};
                        }
                    }

                    req.userId = req.userId || params.userId || null;
                    log.debug("request before if", req)
                    if (!action && req && req.action) {
                        action = req.action;
                        log.debug("action  in if", action)
                    }

                    let res;
                    switch (action) {
                        case 'reset':
                            res = USER_AUTH.resetPassword(req);
                            break;
                        case 'login':
                            res = USER_AUTH.login(req);
                            break;
                        case 'upload':
                            res = USER_AUTH.createOrder(req, request.parameters);
                            break;
                        case 'forgot':
                            res = USER_AUTH.sendPasswordResetEmail(req);
                            break;
                        case 'session':
                            res = USER_AUTH.isValidSession(req);
                            break;
                        case 'opportunityform':
                            res = getOpportunityFormData(req);
                            break;
                        case 'getItemPriceLevels':
                            res = getItemPriceLevelsUsingSearch(req.itemId);
                            break;
                        case 'opportunitydropdowns':
                            res = getOpportunityDropdowns();
                            break;
                        case 'getSubsidiary':
                            res = getSubsidiaryForCustomer(search, req.customerId);
                            break;
                        case 'getSubsidiaryDependents':
                            res = getSubsidiaryDependents(search, req.subsidiaryId);
                            break;
                        case 'loadOpportunity':
                            log.debug("POST ACTION", req.action);
                            log.debug("REQ ID RECEIVED", req.id);
                            return loadOpportunityForEdit(req.id, response, record);
                        case 'createOpportunity':
                            res = createOpportunityRecord(request, record);
                            break;
                        case 'updateOpportunity':
                            res = updateOpportunityRecord(request, record, req.opportunityId);
                            break;
                        case 'getCustomerDetails':
                            res = USER_AUTH.getCustomerDetails(req);
                            break;
                        case 'getHistory':
                            res = getHistory(req);
                            break;
                        case 'updateOppLines':
                            res = updateOpportunityLines(req);
                            break;
                        case 'getLeads':
                            res = fetchLeadDetails(req);
                            break;
                        case 'updateLead':
                            res = updateLeadRecord(req.leadId, req);
                            break;
                        case 'fetchLeadList':
                            res = model.fetchLeadList("2028");
                            break;
                        case 'fetchReportData':
                            res = getReportData(req)
                            break;
                        case 'fetchRecords':
                            res = fetchKanbanData(req.startDate, req.endDate, req.userId);
                            break;
                        case 'updateStage':
                            res = { success: updateRecordStage(req.fromRecordType, req.toRecordType, req.fromId) };
                            break;
                        case 'getUserInfo':
                            res = userInformation();
                            break;
                        case 'getRecentActivity':
                            res = getRecentRecords();
                            break;

                        case 'getKanbanEstimateDetails':
                            res = getKanbanEstimateDetails(req.estimateId, req.userId);
                            res.data.header.jobDetails = model.jobDetails(req.estimateId);
                            res.data.header.partnerDetails = model.partnerDetails(req.estimateId);
                            res.data.header.leadSourceDetails = model.leadSourceDetails(req.estimateId);
                            res.data.header.classDetails = model.classDetails(req.estimateId);
                            res.data.header.departmentDetails = model.departmentDetails(req.estimateId);
                            res.data.header.locationDetails = model.locationDetails(req.estimateId);
                            res.data.header.itemList = model.itemList(req.estimateId);
                            res.data.header.salesRepList = model.salesRepList();
                            res.data.header.classList = model.classList(req.estimateId);
                            res.data.header.departmentList = model.departmentList(req.estimateId);
                            res.data.header.unitList = model.unitList(req.estimateId);
                            res.data.header.priceLevelList = model.pricelevelList(req.estimateId);
                            res.data.header.salesRoleList = model.salesRoleList();
                            break;
                        case 'updateEstimate':
                            res = updateEstimateRecord(req);
                            break;
                        case 'getItemDetails':
                            res = model.getItemDetails(req.itemId);
                            break;

                        case 'getKanbanOpportunityDetails':
                            res = getKanbanOpportunityDetails(req.opportunityId);
                            break;
                        case 'getKanbanSalesOrderDetails':
                            res = getKanbanSalesOrderDetails(req.salesOrderId, req.userId);
                            res.data.soClassDetails = model.soClassDetails(req.salesOrderId);
                            res.data.soDepartmentDetails = model.soDepartmentDetails(req.salesOrderId);
                            res.data.soLocationDetails = model.soLocationDetails(req.salesOrderId);
                            res.data.soJobDetails = model.soJobDetails(req.salesOrderId);
                            res.data.soPartnerDetails = model.soPartnerDetails(req.salesOrderId);
                            res.data.soLeadSourceDetails = model.soLeadSourceDetails(req.salesOrderId);
                            res.data.soOpportunityDetails = model.soOpportunityDetails(req.salesOrderId);
                            res.data.soItemList = model.soItemList(req.salesOrderId);
                            res.data.soEmployeeList = model.salesRepList();
                            res.data.soUnitList = model.soUnitList(req.salesOrderId);
                            res.data.soSalesRoleList = model.salesRoleList();
                            res.data.soPriceLevelList = getSalesOrderPriceLevels(req.salesOrderId);
                            break;

                        case 'updateSalesOrder':
                            res = updateSalesOrder(req);
                            break;

                        case 'checkSalesManager':
                            const isManager = checkIfSalesManager(req.userId);
                            res = { success: true, isSalesManager: isManager };
                            break;

                        case 'fetchEstimates':
                            res = {
                                success: true,
                                estimatesList: getEstimatesList(req.userId, req.customerId, req.status)
                            };
                            break;

                        case 'getDropdownData':
                            res = {
                                statuses: model.getStatusValues(),
                                priorities: model.getPriorityValues(),
                                issues: model.getIssueValues(),
                                customers: model.getAllCustomers(),
                                employees: model.getAllEmployees()
                            };
                            break;
                        case 'createepic':
                            res = createEpicWithDropdowns(req);
                            break;

                        case 'approveso':
                            res = approveSo(req);
                            break;


                        case 'getQuoteStatuses':
                            const statuses = getQuoteStatuses(record);
                            res = { success: true, statuses: statuses };
                            break;

                        case 'getCustomerDetailsByEmail':
                            if (!req.email) {
                                res = { success: false, message: "Email parameter missing" };
                            } else {
                                const customers = getCustomersByEmail(req.email);
                                res = { success: true, customers: customers };
                            }
                            break;

                        default:
                            res = { success: false, message: 'Invalid action' };
                            break;
                    }
                    response.write(JSON.stringify(res));
                }
            }
            catch (error) {
                log.error("Error @onRequest", error);
                response.write(JSON.stringify({ success: false, message: 'OOPS.... SOMETHING WENT WRONG!' }));
            }
        };
        return { onRequest };
    });

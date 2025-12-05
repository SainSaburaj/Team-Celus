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

        /**
         * Opportunity forms dropdown options
         * @type {Array<Object>}
         */
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
                log.debug("credentialRecordId", credentialRecordId)
                log.debug("is sales manager", checkIfSalesManager(credentialRecordId));

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
                            log.debug("token", token)
                            const encryptedToken = XORCipher.encode(key, token);
                            log.debug("encryptedToken", encryptedToken)
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
         * Get customers by email, returning an object with id:name pairs
         *
         * @param {string} email - The email address to filter by
         * @returns {Object} customersObj - Object with {id: name}
         */
        function getCustomersByEmail(email) {
            const customersObj = {};

            const customrecordSearch = search.create({
                type: "customrecord_jj_order_request_credential",
                filters: [
                    ["custrecord_jj_request_email", "is", email]
                ],
                columns: [
                    search.createColumn({
                        name: "custrecord_jj_opp_creation_customer",
                        join: "CUSTRECORD_JJ_OPP_CREATION_CREDENTIAL",
                        label: "Customer"
                    })
                ]
            });

            customrecordSearch.run().each(function (result) {
                const customerId = result.getValue({
                    name: "custrecord_jj_opp_creation_customer",
                    join: "CUSTRECORD_JJ_OPP_CREATION_CREDENTIAL"
                });

                const customerName = result.getText({
                    name: "custrecord_jj_opp_creation_customer",
                    join: "CUSTRECORD_JJ_OPP_CREATION_CREDENTIAL"
                });

                if (customerId) {
                    customersObj[String(customerId)] = customerName || `Customer ${customerId}`;
                }

                return true; // continue iteration
            });

            log.debug("customer id-name object", customersObj);
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

            } catch (err) {
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
                case 'opportunityform':
                    return '../VIEW/jj_opportunity_layouts.html';
                case 'editopp':
                    return '../VIEW/jj_home_page.html';
                case 'help':
                    return '../VIEW/jj_home_page.html';
                case 'report':
                    return '../VIEW/jj_home_page.html';
                case 'implementation':
                    return '../VIEW/jj_home_page.html';
                case 'leaddetails':
                    return '../VIEW/jj_home_page.html';
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
         * @param {string} startDate - The start date for filtering records (ISO format or NetSuite-compatible).
         * @param {string} endDate - The end date for filtering records (ISO format or NetSuite-compatible).
         * @returns {Object} An object containing:
         * @property {Array} data - List of filtered transaction records for the Kanban board.
         * @property {Object|null} recordTypeTotal - Summary totals by record type (opportunity, estimate, salesorder),
         *                                           or null if the user is not authorized to view totals.
         */
        function fetchKanbanData(startDate, endDate) {
            try {
                return {
                    data: getRecords(startDate, endDate),
                    recordTypeTotal: salesSummaryByType(startDate, endDate),
                };
            } catch (error) {
                log.error('Error @ fetchKanbanData', error);
            }
        }

        /**
         * Fetches transaction records (Opportunity, Sales Order, Estimate) within a given date range.
         *
         * @param {Date|string} startDate - The start date for the search range.
         * @param {Date|string} endDate - The end date for the search range.
         * @returns {Array<Object>} An array of transaction objects containing:
         *   - id {string} Internal ID
         *   - transactionNumber {string} Transaction Number
         *   - stage {string} Derived stage/type
         *   - date {string} Transaction date
         *   - desc {string|null} Memo
         *   - status {string} Status reference
         *   - entity {string} Customer/Entity name
         *   - amount {string|number} Transaction amount
         *   - probability {string|number} Probability
         *   - entityStatus {string} Entity status
         *   - currency {string} Currency name
         */
        function getRecords(startDate, endDate) {
            const resultRow = [];
            try {
                let formattedStartDate = '';
                let formattedEndDate = '';
                if (startDate && endDate) {
                    formattedStartDate = dateFormatter(startDate);
                    formattedEndDate = dateFormatter(endDate);
                    if (formattedStartDate && formattedEndDate) {
                        const transactionSearchObj = search.create({
                            type: "transaction",
                            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                            filters:
                                [
                                    ["type", "anyof", "Opprtnty", "SalesOrd", "Estimate"],
                                    "AND",
                                    ["mainline", "is", "T"],
                                    "AND",
                                    ["trandate", "within", formattedStartDate, formattedEndDate],
                                    "AND",
                                    ["status", "noneof", "Opprtnty:C", "Estimate:C", "Estimate:X", "Estimate:B", "Estimate:V", "Opprtnty:D", "Opprtnty:B"]
                                ],
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
         * @param {Date|string} startDate - The start date for the search range.
         * @param {Date|string} endDate - The end date for the search range.
         * @returns {{salesorderTotal: number, estimateTotal: number, opportunityTotal: number}} 
         *          An object containing summed totals for each transaction type.
         */
        function salesSummaryByType(startDate, endDate) {
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

                    if (formattedStartDate && formattedEndDate) {
                        const searchTotal = search.create({
                            type: "transaction",
                            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                            filters:
                                [
                                    ["type", "anyof", "Estimate", "SalesOrd", "Opprtnty"],
                                    "AND",
                                    ["memorized", "is", "F"],
                                    "AND",
                                    ["mainline", "is", "T"],
                                    "AND",
                                    ["trandate", "within", formattedStartDate, formattedEndDate],
                                    "AND",
                                    ["status", "noneof", "Opprtnty:C", "Opprtnty:B", "Opprtnty:D", "Estimate:C", "Estimate:X", "Estimate:B", "Estimate:V"]
                                ],
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
        estimateSearch.run().each(function(result) {
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

            // Get employee internal ID from email
            const searchInternalId = getEmployeeIdByEmail(email);
            log.debug("employee internalid", searchInternalId);

            // Get all customers linked to this email
            const customerInternalObj = getCustomersByEmail(email);
            let customerInternalIds = Object.keys(customerInternalObj);

            let statusId = selectedStatusId || "10";

            // If a specific customer filter was selected in the frontend, override
            if (selectedCustomerId) {
                customerInternalIds = [selectedCustomerId];
            }

            try {
                const stringSearchInternalId = String(searchInternalId);
                log.debug("String internalid", stringSearchInternalId);

                // Build filters dynamically
                const filters = [
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['salesteammember', 'anyof', stringSearchInternalId]
                ];

                // Add customer filter if IDs exist
                if (customerInternalIds.length > 0) {
                    filters.push('AND', ['customersubof', 'anyof', customerInternalIds]);
                }

                // Add status filter if provided
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
            } catch (error) {
                log.error('Error in getEstimatesList', JSON.stringify(error));
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
        function approveSo(req) {
            try {
                const salesOrderId = req.salesOrderId;
                const salesOrderIds = req.salesOrderIds;

                if ((!salesOrderId && !salesOrderIds)) {
                    const salesOrders = [];
                    const salesOrderSearch = search.create({
                        type: search.Type.SALES_ORDER,
                        filters: [
                            ['mainline', 'is', 'T'],
                            'AND',
                            ['status', 'anyof', 'SalesOrd:A'] // Pending Approval
                        ],
                        columns: [
                            search.createColumn({ name: 'tranid' }),
                            search.createColumn({ name: "entity", label: "Name" }),
                            search.createColumn({ name: "statusref", label: "Status" }),
                            search.createColumn({ name: "trandate", label: "Date" }),
                            search.createColumn({ name: "datecreated", label: "Date Created" }),
                            search.createColumn({ name: "memo", label: "Memo" }),
                            search.createColumn({ name: "salesrep", label: "Sales Rep" }),
                            search.createColumn({ name: "currency", label: "Currency" }),
                            search.createColumn({ name: "terms", label: "Terms" }),
                            search.createColumn({ name: "shipdate", label: "Ship Date" }),
                            search.createColumn({ name: "location", label: "Location" }),
                            search.createColumn({ name: "department", label: "Department" }),
                            search.createColumn({ name: "class", label: "Class" }),
                            search.createColumn({ name: 'total' })
                        ]
                    });

                    salesOrderSearch.run().each(function (result) {
                        salesOrders.push({
                            id: result.id,
                            tranid: result.getValue({ name: 'tranid' }),
                            customer: result.getText({ name: 'entity' }),
                            status: result.getText({ name: 'statusref' }),
                            date: result.getValue({ name: 'trandate' }),
                            created: result.getValue({ name: 'datecreated' }),
                            memo: result.getValue({ name: 'memo' }),
                            salesRep: result.getText({ name: 'salesrep' }),
                            currency: result.getText({ name: 'currency' }),
                            terms: result.getText({ name: 'terms' }),
                            shipDate: result.getValue({ name: 'shipdate' }),
                            location: result.getText({ name: 'location' }),
                            department: result.getText({ name: 'department' }),
                            class: result.getText({ name: 'class' }),
                            total: result.getValue({ name: 'total' })
                        });
                        return true;
                    });

                    return { success: true, data: salesOrders };
                }

                const idsToApprove = salesOrderIds || [salesOrderId];
                const results = [];
                let successCount = 0;
                let failCount = 0;

                idsToApprove.forEach(function (id) {
                    try {
                        record.submitFields({
                            type: record.Type.SALES_ORDER,
                            id: id,
                            values: {
                                orderstatus: 'B'
                            },
                            options: {
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            }
                        });

                        successCount++;
                        results.push({
                            id: id,
                            success: true,
                            message: 'Approved'
                        });

                    } catch (e) {
                        log.error(`Error approving Sales Order ${id}`, e);
                        failCount++;
                        results.push({
                            id: id,
                            success: false,
                            message: e.message
                        });
                    }
                });

                return {
                    success: successCount > 0,
                    message: `Approved ${successCount} order(s). Failed: ${failCount}`,
                    results: results
                };
            } catch (e) {
                log.error('Error @ approveSo', e);
                return {
                    success: false,
                    message: 'Failed to process approval: ' + e.message
                };
            }
        }


        function getKanbanEstimateDetails(estimateId) {
            try {
                if (!estimateId) {
                    return { success: false, message: "No Estimate ID provided." };
                }

                const estimateRecord = record.load({
                    type: record.Type.ESTIMATE,
                    id: estimateId,
                    isDynamic: false
                });

                // ------------------------
                // HEADER
                // ------------------------
                const header = {
                    tranid: estimateRecord.getValue("tranid"),
                    trandate: estimateRecord.getText("trandate"),
                    entity: estimateRecord.getText("entity"),
                    statusRef: estimateRecord.getValue("statusRef"),
                    status: estimateRecord.getText("entitystatus"),
                    job: estimateRecord.getText("job"),
                    probability: estimateRecord.getValue("probability"),
                    title: estimateRecord.getValue("title"),
                    expectedCloseDate: estimateRecord.getText("expectedclosedate"),
                    expirationDate: estimateRecord.getText("duedate"),
                    memo: estimateRecord.getValue("memo"),

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
                };

                // ------------------------
                // LINE ITEMS
                // ------------------------
                const items = [];
                const itemCount = estimateRecord.getLineCount("item");

                for (let i = 0; i < itemCount; i++) {
                    items.push({
                        lineKey: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "lineuniquekey", line: i }),
                        itemId: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "item", line: i }),
                        item: estimateRecord.getSublistText({ sublistId: "item", fieldId: "item", line: i }),
                        quantity: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "quantity", line: i }),
                        units: estimateRecord.getSublistText({ sublistId: "item", fieldId: "units", line: i }),
                        description: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "description", line: i }),
                        priceLevel: estimateRecord.getSublistText({ sublistId: "item", fieldId: "price", line: i }),
                        rate: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "rate", line: i }),
                        amount: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "amount", line: i }),

                        classId: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "class", line: i }),
                        class: estimateRecord.getSublistText({ sublistId: "item", fieldId: "class", line: i }),
                        departmentId: estimateRecord.getSublistValue({ sublistId: "item", fieldId: "department", line: i }),
                        department: estimateRecord.getSublistText({ sublistId: "item", fieldId: "department", line: i })
                    });
                }

                // ------------------------
                // SALES TEAM
                // ------------------------
                const salesTeam = [];
                const salesCount = estimateRecord.getLineCount("salesteam");

                for (let i = 0; i < salesCount; i++) {
                    salesTeam.push({
                        employee: estimateRecord.getSublistText({ sublistId: "salesteam", fieldId: "employee", line: i }),
                        employeeId: estimateRecord.getSublistValue({ sublistId: "salesteam", fieldId: "employee", line: i }),
                        salesRole: estimateRecord.getSublistText({ sublistId: "salesteam", fieldId: "salesrole", line: i }),
                        primary: estimateRecord.getSublistValue({ sublistId: "salesteam", fieldId: "isprimary", line: i }) ? "Yes" : "No",
                        contribution: estimateRecord.getSublistValue({ sublistId: "salesteam", fieldId: "contribution", line: i }) || 0
                    });
                }

                // ------------------------
                // SALES REP LIST
                // ------------------------
                const repListResult = model.salesRepList();
                const repList = repListResult.reps || [];

                // ------------------------
                // CLASS & DEPARTMENT LIST (with subsidiary filter)
                // ------------------------
                header.classList = model.classList(estimateId);
                header.departmentList = model.departmentList(estimateId);

                log.debug("Estimate Details", { header, items, salesTeam, repList });

                return {
                    success: true,
                    data: {
                        header,
                        items,
                        salesTeam,
                        repList
                    }
                };

            } catch (e) {
                log.error("Error @ getKanbanEstimateDetails", e);
                return { success: false, message: "Failed to load estimate details." };
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
                    trandate: opportunityRecord.getText('trandate'),
                    entity: opportunityRecord.getText('entity'),
                    status: opportunityRecord.getText('entitystatus'),
                    job: opportunityRecord.getText('job'),
                    probability: opportunityRecord.getValue('probability'),
                    title: opportunityRecord.getValue('title'),
                    expectedCloseDate: opportunityRecord.getText('expectedclosedate'),
                    actualCloseDate: opportunityRecord.getText('actualclosedate'),
                    winLossReason: opportunityRecord.getText('custbody_win_loss_reason'),
                    details: opportunityRecord.getValue('custbody_details'),
                    projectedTotal: opportunityRecord.getValue('projectedtotal'),
                    rangelow: opportunityRecord.getValue('rangelow'),
                    rangehigh: opportunityRecord.getValue('rangehigh'),
                    forecastType: opportunityRecord.getText('forecasttype'),
                    weightedTotal: opportunityRecord.getValue('weightedtotal'),
                    department: opportunityRecord.getText('department'),
                    projectType: opportunityRecord.getText('custbody_project_type'),
                    priority: opportunityRecord.getText('custbody_priority'),
                    location: opportunityRecord.getText('location'),
                    salesRep: opportunityRecord.getText('salesrep'),
                    partner: opportunityRecord.getText('partner'),
                    leadSource: opportunityRecord.getText('leadsource'),
                    solutionEngineer: opportunityRecord.getText('custbody_jj_opp_creation_se')
                };

                // ---- LINE ITEMS ----
                const itemCount = opportunityRecord.getLineCount("item");
                const items = [];

                for (let i = 0; i < itemCount; i++) {
                    items.push({
                        item: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "item", line: i }),
                        quantity: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "quantity", line: i }),
                        units: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "units", line: i }),
                        description: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "description", line: i }),
                        priceLevel: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "price", line: i }),
                        rate: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "rate", line: i }),
                        amount: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "amount", line: i }),
                        options: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "options", line: i }),
                        expectedShipDate: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "expectedshipdate", line: i }),
                        projectItem: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "custcol_project_item", line: i }),
                        billableEstimate: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "custcol_billable_estimate", line: i }),
                        costEstimateType: opportunityRecord.getSublistText({ sublistId: "item", fieldId: "costestimatetype", line: i }),
                        estExtendedCost: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "costestimate", line: i }),
                        estGrossProfit: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "grossamt", line: i }),
                        estGrossProfitPercent: opportunityRecord.getSublistValue({ sublistId: "item", fieldId: "grosspct", line: i })
                    });
                }

                // ---- RELATIONSHIPS ----
                const relationshipCount = opportunityRecord.getLineCount("contactroles");
                const relationships = [];

                for (let i = 0; i < relationshipCount; i++) {
                    relationships.push({
                        contact: opportunityRecord.getSublistText({ sublistId: "contactroles", fieldId: "contact", line: i }),
                        role: opportunityRecord.getSublistText({ sublistId: "contactroles", fieldId: "role", line: i }),
                        email: opportunityRecord.getSublistValue({ sublistId: "contactroles", fieldId: "email", line: i }),
                        phone: opportunityRecord.getSublistValue({ sublistId: "contactroles", fieldId: "phone", line: i })
                    });
                }

                // ---- COMMUNICATION ----
                const messageCount = opportunityRecord.getLineCount("messages");
                const communications = [];

                for (let i = 0; i < messageCount; i++) {
                    communications.push({
                        subject: opportunityRecord.getSublistValue({ sublistId: "messages", fieldId: "subject", line: i }),
                        author: opportunityRecord.getSublistText({ sublistId: "messages", fieldId: "author", line: i }),
                        date: opportunityRecord.getSublistText({ sublistId: "messages", fieldId: "messageDate", line: i }),
                        message: opportunityRecord.getSublistValue({ sublistId: "messages", fieldId: "message", line: i })
                    });
                }

                // ---- SALES TEAM ----
                const salesTeamCount = opportunityRecord.getLineCount("salesteam");
                const salesTeam = [];

                for (let i = 0; i < salesTeamCount; i++) {
                    salesTeam.push({
                        salesRep: opportunityRecord.getSublistText({ sublistId: "salesteam", fieldId: "employee", line: i }),
                        contributionPercent: opportunityRecord.getSublistValue({ sublistId: "salesteam", fieldId: "contribution", line: i }),
                        role: opportunityRecord.getSublistText({ sublistId: "salesteam", fieldId: "role", line: i }),
                        isPrimary: opportunityRecord.getSublistValue({ sublistId: "salesteam", fieldId: "isprimary", line: i })
                    });
                }


                log.debug("Opportunity Details", { header, items });

                return {
                    success: true,
                    data: {
                        header,
                        items,
                        relationships,
                        communications,
                        salesTeam
                    }
                };

            } catch (e) {
                log.error("Error @ getKanbanOpportunityDetails", e);
                return { success: false, message: "Failed to load opportunity details." };
            }
        }

        function getKanbanSalesOrderDetails(salesOrderId) {
            try {
                if (!salesOrderId) {
                    return { success: false, message: "No sales order ID provided." };
                }

                const salesOrderRecord = record.load({
                    type: record.Type.SALES_ORDER,
                    id: salesOrderId,
                    isDynamic: false
                });

                const data = {
                    tranid: salesOrderRecord.getValue('tranid'),                    // Quote #
                    trandate: salesOrderRecord.getText('trandate'),                // Date
                    entity: salesOrderRecord.getText('entity'),                    // Customer
                    enddate: salesOrderRecord.getText('enddate'),
                    memo: salesOrderRecord.getValue('memo'),                       // Memo
                    status: salesOrderRecord.getText('status'),
                    po: salesOrderRecord.getValue('otherrefnum'),
                    job: salesOrderRecord.getText('job'),
                    startdate: salesOrderRecord.getText('startdate'),
                    total: salesOrderRecord.getText('total'),

                    salesrep: salesOrderRecord.getText('salesrep'),
                    saleseffectivedate: salesOrderRecord.getText('saleseffectivedate'),
                    leadsource: salesOrderRecord.getText('leadsource'),

                    subsidiary: salesOrderRecord.getText('subsidiary'),
                    class: salesOrderRecord.getText('class'),
                    location: salesOrderRecord.getText('location'),
                    department: salesOrderRecord.getText('department'),

                    items: [],
                    salesteam: [],

                };
                const itemLineCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
                for (let i = 0; i < itemLineCount; i++) {
                    const lineData = {
                        item: salesOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }),
                        quantitycommitted: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantitycommitted', line: i }),
                        location: salesOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'location', line: i }),
                        requestedquantity: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantityrequestedtofulfill', line: i }),
                        quantitypicked: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantitypicked', line: i }),
                        quantitypacked: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantitypacked', line: i }),
                        quantityfulfilled: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantityfulfilled', line: i }),
                        quantitybilled: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantitybilled', line: i }),
                        quantitybackordered: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantitybackordered', line: i }),
                        quantity: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                        units: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'units', line: i }),
                        pricelevel: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'price', line: i }),
                        rate: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }),
                        amount: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i }),

                    };

                    data.items.push(lineData);
                }
                const salesTeamLineCount = salesOrderRecord.getLineCount({ sublistId: 'salesteam' });
                for (let i = 0; i < salesTeamLineCount; i++) {
                    const lineData = {
                        employee: salesOrderRecord.getSublistText({ sublistId: 'salesteam', fieldId: 'employee',line: i }),
                        salesrole: salesOrderRecord.getSublistText({ sublistId: 'salesteam', fieldId: 'salesrole', line: i }),
                        primary: salesOrderRecord.getSublistText({ sublistId: 'salesteam', fieldId: 'isprimary', line: i }),
                        contribution: salesOrderRecord.getSublistValue({ sublistId: 'salesteam', fieldId: 'contribution', line: i })
                    }
                    data.salesteam.push(lineData);
                }
                log.debug("sales team sublist", data.salesteam);


                log.debug("item sublist", data.items);

                log.debug("Sales order details", data);

                return {
                    success: true,
                    data: data
                };

            }
            catch (e) {
                log.error("Error @ getKanbanSalesOrderDetails", e);
                return { success: false, message: "Failed to load sales order details." };
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
                const items = getActiveItems(search);
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
                    items,
                    employees,
                    salesRoles
                };
            } catch (e) {
                log.error('Error building dropdown JSON', e);
                return { success: false, error: e.message };
            }
        }

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

        function setRequiredOpportunityFields(opportunityRecord, request) {
            try {
                const company = request.parameters.company ? String(request.parameters.company).trim() : '';
                const status = request.parameters.status ? String(request.parameters.status).trim() : '';
                const probability = request.parameters.probability ? String(request.parameters.probability).trim() : '';
                const projectedTotal = request.parameters.projectedTotal ? String(request.parameters.projectedTotal).trim() : '';
                const subsidiary = request.parameters.subsidiary ? String(request.parameters.subsidiary).trim() : '';
                const expectedCloseParam = request.parameters.expectedClose ? String(request.parameters.expectedClose).trim() : '';
                if (!company) throw new Error('Company is required');
                if (!status) throw new Error('Status is required');
                if (!probability) throw new Error('Probability is required');
                if (!projectedTotal) throw new Error('Projected Total is required');
                if (!subsidiary) throw new Error('Subsidiary is required');
                if (!expectedCloseParam) throw new Error('Expected Close Date is required');
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
                    opportunityRecord.selectNewLine({ sublistId: 'item' });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: itemId });
                    opportunityRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'class',value:classVal || ''});
                    opportunityRecord.setCurrentSublistValue({sublistId: 'item',fieldId: 'department',value:departmentVal || ''});
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: qtyVal });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: rateVal });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: amtVal });
                    opportunityRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: descVal });
                    try {
                        opportunityRecord.commitLine({ sublistId: 'item' });
                    } catch (commitErr) {
                        log.error("Error committing line " + itemId + ", continuing with next line", commitErr);
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

        function setOptionalOpportunityFields(opportunityRecord, request) {
            try {
                if (request.parameters.title) {
                    opportunityRecord.setValue({ fieldId: 'title', value: request.parameters.title });
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
                    try {
                        oppRecord.selectNewLine({ sublistId: 'item' });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: parseInt(itemId, 10) });
                        oppRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'class', value:classVal || ''});
                        oppRecord.setCurrentSublistValue({sublistId: 'item',fieldId: 'department',value:departmentVal || ''});
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: qtyVal });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: rateVal });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: amtVal });
                        oppRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: descVal });
                        oppRecord.commitLine({ sublistId: 'item' });
                        log.debug('Re-added item line (update)', { item: itemId, qty: qtyVal, rate: rateVal, amount: amtVal });
                    } catch (addErr) {
                        log.error('Error adding item line during update', addErr);
                    }
                });
                let salesTeamCount = oppRecord.getLineCount({ sublistId: 'salesteam' });
                log.debug('Existing sales team line count before update', salesTeamCount);
                ensureCompanyOnRecord(oppRecord, request, originalCompany);
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

        function setOptionalOpportunityFields(opportunityRecord, request) {
            try {
                if (request.parameters.title) {
                    opportunityRecord.setValue({ fieldId: 'title', value: request.parameters.title });
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
                const totalContribution = salesTeam.reduce((sum, m) => sum + (parseFloat(m.contribution) || 0), 0);
                if (Math.abs(totalContribution - 100) > 0.01) {
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

        function getOpportunityStatuses() {
            return opportunityStatuses;
        }

        function getOpportunityForms() {
            return opportunityForms;
        }

        function getActiveItems(search) {
            const items = [];
            try {
                const itemTypes = [
                    { type: search.Type.INVENTORY_ITEM, label: 'Inventory' },
                    { type: search.Type.SERVICE_ITEM, label: 'Service' },
                    { type: search.Type.NON_INVENTORY_ITEM, label: 'Non-Inventory' },
                    { type: search.Type.ASSEMBLY_ITEM, label: 'Assembly' }
                ];
                itemTypes.forEach(function (itemType) {
                    try {
                        const searchObj = search.create({
                            type: itemType.type,
                            filters: [
                                ['subsidiary', 'anyof', subsidiaryId],
                                'AND',
                                ['isinactive', 'is', 'F']
                            ],
                            columns: ['internalid', 'itemid', 'baseprice'] // fetch ID, Name, Rate
                        });
                        searchObj.run().each(function (result) {
                            items.push({
                                id: result.getValue('internalid'),
                                name: result.getValue('itemid'),
                                rate: parseFloat(result.getValue('baseprice')) || 0,
                                type: itemType.label
                            });
                            return true;
                        });
                    } catch (innerErr) {
                        log.error('Error searching ' + itemType.label, innerErr);
                    }
                });
            } catch (e) {
                log.error('Error in getActiveItems', e);
            }
            return items;
        }


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

        function getForecastTypes() {
            return forecastTypes;
        }

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

        function getItemsBySubsidiary(search, subsidiaryId) {
            const items = [];
            try {
                const itemTypes = [
                    { type: search.Type.INVENTORY_ITEM, label: 'Inventory' },
                    { type: search.Type.SERVICE_ITEM, label: 'Service' },
                    { type: search.Type.NON_INVENTORY_ITEM, label: 'Non-Inventory' },
                    { type: search.Type.ASSEMBLY_ITEM, label: 'Assembly' }
                ];
                itemTypes.forEach(itemType => {
                    const searchObj = search.create({
                        type: itemType.type,
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
                            type: itemType.label
                        });
                        return true;
                    });
                });
            } catch (e) {
                log.error('Error in getItemsBySubsidiary', e);
            }
            return items;
        }


        function getActiveSalesTypes() {
            return salesTypes;
        }

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
            try {
                if (request.method === 'GET') {
                    const params = request.parameters;
                    try {
                        const params = request.parameters;
                        log.debug("params userid", params.userId)


                        const fileId = getPageFilePath(params.action);
                        try {
                            const pageContents = file.load({ id: fileId }).getContents();
                            response.write(pageContents || "OOPS.... SOMETHING WENT WRONG!");
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
                    let action = request.parameters.action || null;
                    let req = null;

                    if (action === 'upload') {
                        req = request.files;
                    }
                    else if (action === 'updateLead') {
                        req = request.parameters;
                    }
                    else if (request.body.action === 'kanbanBoard') {
                        let reqBody = JSON.parse(request.body);
                        res = fetchKanbanData(reqBody.startDate, reqBody.endDate);

                    }
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

                    if (!action && req && req.action) {
                        action = req.action;
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
                            res = fetchKanbanData(req.startDate, req.endDate);
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
                            const resData = getKanbanEstimateDetails(req.estimateId);
                            resData.data.header.jobDetails = model.jobDetails(req.estimateId);
                            resData.data.header.partnerDetails = model.partnerDetails(req.estimateId);
                            resData.data.header.classDetails = model.classDetails(req.estimateId);
                            resData.data.header.departmentDetails = model.departmentDetails(req.estimateId);
                            resData.data.header.locationDetails = model.locationDetails(req.estimateId);
                            resData.data.header.itemList = model.itemList(req.estimateId);
                            resData.data.header.salesRepList = model.salesRepList();
                            resData.data.header.classList = model.classList(req.estimateId);
                            resData.data.header.departmentList = model.departmentList(req.estimateId);

                            res = resData;
                            break;



                        case 'getKanbanOpportunityDetails':
                            res = getKanbanOpportunityDetails(req.opportunityId);
                            break;
                        case 'getKanbanSalesOrderDetails':
                            res = getKanbanSalesOrderDetails(req.salesOrderId);
                            break;

                        case 'checkSalesManager':
                            const userEmail = req.userId || request.parameters.userId;
                            const managerStatus = checkIfSalesManager(userEmail);
                            res = { success: true, isSalesManager: managerStatus };
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
                            const statuses = getQuoteStatuses(record); // your helper function
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

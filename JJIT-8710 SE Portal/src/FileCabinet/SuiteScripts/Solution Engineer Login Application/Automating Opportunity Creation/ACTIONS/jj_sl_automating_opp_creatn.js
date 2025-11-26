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
define(['N/file', 'crypto', 'N/crypto', 'N/record', '../MODEL/jj_cm_model.js', 'N/email', 'N/search'],
    (file, crypto, nscrypto, record, model, mail, search) => {
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
                case 'history':
                    return '../VIEW/jj_home_page.html';
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
                case 'createepic':
                    return '../VIEW/jj_create_epic_view.html';
                default:
                    return '../VIEW/jj_home_page.html';
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
        function getReportData(request ) {
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

        function createEpicRecord(req) {
            try {
                const data = {
                    projectName: req.projectName,
                    customerId: req.customerId,
                    startDate: req.startDate,
                    endDate: req.endDate,
                    status: req.status,
                    priority: req.priority,
                    issue: req.issue,
                    assigneeId: req.assigneeId,
                    reporterId: req.reporterId
                };

                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);

                if (endDate < startDate) {
                    return {
                        success: false,
                        message: "Error: End date cannot be before start date."
                    };
                }

                const format = (d) =>
                    `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;

                const formattedStart = format(startDate);
                const formattedEnd = format(endDate);

                const job = record.create({
                    type: record.Type.JOB,
                    isDynamic: false
                });

                job.setValue({ fieldId: "companyname", value: data.projectName });
                job.setValue({ fieldId: "parent", value: data.customerId });
                job.setValue({
                    fieldId: "custentity_jj_jira_start_date",
                    value: new Date(formattedStart),
                });
                job.setValue({
                    fieldId: "custentity_jj_jira_due_date",
                    value: new Date(formattedEnd),
                });
                job.setValue({
                    fieldId: "custentity_jj_jira_status",
                    value: data.status || 1,
                });
                job.setValue({
                    fieldId: "custentity_jj_jira_priority",
                    value: data.priority,
                });
                job.setValue({
                    fieldId: "custentity_jj_jira_issue_type",
                    value: data.issue,
                });
                job.setValue({
                    fieldId: "custentity_jj_jira_epic_assignee",
                    value: data.assigneeId,
                });
                job.setValue({
                    fieldId: "custentity_jj_jira_epic_reporter",
                    value: data.reporterId,
                });

                job.setValue({ fieldId: "subsidiary", value: 1 });
                job.setValue({ fieldId: "projectexpensetype", value: 1 });

                const id = job.save();

                return {
                    success: true,
                    jobId: id,
                    message: "Epic created successfully",
                };
            } 
            catch (e) {
                log.error("Error in createEpicRecord", e);

                return {
                    success: false,
                    message: "Unexpected error occurred.",
                    error: e.message,
                };
            }
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            log.debug("onRequest", scriptContext);
            const { request, response } = scriptContext;
            try {
                if (request.method === 'GET') {
                    try {
                        const params = request.parameters;
                        const fileId = getPageFilePath(params.action);
                        const pageContents = file.load({ id: fileId }).getContents();
                        response.write(pageContents || "OOPS.... SOMETHING WENT WRONG!");
                    } catch (error) {
                        log.error("Error @onRequest", error);
                        response.write("OOPS.... SOMETHING WENT WRONG!");
                    }

                } 
                else if (request.method === 'POST') {
                    log.debug("request", request.parameters)
                    const { action } = request.parameters;
                    log.debug("action", action)
                    let req;
                    if (action === 'upload') {
                        req = request.files
                    } else if (action === 'updateLead') {
                        req = request.parameters;
                    } else {
                        req = JSON.parse(request.body)
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
                        case 'createEpic':
                            res = createEpicRecord(req)
                            break;
                        default:
                            res = { success: false, message: 'Invalid action' };
                            break;
                    }
                    log.debug("response", res)
                    response.write(JSON.stringify(res));
                }
            } catch (error) {
                log.error("Error @onRequest", error);
                response.write(JSON.stringify({ success: false, message: 'OOPS.... SOMETHING WENT WRONG!' }));
            }
        };

        return { onRequest };
    });

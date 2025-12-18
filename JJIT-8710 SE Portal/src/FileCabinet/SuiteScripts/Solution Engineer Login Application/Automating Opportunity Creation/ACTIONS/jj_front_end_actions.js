const BASE_URL = 'https://td3047046.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=95&deploy=1&compid=TD3047046&ns-at=AAEJ7tMQZfEmAHZ5pKgDlB14gl1ebwQScEBzoIyXL1pSYbQfpTM';

/**
 * Change user password.
 */
function changePassword() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!isValidEmail(email)) {
        showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
        return;
    }
    if (!isValidPassword(newPassword)) {
        showAlert('error', '', 'Password must be 8-15 characters long, and include an uppercase letter, a lowercase letter, a number, and a special character.');
        return;
    }
    if (newPassword !== confirmPassword) {
        showAlert('error', 'Oops...', 'Passwords do not match!');
        return;
    }

    const requestBody = createPasswordUpdateRequestBody(newPassword, email, otp);

    Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we update your password',
        allowOutsideClick: false,
        heightAuto: false,
        didOpen: () => {
            Swal.showLoading();
            sendPasswordUpdateRequest(requestBody);
        }
    });
}

/**
 * Send password reset email.
 */
function sendResetEmail() {
    const emailInput = document.querySelector('.email-input');
    const email = emailInput.value;

    if (!isValidEmail(email)) {
        showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
        return;
    }

    const requestBody = { email: email };

    Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we send you a reset password link',
        allowOutsideClick: false,
        heightAuto: false,
        didOpen: () => {
            Swal.showLoading();
            sendEmailRequest(requestBody);
        }
    });
}

/**
 * Send request to reset email.
 * @param {Object} requestBody - The request body.
 */
function sendEmailRequest(requestBody) {
    fetch(`${BASE_URL}&action=forgot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => handleEmailRequestResponse(data))
        .catch(error => handleError('Error sending email', error));
}

/**
 * Validate email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if email is valid, false otherwise.
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password format.
 * @param {string} password - The password to validate.
 * @returns {boolean} True if password is valid, false otherwise.
 */
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,15}$/;
    return passwordRegex.test(password);
}

/**
 * Show alert message.
 * @param {string} icon - The icon type for the alert.
 * @param {string} title - The title of the alert.
 * @param {string} text - The text of the alert.
 * @param {Function} [onClose] - Optional callback to execute when the alert is closed.
 */
function showAlert(icon, title, text, onClose) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        heightAuto: false,
        didClose: onClose || null
    });
}

/**
 * Create the request body for password update.
 * @param {string} newPassword - The new password.
 * @param {string} email - The user's email.
 * @param {string} otp - The OTP.
 * @returns {Object} The request body object.
 */
function createPasswordUpdateRequestBody(newPassword, email, otp) {
    const timestamp = Date.now().toString();
    const keyString = CryptoJS.SHA256(timestamp).toString(CryptoJS.enc.Hex).substring(0, 32);
    const key = CryptoJS.enc.Utf8.parse(keyString);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encryptedPassword = CryptoJS.AES.encrypt(newPassword, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    }).toString();

    return {
        email: email,
        otp: otp,
        newPassword: encryptedPassword,
        iv: iv.toString(),
        timeStamp: timestamp
    };
}

/**
 * Send password update request.
 * @param {Object} requestBody - The request body.
 */
function sendPasswordUpdateRequest(requestBody) {
    fetch(`${BASE_URL}&action=reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => handlePasswordUpdateResponse(data))
        .catch(error => handleError('Error updating password', error));
}

/**
 * Handle the response of email request.
 * @param {Object} data - The response data.
 */
function handleEmailRequestResponse(data) {
    Swal.close();
    if (data.success) {
        showAlert('success', 'Email Sent', 'A reset password link has been sent to your email.');
        window.location.reload();
    } else {
        showAlert('error', 'Failed', `Failed to send email: ${data.message}`);
    }
}

/**
 * Handle the response of password update request.
 * @param {Object} data - The response data.
 */
function handlePasswordUpdateResponse(data) {
    Swal.close();
    if (data.success) {
        showAlert('success', 'Success!', 'Password has been successfully updated. Click OK to login.', () => {
            window.location.href = `${BASE_URL}&action=login`;
        });
    } else {
        showAlert('error', 'Failed', `Failed to update password: ${data.message}`);
    }
}

/**
 * Handle any errors that occur during fetch requests.
 * @param {string} message - The error message to display.
 * @param {Error} error - The error object.
 */
function handleError(message, error) {
    console.error('Error:', error);
    showAlert('error', 'Error', message);
}

/**
 * User login function.
 */
function login() {
    console.log("Login function triggered");
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email,password);

    if (!isValidEmail(email)) {
        showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
        return;
    }

    const requestBody = createPasswordUpdateRequestBody(password, email, '');

    Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we login into your account',
        allowOutsideClick: false,
        heightAuto: false,
        didOpen: () => {
            Swal.showLoading();
            sendLoginRequest(requestBody, email);
        }
    });
}

/**
 * Send login request.
 * @param {Object} requestBody - The request body.
 */
function sendLoginRequest(requestBody, email) {
    //const expireTime = new Date(Date.now() + 10 * 60 * 1000).toUTCString();
    const expireTime = new Date(Date.now() + 10 * 60 * 1000).toUTCString();


    fetch(`${BASE_URL}&action=login`, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => handleLoginResponse(data, expireTime, email))
        .catch(error => handleError('Error logging in', error));
}

/**
 * Handle the response of login request.
 * @param {Object} data - The response data.
 * @param {string} expireTime - The expiration time for the cookies.
 */
function handleLoginResponse(data, expireTime, email) {
    Swal.close();
    if (data.success) {
        document.cookie = `sessionToken=${data.token}; expires=${expireTime}; path=/; secure`;
        document.cookie = `recordId=${data.recordId}; expires=${expireTime}; path=/; secure`;
        window.location.href = `${BASE_URL}&action=home&userId=${encodeURIComponent(email)}`;
    } else {
        showAlert('error', 'Failed', `Failed to login into your account: ${data.message}`);
    }
}
/**
 * Extracts the value of a specified query parameter from a URL.
 * @param {string} url - The URL containing the query parameters.
 * @param {string} paramName - The name of the query parameter to retrieve.
 * @returns {string|null} - The value of the specified query parameter, or null if not found.
 */
function getQueryParam(url, paramName) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(paramName);
}
/**
 * Create a new order.
 */
function createOrder() {
    const customer = document.getElementById('customer').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const fileInput = document.getElementById('file');
    const url = window.location.href;
    const userId = getQueryParam(url, 'userId');
    const recordId = getCookie('recordId');
    const file = fileInput.files[0];
    const allowedExtensions = ['csv', 'xls', 'xlsx'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validateOrderInput(customer, title, description, file, allowedExtensions, maxSize)) {
        return;
    }

    const formData = createOrderFormData(customer, title, description, file, userId, recordId);

    const reader = new FileReader();
    reader.onload = function (e) {
        processFile(e.target.result, formData);
    };
    reader.readAsArrayBuffer(file);
}
/**
 * Insert lead data.    
 */
function insertLeadData() {
    try {
        const leadId = document.getElementById('customer').value;
        console.log("leadId", leadId)
        const coreProcesses = document.getElementById('coreProcesses').value;
        const processPainPoints = document.getElementById('processPainPoints').value;
        const departmentNeeds = document.getElementById('departmentNeeds').value;
        const customizationRequests = document.getElementById('customizationRequests').value;
        const dataMigration = document.getElementById('dataMigration').value;
        const integrationNeeds = document.getElementById('integrationNeeds').value;
        const userRoles = document.getElementById('userRoles').value;
        const reportingRequirements = document.getElementById('reportingRequirements').value;
        const workflowRequirements = document.getElementById('workflowRequirements').value;
        const complianceRequirements = document.getElementById('complianceRequirements').value;
        const futureNeeds = document.getElementById('futureNeeds').value;
        const url = window.location.href;
        const userId = getQueryParam(url, 'userId');
        const recordId = getCookie('recordId');
        const formData = new FormData();
        formData.append('leadId', leadId);
        formData.append('coreProcesses', coreProcesses);
        formData.append('processPainPoints', processPainPoints);
        formData.append('departmentNeeds', departmentNeeds);
        formData.append('customizationRequests', customizationRequests);
        formData.append('dataMigration', dataMigration);
        formData.append('integrationNeeds', integrationNeeds);
        formData.append('userRoles', userRoles);
        formData.append('reportingRequirements', reportingRequirements);
        formData.append('workflowRequirements', workflowRequirements);
        formData.append('complianceRequirements', complianceRequirements);
        formData.append('futureNeeds', futureNeeds);
        formData.append('userId', userId);
        formData.append('recordId', recordId);
        Swal.fire({
            title: 'Updating Lead Data...',
            text: 'Please wait while we update your lead data.',
            allowOutsideClick: false,
            heightAuto: false,
            didOpen: () => {
                Swal.showLoading();
                fetch(`${BASE_URL}&action=updateLead`, {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.close();
                        if (data.success) {

                            Swal.fire({
                                icon: 'success',
                                title: data.message,
                                text: 'Lead Data submitted successfully.',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                window.location.reload(); // Refresh the page after clicking OK
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Submission failed',
                                text: `Error submitting Lead Data:`,
                                confirmButtonText: 'OK'
                            });
                        }
                    })
                    .catch(error => handleError('Error submitting order', error));
            }
        });
    } catch (error) {
        console.log("error in insertLeadData", error);
        swal.fire("Error", "Something went wrong!", "error");
    }
}
/**
 * Validate the order input fields.
 * @param {string} email - The email address.
 * @param {string} title - The title.
 * @param {string} description - The description.
 * @param {File} file - The file.
 * @param {Array} allowedExtensions - The allowed file extensions.
 * @param {number} maxSize - The maximum file size.
 * @returns {boolean} True if all inputs are valid, false otherwise.
 */
function validateOrderInput(customer, title, description, file, allowedExtensions, maxSize) {
    if (!customer) {
        showAlert('error', 'Customer cannot be empty!', 'Please select a customer.');
        return false;
    }

    // if (!isValidEmail(email)) {
    //     showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
    //     return false;
    // }

    if (!title) {
        showAlert('error', 'Missing Title', 'Please enter the title.');
        return false;
    }

    if (!description) {
        showAlert('error', 'Missing Description', 'Please enter the description.');
        return false;
    }

    if (!file) {
        showAlert('error', 'No file uploaded', 'Please upload a file.');
        return false;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        showAlert('error', 'Invalid file type', 'Only CSV files are allowed.');
        return false;
    }

    if (file.size > maxSize) {
        showAlert('error', 'File too large', 'The file size exceeds the 100MB limit.');
        return false;
    }

    return true;
}






/**
 * Create FormData for order submission.
 * @param {string} email - The email address.
 * @param {string} title - The title.
 * @param {string} description - The description.
 * @param {File} file - The file.
 * @returns {FormData} The FormData object.
 */
function createOrderFormData(customer, title, description, file, userId, recordId) {
    const formData = new FormData();
    formData.append('customer', customer);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('recordId', recordId);
    return formData;
}
/**
 * Process the uploaded file and convert it to JSON.
 * @param {ArrayBuffer} fileData - The file data as an ArrayBuffer.
 * @param {FormData} formData - The FormData object.
 */
function processFile(fileData, formData) {
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    let jsonData = [];

    if (fileExtension === 'csv') {
        const text = new TextDecoder().decode(fileData);
        const lines = text.split(/\r\n|\n/);
        const headers = lines[0].split(',');

        jsonData = lines.slice(1).map(line => {
            const values = line.split(',');
            const jsonObject = {};
            headers.forEach((header, index) => {
                jsonObject[header.trim()] = values[index] ? values[index].trim() : null;
            });
            return jsonObject;
        });
    }
    else if (['xls', 'xlsx'].includes(fileExtension)) {
        const workbook = XLSX.read(fileData, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
    }
    else {
        console.error('Unsupported file type:', fileExtension);
        return;
    }

    // Append JSON data to FormData and submit the order

    formData.append('fileData', JSON.stringify(jsonData));
    submitOrder(formData, jsonData);
}


/**
 * Process PDF file and extract order total.
 * @param {ArrayBuffer} pdfBuffer - The PDF file buffer.
 * @param {FormData} formData - The FormData object.
 */
function processPDF(pdfBuffer, formData) {
    const pdfData = new Uint8Array(pdfBuffer);
    pdfjsLib.getDocument({ data: pdfData }).promise.then(async (pdf) => {
        let textContent = '';
        const numPages = pdf.numPages;
        let totalAmount = '';

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContentPage = await page.getTextContent();
            textContent += combineTextItems(textContentPage.items) + ' ';
        }
        console.log("textContent", textContent)
        totalAmount = extractTotalAmount(textContent);
        console.log("totalAmount", totalAmount)
        if (totalAmount) {
            let amount = parseInt(totalAmount.replace(/,/g, ''));
            formData.append('orderTotal', amount);

        }
        submitOrder(formData);
    }).catch(error => handleError('Error reading PDF', error));
}

/**
 * Extract the total amount from text content.
 * @param {string} textContent - The text content of the PDF.
 * @returns {string} The extracted total amount.
 */
function extractTotalAmount(textContent) {
    const totalRegex = /order\s*total\s*[:\s]*\$?\s*(\d+[.,]?\d*)/i;
    const totalMatch = textContent.match(totalRegex);
    return totalMatch ? totalMatch[1] : '';
}

/**
 * Submit the order.
 * @param {FormData} formData - The FormData object.
 */
function submitOrder(formData) {
    Swal.fire({
        title: 'Submitting Order...',
        text: 'Please wait while we submit your order.',
        allowOutsideClick: false,
        heightAuto: false,
        didOpen: () => {
            Swal.showLoading();
            fetch(`${BASE_URL}&action=upload`, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => handleOrderSubmissionResponse(data))
                .catch(error => handleError('Error submitting order', error));
        }
    });
}

/**
 * Handle the response of order submission.
 * @param {Object} data - The response data.
 */
function handleOrderSubmissionResponse(data) {
    Swal.close();
    if (data.success) {
        console.log("Order data", data);
        Swal.fire({
            icon: 'success',
            title: data.message,
            text: 'Order submitted successfully.',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.reload(); // Refresh the page after clicking OK
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Submission failed',
            text: `Error submitting order:`,
            confirmButtonText: 'OK'
        });
    }
}

/**
 * Combine text items from PDF.
 * @param {Array} items - The text items.
 * @returns {string} The combined text.
 */
function combineTextItems(items) {
    let combinedText = '';
    let currentLine = '';
    let lastY = null;

    items.forEach(item => {
        if (lastY === null || Math.abs(item.transform[5] - lastY) < 10) {
            currentLine += item.str;
        } else {
            combinedText += currentLine + ' ';
            currentLine = item.str;
        }
        lastY = item.transform[5];
    });

    combinedText += currentLine;
    return combinedText;
}
let currentPage = 1;
const rowsPerPage = 10;
let allOrders = [];

function setDefaultDateFilters() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const firstOfMonth = `${yyyy}-${mm}-01`;
    const todayStr = `${yyyy}-${mm}-${dd}`;

    document.getElementById("from-date").value = firstOfMonth;
    document.getElementById("to-date").value = todayStr;
}


function renderTable() {
    let tbody = document.getElementById("order-history-body");
    tbody.innerHTML = "";


    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedOrders = allOrders.slice(start, end);
    console.log("paginatedOrders", paginatedOrders)
    paginatedOrders.forEach(order => {
        let row = `<tr>
                <td id='tranid'><a href="${BASE_URL}&tranId=${order.tranId}&action=editopp">${order.tranId}</a></td>
                <td>${order.date}</td>
                <td>${order.entity}</td>
                <td>${order.status}</td>
                <td>${order.item}</td>
                <td>${order.description}</td>
                <td>${order.hour}</td>
            </tr>`;
        tbody.innerHTML += row;
    });

    document.getElementById("page-number").innerText = `Page ${currentPage}`;
}
function applyFilters(returnData = false) {
    const fromDateInput = document.getElementById("from-date").value;
    const toDateInput = document.getElementById("to-date").value;

    const recordId = getCookie('recordId');

    const formattedFromDate = fromDateInput ? formatDateToDDMMMYYYY(fromDateInput) : null;
    const formattedToDate = toDateInput ? formatDateToDDMMMYYYY(toDateInput) : null;

    fetchOrderHistory(recordId, formattedFromDate, formattedToDate);
}

function populateData(orders) {
    allOrders = orders;
    currentPage = 1;
    renderTable();
}
function nextPage() {
    if (currentPage * rowsPerPage < allOrders.length) {
        currentPage++;
        renderTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}
function formatDateToDDMMMYYYY(dateStr) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const date = new Date(dateStr);
    const day = date.getDate(); // no leading zero
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

function fetchOrderHistory(recordId) {
    console.log("recordId", recordId)
    const fromDate = document.getElementById("from-date").value;
    const toDate = document.getElementById("to-date").value;
    const formattedFromDate = fromDate ? formatDateToDDMMMYYYY(fromDate) : null;
    const formattedToDate = toDate ? formatDateToDDMMMYYYY(toDate) : null;
    let requestBody = {
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        id: recordId
    };
    recordId && fetch(`${BASE_URL}&action=getHistory`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => {
            console.log("data", data)
            populateData(data.data)
        })
        .catch(error => handleError('Error sending email', error));
}
function populateLineItems(lines) {
    console.log("lines inside populateLineItems ", lines)
    // const tbody = document.querySelector("#lineItemsTable tbody");
    // tbody.innerHTML = "";

    lines.forEach((line, index) => {
        createLineItemRow(line, index);
        // const row = document.createElement("tr");U

        // row.innerHTML = `
        //     <td>${line.item}</td>
        //     <td><input type="text" value="${line.itemId}" data-index="${index}" name="item" /></td>
        //     <td><textarea name="description" data-index="${index}">${line.description}</textarea></td>

        //     <td><input type="number" value="${line.hour}" data-index="${index}" name="hour" /></td>
        // `;

        // tbody.appendChild(row);
    });
}
function replaceSpecialCharacters(str) {
    try {
        return str.replace(/[><\-&\[\]\(\)]/g, ' ');
    } catch (error) {
        log.error("Error in replaceSpecialCharacters", error);
        return str;
    }

}
/**
 * 
 */
function saveLineItems() {
    console.log("saveLineItems called")
    const internalId = document.getElementById("internalId").value;
    const rows = document.querySelectorAll(".item-box");
    const updatedLines = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const item = row.querySelector('input[name="itemId"]').value.trim();
        const description = row.querySelector('textarea[name="description"]').value.trim();
        const hour = row.querySelector('input[name="hour"]').value;
        console.log("item", item, "description", description, "hour", hour)
        if (!item || !description || hour === '') {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: `Line ${i + 1} has missing required fields. Please fill all fields before saving.`,
            });
            return; // Stop further execution
        }

        const cleanedDescription = replaceSpecialCharacters(description);
        updatedLines.push({ item, description: cleanedDescription, hour });
    }

    // Proceed to submit data
    fetch(`${BASE_URL}&action=updateOppLines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalId, lines: updatedLines })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire("Success", data.message, "success");
            } else {
                Swal.fire("Error", data.message, "error");
            }
        })
        .catch(err => Swal.fire("Error", err.message, "error"));


}
/**
 * editOpportunity
 * @param {*} recordId 
 * @returns 
 */
function editOpportunity(recordId) {
    const tranId = new URLSearchParams(window.location.search).get("tranId");

    console.log("tranId", tranId)
    if (!tranId) {
        Swal.fire("Error", "Opportunity ID not found", "error");
        return;
    }
    document.getElementById("tranId").value = tranId;
    recordId && fetch(`${BASE_URL}&action=getHistory`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: recordId, tranid: tranId })
    })
        .then(response => response.json())
        .then(data => {
            console.log("data", data)
            lineItems = [...data.data]
            if (lineItems[0]?.internalId) {
                const internalId = document.getElementById("internalId");
                internalId.value = lineItems[0].internalId;
            }
            renderAllLines();

        })
        .catch(error => handleError('Something went wrong!', error));


}
/**
 * Verify user session.
 */
function verifySession() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("urlParams", urlParams)
    const action = urlParams.get('action');
    console.log("action", action)
    if (action === 'upload' || action === 'home' || action === 'history' || action === 'editopp' || action === 'implementation' || action === 'approveso' || action === 'kanbanBoard'|| action === 'opportunityform' || action === 'getKanbanSalesOrderDetails') {
        console.log("Inside verifySession");
        const token = getCookie('sessionToken');
        const recordId = getCookie('recordId');
        let mainContainer;

        mainContainer = document.getElementById('mainContainer');
        console.log("mainContainer", mainContainer)
        const sessionExpired = document.getElementById('sessionExpired');
        const requestBody = { token, recordId };

        fetch(`${BASE_URL}&action=session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (action === 'upload') {
                        mainContainer.style.display = 'flex';
                        fetchCustomers()
                    } else if (action === 'history') {
                        console.log("token", token)
                        setDefaultDateFilters();
                        fetchOrderHistory(recordId)
                    } else if (action === 'editopp') {
                        mainContainer.style.display = 'block';
                        editOpportunity(recordId);

                    } else if (action === 'implementation') {
                        console.log("implementation", recordId)
                        fetchLeads(recordId)
                    }
                    sessionExpired.style.display = 'none';
                } else {
                    mainContainer.style.display = 'none';
                    sessionExpired.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mainContainer.style.display = 'none';
                sessionExpired.style.display = 'block';
            });

    }
}
/**
 * fetchLeads
 * @param {*} recordId 
 */
function fetchLeads(recordId) {
    console.log("fetchLeads", recordId)
    recordId && fetch(`${BASE_URL}&action=getLeads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: recordId })
    })
        .then(response => response.json())
        .then(data => {
            console.log("data", data)
            console.log("data.data", data.data);
            console.log("data.data.length", data.data.data.length);
            data?.data && data?.data?.data?.length > 0 && populateLeads(data.data.data)
        })
        .catch(error => handleError('Error populating Leads', error));
}
/**
 *  Fetch customers from the server.
 */
function fetchCustomers() {
    let recordId = getCookie('recordId');
    console.log("recordId", recordId)
    recordId && fetch(`${BASE_URL}&action=getCustomerDetails`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: recordId })
    })
        .then(response => response.json())
        .then(data => {
            console.log("data", data)
            data?.data && data?.data?.length > 0 && populateCustomerDropdown(data.data)
        })
        .catch(error => handleError('Error sending email', error));

    // const data = [{
    //     id: 1,
    //     name: 'Customer 1'
    // }, {
    //     id: 2,
    //     name: 'Customer 2'
    // }, {
    //     id: 3,
    //     name: 'Customer 3'
    // }]
    // populateCustomerDropdown(data)
}
function populateLeads(leads) {
    try {
        console.log("populateLeads", leads)
        const leadsDropdown = document.getElementById('customer');
        leadsDropdown.innerHTML = '<option value="">Select Lead</option>';
        leads.forEach(lead => {
            const option = document.createElement('option');
            option.value = lead.id;
            option.textContent = lead.name;
            leadsDropdown.appendChild(option);
        });
    } catch (error) {
        console.log("error in populateLeads", error)
    }

}
/**
 * Populate the customer dropdown with the provided data.
 * @param {Array} customers 
 */
function populateCustomerDropdown(customers) {
    const customerDropdown = document.getElementById('customer');
    customerDropdown.innerHTML = '<option value="">Select Customer</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        customerDropdown.appendChild(option);
    });
}
/**
 * Get cookie value by name.
 * @param {string} name - The cookie name.
 * @returns {string} The cookie value.
 */
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}
let lineItems = [];

function createLineItemRow(line = {}, index = null) {
    const container = document.getElementById("lineItemsContainer");


    console.log("lineItemsContainer", container)
    const row = document.createElement("div");
    row.className = "row";
    row.style.padding = "10px";
    row.style.marginBottom = "10px";
    row.dataset.index = index !== null ? index : lineItems.length;

    row.innerHTML = `
    <div class="item-box">
         <div class="item-section">
            <label>Item Id</label>
            <input type="text" name="itemId" value="${line.itemId || ''}" class="u-full-width" />
        </div>
        <div class="item-section">
            <label>Item Description</label>
           <textarea id="comments" name="description" rows="4" cols="50">${line.description || ''}</textarea>
        </div>
       
        <div class="item-section">
            <label>Hours</label>
            <input type="number" name="hour" value="${line.hour || 0}" class="u-full-width" />
        </div>
        <div class="item-section" style="align-self: center;">
            <button class="btn-danger" onclick="removeLine(${index !== null ? index : lineItems.length})">🗑</button>
        </div>
        </div>
    `;

    container.appendChild(row);
}


function addNewLine() {
    const index = lineItems.length;
    const newLine = {
        itemId: "",
        hour: 0,
        description: "",
    };
    lineItems.push(newLine);
    console.log("lineItems add new line", lineItems)
    createLineItemRow(newLine, index);
}

function removeLine(index) {
    lineItems.splice(index, 1);
    renderAllLines(); // re-render with updated indices
}

function renderAllLines() {
    console.log("renderAllLines called", lineItems)
    document.getElementById("lineItemsContainer").innerHTML = "";

    lineItems.forEach((line, i) => createLineItemRow(line, i));
}


window.addEventListener('DOMContentLoaded', verifySession);

// ===== SALES ORDER APPROVAL FUNCTIONS =====

/**
 * Load orders from Suitelet for approval.
 * Fetches pending sales orders and populates the approval table.
 * Displays order count and handles empty state.
 * @async
 * @returns {Promise<void>}
 */
async function loadOrders() {
    try {
        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "approveso",
                userId: getPageUserId() || null
            })
        });

        const response = await res.json();
        console.log("Load Orders Response:", response);

        const tbody = document.getElementById("ordersTableBody");
        const orderCountBadge = document.getElementById("orderCount");
        tbody.innerHTML = "";

        if (!response.success || !response.data || response.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-4 text-center text-gray-500">No pending orders.</td></tr>';
            orderCountBadge.textContent = "0";
            return;
        }

        const orderCount = response.data.length;
        orderCountBadge.textContent = orderCount;

        response.data.forEach(order => {
            const row = document.createElement("tr");
            row.className = "border-t border-[#95a2a0] hover:bg-gradient-to-r hover:from-[#ebfff3] hover:to-[#dff9f5] transition";
            row.innerHTML = `
                <td class="px-4 py-2 text-center">
                    <input type="checkbox" class="order-checkbox checkbox-custom" value="${order.id}" onchange="updateCountsSalesOrder()">
                </td>
                <td class="px-4 py-2 text-sm font-semibold text-[#0a514a]">${order.tranid}</td>
                <td class="px-4 py-2 text-sm">${order.customer}</td>
                <td class="px-4 py-2 text-sm">${order.date || '—'}</td>
                <td class="px-4 py-2 text-sm font-semibold">${order.total || '—'}</td>
                <td class="px-4 py-2 text-sm">
                    <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                        ${order.status}
                    </span>
                </td>
            `;
            row.addEventListener("click", (event) => {
                // if the click was anywhere in the checkbox column
                if (event.target.closest("td:first-child")) {
                    // if clicked directly on checkbox, let it handle itself and just update counts
                    if (event.target.type === "checkbox") {
                        updateCountsSalesOrder();
                        return;
                    }
                    // if clicked elsewhere in the column, toggle the checkbox
                    const checkbox = row.querySelector("input.order-checkbox");
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        updateCountsSalesOrder();
                    }
                    return;
                }
                showOrderDetails(order);
            });

            tbody.appendChild(row);
        });

        // Initialize counts after loading
        updateCountsSalesOrder();
    } catch (err) {
        showMessage("Failed to load orders.", "error");
        console.error("Load Orders Error:", err);
    }
}

/**
 * Show message with styling for approval page (enhanced version).
 * Displays styled messages based on type (success, error, warning, info).
 * @param {string} text - The message text to display
 * @param {string} type - The message type: 'success', 'error', 'warning', or 'info'
 * @returns {void}
 */
function showMessage(text, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = text;
    messageDiv.className = "mb-4 text-sm font-semibold";
    messageDiv.style.cssText = "display: block !important; padding: 12px !important; border-radius: 8px !important; border: 1px solid !important; margin-bottom: 16px !important;";

    if (type === "success") {
        messageDiv.style.cssText += " background-color: #dcfce7 !important; border-color: #86efac !important; color: #166534 !important;";
    } else if (type === "error") {
        messageDiv.style.cssText += " background-color: #fee2e2 !important; border-color: #fca5a5 !important; color: #991b1b !important;";
    } else if (type === "warning") {
        messageDiv.style.cssText += " background-color: #fef3c7 !important; border-color: #fcd34d !important; color: #92400e !important;";
    } else if (type === "info") {
        messageDiv.style.cssText += " background-color: #dbeafe !important; border-color: #7dd3fc !important; color: #1e3a8a !important;";
    }
}

/**
 * Select all checkboxes (only visible ones).
 * Filters for visible rows and checks all their checkboxes.
 * Updates the selection count display.
 * @returns {void}
 */
function selectAll() {
    const visibleCheckboxes = Array.from(document.querySelectorAll("input.order-checkbox")).filter(cb => {
        const row = cb.closest("tr");
        return row && row.style.display !== "none";
    });
    visibleCheckboxes.forEach(cb => cb.checked = true);
    updateCountsSalesOrder();
}

/**
 * Deselect all checkboxes.
 * Unchecks all order checkboxes and updates the selection count.
 * @returns {void}
 */
function deselectAll() {
    document.querySelectorAll("input.order-checkbox").forEach(cb => cb.checked = false);
    updateCountsSalesOrder();
}

/**
 * Toggle select all (only visible ones).
 * Checks or unchecks all visible order checkboxes based on the select-all checkbox state.
 * @returns {void}
 */
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    const visibleCheckboxes = Array.from(document.querySelectorAll("input.order-checkbox")).filter(cb => {
        const row = cb.closest("tr");
        return row && row.style.display !== "none";
    });

    visibleCheckboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
    updateCountsSalesOrder();
}

/**
 * Format date to m/d/yyyy because of NetSuite account date format.
 * Converts ISO date format (yyyy-mm-dd) to NetSuite format (m/d/yyyy).
 * @param {string} dateStr - The date string in yyyy-mm-dd format
 * @returns {string} The formatted date string in m/d/yyyy format, or original string if invalid
 */
function formatInputDate(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${month}/${day}/${year}`; // m/d/yyyy
}

/**
 * Update count displays.
 * Updates the order count badge, selected count badge, and select-all checkbox state.
 * Handles indeterminate state for partial selections.
 * @returns {void}
 */
function updateCountsSalesOrder() {
    const allRows = document.querySelectorAll("#ordersTableBody tr:not(#noResultsRow)");
    const visibleRows = Array.from(allRows).filter(row => row.style.display !== "none");
    const selectedCheckboxes = document.querySelectorAll("input.order-checkbox:checked");
    const visibleSelectedCheckboxes = Array.from(selectedCheckboxes).filter(cb => {
        const row = cb.closest("tr");
        return row && row.style.display !== "none";
    });

    // Update order count (visible orders)
    const orderCountBadge = document.getElementById("orderCount");
    orderCountBadge.textContent = visibleRows.length;

    // Update selected count
    const selectedCountBadge = document.getElementById("selectedCount");
    if (visibleSelectedCheckboxes.length > 0) {
        selectedCountBadge.textContent = `${visibleSelectedCheckboxes.length} Selected`;
        selectedCountBadge.classList.remove("hidden");
    } else {
        selectedCountBadge.classList.add("hidden");
    }

    // Update select all checkbox state
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    if (visibleRows.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (visibleSelectedCheckboxes.length === visibleRows.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (visibleSelectedCheckboxes.length > 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
}

/**
 * Filter orders by customer and date.
 * Filters the orders table based on customer name and date inputs.
 * Shows/hides reset buttons and displays "no results" message when applicable.
 * @returns {void}
 */
function filterOrders() {
    const customerFilter = document.getElementById("customerFilter").value.toLowerCase();
    const rawDateFilter = document.getElementById("dateFilter").value.trim();
    const dateFilter = formatInputDate(rawDateFilter);

    // Show/hide reset buttons
    const resetCustomerBtn = document.getElementById("resetCustomerBtn");
    const resetDateBtn = document.getElementById("resetDateBtn");

    if (customerFilter) {
        resetCustomerBtn.classList.remove("hidden");
    } else {
        resetCustomerBtn.classList.add("hidden");
    }

    if (rawDateFilter) {
        resetDateBtn.classList.remove("hidden");
    } else {
        resetDateBtn.classList.add("hidden");
    }

    const rows = document.querySelectorAll("#ordersTableBody tr:not(#noResultsRow)");
    let visibleCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 4) return;

        const customerCell = cells[2].textContent.toLowerCase();
        const dateCell = cells[3].textContent.trim();

        let matchCustomer = !customerFilter || customerCell.includes(customerFilter);
        let matchDate = !dateFilter || dateCell === dateFilter;

        if (matchCustomer && matchDate) {
            row.style.display = "";
            visibleCount++;
        } else {
            row.style.display = "none";
        }
    });

    // Handle no results message
    const tbody = document.getElementById("ordersTableBody");
    const noResultsRow = document.getElementById("noResultsRow");

    if (visibleCount === 0) {
        if (!noResultsRow) {
            const newNoResultsRow = document.createElement("tr");
            newNoResultsRow.id = "noResultsRow";
            newNoResultsRow.innerHTML = '<td colspan="6" class="px-4 py-4 text-center text-gray-500">No orders match your filters.</td>';
            tbody.appendChild(newNoResultsRow);
        }
    } else {
        if (noResultsRow) noResultsRow.remove();
    }

    // Update counts after filtering
    updateCountsSalesOrder();
}

/**
 * Reset customer filter.
 * Clears the customer filter input and re-applies filters.
 * @returns {void}
 */
function resetCustomerFilter() {
    document.getElementById("customerFilter").value = "";
    document.getElementById("resetCustomerBtn").classList.add("hidden");
    filterOrders();
}

/**
 * Reset date filter.
 * Clears the date filter input and re-applies filters.
 * @returns {void}
 */
function resetDateFilter() {
    document.getElementById("dateFilter").value = "";
    document.getElementById("resetDateBtn").classList.add("hidden");
    filterOrders();
}

let currentOrderId = null;

/**
 * Show order details in modal.
 * Populates and displays the order details modal with comprehensive order information.
 * Prevents opening during bulk approval processing.
 * @param {Object} order - The order object containing all order details
 * @param {string} order.id - The internal order ID
 * @param {string} order.tranid - The transaction ID
 * @param {string} order.customer - The customer name
 * @param {string} order.status - The order status
 * @param {string} order.date - The order date
 * @param {string} order.total - The order total amount
 * @returns {void}
 */
function showOrderDetails(order) {
    // Prevent modal opening during bulk processing
    if (window.isProcessingBulkApproval) {
        return;
    }
    
    currentOrderId = order.id;
    
    // Hide any warning/error messages when opening modal
    hideBetterMessage();
    
    // Clear any previous modal messages
    clearModalMessage();
    
    // Reset button states
    disableModalButtons(false);
    
    // Populate order details
    document.getElementById("modalOrderId").textContent = order.tranid || "—";
    document.getElementById("modalCustomer").textContent = order.customer || "—";
    document.getElementById("modalStatus").textContent = order.status || "—";
    document.getElementById("modalDate").textContent = order.date || "—";
    document.getElementById("modalCreated").textContent = order.created || "—";
    document.getElementById("modalMemo").textContent = order.memo || "—";
    document.getElementById("modalPoNumber").textContent = order.ponumber || "—";
    document.getElementById("modalSalesRep").textContent = order.salesRep || "—";
    document.getElementById("modalCurrency").textContent = order.currency || "—";
    document.getElementById("modalTerms").textContent = order.terms || "—";
    document.getElementById("modalShipDate").textContent = order.shipDate || "—";
    document.getElementById("modalDueDate").textContent = order.shipDate || "—";
    document.getElementById("modalLocation").textContent = order.location || "—";
    document.getElementById("modalDepartment").textContent = order.department || "—";
    document.getElementById("modalClass").textContent = order.class || "—";
    document.getElementById("modalAmount").textContent = order.total || "—";

    document.getElementById("orderModal").classList.remove("hidden");
}

/**
 * Close order details modal.
 * Hides the order details modal and clears any displayed messages.
 * @returns {void}
 */
function closeModal() {
    document.getElementById("orderModal").classList.add("hidden");
    // Clear any modal messages when closing
    clearModalMessage();
}

/**
 * Show message inside the modal.
 * Displays a styled message within the order details modal.
 * Optionally shows a loading spinner.
 * @param {string} text - The message text to display
 * @param {string} type - The message type: 'success', 'error', 'warning', or 'info'
 * @param {boolean} [showSpinner=false] - Whether to show a loading spinner
 * @returns {void}
 */
function showModalMessage(text, type, showSpinner = false) {
    let messageDiv = document.getElementById("modalMessage");
    
    // Create message div if it doesn't exist
    if (!messageDiv) {
        messageDiv = document.createElement("div");
        messageDiv.id = "modalMessage";
        messageDiv.className = "mb-4 p-3 rounded-lg text-sm font-semibold";
        
        // Insert at the top of modal body
        const modalBody = document.querySelector("#orderModal .p-8");
        modalBody.insertBefore(messageDiv, modalBody.firstChild);
    }
    
    messageDiv.textContent = text;
    messageDiv.className = "mb-4 p-3 rounded-lg text-sm font-semibold";
    
    // Add spinner if requested
    if (showSpinner) {
        const spinner = document.createElement("div");
        spinner.className = "inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2";
        messageDiv.innerHTML = "";
        messageDiv.appendChild(spinner);
        messageDiv.appendChild(document.createTextNode(text));
    }
    
    // Style based on type
    if (type === "success") {
        messageDiv.className += " bg-green-100 border border-green-300 text-green-800";
    } else if (type === "error") {
        messageDiv.className += " bg-red-100 border border-red-300 text-red-800";
    } else if (type === "info") {
        messageDiv.className += " bg-blue-100 border border-blue-300 text-blue-800";
    } else if (type === "warning") {
        messageDiv.className += " bg-yellow-100 border border-yellow-300 text-yellow-800";
    }
    
    messageDiv.style.display = "block";
}

/**
 * Clear modal message.
 * Hides and clears the message displayed in the modal.
 * @returns {void}
 */
function clearModalMessage() {
    const messageDiv = document.getElementById("modalMessage");
    if (messageDiv) {
        messageDiv.style.display = "none";
        messageDiv.innerHTML = "";
    }
}

/**
 * Disable/enable modal buttons during processing.
 * Toggles the disabled state of approve and cancel buttons in the modal.
 * Shows loading state when disabled.
 * @param {boolean} disabled - Whether to disable the buttons
 * @returns {void}
 */
function disableModalButtons(disabled) {
    const approveBtn = document.querySelector("#orderModal button[onclick='approveOrder()']");
    const cancelBtn = document.querySelector("#orderModal button[onclick='closeModal()']");
    
    if (approveBtn) {
        approveBtn.disabled = disabled;
        if (disabled) {
            approveBtn.classList.add("opacity-50", "cursor-not-allowed");
            approveBtn.innerHTML = `
                <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Processing...
            `;
        } else {
            approveBtn.classList.remove("opacity-50", "cursor-not-allowed");
            approveBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Approve Order
            `;
        }
    }
    
    if (cancelBtn) {
        cancelBtn.disabled = disabled;
        if (disabled) {
            cancelBtn.classList.add("opacity-50", "cursor-not-allowed");
        } else {
            cancelBtn.classList.remove("opacity-50", "cursor-not-allowed");
        }
    }
}

/**
 * Approve single order from modal.
 * Sends approval request for the currently displayed order.
 * Shows loading state, handles success/error responses, and auto-closes modal on success.
 * @async
 * @returns {Promise<void>}
 */
async function approveOrder() {
    // Show loading state in modal
    showModalMessage("Processing approval...", "info", true);
    disableModalButtons(true);
    
    try {
        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "approveso", salesOrderIds: [currentOrderId] })
        });
        const result = await res.json();
        
        if (result.success) {
            showModalMessage("✅ Order approved successfully!", "success", false);
            // Auto-close modal after 2 seconds and refresh
            setTimeout(() => {
                closeModal();
                loadOrders();
            }, 2000);
        } else {
            showModalMessage("❌ " + (result.message || "Approval failed. Please try again."), "error", false);
            disableModalButtons(false);
        }
    } catch (err) {
        showModalMessage("❌ Network error. Please check your connection and try again.", "error", false);
        disableModalButtons(false);
        console.error("Approval Error:", err);
    }
}

/**
 * Approve selected orders.
 * Sends bulk approval request for all checked orders.
 * Validates selection, shows loading state, and handles success/error responses.
 * Auto-refreshes the orders list on success.
 * @async
 * @returns {Promise<void>}
 */
async function approveSelected() {
    const selected = Array.from(document.querySelectorAll("input.order-checkbox:checked"))
        .filter(cb => {
            const row = cb.closest("tr");
            return row && row.style.display !== "none";
        })
        .map(cb => cb.value);

    if (selected.length === 0) {
        showBetterMessage("⚠️ Please select at least one order to approve.", "warning");
        return;
    }

    // Show loading message with better visibility
    showBetterMessage(`🔄 Processing ${selected.length} order(s) for approval...`, "info", true);
    disableApprovalButtons(true);

    try {
        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "approveso",
                salesOrderIds: selected
            })
        });

        const result = await res.json();
        console.log("Approval Response:", result);

        if (result.success) {
            showBetterMessage(`✅ ${result.message || 'Orders approved successfully!'}`, "success");
            // Auto-refresh after 2 seconds
            setTimeout(() => {
                loadOrders();
                hideBetterMessage();
                disableApprovalButtons(false);
            }, 2000);
        } else {
            showBetterMessage(`❌ ${result.message || 'Approval failed. Please try again.'}`, "error");
            disableApprovalButtons(false);
        }

    } catch (err) {
        showBetterMessage("❌ Network error. Please check your connection and try again.", "error");
        disableApprovalButtons(false);
        console.error("Approval Error:", err);
    }
}

/**
 * Get page user ID (helper function for approval page).
 * Retrieves the user ID that was injected by the server into the PAGE_USER_ID variable.
 * @returns {string|null} The user ID if available, null otherwise
 */
function getPageUserId() {
    // This will be replaced by the server with actual user ID
    return typeof PAGE_USER_ID !== 'undefined' ? PAGE_USER_ID : null;
}

/**
 * Show better message with enhanced visibility.
 * Displays a fixed-position message at the top of the page with high z-index.
 * Includes optional loading spinner and auto-scrolls to ensure visibility.
 * Auto-closes warning and error messages after 5 seconds.
 * @param {string} text - The message text to display
 * @param {string} type - The message type: 'success', 'error', 'warning', or 'info'
 * @param {boolean} [showSpinner=false] - Whether to show a loading spinner
 * @returns {void}
 */
function showBetterMessage(text, type, showSpinner = false) {
    const messageDiv = document.getElementById("message");
    messageDiv.innerHTML = "";
    
    // Clear any existing auto-close timer
    if (window.messageAutoCloseTimer) {
        clearTimeout(window.messageAutoCloseTimer);
        window.messageAutoCloseTimer = null;
    }
    
    // Create content with spinner if needed
    if (showSpinner) {
        const spinner = document.createElement("div");
        spinner.className = "inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3";
        messageDiv.appendChild(spinner);
    }
    
    messageDiv.appendChild(document.createTextNode(text));
    messageDiv.className = "mb-4 text-base font-bold p-4 rounded-lg border-2 shadow-lg";
    
    // Enhanced styling with better visibility and higher z-index than modal
    if (type === "success") {
        messageDiv.className += " bg-green-50 border-green-400 text-green-800 shadow-green-200";
    } else if (type === "error") {
        messageDiv.className += " bg-red-50 border-red-400 text-red-800 shadow-red-200";
    } else if (type === "warning") {
        messageDiv.className += " bg-yellow-50 border-yellow-400 text-yellow-800 shadow-yellow-200";
    } else if (type === "info") {
        messageDiv.className += " bg-blue-50 border-blue-400 text-blue-800 shadow-blue-200";
    }
    
    // Lower z-index than modal (modal is z-50 = 50, so use 40)
    messageDiv.style.cssText = "display: block !important; position: fixed !important; top: 20px !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 40 !important; max-width: 90% !important; width: auto !important;";
    
    // Scroll to message to ensure visibility
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-close warning and error messages after 5 seconds (unless it has a spinner)
    if ((type === "warning" || type === "error") && !showSpinner) {
        window.messageAutoCloseTimer = setTimeout(() => {
            hideBetterMessage();
        }, 5000);
    }
}

/**
 * Hide better message.
 * Hides the fixed-position message and resets its styling.
 * @returns {void}
 */
function hideBetterMessage() {
    const messageDiv = document.getElementById("message");
    messageDiv.style.display = "none";
    messageDiv.innerHTML = "";
    // Reset positioning to normal
    messageDiv.style.cssText = "display: none;";
}

/**
 * Disable/enable approval buttons during processing.
 * Toggles the disabled state of all approval-related buttons and checkboxes.
 * Prevents user interaction during bulk approval processing.
 * Sets global flag to prevent modal opening during processing.
 * @param {boolean} disabled - Whether to disable the buttons and interactions
 * @returns {void}
 */
function disableApprovalButtons(disabled) {
    const approveBtn = document.querySelector("button[onclick='approveSelected()']");
    const selectAllBtn = document.querySelector("button[onclick='selectAll()']");
    const deselectAllBtn = document.querySelector("button[onclick='deselectAll()']");
    
    [approveBtn, selectAllBtn, deselectAllBtn].forEach(btn => {
        if (btn) {
            btn.disabled = disabled;
            if (disabled) {
                btn.classList.add("opacity-50", "cursor-not-allowed");
                if (btn === approveBtn) {
                    btn.innerHTML = `
                        <span class="flex items-center gap-2">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Processing...
                        </span>
                    `;
                }
            } else {
                btn.classList.remove("opacity-50", "cursor-not-allowed");
                if (btn === approveBtn) {
                    btn.innerHTML = `
                        <span class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            Approve Selected Orders
                        </span>
                    `;
                }
            }
        }
    });
    
    // Also disable checkboxes during processing
    const checkboxes = document.querySelectorAll("input.order-checkbox, #selectAllCheckbox");
    checkboxes.forEach(cb => {
        cb.disabled = disabled;
        if (disabled) {
            cb.classList.add("opacity-50", "cursor-not-allowed");
        } else {
            cb.classList.remove("opacity-50", "cursor-not-allowed");
        }
    });
    
    // Disable/enable table row interactions during processing
    const tableRows = document.querySelectorAll("#ordersTableBody tr");
    tableRows.forEach(row => {
        if (disabled) {
            row.style.pointerEvents = "none";
            row.classList.add("opacity-75");
        } else {
            row.style.pointerEvents = "auto";
            row.classList.remove("opacity-75");
        }
    });
    
    // Store processing state globally to prevent modal opening
    window.isProcessingBulkApproval = disabled;
}

/**
 * Initialize approval page.
 * Entry point for the sales order approval page.
 * Loads pending orders when the page is ready.
 * @returns {void}
 */
function initializeApprovalPage() {
    loadOrders();
}

// Sales Order Approval - End


// ============================================================================
// KANBAN BOARD FUNCTIONS - Migrated from jj_sales_process_kanban_board.html
// ============================================================================

let cardCounter = 4;
let allCards = [];

/**
 * Sets default values for the start and end date filters in the dashboard.
 * The start date is set to 30 days before today, and the end date is set to today.
 *
 * @function
 * @returns {void}
 */
function setDefaultDateValues() {
    try {
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setDate(currentDate.getDate() - 30);
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        document.getElementById('startDateFilter').value = formatDate(pastDate);
        document.getElementById('endDateFilter').value = formatDate(currentDate);
    } catch (error) {
        console.error('Error @ setDefaultDateValues:', error);
    }
}

/**
 * Sends a POST request to the current Suitelet URL to fetch filtered transaction records.
 * It reads the selected start and end dates from the filter inputs and passes them to the backend.
 * The response is expected to be JSON containing filtered data for rendering the dashboard.
 *
 * @function fetchFilteredRecords
 * @returns {void}
 */
function fetchFilteredRecords() {
    try {
        showLoaderKanban();
        const startDate = document.getElementById('startDateFilter').value;
        const endDate = document.getElementById('endDateFilter').value;
        const currentURL = window.location.href;
        const urlParams = new URLSearchParams(new URL(currentURL).search);
        const emailParam = urlParams.get("userId");
        console.log('Fetching records with date range:', startDate, 'to', endDate);
        return fetch(BASE_URL + '&action=fetchRecords', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate: startDate,
                endDate: endDate,
                userId: emailParam
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Filtered data received:', data);
                allCards = [...data.data];
                ['opportunity', 'estimate', 'salesorder'].forEach(stage => {
                    const col = document.getElementById(`${stage}-col`);
                    if (col) {
                        [...col.querySelectorAll('.kanban-card')].forEach(card => card.remove());
                    }
                });
                if (Array.isArray(data.data)) {
                    data.data.forEach(card => {
                        addCardToColumn(card);
                    });
                }
                const totals = data.recordTypeTotal || {};
                const counts = {
                    opportunity: data.data.filter(c => c.stage === 'opportunity').length,
                    estimate: data.data.filter(c => c.stage === 'estimate').length,
                    salesorder: data.data.filter(c => c.stage === 'salesorder').length
                };
                const updateEl = (id, value) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = value;
                };
                updateEl('oppTotal', formatNumberWithCommas(totals.opportunityTotal));
                updateEl('estTotal', formatNumberWithCommas(totals.estimateTotal));
                updateEl('soTotal', formatNumberWithCommas(totals.salesorderTotal));
                updateEl('oppCount', counts.opportunity);
                updateEl('estCount', counts.estimate);
                updateEl('soCount', counts.salesorder);
                return allCards;
            })
            .catch(error => {
                hideLoaderKanban();
                console.error('Fetch error:', error);
            })
            .finally(() => {
                hideLoaderKanban();
            });
    } catch (error) {
        console.error('Error @ fetchFilteredRecords:', error);
    }
}

/**
 * Applies the selected theme to the document and updates the theme toggle button state.
 * Also stores the selected theme in localStorage for persistence.
 *
 * @function
 * @param {string} theme - The theme to apply ('light' or 'dark').
 * @returns {void}
 */
function setTheme(theme) {
    try {
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelector('.theme-toggle').classList.toggle('active', theme === 'light');
        localStorage.setItem('theme', theme);
    } catch (error) {
        console.error('Error @ setTheme:', error);
    }
}

/**
 * Toggles between 'light' and 'dark' themes based on the current theme setting.
 *
 * @function
 * @returns {void}
 */
function toggleTheme() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    } catch (error) {
        console.error('Error @ toggleTheme:', error);
    }
}

/**
 * Displays the global loading overlay by adding the 'show' class to the loader element.
 *
 * @function
 * @returns {void}
 */
function showLoaderKanban() {
    try {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.classList.add('show');
        }
    } catch (error) {
        console.error('Error @ showLoaderKanban:', error);
    }
}

/**
 * Hides the global loading overlay by removing the 'show' class from the loader element.
 *
 * @function
 * @returns {void}
 */
function hideLoaderKanban() {
    try {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.classList.remove('show');
        }
    } catch (error) {
        console.error('Error @ hideLoaderKanban:', error);
    }
}

/**
 * Displays a modal alert with a given title and message.
 *
 * @function
 * @param {string} title - The title text to display in the alert modal.
 * @param {string} message - The message body to display in the alert modal.
 * @returns {void}
 */
function showAlertKanban(title, message) {
    try {
        const titleEl = document.getElementById('alertTitle');
        const messageEl = document.getElementById('alertMessage');
        const modal = document.getElementById('alertModal');
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (modal) modal.classList.add('show');
    } catch (error) {
        console.error('Error @ showAlertKanban:', error);
    }
}

/**
 * Closes the alert modal by removing the 'show' class from the modal element.
 *
 * @function
 * @returns {void}
 */
function closeAlertKanban() {
    try {
        const modal = document.getElementById('alertModal');
        if (modal) {
            modal.classList.remove('show');
        }
    } catch (error) {
        console.error('Error @ closeAlertKanban:', error);
    }
}

/**
 * Clears all existing Kanban cards from the board and displays new cards in their respective columns.
 *
 * @function
 * @param {Array<Object>} cards - Array of card objects to be displayed.
 * @param {string} cards[].stage - The record type (e.g., 'opportunity', 'estimate', 'salesorder').
 * @returns {void}
 */
function displayCards(cards) {
    try {
        document.querySelectorAll('.kanban-card').forEach(card => card.remove());
        cards.forEach(card => addCardToColumn(card));
    } catch (error) {
        console.error('Error @ displayCards:', error);
    }
}

/**
 * Updates the count indicators for each Kanban column based on the provided list of records.
 *
 * @function
 * @param {Array<Object>} list - Array of card objects to count.
 * @param {string} list[].stage - The record type (e.g., 'opportunity', 'estimate', 'salesorder').
 * @returns {void}
 */
function updateCountsLocal(list) {
    try {
        const oppCount = list.filter(c => c.stage === 'opportunity').length;
        const estCount = list.filter(c => c.stage === 'estimate').length;
        const soCount = list.filter(c => c.stage === 'salesorder').length;
        document.getElementById('oppCount').textContent = oppCount;
        document.getElementById('estCount').textContent = estCount;
        document.getElementById('soCount').textContent = soCount;
        document.querySelector('#opportunity-col h3 span').textContent = `(${oppCount})`;
        document.querySelector('#estimate-col h3 span').textContent = `(${estCount})`;
        document.querySelector('#salesorder-col h3 span').textContent = `(${soCount})`;
    } catch (error) {
        console.error('Error @ updateCountsLocal:', error);
    }
}

/**
 * Converts a string to camelCase format.
 * Capitalizes letters after spaces and lowercases the first character.
 *
 * @function
 * @param {string} str - The input string to convert.
 * @returns {string} - The camelCase formatted string.
 */
function toCamelCase(str) {
    try {
        return str
            .replace(/\s(.)/g, function (match, group1) {
                return group1.toUpperCase();
            })
            .replace(/^(.)/, function (match, group1) {
                return group1.toLowerCase();
            });
    } catch (error) {
        console.error('Error @ toCamelCase:', error);
    }
}

/**
 * Applies frontend-only filters to the global `allCards` list based on selected date range.
 * Optionally supports record type and status filtering (currently commented out).
 * Updates the Kanban board and column counts with the filtered results.
 *
 * @function
 * @returns {void}
 */
function applyFilters() {
    initCards();
}

/**
 * Fetches the current user's information from the Suitelet backend.
 * Displays the user's name in the dashboard header and returns the user data.
 * Falls back to dummy user info if the request fails.
 *
 * @async
 * @function
 * @returns {Promise<Object>} - A promise that resolves to the user info object.
 * @property {string} name - The user's name.
 * @property {string} email - The user's email address.
 * @property {string} role - The user's role.
 * @property {string} id - The user's internal ID.
 * @property {string} lastLogin - Last login timestamp.
 */
async function fetchUserInfo() {
    try {
        showLoaderKanban();
        const response = await fetch(BASE_URL + '&action=getUserInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        const data = await response.json();
        if (data.name == '-System-') {
            document.getElementById('userInfo').textContent = `Welcome`;
        } else {
            document.getElementById('userInfo').textContent = `Hello, ${data.name}`;
        }
        return data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        document.getElementById('userInfo').textContent = `Hi`;
    } finally {
        hideLoaderKanban();
    }
}

/**
 * Fetches filtered transaction records from the Suitelet backend.
 * Clears existing cards, updates the global `allCards` list, and repopulates the Kanban board.
 * Also updates record counts and totals for each transaction type.
 * Falls back to dummy data if the request fails.
 *
 * @async
 * @function
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of card objects.
 * @property {string} stage - Record type (e.g., 'opportunity', 'estimate', 'salesorder').
 * @property {string} title - Title or transaction ID.
 * @property {string} date - Transaction date.
 * @property {string} desc - Memo or description.
 * @property {string} status - Transaction status.
 * @property {string} entity - Associated entity name.
 * @property {number|string} amount - Projected amount.
 * @property {number|string} probability - Probability percentage.
 * @property {string} entityStatus - Entity status label.
 */
async function fetchKanbanData() {
    try {
        showLoaderKanban();
        const response = await fetch(BASE_URL + '&action=fetchRecords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        const cards = await response.json();
        // Clear existing cards from all columns
        document.querySelectorAll('.kanban-card').forEach(card => card.remove());
        // Update allCards and repopulate
        allCards = [...cards.data];
        cards.data.forEach(card => addCardToColumn(card));
        const oppCount = cards.data.filter(c => c.stage === 'opportunity').length;
        const estCount = cards.data.filter(c => c.stage === 'estimate').length;
        const soCount = cards.data.filter(c => c.stage === 'salesorder').length;
        document.getElementById('oppCount').textContent = oppCount;
        document.getElementById('estCount').textContent = estCount;
        document.getElementById('soCount').textContent = soCount;
        document.querySelector('#opportunity-col h3 span').textContent = `(${oppCount})`;
        document.querySelector('#estimate-col h3 span').textContent = `(${estCount})`;
        document.querySelector('#salesorder-col h3 span').textContent = `(${soCount})`;
        const totals = cards.recordTypeTotal || {};
        document.getElementById('oppTotal').textContent = totals.opportunityTotal?.toLocaleString() || '0';
        document.getElementById('estTotal').textContent = totals.estimateTotal?.toLocaleString() || '0';
        document.getElementById('soTotal').textContent = totals.salesorderTotal?.toLocaleString() || '0';
        return cards.data;
    } catch (error) {
        console.error('Error fetching kanban data:', error);
        allCards.forEach(card => addCardToColumn(card));
        updateCounts();
    } finally {
        hideLoaderKanban();
    }
}

/**
 * Formats a camelCase status string into a human-readable format.
 * Adds spaces before capital letters and capitalizes the first letter.
 *
 * @function
 * @param {string} status - The camelCase status string to format.
 * @returns {string} - The formatted status string.
 */
function formatStatus(status) {
    try {
        return status
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
    } catch (error) {
        console.error('Error @ formatStatus:', error);
    }
}

/**
 * Initializes the Kanban board by fetching card data from the backend
 * and assigning it to the global `allCards` array.
 *
 * @async
 * @function
 * @returns {Promise<void>} - Resolves when cards are fetched and stored.
 */
async function initCards() {
    try {
        allCards = await fetchFilteredRecords();
        console.log('allCards', allCards);
    } catch (error) {
        console.error('Error @ initCards:', error);
    }
}

/**
 * Fetches and displays the current user's information in the dashboard header.
 *
 * @async
 * @function
 * @returns {Promise<void>} - Resolves when user info is fetched and rendered.
 */
async function updateUserInfo() {
    try {
        await fetchUserInfo();
    } catch (error) {
        console.error('Error @ updateUserInfo:', error);
    }
}

/**
 * Adds a single card element to the appropriate Kanban column based on its stage.
 *
 * @function
 * @param {Object} card - The card data object.
 * @param {string} card.id - Internal ID of the record.
 * @param {string} card.title - Title or transaction ID.
 * @param {string} card.stage - Record type (e.g., 'opportunity', 'estimate', 'salesorder').
 * @param {string} card.date - Transaction date.
 * @param {string} card.desc - Memo or description.
 * @param {string} card.status - Status of the transaction.
 * @param {string} card.entity - Associated entity name.
 * @param {string|number} card.amount - Projected amount.
 * @param {string|number} card.probability - Probability percentage.
 * @param {string} card.entityStatus - Entity status label.
 * @returns {void}
 */
 function addCardToColumn(card) {
      try{
        const readableStatus = formatStatus(card.status);
        const formattedCurrency = formatCurrency(card.amount, card.currency)
        const col = document.getElementById(`${card.stage}-col`);
        const div = document.createElement('div');
        div.className = `kanban-card ${card.stage} p-3 mb-3 cursor-grab active:cursor-grabbing`;
        div.draggable = true;
        div.dataset.stage = card.stage;
        div.dataset.id = card.id;
        let stageInUrl = card.stage === 'opportunity' ? 'opprtnty.nl' : card.stage === 'estimate' ? 'estimate.nl' : 'salesord.nl';
        div.onclick = () => window.open(`/app/accounting/transactions/${stageInUrl}?id=${card.id}&whence=`, "ChildWindow", "width=800,height=800,top=300,left=300");
        // Determine badge color based on status
        let badgeColor = '';
        if (card.status.includes('inProgress')) badgeColor = 'var(--accent-opportunity-sec)';
        else if (card.status.includes('open')) badgeColor = 'var(--accent-estimate-sec)';
        else if (card.status.includes('pendingFulfillment') || 
        card.status.includes('fullyBilled') || 
        card.status.includes('pendingApproval') ||
        card.status.includes('partiallyBilled') ||
        card.status.includes('partiallyFulfilled') ||
        card.status.includes('closed') ||
        card.status.includes('approved') ||
        card.status.includes('due') ||
        card.status.includes('created') ||
        card.status.includes('pendingBilling')) badgeColor = 'var(--accent-salesorder-sec)';
        else badgeColor = 'var(--accent-primary)';

        if (card.stage === 'opportunity') {
          div.innerHTML = `
            <strong class="block text-sm font-medium mb-1 card-title" style="color: var(--text-primary);">${card.entity}</strong>
            <span class="text-xs font-medium px-2 py-1 rounded-full card-status" style="background-color: ${badgeColor}; color: var(--text-primary);">${readableStatus}</span>
            <p class="text-xs card-desc" style="color: var(--text-secondary);">Transaction ID: ${card.transactionNumber}</p>
            <p class="text-xs card-desc" style="color: var(--text-secondary);">Status: ${card.entityStatus}</p>
            <p class="text-xs card-desc" style="color: var(--text-secondary);">Amount: ${formattedCurrency}</p>
            <small class="text-xs block mb-1 card-date" style="color: var(--text-secondary);">Transaction Date: ${card.date}</small>
            <p class="text-xs card-desc" style="color: var(--text-secondary);">${card.desc}</p>
          `;
        } else {
          div.innerHTML = `
            <strong class="block text-sm font-medium mb-1 card-title" style="color: var(--text-primary);">${card.entity}</strong>
            <span class="text-xs font-medium px-2 py-1 rounded-full card-status" style="background-color: ${badgeColor}; color: var(--text-primary);">${readableStatus}</span>
            <p class="text-xs card-desc" style="color: var(--text-secondary);">Transaction ID: ${card.transactionNumber}</p>
            <p class="text-xs card-desc" style="color: var(--text-secondary);">Amount: ${formattedCurrency}</p>
            <small class="text-xs block mb-1 card-date" style="color: var(--text-secondary);">${card.date}</small>
          `;
        }
        col.appendChild(div);
      } catch(error) {
        log.error('Error @ userInformation');
      }
    }


/**
 * Formats a numeric amount into a currency string using Indian locale formatting.
 *
 * @param {number|string} amount - The numeric value to format.
 * @param {string} [currencyCode='INR'] - The currency code to prefix (e.g., 'INR', 'USD').
 * @returns {string} Formatted currency string (e.g., "INR 1,234.56").
 */
function formatCurrency(amount, currencyCode = 'INR') {
    try {
        if (!amount || isNaN(amount)) return `${currencyCode} 0.00`;
        return `${currencyCode} ${parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    } catch (error) {
        console.error('Error @ formatCurrency:', error);
    }
}

/**
 * Formats a numeric amount with commas and two decimal places using Indian locale.
 *
 * @param {number|string} amount - The numeric value to format.
 * @returns {string} Formatted number string (e.g., "1,234.56").
 */
function formatNumberWithCommas(amount) {
    try {
        if (!amount || isNaN(amount)) return '0.00';
        return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } catch (error) {
        console.error('Error @ formatNumberWithCommas:', error);
    }
}

/**
 * Creates a new card object with default values and adds it to the Kanban board.
 * Updates the global `allCards` list, refreshes counts, and closes the modal.
 *
 * @function
 * @param {string} stage - The record type or stage (e.g., 'opportunity', 'estimate', 'salesorder').
 * @param {string} title - The title or name of the new card.
 * @param {string} [desc=''] - Optional description or memo for the card.
 * @returns {Object} newCard - The newly created card object.
 * @property {number} newCard.id - Unique ID for the card.
 * @property {string} newCard.title - Title of the card.
 * @property {string} newCard.stage - Record type or stage.
 * @property {string} newCard.date - Creation date in localized format.
 * @property {string} newCard.desc - Description or memo.
 * @property {string} newCard.entity - Entity name (same as title).
 * @property {string} newCard.status - Default status ('Created').
 * @property {string} newCard.entityStatus - Entity status label (e.g., 'Prospect' for opportunities).
 * @property {string} newCard.amount - Default amount (e.g., '$0' for opportunities).
 */
function createNewCard(stage, title, desc = '') {
    try {
        const newCard = {
            id: cardCounter++,
            title,
            stage,
            date: `Created: ${new Date().toLocaleDateString()}`,
            desc,
            entity: title,
            status: 'Created',
            entityStatus: stage === 'opportunity' ? 'Prospect' : '',
            amount: stage === 'opportunity' ? '$0' : ''
        };
        allCards.push(newCard);
        addCardToColumn(newCard);
        updateCounts();
        closeAddModal();
        return newCard;
    } catch (error) {
        console.error('Error @ createNewCard:', error);
    }
}

/**
 * Fetches the latest Kanban card data and updates the count indicators
 * for each record type (opportunity, estimate, salesorder) in the dashboard.
 *
 * @async
 * @function
 * @returns {Promise<void>} - Resolves when counts are updated in the DOM.
 */
async function updateCounts() {
    try {
        const cards = await fetchFilteredRecords();
        const oppCount = cards.filter(c => c.stage === 'opportunity').length;
        const estCount = cards.filter(c => c.stage === 'estimate').length;
        const soCount = cards.filter(c => c.stage === 'salesorder').length;

        document.getElementById('oppCount').textContent = oppCount;
        document.getElementById('estCount').textContent = estCount;
        document.getElementById('soCount').textContent = soCount;

        document.querySelector('#opportunity-col h3 span').textContent = `(${oppCount})`;
        document.querySelector('#estimate-col h3 span').textContent = `(${estCount})`;
        document.querySelector('#salesorder-col h3 span').textContent = `(${soCount})`;
    } catch (error) {
        console.error('Error @ updateCounts:', error);
    }
}

/**
 * Closes the "Add Card" modal by hiding it and resetting the form fields.
 *
 * @function
 * @returns {void}
 */
function closeAddModal() {
    try {
        const modal = document.getElementById('addCardModal');
        const addCardForm = document.getElementById('addCardForm');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
        if (addCardForm) {
            addCardForm.reset();
        }
    } catch (error) {
        console.error('Error @ closeAddModal:', error);
    }
}

/**
 * Toggles the collapsed state of all cards within a specified Kanban column.
 * Collapsed cards hide their description and date. The toggle button switches between '+' and '−'.
 *
 * @function
 * @param {string} stage - The record type or column ID suffix (e.g., 'opportunity', 'estimate', 'salesorder').
 * @returns {void}
 */
function toggleCollapse(stage) {
    try {
        const col = document.getElementById(`${stage}-col`);
        const toggleBtn = col.querySelector('.collapse-toggle-opportunity, .collapse-toggle-estimate, .collapse-toggle-salesorder');
        const cards = col.querySelectorAll('.kanban-card');
        const isCollapsed = toggleBtn.textContent === '−';
        cards.forEach(card => card.classList.toggle('collapsed', isCollapsed));
        toggleBtn.textContent = isCollapsed ? '+' : '−';
    } catch (error) {
        console.error('Error @ toggleCollapse:', error);
    }
}

/**
 * Toggles the visibility of the sidebar based on screen width.
 * On mobile (≤768px), toggles the 'show' class. On desktop, toggles the 'hidden' class.
 * Also updates the sidebar toggle button icon accordingly.
 *
 * @function
 * @returns {void}
 */
function toggleSidebar() {
    try {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        const screenWidth = window.innerWidth;
        if (screenWidth <= 768) {
            sidebar.classList.toggle('show');
            toggleBtn.textContent = sidebar.classList.contains('show') ? '«' : '»';
        } else {
            sidebar.classList.toggle('hidden');
            toggleBtn.textContent = sidebar.classList.contains('hidden') ? '»' : '«';
        }
    } catch (error) {
        console.error('Error @ toggleSidebar:', error);
    }
}

/**
 * Fetches all card data from the backend and exports it as a CSV file.
 * Includes ID, title, stage, and date for each card.
 * Shows and hides the loader during the process.
 *
 * @function
 * @returns {void}
 */
 function exportData() {
      try{
        let csv = "Stage,Title,Description\n";
        $(".kanban-column").each(function () {
          const stage = $(this).attr("id").replace("-col", "");
          $(this).find(".kanban-card").each(function () {
            const title = $(this).find(".card-title").text().trim();
            const desc = $(this).find(".card-desc").text().trim();
            csv += `"${stage}","${title}","${desc}"\n`;
          });
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "sales_pipeline.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error @ exportData:', error);
    }
}

/**
 * Temporarily highlights a specific Kanban column by dimming others.
 * Resets all columns to full opacity after 3 seconds.
 *
 * @function
 * @param {string} stage - The record type to highlight (e.g., 'opportunity', 'estimate', 'salesorder').
 * @returns {void}
 */
function filterByStage(stage) {
    try {
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(col => col.style.opacity = '0.5');
        document.getElementById(`${stage}-col`).style.opacity = '1';
        setTimeout(() => {
            columns.forEach(col => col.style.opacity = '1');
        }, 3000);
    } catch (error) {
        console.error('Error @ filterByStage:', error);
    }
}

/**
 * Initializes the sales dashboard by:
 * - Setting default date filters
 * - Fetching Kanban data and filtered records
 * - Displaying the global loader
 * - Fetching and displaying user info
 * - Populating the Kanban board with cards
 * - Hiding the loader once all async tasks complete
 *
 * @function
 * @returns {void}
 */
function initDashboard() {
    try {
        setDefaultDateValues();
        showLoaderKanban();
        // Verify session first; verifySession returns a Promise<boolean>
        // verifySession().then(valid => {
        // still fetch user info (may be limited) and cards — board remains readable when session invalid
        updateUserInfo();
        // if (!valid) {
        //   // show a non-blocking notice
        //   console.warn('Session invalid: board will be read-only');
        // }
        initCards().then(() => {
            hideLoaderKanban();
        });
        // });
    } catch (error) {
        console.error('Error @ initDashboard:', error);
    }
}

/**
 * Initializes drag and drop event handlers for Kanban board.
 * Manages card movement between columns and stage transitions.
 *
 * @function
 * @returns {void}
 */
function initKanbanDragDrop() {
    let draggedCard = null;

    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            draggedCard = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.outerHTML);
            e.dataTransfer.setDragImage(e.target, 10, 10);
        }
    });

    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            e.target.classList.remove('dragging');
            document.querySelectorAll('.kanban-column').forEach(col => {
                col.classList.remove('drag-over');
            });
            draggedCard = null;
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.target.closest('.kanban-column') && draggedCard) {
            const column = e.target.closest('.kanban-column');
            column.classList.add('drag-over');
        }
    });

    document.addEventListener('dragleave', (e) => {
        if (e.target.closest('.kanban-column')) {
            const column = e.target.closest('.kanban-column');
            column.classList.remove('drag-over');
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        // If session is invalid, block stage transformations (allow read-only view)
        if (window.SESSION_VALID === false) {
            showAlertKanban('Session Expired', 'Your session has expired — board is read-only. Please log in to make changes.');
            return;
        }
        if (draggedCard && e.target.closest('.kanban-column')) {
            const column = e.target.closest('.kanban-column');
            const colId = column.id.replace('-col', '');
            column.classList.remove('drag-over');

            const cardId = draggedCard.dataset.id;
            const card = allCards.find(c => c.id == cardId);

            if (card) {
                const fromRecordType = card.stage;

                const currentCard = draggedCard;
                const toRecordType = colId;
                const fromId = cardId;

                const validTransitions = {
                    opportunity: ['estimate', 'salesorder'],
                    estimate: ['salesorder']
                };

                if (validTransitions[fromRecordType] && validTransitions[fromRecordType].includes(toRecordType)) {
                    console.log(`Transforming ${fromRecordType} → ${toRecordType} for record ID ${fromId}`);
                    showLoaderKanban();
                    fetch(BASE_URL + '&action=updateStage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fromRecordType,
                            toRecordType,
                            fromId
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                console.log(`Moved card ${cardId} to stage: ${colId}`);

                                card.stage = colId;
                                card.date = `${card.date} | Moved: ${new Date().toLocaleDateString()}`;

                                currentCard.className = `kanban-card ${colId} p-3 mb-3 cursor-grab active:cursor-grabbing`;
                                const targetColumn = document.getElementById(`${colId}-col`);
                                if (targetColumn) {
                                    targetColumn.appendChild(currentCard);
                                }

                                fetchFilteredRecords();
                            } else {
                                showAlertKanban('Update Failed', data.message);
                                card.stage = fromRecordType;
                                currentCard.className = `kanban-card ${fromRecordType} p-3 mb-3 cursor-grab active:cursor-grabbing`;
                            }
                        })
                        .catch(err => console.error('Transform API error:', err))
                        .finally(() => {
                            hideLoaderKanban();
                        });
                } else {
                    showAlertKanban('Invalid Transition', `Cannot move from ${fromRecordType} to ${toRecordType}.`);
                    return;
                }
            }
            draggedCard = null;
        }
    });
}

/**
 * Initializes the add card form submission handler.
 *
 * @function
 * @returns {void}
 */
function initAddCardForm() {
    const addCardForm = document.getElementById('addCardForm');
    if (addCardForm) {
        addCardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const stage = document.getElementById('cardStage').value;
            const title = document.getElementById('cardTitle').value;
            const desc = document.getElementById('cardDesc').value;
            createNewCard(stage, title, desc);
        });
    }
}

/**
 * Initializes the apply filter button handler.
 *
 * @function
 * @returns {void}
 */
function initFilterButton() {
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyFilters);
    }
}

/**
 * Wrapper functions for backward compatibility and easier HTML onclick handlers.
 * These map to the Kanban-specific versions above.
 */

/**
 * Alias for showAlertKanban - used by HTML onclick handlers.
 *
 * @function
 * @param {string} title - The alert title.
 * @param {string} message - The alert message.
 * @returns {void}
 */
function showAlert(title, message) {
    showAlertKanban(title, message);
}

/**
 * Alias for closeAlertKanban - used by HTML onclick handlers.
 *
 * @function
 * @returns {void}
 */
function closeAlert() {
    closeAlertKanban();
}

/**
 * Alias for showLoaderKanban - used in Kanban context.
 *
 * @function
 * @returns {void}
 */
function showLoader() {
    showLoaderKanban();
}

/**
 * Alias for hideLoaderKanban - used in Kanban context.
 *
 * @function
 * @returns {void}
 */
function hideLoader() {
    hideLoaderKanban();
}

// End of Kanban Board Functions

// ============================================================================
// OPPORTUNITY LAYOUT FUNCTIONS - Migrated from jj_opportunity_layouts.html
// ============================================================================

const ERROR_MESSAGES = {
  COMPANY: 'Company is mandatory.',
  STATUS: 'Status is mandatory.',
  DEPARTMENT: ' Department is mandatory.',
  LOCATION: ' Location is mandatory.',
  CLASS: ' Class is mandatory.',
  SALES_TYPE: ' Sales Type is mandatory.',
  PROBABILITY: 'Probability is mandatory.',
  EXPECTED_CLOSE: 'Expected Close Date is mandatory.',
  PROJECTED_TOTAL: 'Projected Total is mandatory.',
  SUBSIDIARY: 'Subsidiary is mandatory.',
  INVALID_DATE: 'Expected Close Date must be a valid future date.',
  INVALID_TOTAL: 'Projected Total must be a positive number.'
};

/**
 * Checks whether a field value should be treated as filled.
 * @param {string|number|null|undefined} value - Field value to check
 * @returns {boolean} True when value is present and not a blank or sentinel '0'
 */
function isFieldRequired(value) {
  return value !== null && value !== undefined && value !== '' && value !== '0';
}

/**
 * Validate that a date string represents today or a future date.
 * @param {string} dateValue - Date string parseable by Date
 * @returns {boolean} True when the date is valid and not before today
 */
function isValidFutureDate(dateValue) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Returns true when value is a positive numeric value.
 * @param {string|number} value - Value to test
 * @returns {boolean}
 */
function isPositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Display an error alert at the top of the form.
 * Non-validation system errors are logged and a generic message is shown.
 * @param {string} message - Message to display
 */
function showErrorAlert(message) {
  const validationErrors = ['mandatory', 'required', 'invalid', 'positive', 'future', 'valid'];
  const isValidationError = validationErrors.some(keyword => message.toLowerCase().includes(keyword));

  if (!isValidationError && message.includes('Error')) {
    console.error('System Error:', message);
    message = 'An error occurred. Please try again or contact support.';
  }
  const container = document.getElementById('alertContainer');
  const messageDiv = document.getElementById('alertMessage');
  messageDiv.textContent = message;
  container.classList.add('show');
  document.getElementById('successContainer').classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Display a success alert at the top of the form.
 * @param {string} message - Message to display
 */
function showSuccessAlert(message) {
  const container = document.getElementById('successContainer');
  const messageDiv = document.getElementById('successMessage');
  messageDiv.textContent = message;
  container.classList.add('show');
  document.getElementById('alertContainer').classList.remove('show');
}

/**
 * Close any visible alert (error or success).
 */
function closeAlertOpp() {
  document.getElementById('alertContainer').classList.remove('show');
  document.getElementById('successContainer').classList.remove('show');
}

/**
 * Mark a field's container with the error state for visual feedback.
 * @param {string} fieldId - ID of the input/select to mark
 */
function markFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.parentElement.classList.add('error');
  }
}

/**
 * Clear visual error indicators from all fields.
 */
function clearFieldErrors() {
  const errorFields = document.querySelectorAll('.field.error');
  errorFields.forEach(field => field.classList.remove('error'));
}

/**
 * Validate the entire form. Shows errors and marks fields when invalid.
 * @returns {boolean} True when form is valid
 */
function validateForm() {
  closeAlertOpp();
  clearFieldErrors();
  const company = document.getElementById('company').value;
  if (!isFieldRequired(company)) {
    showErrorAlert(ERROR_MESSAGES.COMPANY);
    markFieldError('company');
    return false;
  }
  const status = document.getElementById('status').value;
  if (!isFieldRequired(status)) {
    showErrorAlert(ERROR_MESSAGES.STATUS);
    markFieldError('status');
    return false;
  }
  const department = document.getElementById('department').value;
  if (!isFieldRequired(department)) {
    showErrorAlert(ERROR_MESSAGES.DEPARTMENT);
    markFieldError('department');
    return false;
  }
  const location = document.getElementById('location').value;
  if (!isFieldRequired(location)) {
    showErrorAlert(ERROR_MESSAGES.LOCATION);
    markFieldError('location');
    return false;
  }
  const classField = document.getElementById('class').value;
  if (!isFieldRequired(classField)) {
    showErrorAlert(ERROR_MESSAGES.CLASS);
    markFieldError('class');
    return false;
  }
  const salesType = document.getElementById('salesType').value;
  if (!isFieldRequired(salesType)) {
    showErrorAlert(ERROR_MESSAGES.SALES_TYPE);
    markFieldError('salesType');
    return false;
  }
  const probability = document.getElementById('probability').value;
  if (!isFieldRequired(probability)) {
    showErrorAlert(ERROR_MESSAGES.PROBABILITY);
    markFieldError('probability');
    return false;
  }
  const expectedClose = document.getElementById('expectedClose').value;
  if (!isFieldRequired(expectedClose)) {
    showErrorAlert(ERROR_MESSAGES.EXPECTED_CLOSE);
    markFieldError('expectedClose');
    return false;
  }
  if (!isValidFutureDate(expectedClose)) {
    showErrorAlert(ERROR_MESSAGES.INVALID_DATE);
    markFieldError('expectedClose');
    return false;
  }
  const projectedTotal = document.getElementById('projectedTotal').value;
  if (!isFieldRequired(projectedTotal)) {
    showErrorAlert(ERROR_MESSAGES.PROJECTED_TOTAL);
    markFieldError('projectedTotal');
    return false;
  }
  if (!isPositiveNumber(projectedTotal)) {
    showErrorAlert(ERROR_MESSAGES.INVALID_TOTAL);
    markFieldError('projectedTotal');
    return false;
  }
  const subsidiary = document.getElementById('subsidiary').value;
  if (!isFieldRequired(subsidiary)) {
    showErrorAlert(ERROR_MESSAGES.SUBSIDIARY);
    markFieldError('subsidiary');
    return false;
  }
  return true;
}

/**
 * Validate the sales team contribution rows. Ensures contributions sum to 100
 * when at least one employee is assigned and each value is between 0-100.
 * @returns {boolean}
 */
function validateContribution() {
  let isValid = true;
  let totalContribution = 0;
  let hasEmployee = false;
  const rows = document.querySelectorAll('#salesTeamTable tbody tr');
  rows.forEach(row => {
    const employeeEl = row.querySelector('.employee-select');
    const contribEl = row.querySelector('.contribution');
    const employeeVal = employeeEl ? (employeeEl.value || '').toString().trim() : '';
    const value = contribEl ? parseFloat(contribEl.value) : 0;
    if (employeeVal) {
      hasEmployee = true;
      if (isNaN(value) || value < 0 || value > 100) {
        showErrorAlert('Contribution should be between 0 and 100 for assigned sales team members.');
        contribEl && contribEl.classList.add('error');
        isValid = false;
      } else {
        contribEl && contribEl.classList.remove('error');
      }
      totalContribution += (isNaN(value) ? 0 : value);
    } else {
      contribEl && contribEl.classList.remove('error');
    }
  });
  if (hasEmployee && Math.abs(totalContribution - 100) > 0.01) {
    showErrorAlert('Sales team contributions must total 100. Current total: ' + totalContribution);
    isValid = false;
  }
  return isValid;
}

/**
 * Attach blur listeners to key fields to validate them in real-time.
 */
function setupRealTimeValidation() {
  const fieldsToValidate = ['expectedClose', 'projectedTotal'];
  fieldsToValidate.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', function () {
        if (fieldId === 'expectedClose' && this.value) {
          if (!isValidFutureDate(this.value)) {
            showErrorAlert(ERROR_MESSAGES.INVALID_DATE);
            markFieldError(fieldId);
          } else {
            closeAlertOpp();
            this.parentElement.classList.remove('error');
          }
        } else if (fieldId === 'projectedTotal' && this.value) {
          if (!isPositiveNumber(this.value)) {
            showErrorAlert(ERROR_MESSAGES.INVALID_TOTAL);
            markFieldError(fieldId);
          } else {
            closeAlertOpp();
            this.parentElement.classList.remove('error');
          }
        }
      });
    }
  });
}

/**
 * Hide the Sales Team UI completely (used for non-sales roles).
 */
function hideSalesTeamSection() {
  const panel = document.getElementById('salesTeamPanel');
  if (panel) panel.style.display = 'none';
  const table = document.getElementById('salesTeamTable');
  if (table) table.style.display = 'none';
  const addBtn = document.getElementById('addSalesTeamBtnBottom');
  if (addBtn) addBtn.style.display = 'none';
  const tile = document.getElementById('tileSalesTeam');
  if (tile) tile.style.display = 'none';
}

/**
 * Hide rate and amount columns/inputs. Also sets up mutation observer to
 * hide any newly added rows' rate/amount controls.
 */
function hideRateAndAmount() {
  document.querySelectorAll('th.item-rate-header, th.item-amount-header')
    .forEach(th => th.style.display = 'none');
  document.querySelectorAll('input.item-rate, input.item-amount')
    .forEach(inp => {
      const td = inp.closest('td');
      if (td) td.style.display = 'none';
    });
  const tbody = document.querySelector('#itemTable tbody') || document.querySelector('#itemTable');
  if (tbody && !tbody.__observerSet) {
    const obs = new MutationObserver(() => {
      document.querySelectorAll('input.item-rate, input.item-amount').forEach(inp => {
        const td = inp.closest('td');
        if (td) td.style.display = 'none';
      });
    });
    obs.observe(tbody, { childList: true, subtree: true });
    tbody.__observerSet = true;
  }
  const addBtn = document.getElementById('addLineBtn');
  if (addBtn && !addBtn.__hideHooked) {
    addBtn.addEventListener('click', () => {
      setTimeout(() => {
        document.querySelectorAll('input.item-rate, input.item-amount').forEach(inp => {
          const td = inp.closest('td');
          if (td) td.style.display = 'none';
        });
      }, 0);
    });
    addBtn.__hideHooked = true;
  }
}

/**
 * Check via POST whether the current user is a Sales Manager and hide
 * rate/amount and sales-team UI when not a manager.
 * @param {string} baseUrl - URL to call for the check
 * @returns {Promise<void>}
 */
async function checkAndApplyRateVisibilityPOST(baseUrl) {
  try {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    if (!userId) {
      hideRateAndAmount();
      hideSalesTeamSection();
      return;
    }
    const resp = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'checkSalesManager',
        userId: userId
      })
    });
    let data;
    try {
      data = await resp.json();
    } catch {
      const txt = await resp.text();
      try { data = JSON.parse(txt); } catch { data = { success: false, isSalesManager: false }; }
    }
    const isMgr = !!(data && data.isSalesManager);
    if (!isMgr) {
      hideRateAndAmount();
      hideSalesTeamSection();
    }
  } catch (err) {
    console.error('Error checking Sales Manager (POST):', err);
    hideRateAndAmount();
  }
}

/**
 * Fetch dropdown data (companies, items, classes, employees, etc.) and
 * populate the form selects. Stores the result in `window.latestItemsData`.
 * @returns {Promise<void>}
 */
async function loadDropdowns() {
  try {
    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "opportunitydropdowns"
      })
    });
    const data = await resp.json();
    window.latestItemsData = data;
    const fillSelect = (id, arr, placeholder) => {
      const el = document.getElementById(id);
      if (el && Array.isArray(arr)) {
        const options = arr
          .map(item => `<option value="${item.id}">${item.name}</option>`)
          .join('');
        el.innerHTML = `<option value="">${placeholder}</option>${options}`;
      }
    };
    if (data.items && Array.isArray(data.items)) {
      document.querySelectorAll('.item-select').forEach(select => {
        select.innerHTML = '<option value="">Select Item</option>';
        data.items.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id;
          opt.textContent = item.name;
          opt.dataset.rate = item.rate || 0;
          opt.dataset.desc = item.type || '';
          select.appendChild(opt);
        });
      });
    }
    fillSelect('company', data.companies, 'Select Company');
    fillSelect('status', data.statuses, 'Select Status');
    fillSelect('subsidiary', data.subsidiaries || [], 'Select Subsidiary');
    fillSelect('department', data.departments, 'Select Department');
    fillSelect('location', data.locations, 'Select Location');
    fillSelect('class', data.classes, 'Select Class');
    fillSelect('forecastType', data.forecastTypes, 'Select Forecast Type');
    fillSelect('salesType', data.salesTypes, 'Select Sales Type');
    const populateSelectList = (selector, list, placeholder) => {
      document.querySelectorAll(selector).forEach(el => {
        el.innerHTML = `<option value="">${placeholder}</option>`;
        if (Array.isArray(list)) {
          list.forEach(i => {
            const opt = document.createElement('option');
            opt.value = i.id;
            opt.textContent = i.name;
            el.appendChild(opt);
          });
        }
      });
    };
    populateSelectList('.employee-select', data.employees || [], 'Select Employee');
    populateSelectList('.salesrole-select', data.salesRoles || [], 'Select Role');
  } catch (err) {
    console.error('Error loading dropdowns:', err);
    showErrorAlert('Error loading form data. Please refresh the page.');
  }
}

/**
 * Toggle UI for create vs update mode. Shows/hides opportunity id input and
 * load button when switching to update.
 */
function handleModeChange() {
  try {
    const mode = document.getElementById('operationMode').value;
    const oppIdField = document.getElementById('opportunityIdField');
    const loadBtn = document.getElementById('loadBtn');
    const oppNumberEl = document.getElementById('oppNumber');
    const oppIdInput = document.getElementById('updateOpportunityId');
    if (mode === 'update') {
      oppIdField.style.display = 'block';
      loadBtn.style.display = 'block';
      oppIdInput.setAttribute('required', 'required');
      oppIdInput.value = '';
    } else {
      oppIdField.style.display = 'none';
      loadBtn.style.display = 'none';
      oppIdInput.removeAttribute('required');
      oppIdInput.value = '';
      oppNumberEl.value = 'To be generated';
    }
  } catch (err) {
    console.error('Error handling mode change:', err);
  }
}

/**
 * Load an existing opportunity by ID and populate the form for editing.
 * Expects the server to return `opportunity` containing fields and `lines`.
 */
function loadOpportunityById() {
  const mode = document.getElementById('operationMode').value;
  if (mode !== 'update') return;
  const oppId = document.getElementById('updateOpportunityId').value.trim();
  if (!oppId) {
    showErrorAlert('Please enter an Opportunity ID.');
    return;
  }
  fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "loadOpportunity",
      id: oppId
    })
  })
    .then(resp => resp.json())
    .then(data => {
      if (data.success && data.opportunity) {
        const opp = data.opportunity;
        document.getElementById('oppNumber').value = opp.opportunityNumber || '';
        document.getElementById('title').value = opp.title || '';
        document.getElementById('projectSummary').value = opp.projectSummary || '';
        document.getElementById('details').value = opp.details || '';
        document.getElementById('company').value = opp.company || '';
        document.getElementById('status').value = opp.status || '';
        document.getElementById('probability').value = opp.probability || '';
        document.getElementById('expectedClose').value = opp.expectedClose || '';
        document.getElementById('projectedTotal').value = opp.projectedTotal || '';
        document.getElementById('forecastType').value = opp.forecastType || '';
        document.getElementById('rangeFrom').value = opp.rangeFrom || '';
        document.getElementById('rangeTo').value = opp.rangeTo || '';
        document.getElementById('salesType').value = opp.salesType || '';
        document.getElementById('subsidiary').value = opp.subsidiaryName || '';
        document.getElementById('department').value = opp.department || '';
        document.getElementById('class').value = opp.class || '';
        document.getElementById('location').value = opp.location || '';
        if (opp.lines && Array.isArray(opp.lines)) {
          const tbody = document.querySelector('#itemTable tbody');
          tbody.innerHTML = '';
          console.log('Available Items:', window.latestItemsData.items);
          opp.lines.forEach((line, lineIdx) => {
            console.log(`\n=== Processing Line ${lineIdx} ===`);
            console.log('Line Object:', line);
            console.log('Line Item ID (should be selected):', line.itemId);
            const row = document.createElement('tr');
            row.classList.add('line-row');
            const tdItem = document.createElement('td'); tdItem.setAttribute('data-label', 'Item');
            const select = document.createElement('select'); select.className = 'item-select'; select.name = 'item[]';
            const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Select Item';
            select.appendChild(placeholder);
            const itemsArr = (window.latestItemsData && window.latestItemsData.items) || [];
            itemsArr.forEach((item) => {
              const opt = document.createElement('option');
              opt.value = String(item.id);
              opt.textContent = item.name || (item.itemid || '');
              if (item.rate !== undefined) opt.dataset.rate = item.rate;
              opt.dataset.desc = item.type || item.desc || '';
              if (String(item.id) === String(line.itemId)) opt.selected = true;
              select.appendChild(opt);
            });
            tdItem.appendChild(select);
            const tdDesc = document.createElement('td');
            tdDesc.setAttribute('data-label', 'Description');
            const descInput = document.createElement('textarea');
            descInput.className = 'item-desc';
            descInput.name = 'itemdesc[]';
            descInput.rows = 3;
            descInput.value = line?.desc || '';
            tdDesc.appendChild(descInput);
            const tdClass = document.createElement('td');
            tdClass.setAttribute('data-label', 'Class');
            const classSelect = document.createElement('select');
            classSelect.className = 'item-class';
            classSelect.name = 'itemclass[]';
            tdClass.appendChild(classSelect);
            const tdDept = document.createElement('td');
            tdDept.setAttribute('data-label', 'Department');
            const deptSelect = document.createElement('select');
            deptSelect.className = 'item-dept';
            deptSelect.name = 'itemdept[]';
            tdDept.appendChild(deptSelect);
            const tdQty = document.createElement('td'); tdQty.setAttribute('data-label', 'Qty');
            const qtyInput = document.createElement('input'); qtyInput.type = 'number'; qtyInput.className = 'item-qty'; qtyInput.name = 'itemqty[]'; qtyInput.min = 1; qtyInput.value = line.qty || 1;
            tdQty.appendChild(qtyInput);
            const tdRate = document.createElement('td'); tdRate.setAttribute('data-label', 'Rate');
            const rateInput = document.createElement('input'); rateInput.type = 'number'; rateInput.className = 'item-rate'; rateInput.name = 'itemrate[]'; rateInput.readOnly = true; rateInput.value = line.rate || 0;
            tdRate.appendChild(rateInput);
            const tdAmt = document.createElement('td'); tdAmt.setAttribute('data-label', 'Amount');
            const amtInput = document.createElement('input'); amtInput.type = 'number'; amtInput.className = 'item-amount'; amtInput.name = 'itemamount[]'; amtInput.readOnly = true; amtInput.value = line.amount || 0;
            tdAmt.appendChild(amtInput);
            const tdAction = document.createElement('td'); tdAction.setAttribute('data-label', 'Action');
            const removeBtn = document.createElement('button'); removeBtn.type = 'button'; removeBtn.className = 'remove-line'; removeBtn.textContent = '✕';
            tdAction.appendChild(removeBtn);
            row.appendChild(tdItem);
            row.appendChild(tdDesc);
            row.appendChild(tdClass);
            row.appendChild(tdDept);
            row.appendChild(tdQty);
            const tdPriceLevel = document.createElement('td');
            tdPriceLevel.setAttribute('data-label', 'Price Level');
            const priceLevelSelect = document.createElement('select');
            priceLevelSelect.className = 'item-pricelevel';
            priceLevelSelect.name = 'itempricelevel[]';
            priceLevelSelect.innerHTML = `<option value="">Select Price Level</option>`;
            tdPriceLevel.appendChild(priceLevelSelect);
            fetch(baseUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "getItemPriceLevels",
                itemId: line.itemId
              })
            })
              .then(res => res.json())
              .then(data => {
                if (data.priceLevels) {
                  data.priceLevels.forEach(level => {
                    const opt = document.createElement('option');
                    opt.value = level.id;
                    opt.textContent = level.name;
                    opt.dataset.rate = level.rate;
                    if (String(level.id) === String(line.priceLevelId)) {
                      opt.selected = true;
                    }
                    priceLevelSelect.appendChild(opt);
                  });
                }
              });
            row.appendChild(tdPriceLevel);
            row.appendChild(tdRate);
            row.appendChild(tdAmt);
            row.appendChild(tdAction);
            tbody.appendChild(row);
            console.log('Browser-selected value for Line', lineIdx, ':', select.value, '=>', select.options[select.selectedIndex]?.textContent);
            attachRowEvents(row);
          });
          tbody.querySelectorAll('.line-row').forEach(row => attachRowEvents(row));
          updateTotals();
        }
        if (opp.salesTeam && Array.isArray(opp.salesTeam)) {
          defineSalesTeam(opp.salesTeam || []);
        }
        if (opp.subsidiary && opp.subsidiary !== 'null' && opp.subsidiary !== '') {
          const subsidiarySel = document.getElementById('subsidiary');
          let optionExists = false;
          for (let i = 0; i < subsidiarySel.options.length; i++) {
            if (subsidiarySel.options[i].value === opp.subsidiary) {
              optionExists = true;
              break;
            }
          }
          if (!optionExists) {
            const subsidiaryName = opp.subsidiaryName || 'Subsidiary ' + opp.subsidiary;
            const option = document.createElement('option');
            option.value = opp.subsidiary;
            option.text = subsidiaryName;
            subsidiarySel.appendChild(option);
          }
          subsidiarySel.value = opp.subsidiary;
          loadSubsidiaryDependents(opp.subsidiary)
            .then(() => {
              document.getElementById('department').value = opp.department || '';
              document.getElementById('class').value = opp.class || '';
              document.getElementById('location').value = opp.location || '';
              try {
                const rows = document.querySelectorAll('#itemTable tbody .line-row');
                rows.forEach((row, idx) => {
                  const sel = row.querySelector('.item-select');
                  const rateInput = row.querySelector('.item-rate');
                  const descInput = row.querySelector('.item-desc');
                  const qtyInput = row.querySelector('.item-qty');
                  const amtInput = row.querySelector('.item-amount');
                  const original = (opp.lines && opp.lines[idx]) ? opp.lines[idx] : null;
                  const targetId = original && original.itemId ? String(original.itemId) : '';
                  const classSelect = row.querySelector('.item-class');
                  if (classSelect) {
                    classSelect.innerHTML = '<option value="">Select Class</option>';
                    (window.latestItemsData.classes || []).forEach(cls => {
                      const opt = document.createElement('option');
                      opt.value = cls.id;
                      opt.textContent = cls.name;
                      if (String(cls.id) === String(original.classId)) opt.selected = true;
                      classSelect.appendChild(opt);
                    });
                  }

                  const deptSelect = row.querySelector('.item-dept');
                  if (deptSelect) {
                    deptSelect.innerHTML = '<option value="">Select Department</option>';
                    (window.latestItemsData.departments || []).forEach(dep => {
                      const opt = document.createElement('option');
                      opt.value = dep.id;
                      opt.textContent = dep.name;
                      if (String(dep.id) === String(original.departmentId)) opt.selected = true;
                      deptSelect.appendChild(opt);
                    });
                  }

                  if (!sel) return;
                  let matched = false;
                  for (let i = 0; i < sel.options.length; i++) {
                    if (String(sel.options[i].value) === targetId) {
                      sel.selectedIndex = i;
                      matched = true;
                      break;
                    }
                  }
                  if (!matched && targetId) {
                    const opt = document.createElement('option');
                    opt.value = targetId;
                    opt.textContent = original.itemName || ('Item ' + targetId);
                    if (original.rate !== undefined) opt.dataset.rate = original.rate;
                    if (original.desc) opt.dataset.desc = original.desc;
                    if (sel.options.length > 0) sel.insertBefore(opt, sel.options[1] || null);
                    sel.value = targetId;
                  }
                  const chosen = sel.selectedOptions && sel.selectedOptions[0];
                  const chosenRate = chosen ? (parseFloat(chosen.dataset.rate) || 0) : (original ? (parseFloat(original.rate) || 0) : 0);
                  const chosenDesc = chosen ? (chosen.dataset.desc || '') : (original ? (original.desc || '') : '');
                  if (rateInput) rateInput.value = chosenRate;
                  if (descInput) descInput.value = chosenDesc;
                  if (amtInput) {
                    const qty = qtyInput ? (parseFloat(qtyInput.value) || 0) : 0;
                    amtInput.value = (qty * chosenRate).toFixed(2);
                  }
                });
                updateTotals();
              } catch (restoreErr) {
                console.error('Error restoring item selections after subsidiary load:', restoreErr);
              }
            })
            .catch(err => {
              console.error('Error loading subsidiary dependents:', err);
            });
        } else {
          clearSubsidiaryDependents();
          document.getElementById('subsidiary').value = '';
        }
        closeAlertOpp();
        showSuccessAlert('Opportunity loaded successfully. Make your changes and click Update.');
      } else {
        showErrorAlert(data.error || 'Opportunity not found.');
      }
    })
    .catch(err => {
      console.error('Error loading opportunity:', err);
      showErrorAlert('Error loading opportunity. Please try again.');
    });
}

/**
 * Recalculate the amount for a given item row from qty and rate.
 * @param {HTMLTableRowElement} row - The item row element
 */
function updateItemAmount(row) {
  const qtyInput = row.querySelector(".item-qty");
  const rateInput = row.querySelector(".item-rate");
  const amountInput = row.querySelector(".item-amount");

  const qty = parseFloat(qtyInput.value) || 0;
  const rate = parseFloat(rateInput.value) || 0;

  amountInput.value = (qty * rate).toFixed(2);
  updateTotals();
}

/**
 * Recalculate grand total from all item amounts and render it.
 */
function updateTotals() {
  let total = 0;
  document.querySelectorAll(".item-amount").forEach(input => {
    total += parseFloat(input.value) || 0;
  });

  const totalField = document.getElementById("grandTotal");
  if (totalField) {
    totalField.textContent = total.toFixed(2);
  }
}

/**
 * Ensure a hidden input `opportunityId` exists and set its value.
 * @param {string} id - Opportunity ID to set
 */
function ensureHiddenOpportunityIdInput(id) {
  let hidden = document.getElementById('opportunityIdHidden');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'opportunityIdHidden';
    hidden.name = 'opportunityId';
    document.getElementById('opportunityform').appendChild(hidden);
  }
  hidden.value = id;
}

/**
 * Convert a FormData into a plain object. Handles `key[]` arrays.
 * @param {FormData} formData
 * @returns {Object}
 */
function formDataToJSON(formData) {
  const obj = {};
  formData.forEach((value, key) => {
    if (key.endsWith("[]")) {
      const cleanKey = key.replace("[]", "");
      if (!obj[cleanKey]) obj[cleanKey] = [];
      obj[cleanKey].push(value);
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

/**
 * Handle form submit: validate, gather items & sales team, send to server,
 * and display success/error messages.
 * @param {Event} event
 * @returns {Promise<boolean>}
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  closeAlertOpp();
  if (!validateForm() || !validateContribution()) {
    return false;
  }
  const mode = document.getElementById('operationMode').value;
  if (mode === 'update') {
    const oppId = document.getElementById('updateOpportunityId').value.trim();
    if (!oppId) {
      showErrorAlert('Please enter an Opportunity ID for update.');
      return false;
    }
  }
  try {
    const formEl = document.getElementById('opportunityform');
    const formData = new FormData(formEl);
    console.log('Initial Form Data:', Array.from(formData.entries()));
    console.log('Form Mode:', mode);
    console.log('formData if update):', formData);
    formData.append('mode', mode);
    if (mode === 'create') {
      formData.append('action', 'createOpportunity');
    }
    if (mode === 'update') {
      formData.set('action', 'updateOpportunity');
      formData.set('opportunityId', document.getElementById('updateOpportunityId').value);
    }
   
    const items = [];
    document.querySelectorAll('#itemTable tbody tr').forEach(row => {
      const itemIdEl = row.querySelector('.item-select') || row.querySelector('input[name="item[]"]');
      const priceLevelEl = row.querySelector('.item-pricelevel');
      const rateEl = row.querySelector('.item-rate');

      const itemObj = {
        id: itemIdEl ? itemIdEl.value : '',
        name: row.querySelector('.item-select option:checked')?.textContent ||
          row.querySelector('.item-name')?.value || '',
        desc: row.querySelector('.item-desc')?.value || '',
        qty: row.querySelector('.item-qty')?.value || 1,
        rate: rateEl ? rateEl.value : 0,
        amount: row.querySelector('.item-amount')?.value || 0,
        classId: row.querySelector('.item-class')?.value || '',
        departmentId: row.querySelector('.item-dept')?.value || '',
        priceLevel: priceLevelEl ? priceLevelEl.value : '',
      };

      if (itemObj.id) {
        items.push(itemObj);
      }
    });

    formData.append('items', JSON.stringify(items));
    console.log('Collecting Sales Team Rows');
    const salesTeam = [];
    document.querySelectorAll('#salesTeamTable tbody tr').forEach(row => {
      const roleId = row.querySelector('.salesrole-select')?.value || '';
      const employeeId = row.querySelector('.employee-select')?.value || '';
      const contribution = row.querySelector('.contribution')?.value || 0;
      const isPrimary = row.querySelector('.is-primary')?.checked || false;
      if (employeeId) {
        const memberObj = { roleId, employeeId, contribution, isPrimary };
        salesTeam.push(memberObj);
        console.debug('Collected Sales Team Member for payload:', memberObj);
      }
    });
    console.debug('Final salesTeam payload array:', salesTeam);
    formData.append('salesTeam', JSON.stringify(salesTeam));

    const jsonPayload = formDataToJSON(formData);

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(jsonPayload)
    });
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Invalid JSON from server:", e);
      showErrorAlert("Server returned invalid response.");
      return false;
    }
    console.log('Server Response:', data);
    if (data.success) {
      const action = mode === 'update' ? 'updated' : 'created';
      const successMsg = `Opportunity ${action} successfully (ID: ${data.opportunityId})`;
      showSuccessAlert(successMsg);
      if (mode === 'create') {
        const selectCache = [];
        formEl.querySelectorAll('select').forEach(s => {
          selectCache.push({ el: s, html: s.innerHTML, value: s.value });
        });
        formEl.querySelectorAll('input, textarea').forEach(el => {
          const type = el.type ? el.type.toLowerCase() : '';
          if (type === 'hidden' || type === 'button' || type === 'submit' || type === 'reset') return;
          if (type === 'checkbox' || type === 'radio') {
            el.checked = false;
          } else {
            el.value = '';
          }
        });
        selectCache.forEach(cache => {
          try {
            cache.el.innerHTML = cache.html;
            cache.el.value = cache.value || '';
          } catch (err) {
            console.warn('Unable to restore select from cache', err);
          }
        });
        handleModeChange();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      let errorMsg = data.message || 'An error occurred while saving the opportunity.';
      if (errorMsg.toLowerCase().includes('required') ||
        errorMsg.toLowerCase().includes('mandatory') ||
        errorMsg.toLowerCase().includes('invalid') ||
        errorMsg.toLowerCase().includes('duplicate')) {
        showErrorAlert(errorMsg);
      } else {
        console.error('Server Error:', data.message);
        showErrorAlert('Unable to save opportunity. Please try again or contact support.');
      }
    }
  } catch (err) {
    console.error('Network/Client Error:', err);
    showErrorAlert('Unable to save opportunity. Please try again or contact support.');
  }
  return false;
}

/**
 * Load subsidiary-dependent lists (classes, departments, items, locations)
 * and populate related dropdowns on the form.
 * @param {string} subsidiaryId - Subsidiary identifier to fetch dependents for
 * @returns {Promise<void>}
 */
async function loadSubsidiaryDependents(subsidiaryId) {
  try {
    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getSubsidiaryDependents",
        subsidiaryId: subsidiaryId
      })
    });
    const data = await resp.json();
    const fillSelect = (id, arr, placeholder) => {
      const el = document.getElementById(id);
      if (el && Array.isArray(arr)) {
        el.innerHTML = `<option value="">${placeholder}</option>`;
        arr.forEach(item => {
          el.innerHTML += `<option value="${item.id}">${item.name}</option>`;
        });
      }
    };
    window.latestItemsData = window.latestItemsData || {};
    window.latestItemsData.items = data.items || [];
    fillSelect('department', data.departments || [], 'Select Department');
    fillSelect('location', data.locations || [], 'Select Location');
    fillSelect('class', data.classes || [], 'Select Class');
    if (Array.isArray(data.items)) {
      document.querySelectorAll('.item-select').forEach(select => {
        select.innerHTML = '<option value="">Select Item</option>';
        data.items.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id;
          opt.textContent = item.name;
          opt.dataset.rate = item.rate || 0;
          opt.dataset.desc = item.type || item.desc || '';
          select.appendChild(opt);
        });
      });
    }
    document.querySelectorAll('.item-class').forEach(select => {
      select.innerHTML = '<option value="">Select Class</option>';
      (data.classes || []).forEach(cls => {
        const opt = document.createElement('option');
        opt.value = cls.id;
        opt.textContent = cls.name;
        select.appendChild(opt);
      });
    });

    document.querySelectorAll('.item-dept').forEach(select => {
      select.innerHTML = '<option value="">Select Department</option>';
      (data.departments || []).forEach(dep => {
        const opt = document.createElement('option');
        opt.value = dep.id;
        opt.textContent = dep.name;
        select.appendChild(opt);
      });
    });
  } catch (err) {
    console.error('Error loading subsidiary dependents:', err);
    clearSubsidiaryDependents();
  }
}

/**
 * Reset subsidiary-dependent selects to their default placeholder option.
 */
function clearSubsidiaryDependents() {
  const fillSelect = (id, placeholder) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<option value="">${placeholder}</option>`;
    }
  };
  fillSelect('department', 'Select Department');
  fillSelect('location', 'Select Location');
  fillSelect('class', 'Select Class');
  document.querySelectorAll('.item-select').forEach(select => {
    select.innerHTML = '<option value="">Select Item</option>';
  });
}

/**
 * Attach event listeners to an item row: qty/rate input changes and remove.
 * @param {HTMLTableRowElement} row - The item row element
 */
function attachRowEvents(row) {
  const qtyInput = row.querySelector('.item-qty');
  const rateInput = row.querySelector('.item-rate');
  const amountInput = row.querySelector('.item-amount');
  const removeBtn = row.querySelector('.remove-line');

  function calculateAmount() {
    const qty = parseFloat(qtyInput?.value || 0);
    const rate = parseFloat(rateInput?.value || 0);
    if (amountInput) amountInput.value = (qty * rate).toFixed(2);
    updateTotals();
  }
  if (qtyInput) qtyInput.addEventListener('input', calculateAmount);
  if (rateInput) rateInput.addEventListener('input', calculateAmount);
  if (removeBtn) {
    removeBtn.addEventListener('click', function () {
      row.remove();
      updateTotals();
      evaluatePanelsVisibility();
    });
  }
}

/**
 * Attach event listeners to a sales-team row: remove, employee change,
 * contribution validation, and primary toggling.
 * @param {HTMLTableRowElement} row - The sales team row element
 */
function attachSalesTeamRowEvents(row) {
  const removeBtn = row.querySelector('.remove-st-line');
  const employeeSel = row.querySelector('.employee-select');
  const primaryChk = row.querySelector('.is-primary');
  const contribution = row.querySelector('.contribution');
  if (removeBtn) {
    removeBtn.addEventListener('click', function () {
      row.remove();
      evaluatePanelsVisibility();
    });
  }
  if (employeeSel) {
    employeeSel.addEventListener('change', evaluatePanelsVisibility);
  }
  if (contribution) {
    contribution.addEventListener('input', function (e) {
      validateContribution(e);
      if (e.target.value === '') return;
      if (Number(e.target.value) < 0) e.target.value = 0;
      if (Number(e.target.value) > 100) e.target.value = 100;
    });
  }
  if (primaryChk) {
    primaryChk.addEventListener('change', function () {
      if (primaryChk.checked) {
        document.querySelectorAll('.is-primary').forEach(chk => {
          if (chk !== primaryChk) chk.checked = false;
        });
      }
    });
  }
}

/**
 * Render sales team member rows from provided member data array.
 * @param {Array<Object>} members - Array of sales team member objects
 */
function defineSalesTeam(members) {
  try {
    const tbody = document.querySelector('#salesTeamTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const roles = (window.latestItemsData && window.latestItemsData.salesRoles) || [];
    const emps = (window.latestItemsData && window.latestItemsData.employees) || [];
    members.forEach((m, idx) => {
      const row = document.createElement('tr');
      row.classList.add('st-line-row');
      const roleSel = document.createElement('select'); roleSel.name = 'role[]'; roleSel.className = 'salesrole-select';
      roleSel.innerHTML = '<option value="">Select Role</option>';
      roles.forEach(r => { const o = document.createElement('option'); o.value = r.id; o.text = r.name; roleSel.appendChild(o); });
      if (m.roleId) {
        let found = false; for (let i = 0; i < roleSel.options.length; i++) { if (String(roleSel.options[i].value) === String(m.roleId)) { found = true; break; } }
        if (!found) { const o = document.createElement('option'); o.value = m.roleId; o.text = m.roleText || m.roleId; roleSel.insertBefore(o, roleSel.options[1] || null); }
        roleSel.value = m.roleId;
      }
      const empSel = document.createElement('select'); empSel.name = 'employee[]'; empSel.className = 'employee-select';
      empSel.innerHTML = '<option value="">Select Employee</option>';
      emps.forEach(e => { const o = document.createElement('option'); o.value = e.id; o.text = e.name; empSel.appendChild(o); });
      if (m.employeeId) {
        let foundE = false; for (let i = 0; i < empSel.options.length; i++) { if (String(empSel.options[i].value) === String(m.employeeId)) { foundE = true; break; } }
        if (!foundE) { const o = document.createElement('option'); o.value = m.employeeId; o.text = m.employeeText || m.employeeId; empSel.insertBefore(o, empSel.options[1] || null); }
        empSel.value = m.employeeId;
      }
      const primary = document.createElement('input'); primary.type = 'checkbox'; primary.name = 'primary[]'; primary.className = 'is-primary'; if (m.isPrimary) primary.checked = true;
      const contribution = document.createElement('input'); contribution.type = 'number'; contribution.name = 'contribution[]'; contribution.className = 'contribution'; contribution.min = 0; contribution.max = 100; contribution.value = (m.contribution != null) ? m.contribution : 0;
      const removeBtn = document.createElement('button'); removeBtn.type = 'button'; removeBtn.className = 'remove-st-line'; removeBtn.textContent = '✕';
      const tdRole = document.createElement('td'); tdRole.setAttribute('data-label', 'Sales Role'); tdRole.appendChild(roleSel);
      const tdEmp = document.createElement('td'); tdEmp.setAttribute('data-label', 'Employee'); tdEmp.appendChild(empSel);
      const tdPrimary = document.createElement('td'); tdPrimary.setAttribute('data-label', 'Primary'); tdPrimary.appendChild(primary);
      const tdContrib = document.createElement('td'); tdContrib.setAttribute('data-label', 'Contribution'); tdContrib.appendChild(contribution);
      const tdAction = document.createElement('td'); tdAction.setAttribute('data-label', 'Action'); tdAction.appendChild(removeBtn);
      row.appendChild(tdRole); row.appendChild(tdEmp); row.appendChild(tdPrimary); row.appendChild(tdContrib); row.appendChild(tdAction);
      tbody.appendChild(row);
      removeBtn.addEventListener('click', function () { row.remove(); evaluatePanelsVisibility(); });
      contribution.addEventListener('input', function (e) { if (e.target.value === '') return; if (Number(e.target.value) < 0) e.target.value = 0; if (Number(e.target.value) > 100) e.target.value = 100; });
      primary.addEventListener('change', function () { if (primary.checked) { document.querySelectorAll('#salesTeamTable .is-primary').forEach(chk => { if (chk !== primary) chk.checked = false; }); } });
    });
    document.querySelectorAll('#salesTeamTable .st-line-row').forEach(row => attachSalesTeamRowEvents(row));
    console.debug('defineSalesTeam rendered rows count:', members.length);
  } catch (e) {
    console.error('defineSalesTeam failed', e);
  }
}

/**
 * Decide whether the Items or Sales Team panel should be active based on
 * whether rows exist/selections have been made.
 */
function evaluatePanelsVisibility() {
  const anyItemSelected = Array.from(document.querySelectorAll('.item-select')).some(s => s && s.value && String(s.value).trim() !== '');
  const anySalesEmpSelected = Array.from(document.querySelectorAll('.employee-select')).some(s => s && s.value && String(s.value).trim() !== '');
  if (anyItemSelected && !anySalesEmpSelected) {
    setActiveTile(true);
  } else if (anySalesEmpSelected && !anyItemSelected) {
    setActiveTile(false);
  }
}

/**
 * Set which tile is active (Items or Sales Team).
 * @param {boolean} isItems - True to activate Items panel, false for Sales Team
 */
function setActiveTile(isItems) {
  const tileItems = document.getElementById('tileItems');
  const tileSales = document.getElementById('tileSalesTeam');
  const itemsPanel = document.getElementById('itemsPanel');
  const salesPanel = document.getElementById('salesTeamPanel');
  
  if (isItems) {
    tileItems.classList.add('btn-primary'); tileItems.classList.remove('btn-secondary');
    tileSales.classList.remove('btn-primary'); tileSales.classList.add('btn-secondary');
    itemsPanel.style.display = '';
    salesPanel.style.display = 'none';
  } else {
    tileSales.classList.add('btn-primary'); tileSales.classList.remove('btn-secondary');
    tileItems.classList.remove('btn-primary'); tileItems.classList.add('btn-secondary');
    salesPanel.style.display = '';
    itemsPanel.style.display = 'none';
  }
}

/**
 * Helper function to add a new sales team row
 */
function addSalesTeamRow() {
  const tbody = document.querySelector('#salesTeamTable tbody');
  const newRow = document.createElement('tr');
  newRow.classList.add('st-line-row');
  newRow.innerHTML = `
    <td><select name="role[]" class="salesrole-select"><option value="">Select Role</option></select></td>
    <td><select name="employee[]" class="employee-select"><option value="">Select Employee</option></select></td>
    <td><input type="checkbox" name="primary[]" class="is-primary" /></td>
    <td><input type="number" name="contribution[]" class="contribution" value="0" min="0" max="100" /></td>
    <td><button type="button" class="remove-st-line">✕</button></td>`;
  tbody.appendChild(newRow);
  if (window.latestItemsData) {
    const teams = window.latestItemsData.salesTeams || [];
    const roles = window.latestItemsData.salesRoles || [];
    const emps = window.latestItemsData.employees || [];
    const roleSel = newRow.querySelector('.salesrole-select');
    roles.forEach(r => { const o = document.createElement('option'); o.value = r.id; o.text = r.name; roleSel.appendChild(o); });
    const empSel = newRow.querySelector('.employee-select');
    emps.forEach(e => { const o = document.createElement('option'); o.value = e.id; o.text = e.name; empSel.appendChild(o); });
  }
  attachSalesTeamRowEvents(newRow);
}

/**
 * Setup event listeners for item selection and price level changes
 */
function setupItemEventListeners() {
  document.addEventListener("change", function (e) {
    if (!e.target.classList.contains("item-select")) return;
    const row = e.target.closest("tr");
    const itemId = e.target.value;
    if (!itemId) return;
    fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getItemPriceLevels",
        itemId: itemId
      })
    })
      .then(res => res.json())
      .then(data => {
        const priceLevelSelect = row.querySelector(".item-pricelevel");
        const rateInput = row.querySelector(".item-rate");
        priceLevelSelect.innerHTML = '<option value="">Select Price Level</option>';
        (data.priceLevels || []).forEach(level => {
          const option = document.createElement("option");
          option.value = level.id;
          option.textContent = level.name;
          option.dataset.rate = level.rate;
          priceLevelSelect.appendChild(option);
        });
        rateInput.value = "";
        rateInput.setAttribute("readonly", "readonly");
      })
      .catch(err => console.error("Error loading price levels:", err));
  });

  document.addEventListener("change", function (e) {
    if (!e.target.classList.contains("item-pricelevel")) return;
    const row = e.target.closest("tr");
    const selectedOption = e.target.selectedOptions[0];
    const rateInput = row.querySelector(".item-rate");
    if (selectedOption) {
      const isCustom = selectedOption.textContent.trim().toLowerCase() === "custom";
      if (isCustom) {
        rateInput.value = "";
        rateInput.removeAttribute("readonly"); 
      } else {
        const rate = parseFloat(selectedOption.dataset.rate) || 0;
        rateInput.value = rate;
        rateInput.setAttribute("readonly", "readonly"); 
      }
    }
    updateItemAmount(row);
  });
}

/**
 * Setup company change listener for subsidiary auto-selection
 */
function setupCompanyChangeListener() {
  const companySelect = document.getElementById('company');
  if (!companySelect) return;
  
  companySelect.addEventListener('change', async function () {
    const companyId = this.value;
    if (!companyId) return;
    const selectedOption = this.options[this.selectedIndex];
    const selectedType = selectedOption ? selectedOption.getAttribute('data-type') : null;
    const el = document.getElementById('subsidiary');
    el.innerHTML = "";
    if (selectedType && selectedType !== 'customer' && selectedType !== 'prospect') {
      el.innerHTML = '<option value="">Select Subsidiary</option>';
      el.parentElement.classList.remove('error');
      closeAlertOpp();
      return;
    }
    try {
      const resp = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getSubsidiary",
          customerId: companyId
        })
      });
      const data = await resp.json();
      if (data && data.hasSubsidiary === true && data.subsidiaryActive === true) {
        const displayName = data.subsidiaryName || data.subsidiaryId;
        el.innerHTML = `<option value="${data.subsidiaryId}">${displayName}</option>`;
        el.value = data.subsidiaryId;
        el.parentElement.classList.remove('error');
        closeAlertOpp();
        loadSubsidiaryDependents(data.subsidiaryId);
      } else {
        el.innerHTML = '<option value="">No subsidiary found</option>';
        el.parentElement.classList.remove('error');
        closeAlertOpp();
        clearSubsidiaryDependents();
      }
    } catch (err) {
      console.error('Error auto‑selecting subsidiary:', err);
      el.innerHTML = '<option value="">Select Subsidiary</option>';
      el.parentElement.classList.remove('error');
      closeAlertOpp();
      clearSubsidiaryDependents();
    }
  });
}

/**
 * Setup item selection and row update listeners
 */
function setupItemRowUpdateListeners() {
  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('item-select')) {
      const row = e.target.closest('tr');
      if (!row) return;
      const rateInput = row.querySelector('.item-rate');
      const descInput = row.querySelector('.item-desc');
      const selectedOption = e.target.selectedOptions[0];
      const rate = selectedOption ? (parseFloat(selectedOption.dataset.rate) || 0) : 0;
      if (rateInput) rateInput.value = rate;
      if (descInput && selectedOption) {
        descInput.value = selectedOption.dataset.desc || '';
      }
      const qtyInput = row.querySelector('.item-qty');
      const amountInput = row.querySelector('.item-amount');
      const qty = qtyInput ? (parseFloat(qtyInput.value) || 0) : 0;
      if (amountInput) amountInput.value = (qty * rate).toFixed(2);
      updateTotals();
    }
    if (e.target.classList && e.target.classList.contains('item-select')) {
      evaluatePanelsVisibility();
    }
    if (e.target.classList && e.target.classList.contains('employee-select')) {
      evaluatePanelsVisibility();
    }
  });
}

/**
 * Setup add line button listener
 */
function setupAddLineButtonListener() {
  const addBtn = document.getElementById('addLineBtn');
  if (!addBtn) return;
  
  addBtn.addEventListener('click', function () {
    const tableBody = document.querySelector('#itemTable tbody');
    const newRow = document.createElement('tr');
    newRow.classList.add('line-row');
    newRow.innerHTML = `
      <td><select name="item[]" class="item-select"><option value="">Select Item</option></select></td>
      <td><textarea name="itemdesc[]" class="item-desc" rows="4"></textarea></td>
      <td><select name="itemclass[]" class="item-class"></select></td>
      <td><select name="itemdept[]" class="item-dept"></select></td>
      <td><input type="number" name="itemqty[]" class="item-qty" value="1" min="1"></td>
      <td><select name="itempricelevel[]" class="item-pricelevel"><option value="">Select Price Level</option></select></td>
      <td><input type="number" name="itemrate[]" class="item-rate" readonly></td>
      <td><input type="number" name="itemamount[]" class="item-amount" readonly></td>
      <td><button type="button" class="remove-line">✕</button></td>`;
    tableBody.appendChild(newRow);
    attachRowEvents(newRow);
    const classSelect = newRow.querySelector('.item-class');
    classSelect.innerHTML = '<option value="">Select Class</option>';
    (window.latestItemsData.classes || []).forEach(cls => {
      const opt = document.createElement('option');
      opt.value = cls.id;
      opt.textContent = cls.name;
      classSelect.appendChild(opt);
    });
    const itempricelevelSelect = newRow.querySelector('.item-pricelevel');
    itempricelevelSelect.innerHTML = '<option value="">Select Price Level</option>';

    const deptSelect = newRow.querySelector('.item-dept');
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    (window.latestItemsData.departments || []).forEach(dep => {
      const opt = document.createElement('option');
      opt.value = dep.id;
      opt.textContent = dep.name;
      deptSelect.appendChild(opt);
    });

    if (window.latestItemsData && Array.isArray(window.latestItemsData.items)) {
      const select = newRow.querySelector('.item-select');
      select.innerHTML = '<option value="">Select Item</option>';
      window.latestItemsData.items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.name;
        opt.dataset.rate = item.rate || 0;
        opt.dataset.desc = item.desc || '';
        select.appendChild(opt);
      });
    }
    updateTotals();
  });
}

/**
 * Setup add sales team button listener
 */
function setupAddSalesTeamButtonListener() {
  const addStBtnBottom = document.getElementById('addSalesTeamBtnBottom');
  if (!addStBtnBottom) return;
  
  addStBtnBottom.addEventListener('click', function () {
    addSalesTeamRow();
  });
}

/**
 * Setup tile button listeners for Items and Sales Team panels
 */
function setupTileButtonListeners() {
  const tileItems = document.getElementById('tileItems');
  const tileSales = document.getElementById('tileSalesTeam');

  if (tileItems) tileItems.addEventListener('click', function () { setActiveTile(true); });
  if (tileSales) tileSales.addEventListener('click', function () { setActiveTile(false); });
}

/**
 * Setup form submit listener for row reordering
 */
function setupFormSubmitListener() {
  const form = document.querySelector("form");
  if (!form) return;
  
  form.addEventListener("submit", function () {
    const tbody = document.querySelector("#itemTable tbody");
    const rows = Array.from(tbody.querySelectorAll(".line-row"));
    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));
    try {
      const rowValues = rows.map(r => {
        const sel = r.querySelector('.item-select');
        if (sel) return sel.value || '';
        const hidden = r.querySelector('input[name="item[]"]');
        return hidden ? (hidden.value || '') : '';
      });
      console.log('Submitting rows in order:', rowValues);
    } catch (logErr) {
      console.warn('Unable to log row values before submit', logErr);
    }
  });
}

/**
 * Setup initial line row event listeners
 */
function setupInitialLineRowListeners() {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#itemTable .line-row').forEach(row => attachRowEvents(row));
  });
}

/**
 * Setup navigation link listeners
 */
function setupNavigationListeners() {
  document.addEventListener('DOMContentLoaded', function () {
    const home = document.getElementById('homeLink');
    const upload = document.getElementById('uploadLink');
    const logout = document.getElementById('logoutLink');
    const goHome = function (e) {
      if (e) e.preventDefault();
      window.location.href = '/';
    };
    if (home) home.addEventListener('click', goHome);
    if (upload) upload.addEventListener('click', goHome);
    if (logout) logout.addEventListener('click', goHome);
  });
}

/**
 * Initialize all event listeners for the opportunity form
 */
function initializeOpportunityFormListeners() {
  setupItemEventListeners();
  setupCompanyChangeListener();
  setupItemRowUpdateListeners();
  setupAddLineButtonListener();
  setupAddSalesTeamButtonListener();
  setupTileButtonListeners();
  setupFormSubmitListener();
  setupInitialLineRowListeners();
  setupNavigationListeners();
}

// End of Opportunity Layout Functions




// =====================================================
// ESTIMATE DETAILS PAGE - HELPER FUNCTIONS
// =====================================================

/**
 * Display loader with optional text
 */
function showLoader(text = "Loading…") {
    const loader = document.getElementById("pageLoader");
    if (!loader) return;

    loader.querySelector("span").innerText = text;
    loader.classList.remove("hidden");
    loader.classList.add("flex");
}

/**
 * Hide loader and show main content
 */
function hideLoader() {
    const loader = document.getElementById("pageLoader");
    const content = document.getElementById("mainContainer");

    if (loader) {
        loader.classList.add("hidden");
        loader.classList.remove("flex");
    }
    if (content) {
        content.classList.remove("hidden");
    }
}

/**
 * Format NetSuite date (MM/DD/YYYY) to input date format (YYYY-MM-DD)
 */
function formatDateForInput(nsDate) {
    if (!nsDate) return "";
    const parts = nsDate.split("/");
    if (parts.length !== 3) return "";
    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
}

/**
 * Populate header fields with estimate data
 */
function populateHeaderFields(header) {
    document.getElementById("est-name").innerText = header.entity || "";
    document.getElementById("est-date").value = formatDateForInput(header.trandate) || "";
    document.getElementById("est-title").value = header.title || "";
    document.getElementById("est-expires").value = formatDateForInput(header.expirationDate) || "";
    document.getElementById("est-expclose").value = formatDateForInput(header.expectedCloseDate) || "";
    document.getElementById("est-memo").value = header.memo || "";
    document.getElementById("est-project-summary").value = header.projectSummary || "";
    document.getElementById("sales-rep").innerText = header.salesRep || "";
    document.getElementById("opportunity").innerText = header.opportunity || "";
    document.getElementById("subsidiary").innerText = header.subsidiary || "";
}

/**
 * Populate job dropdown
 */
function populateJobDropdown(jobs = [], selectedJobId = "") {
    const select = document.getElementById("est-job-id");
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    select.appendChild(blank);

    jobs.forEach(job => {
        const opt = document.createElement("option");
        opt.value = job.id;
        opt.textContent = job.name;
        if (String(job.id) === String(selectedJobId)) opt.selected = true;
        select.appendChild(opt);
    });
}

/**
 * Populate status dropdown
 */
function populateStatusDropdown(selectedStatus = "") {
    const statuses = [
        { id: 14, text: "Closed Lost" },
        { id: 17, text: "Qualified Prospect" },
        { id: 8,  text: "In Discussion" },
        { id: 9,  text: "Identified Decision Makers" },
        { id: 10, text: "Proposal" },
        { id: 11, text: "In Negotiation" },
        { id: 12, text: "Purchasing" }
    ];
    const select = document.getElementById("est-status");
    select.innerHTML = "";

    statuses.forEach(status => {
        const opt = document.createElement("option");
        opt.value = status.id;
        opt.textContent = status.text;
        if (selectedStatus.trim().toLowerCase() === status.text.trim().toLowerCase()) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

/**
 * Populate lead source dropdown
 */
function populateLeadSourceDropdown(leadSources = [], selectedLeadSourceId = "") {
    const select = document.getElementById("lead-source");
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    select.appendChild(blank);

    leadSources.forEach(source => {
        const opt = document.createElement("option");
        opt.value = source.id;
        opt.textContent = source.title;
        if (String(source.id) === String(selectedLeadSourceId)) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

/**
 * Populate forecast type dropdown
 */
function populateForecastTypeDropdown(selectedForecast = "") {
    const forecastTypes = [
        { id: 0, text: "Omitted" },
        { id: 1, text: "Worst Case" },
        { id: 2, text: "Most Likely" },
        { id: 3, text: "Upside" }
    ];
    const select = document.getElementById("forecast-type");
    select.innerHTML = "";
    
    forecastTypes.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type.id;
        opt.textContent = type.text;
        if (selectedForecast.trim().toLowerCase() === type.text.trim().toLowerCase()) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

/**
 * Populate partner dropdown
 */
function populatePartnerDropdown(partners = [], selectedPartnerId = "") {
    const select = document.getElementById("partner");
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    select.appendChild(blank);

    partners.forEach(partner => {
        const opt = document.createElement("option");
        opt.value = partner.id;
        opt.textContent = partner.name;
        if (String(partner.id) === String(selectedPartnerId)) opt.selected = true;
        select.appendChild(opt);
    });
}

/**
 * Populate class dropdown
 */
function populateClassDropdown(classData = {}) {
    const select = document.getElementById("est-class");
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    if (!classData.selectedClassId) blank.selected = true;
    select.appendChild(blank);

    classData.classes?.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        if (String(c.id) === String(classData.selectedClassId)) opt.selected = true;
        select.appendChild(opt);
    });
}

/**
 * Populate department dropdown
 */
function populateDepartmentDropdown(departmentData = {}) {
    const select = document.getElementById("est-department");
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    if (!departmentData.selectedDepartmentId) blank.selected = true;
    select.appendChild(blank);

    departmentData.departments?.forEach(dep => {
        const opt = document.createElement("option");
        opt.value = dep.id;
        opt.textContent = dep.name;
        if (String(dep.id) === String(departmentData.selectedDepartmentId)) opt.selected = true;
        select.appendChild(opt);
    });
}

/**
 * Populate location dropdown
 */
function populateLocationDropdown(locationData = {}) {
    const select = document.getElementById("est-location");
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    if (!locationData.selectedLocationId) blank.selected = true;
    select.appendChild(blank);

    locationData.locations?.forEach(loc => {
        const opt = document.createElement("option");
        opt.value = loc.id;
        opt.textContent = loc.name;
        if (String(loc.id) === String(locationData.selectedLocationId)) opt.selected = true;
        select.appendChild(opt);
    });
}

/**
 * Create item dropdown for line items
 */
function createItemDropdown(itemList = [], selectedItemId = "") {
    const select = document.createElement("select");
    select.className = "line-item-select border border-[#95a2a0] p-1 rounded w-full text-xsm";
    select.disabled = true;
    const blank = document.createElement("option");
    blank.value = "";
    if (!selectedItemId) blank.selected = true;
    select.appendChild(blank);

    itemList.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        if (String(item.id) === String(selectedItemId)) opt.selected = true;
        select.appendChild(opt);
    });
    return select;
}

/**
 * Create class dropdown for line items
 */
function createClassDropdown(classList = [], selectedClassId = "") {
    const select = document.createElement("select");
    select.className = "border border-[#95a2a0] p-1 rounded w-full text-xsm";
    select.disabled = true;
    const blank = document.createElement("option");
    blank.value = "";
    if (!selectedClassId) blank.selected = true;
    select.appendChild(blank);

    classList.forEach(cls => {
        const opt = document.createElement("option");
        opt.value = cls.id;
        opt.textContent = cls.name;
        if (String(cls.id) === String(selectedClassId)) opt.selected = true;
        select.appendChild(opt);
    });
    return select;
}

/**
 * Create department dropdown for line items
 */
function createDepartmentDropdown(deptList = [], selectedDeptId = "") {
    const select = document.createElement("select");
    select.className = "border border-[#95a2a0] p-1 rounded w-full text-xsm";
    select.disabled = true;
    const blank = document.createElement("option");
    blank.value = "";
    if (!selectedDeptId) blank.selected = true;
    select.appendChild(blank);

    deptList.forEach(dep => {
        const opt = document.createElement("option");
        opt.value = dep.id;
        opt.textContent = dep.name;
        if (String(dep.id) === String(selectedDeptId)) opt.selected = true;
        select.appendChild(opt);
    });
    return select;
}

/**
 * Create unit dropdown for line items
 */
function createUnitDropdown(unitList = [], selectedUnitId = "") {
    const select = document.createElement("select");
    select.className = "border border-[#95a2a0] p-1 rounded w-full text-xsm";
    select.disabled = true;
    const blank = document.createElement("option");
    blank.value = "";
    select.appendChild(blank);

    unitList.forEach(uom => {
        if (!uom || !uom.id) return;
        const opt = document.createElement("option");
        opt.value = String(uom.id);
        opt.textContent = uom.name;
        if (String(uom.id) === String(selectedUnitId)) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
    return select;
}

/**
 * Create price level dropdown for line items
 */
function createPriceLevelDropdown(priceLevels = [], selectedPriceLevelId = "") {
    const select = document.createElement("select");
    select.className = "border border-[#95a2a0] p-1 rounded w-full text-xsm";
    select.disabled = true;

    const customOpt = document.createElement("option");
    customOpt.value = "-1";
    customOpt.textContent = "Custom";
    if (String(selectedPriceLevelId) === "-1") {
        customOpt.selected = true;
    }
    select.appendChild(customOpt);

    priceLevels.forEach(pl => {
        const opt = document.createElement("option");
        opt.value = String(pl.id);
        opt.textContent = pl.name;
        opt.dataset.rate = pl.rate;

        if (String(pl.id) === String(selectedPriceLevelId)) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    return select;
}

/**
 * Create sales rep dropdown for sales team
 */
function createSalesRepDropdown(repList = [], selectedEmployeeId = "") {
    const select = document.createElement("select");
    select.className = "border border-[#95a2a0] p-1 rounded w-full text-xsm";
    select.disabled = true;
    const blank = document.createElement("option");
    blank.value = "";
    if (!selectedEmployeeId) blank.selected = true;
    select.appendChild(blank);

    repList.forEach(rep => {
        const opt = document.createElement("option");
        opt.value = rep.id;
        opt.textContent = rep.name;
        if (String(rep.id) === String(selectedEmployeeId)) opt.selected = true;
        select.appendChild(opt);
    });
    return select;
}

/**
 * Create sales role dropdown for sales team
 */
function createSalesRoleDropdown(roleList = [], selectedRoleId = "") {
    const select = document.createElement("select");
    select.className = "border border-[#95a2a0] p-1 rounded w-full text-xsm";
    select.disabled = true;
    const blank = document.createElement("option");
    blank.value = "";
    if (!selectedRoleId) blank.selected = true;
    select.appendChild(blank);

    roleList.forEach(role => {
        const opt = document.createElement("option");
        opt.value = role.id;
        opt.textContent = role.name;
        if (String(role.id) === String(selectedRoleId)) opt.selected = true;
        select.appendChild(opt);
    });
    return select;
}

/**
 * Set edit mode for form fields
 */
function setEditMode(isEdit) {
    const editableFields = document.querySelectorAll("input, select, textarea");
    editableFields.forEach(field => {
        field.disabled = !isEdit;
    });
    document.querySelectorAll("#itemsTableBody select").forEach(sel => {
        sel.disabled = !isEdit ? true : false;
    });
    document.querySelectorAll("#itemsTableBody tr").forEach(row => {
        const amountInput = row.querySelector("td:nth-child(7) input");
        if (amountInput) {
            amountInput.readOnly = true;
        }
    });
    document.querySelectorAll("#salesTeamTableBody select").forEach(sel => {
        sel.disabled = !isEdit ? true : false;
    });

    document.getElementById("editButton").classList.toggle("hidden", isEdit);
    document.getElementById("editActions").classList.toggle("hidden", !isEdit);
}

/**
 * Log and return current estimate form data
 */
function logEstimateFormData() {
    const logOutput = {};
    logOutput.Header = {
        "Quote #": document.querySelector(".est-number")?.innerText || "",
        "Transaction Date": document.getElementById("est-date")?.value || "",
        "Customer Name": document.getElementById("est-custname")?.innerText || "",
        "Company": document.getElementById("est-name")?.innerText || "",
        "Title": document.getElementById("est-title")?.value || "",
        "Memo": document.getElementById("est-memo")?.value || "",
        "Project Summary": document.getElementById("est-project-summary")?.value || "",
        "Expected Close Date": document.getElementById("est-expclose")?.value || "",
        "Expiration Date": document.getElementById("est-expires")?.value || "",
        "Status": document.getElementById("est-status")?.value || "",
        "Job": document.getElementById("est-job-id")?.selectedOptions?.[0]?.text || "",
        "Class": document.getElementById("est-class")?.value || "", 
        "Department": document.getElementById("est-department")?.value || "", 
        "Location": document.getElementById("est-location")?.value || "", 
        "Lead Source": document.getElementById("lead-source")?.value || "", 
        "Forecast Type": document.getElementById("forecast-type")?.value || "", 
        "Partner": document.getElementById("partner")?.value || "", 
        "Sales Rep": document.getElementById("sales-rep")?.innerText || "",
        "Opportunity": document.getElementById("opportunity")?.innerText || "",
        "Subsidiary": document.getElementById("subsidiary")?.innerText || ""
    };

    const itemRows = document.querySelectorAll("#itemsTableBody tr");
    const items = [];
    itemRows.forEach((row, index) => {
        const priceSelect = row.querySelector("td:nth-child(5) select");
        const selectedPriceOpt = priceSelect?.selectedOptions?.[0];
        items.push({
            "Line #": index + 1,
            "Item": row.querySelector("td:nth-child(1) select")?.value || "",
            "Item Name": row.querySelector("td:nth-child(1) select")?.selectedOptions?.[0]?.text || "",
            "Item ID": row.querySelector("td:nth-child(1) select")?.value || "",
            "Quantity": row.querySelector("td:nth-child(2) input")?.value || "",
            "Units": row.querySelector("td:nth-child(3) select")?.value || "",
            "Description": row.querySelector("td:nth-child(4) textarea")?.value || "",
            "Rate": row.querySelector(".rateCell input")?.value || "",
            "Amount": row.querySelector(".amountCell input")?.value || "0.00",
            "Class": row.querySelector(".classCell select")?.value || "",
            "Department": row.querySelector(".deptCell select")?.value || "",
            "PriceLevel": row.querySelector("td:nth-child(5) select")?.value || "-1",
            "PriceLevelName": row.querySelector("td:nth-child(5) select")?.selectedOptions?.[0]?.text || "Custom"
        });

    });
    logOutput.LineItems = items;

    const salesRows = document.querySelectorAll("#salesTeamTableBody tr");
    const salesTeam = [];
    salesRows.forEach((row, index) => {
        const empSelect = row.querySelector("td:nth-child(1) select");
        const roleSelect = row.querySelector("td:nth-child(2) select");
        const primaryCheckbox = row.querySelector("td:nth-child(3) input[type='checkbox']");
        const contributionInput = row.querySelector("td:nth-child(4) input");

        salesTeam.push({
            "Line #": index + 1,
            "Employee": empSelect?.selectedOptions?.[0]?.text || "",
            "Employee ID": empSelect?.value || "",
            "Role": roleSelect?.selectedOptions?.[0]?.text || "",
            "Role ID": roleSelect?.value || "",
            "Primary": primaryCheckbox?.checked || false,
            "Contribution %": contributionInput?.value || ""
        });
    });
    logOutput.SalesTeam = salesTeam;
    console.log("📌 ESTIMATE FORM DATA (LATEST)", logOutput);
    return logOutput;
}

/**
 * Recalculate amount based on quantity and rate
 */
function recalculateAmount(row) {
    const qty = parseFloat(row.querySelector("td:nth-child(2) input")?.value) || 0;
    const rateInput = row.querySelector(".rateCell input");
    const amountInput = row.querySelector(".amountCell input");
    const rate = parseFloat(rateInput?.value);

    if (!rate || rate <= 0) {
        amountInput.value = "0.00";
        row.dataset.blocked = "true";
        return;
    }
    amountInput.value = (qty * rate).toFixed(2);
    row.dataset.blocked = "false";
}

/**
 * Validate rate value
 */
function validateRate(row) {
    const rateInput = row.querySelector("td:nth-child(6) input");
    const amountInput = row.querySelector("td:nth-child(7) input");

    if (!rateInput || Number(rateInput.value) <= 0) {
        row.dataset.blocked = "true";
        amountInput.value = "0.00";
        return false;
    }
    row.dataset.blocked = "false";
    return true;
}

/**
 * Validate form before submission
 */
function validateBeforeSubmit() {
    const rows = document.querySelectorAll("#itemsTableBody tr");

    for (const row of rows) {
        const rateInput = row.querySelector("td:nth-child(6) input");
        const rate = parseFloat(rateInput?.value);
        if (!rate || rate <= 0) {
            alert("Please enter the rate for all items before saving.");
            row.dataset.blocked = "true";
            const amountInput = row.querySelector("td:nth-child(7) input");
            if (amountInput) amountInput.value = "0.00";
            return false;
        }
        row.dataset.blocked = "false";
    }
    return true;
}

/**
 * Handle item change and fetch item details
 */
function handleItemChange(row, header) {
    const itemSelect = row.querySelector("td:nth-child(1) select");
    const itemId = itemSelect.value;
    if (!itemId) return;

    const prevItemId = itemSelect.dataset.prevValue || "";

    const rows = document.querySelectorAll("#itemsTableBody tr");
    for (const r of rows) {
        if (r === row) continue;
        const otherSelect = r.querySelector("td:nth-child(1) select");
        if (otherSelect && otherSelect.value === itemId) {
            alert("This item already exists in another line.");
            itemSelect.value = prevItemId;
            return;
        }
    }
    itemSelect.dataset.prevValue = itemId;

    fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "getItemDetails",
            itemId: itemId
        })
    })
    .then(res => res.json())
    .then(res => {
        if (!res || res.success !== true) {
            console.error("Invalid item response", res);
            return;
        }
        const data = res.data;

        const unitSelect = row.querySelector(".unitCell select");
        if (unitSelect) {
            unitSelect.innerHTML = "<option value=''></option>";
            (data.units || []).forEach(uom => {
                const opt = document.createElement("option");
                opt.value = String(uom.id);
                opt.textContent = uom.name || `Unit ${uom.id}`;
                unitSelect.appendChild(opt);
            });
            if (data.defaultUnit && unitSelect.querySelector(`option[value="${data.defaultUnit}"]`)) {
                unitSelect.value = String(data.defaultUnit);
            } else if (unitSelect.options.length > 1) {
                unitSelect.selectedIndex = 1;
            }
        }

        const priceSelect = row.querySelector("td:nth-child(5) select");
        if (priceSelect) {
            priceSelect.innerHTML = "";
            const customOpt = document.createElement("option");
            customOpt.value = "-1";
            customOpt.textContent = "Custom";
            priceSelect.appendChild(customOpt);

            let basePriceLevelId = "";

            (data.priceLevels || []).forEach(pl => {
                const opt = document.createElement("option");
                opt.value = String(pl.id);
                opt.textContent = (pl.name && pl.name.trim()) || (pl.displayName && pl.displayName.trim()) || `Price Level ${pl.id}`;
                opt.dataset.rate = pl.rate || 0;

                if (pl.name && pl.name.toLowerCase() === "base price") {
                    basePriceLevelId = String(pl.id);
                }

                priceSelect.appendChild(opt);
            });

            if (basePriceLevelId) {
                priceSelect.value = basePriceLevelId;
            } else {
                priceSelect.value = "-1";
            }
        }

        const descArea = row.querySelector("textarea");
        if (descArea) {
            descArea.value = data.description || "";
        }

        const rateInput = row.querySelector(".rateCell input");
        const amountInput = row.querySelector(".amountCell input");

        let selectedRate = 0;
        if (priceSelect && priceSelect.selectedOptions[0] && priceSelect.selectedOptions[0].dataset.rate) {
            selectedRate = Number(priceSelect.selectedOptions[0].dataset.rate);
        }

        if (selectedRate > 0) {
            if (rateInput) rateInput.value = selectedRate.toFixed(2);
            if (row) row.dataset.blocked = "false";
            if (row && typeof recalculateAmount === "function") recalculateAmount(row);
        } else {
            if (rateInput) rateInput.value = "";
            if (amountInput) amountInput.value = "0.00";
            if (row) row.dataset.blocked = "true";
        }

        const classSelect = row.querySelector(".classCell select");
        if (classSelect) {
            classSelect.value = String(data.classId || "");
        }

        const deptSelect = row.querySelector(".deptCell select");
        if (deptSelect) {
            deptSelect.value = String(data.departmentId || "");
        }

    })
    .catch(err => console.error("Failed to fetch item details:", err));
}

/**
 * Initialize tab switching functionality
 */
function initializeEstimateDetailsTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('border-[#0a514a]');
                t.classList.add('border-transparent');
            });

            tabContents.forEach(c => c.classList.remove('tab-active'));
            tab.classList.remove('border-transparent');
            tab.classList.add('border-[#0a514a]');
            const selectedTab = document.getElementById(tab.dataset.tab);
            selectedTab.classList.add('tab-active');
        });
    });
}


/**
 * Loads estimate details based on the current URL parameters.
 * 
 * @function loadEstimateDetails
 * @returns {void} Does not return a value.
 */
function loadEstimateDetails() {
    const url = new URL(window.location.href);
    const pageType = url.searchParams.get("type");
    
    const userIdFromUrl = url.searchParams.get("userId");
    console.log("📍 Frontend: userId from URL:", userIdFromUrl);

    let recordId = '';
    if (pageType === "estimate") recordId = url.searchParams.get("estimateId");
    else if (pageType === "opportunity") recordId = url.searchParams.get("opportunityId");
    else if (pageType === "salesorder") recordId = url.searchParams.get("salesOrderId");

    let action = "";
    if (pageType === "estimate") action = "getKanbanEstimateDetails";
    else if (pageType === "opportunity") action = "getKanbanOpportunityDetails";
    else if (pageType === "salesorder") action = "getKanbanSalesOrderDetails";

    let fetchBody = { 
        action: "getKanbanEstimateDetails",
        estimateId: recordId,
        userId: userIdFromUrl
    };
    if (pageType === "estimate") fetchBody.estimateId = recordId;
    else if (pageType === "opportunity") fetchBody.opportunityId = recordId;
    else if (pageType === "salesorder") fetchBody.salesOrderId = recordId;

    fetch(BASE_URL, {
        method: "POST",
        body: JSON.stringify(fetchBody)
    })
    .then(res => res.json())
    .then(data => {
        console.log("➡️ Fetched Data:", data);
        console.log("➡️ Data.data:", data.data);

        if (!data.success) {
            console.error("Failed to load details");
            return;
        }

        const { header, items, salesTeam, repList, isSalesManager } = data.data;
        console.log("➡️ isSalesManager value:", isSalesManager);
        console.log("➡️ All data.data keys:", Object.keys(data.data));
        
        const salesManager = (isSalesManager === true || isSalesManager === "true" || isSalesManager === "T");
        console.log("Is Sales Manager?", salesManager);

        if (!salesManager) {
            const rateHeader = document.getElementById("th-rate");
            const amountHeader = document.getElementById("th-amount");
            const pricelevelHeader = document.getElementById("th-pricelevel");

            if (rateHeader) rateHeader.style.display = "none";
            if (amountHeader) amountHeader.style.display = "none";
            if (pricelevelHeader) pricelevelHeader.style.display = "none";
        }

        if (!salesManager) {
            const salesTeamTabBtn = document.querySelector('.tab-btn[data-tab="sales-team"]');
            const salesTeamTabContent = document.getElementById("sales-team");

            if (salesTeamTabBtn) salesTeamTabBtn.style.display = "none";
            if (salesTeamTabContent) salesTeamTabContent.style.display = "none";
        }

        document.querySelectorAll(".est-number").forEach(el => el.innerText = header.tranid || "");
        document.getElementById("est-custname").innerText = header.entity || "";
        document.getElementById("est-statusref").innerText = header.statusRef || "";

        populateHeaderFields(header);
        populateJobDropdown(header.jobDetails?.jobs || [], header.jobDetails?.selectedJobId || "");
        populateStatusDropdown(header.status || "");
        populateLeadSourceDropdown(header.leadSourceDetails?.leadSources || [], header.leadSourceDetails?.selectedLeadSourceId || "");
        populateForecastTypeDropdown(header.forecastType || "");
        populatePartnerDropdown(header.partnerDetails?.partners || [], header.partnerDetails?.selectedPartnerId || "");
        populateClassDropdown(header.classDetails);
        populateDepartmentDropdown(header.departmentDetails);
        populateLocationDropdown(header.locationDetails);

        const tbody = document.getElementById("itemsTableBody");
        tbody.innerHTML = "";

        if (!items || items.length === 0) {
            tbody.innerHTML = `<tr><td class="text-sm px-3 py-2 text-gray-500 text-center" colspan="9">No items found</td></tr>`;
        } else {
            items.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="itemCell px-3 py-2 text-sm"></td>
                    <td class="px-3 py-2 text-sm"><input type="number" value="${row.quantity || ''}" disabled class="w-full bg-gray-100 border border-[#95a2a0] px-2 py-1 rounded" /></td>
                    <td class="unitCell px-3 py-2 text-sm"></td>
                    <td class="px-3 py-2 text-sm"><textarea disabled class="w-full bg-gray-100 border border-[#95a2a0] px-2 py-1 rounded" rows="1">${row.description || ''}</textarea></td>
                    <td class="pricelevelCell px-3 py-2 text-sm"></td>
                    <td class="rateCell px-3 py-2 text-sm"><input type="number" value="${row.rate != null ? row.rate.toFixed(2) : ''}" disabled class="w-full bg-gray-100 border border-[#95a2a0] px-2 py-1 rounded" /></td>
                    <td class="amountCell px-3 py-2 text-sm"><input type="number" value="${row.amount != null ? row.amount.toFixed(2) : ''}" disabled class="w-full bg-gray-100 border border-[#95a2a0] px-2 py-1 rounded" /></td>
                    <td class="classCell px-3 py-2 text-sm"></td>
                    <td class="deptCell px-3 py-2 text-sm"></td>
                `;
                tr.querySelector(".itemCell")
                    .appendChild(createItemDropdown(header.itemList?.items || [], row.itemId));

                const itemSelect = tr.querySelector(".itemCell select");
                itemSelect.addEventListener("change", () => {
                    handleItemChange(tr, header);
                });

                const unitOptions = header.unitDetails?.[row.itemId] || [];
                tr.querySelector(".unitCell")
                    .appendChild(createUnitDropdown(unitOptions, row.units));

                tr.querySelector(".classCell")
                    .appendChild(createClassDropdown(header.classDetails?.classes || [], row.classId));

                tr.querySelector(".deptCell")
                    .appendChild(createDepartmentDropdown(header.departmentDetails?.departments || [], row.departmentId));

                tr.querySelector(".pricelevelCell")
                    .appendChild(createPriceLevelDropdown(header.priceLevelList?.priceLevels?.[row.itemId] || [], row.priceLevelId || ""));

                const priceSelect = tr.querySelector(".pricelevelCell select");
                const rateInput = tr.querySelector(".rateCell input");

                if (priceSelect.value === "-1") {
                    rateInput.removeAttribute("readonly");
                } else {
                    rateInput.setAttribute("readonly", true);
                }

                priceSelect.addEventListener("change", () => {
                    if (priceSelect.value === "-1") {
                        rateInput.removeAttribute("readonly");
                        rateInput.value = "";
                    } else {
                        rateInput.setAttribute("readonly", true);
                        rateInput.value = priceSelect.selectedOptions[0].dataset.rate || "";
                    }
                });

                if (!salesManager) {
                    tr.querySelector(".rateCell").style.display = "none";
                    tr.querySelector(".amountCell").style.display = "none";
                    tr.querySelector(".pricelevelCell").style.display = "none";
                }
                tbody.appendChild(tr);
            });
        }

        const salesBody = document.getElementById("salesTeamTableBody");
        salesBody.innerHTML = "";

        if (!salesTeam || salesTeam.length === 0) {
            salesBody.innerHTML = `<tr><td colspan="4" class="text-sm px-3 py-2 text-gray-500 text-center">No sales team found</td></tr>`;
        } else {
            salesTeam.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="px-3 py-2 text-sm"></td>
                    <td class="roleCell px-3 py-2 text-sm"></td>  
                    <td class="primaryCell px-3 py-2 text-sm">
                        <input type="checkbox" class="primaryCheckbox h-5 w-5 ml-2 accent-[#007065]" ${row.primary ? "checked" : ""} disabled />
                    </td>
                    <td class="px-3 py-2 text-sm">
                        <input type="number" value="${row.contribution.toFixed(1)}" disabled class="contributionInput w-full bg-gray-100 border border-[#95a2a0] px-2 py-1 rounded" />
                    </td>
                `;
                tr.children[0].appendChild(createSalesRepDropdown(repList, row.employeeId));

                tr.querySelector(".roleCell")
                    .appendChild(createSalesRoleDropdown(header.salesRoles, row.salesRoleId));

                salesBody.appendChild(tr);
            });
        }
        hideLoader();
    })
    .catch(err => console.error(err));
}

/**
 * Setup event listeners for estimate details page
 */
function setupEstimateDetailsEventListeners() {
    document.getElementById("editButton").addEventListener("click", () => {
        setEditMode(true);
    });

    document.getElementById("cancelButton").addEventListener("click", () => {
        setEditMode(false);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const estimateIdFromUrl = urlParams.get("estimateId");
    const estimateInput = document.querySelector("#estimateId");
    if (estimateInput) estimateInput.value = estimateIdFromUrl || "";
    const estLabel = document.querySelector(".est-number");
    if (estLabel) estLabel.dataset.id = estimateIdFromUrl || "";

    document.getElementById("saveButton").addEventListener("click", async () => {
        if (!validateBeforeSubmit()) {
            return;
        }

        showLoader();
        const estimateData = logEstimateFormData();
        const estimateId = document.querySelector("#estimateId").value;
        const body = {
            action: "updateEstimate",
            estimateId,
            data: estimateData
        };

        try {
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const result = await response.json();
            hideLoader();
            if (result.success) {
                alert("Updated successfully!");
                setEditMode(false);
            } else {
                alert("Failed to update: " + result.message);
            }
        } catch (e) {
            hideLoader();
            console.error("Update failed", e);
            alert("Update failed — check console");
        }
    });

    document.getElementById("itemsTableBody").addEventListener("input", function (e) {
        if (e.target.matches("td:nth-child(2) input") || e.target.matches("td:nth-child(6) input")) {
            const row = e.target.closest("tr");
            recalculateAmount(row);
        }
    });
}

/**
 * Initialize estimate details page when DOM is ready
 */
function initializeEstimateDetailsPage() {
    initializeEstimateDetailsTabs();
    loadEstimateDetails();
    setupEstimateDetailsEventListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEstimateDetailsPage);
} 
else {
    initializeEstimateDetailsPage();
}

// End of Estimate Details Page Initialization






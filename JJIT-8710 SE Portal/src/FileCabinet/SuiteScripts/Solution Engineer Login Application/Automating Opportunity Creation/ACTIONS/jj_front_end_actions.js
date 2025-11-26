const BASE_URL = 'https://5742736.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1024&deploy=1&compid=5742736&ns-at=AAEJ7tMQL9Tri5JLG_3XFKpOSabc7UkdR9r2XF1NZtmKg6MmUjY';

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
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toUTCString();


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
    if (action === 'upload' || action === 'home' || action === 'history' || action === 'editopp' || action === 'implementation') {
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

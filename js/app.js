window.addEventListener('load', onload);

// page name constants
const ACCOUNTS = "accounts";              // reference in index.html navbar
const ADD_ACCOUNT = "add-account";
const EDIT_ACCOUNT = "edit-account";
const BANK_APP_STORAGE_KEY = "bank-app-storage-key";

const accounts = {
  content: null,
  title: "Bank Accounts",
  accountsTable: null,
  accountsArray: null,
  getContent: function () {
    if (!accounts.content) {
      let div = document.createElement('div');
      div.className = "container";

      // create row for page header content and add to page div
      let rowDiv = document.createElement('div');
      rowDiv.className = "row";
      div.append(rowDiv);

      // create title div and add to row div
      let titleDiv = document.createElement('div');
      titleDiv.className = "col-md-5";
      rowDiv.append(titleDiv);

      // create alert div and add to row div
      accounts.alertDiv = document.createElement('div');
      accounts.alertDiv.className = "col-md-4";
      rowDiv.append(accounts.alertDiv);

      // create button div and add to row div 
      let btnDiv = document.createElement('div');
      btnDiv.className = "col-md-3";
      rowDiv.append(btnDiv);

      // create page title and add to title div
      let h1 = document.createElement('h1');
      h1.innerHTML = "Bank Accounts";
      titleDiv.append(h1);

      // create 'add account' btn and add to button div
      let addBtn = document.createElement('a');
      addBtn.href = `#${ADD_ACCOUNT}`;
      addBtn.className = "btn btn-outline-success float-right";
      addBtn.append(document.createTextNode('+'));
      addBtn.preventDefault = true;
      addBtn.href = `#${ADD_ACCOUNT}`;
      btnDiv.append(addBtn);

      // table
      accounts.accountsTable = document.createElement('table');
      accounts.accountsTable.className = "table table-hover";
      accounts.accountsTable.id = "accountsTable";
      let header = accounts.accountsTable.createTHead();
      let row = header.insertRow(0);

      // header cells
      let cell = document.createElement('th');
      cell.innerHTML = "#";
      cell.scope = "col";
      row.append(cell);

      cell = document.createElement('th');
      cell.innerHTML = "Account Number";
      cell.scope = "col";
      row.append(cell);

      cell = document.createElement('th');
      cell.innerHTML = "Account Holder";
      cell.scope = "col";
      row.append(cell);

      cell = document.createElement('th');
      cell.innerHTML = "Account Type";
      cell.scope = "col";
      row.append(cell);

      // edit button column
      cell = document.createElement('th');
      cell.scope = "col";
      row.append(cell);

      // delete button column
      cell = document.createElement('th');
      cell.scope = "col";
      row.append(cell);

      accounts.accountsTable.createTBody();
      div.append(accounts.accountsTable);

      accounts.content = div;
    }
    return accounts.content;
  },
  load(data) {
    if (data && data.hasOwnProperty('alert')) {
      accounts.displayAlert(data.alert);
    }
    if (data && data.hasOwnProperty('addAccount')) {
      accounts.addAccount(data.addAccount);
    }
    if (data && data.hasOwnProperty('editAccount')) {
      accounts.editAccount(data.editAccount);
    }
    accounts.fetchAccountList(accounts.displayAccounts, accounts.displayBookListError);
    $('#deleteModal').on('show.bs.modal', function (event) {
      let button = $(event.relatedTarget) // Button that triggered the modal
      let accountId = button.data('accountid');
      let accountName = button.data('accountname');
      let accountType = button.data('accounttype');
      let account = {
        accountId: accountId,
        accountName: accountName,
        accountType: accountType
      };
      let modal = $(this);
      modal.find('#accountNameSpan').text(accountName);

      let delBtn = document.getElementById("deleteButton");
      delBtn.onclick = function () {
        accounts.onClickDelete(account);
        $('#deleteModal').modal('hide');
      }
    });
  },
  displayAlert(alert) {
    accounts.alertDiv.innerHTML = `
      <div id="alertDiv" class="alert alert-dismissible alert-${alert.type}">
        <button type="button" class="close" data-dismiss="alert">&times;</button>
        ${alert.message}
      </div>`;
  },
  displayAccounts() {
    // remove any existing rows
    while (accounts.accountsTable.rows.length > 1) {
      accounts.accountsTable.deleteRow(1);
    }

    // add new row for each book
    let rowCount = 1;
    accounts.accountsArray.forEach(element => {
      // create new row
      const row = accounts.accountsTable.insertRow(rowCount++);
      row.className = rowCount % 2 == 0 ? "table-active" : "table-default";

      // fill each cell
      let cellCount = 0;
      const rowNumber = row.insertCell(cellCount++);
      rowNumber.scope = "row";
      rowNumber.innerHTML = rowCount - 1 + "."; // element.bookId

      const accountIdCell = row.insertCell(cellCount++);
      accountIdCell.innerHTML = element.accountId;

      const accountNameCell = row.insertCell(cellCount++);
      accountNameCell.innerHTML = element.accountName;

      const accountTypeCell = row.insertCell(cellCount++);
      accountTypeCell.innerHTML = element.accountType;

      const editCell = row.insertCell(cellCount++);
      const editLink = document.createElement('a');
      editLink.href = `#${EDIT_ACCOUNT}?accountId=${element.accountId}`;

      editLink.innerHTML = "Edit";
      editLink.className = "btn btn-outline-primary";

      editCell.append(editLink);

      const deleteCell = row.insertCell(cellCount++);
      const deleteBtn = document.createElement('button');
      const self = accounts;
      deleteBtn.setAttribute('data-toggle', "modal");
      deleteBtn.setAttribute('data-target', "#deleteModal");
      deleteBtn.setAttribute('data-accountid', element.accountId);
      deleteBtn.setAttribute('data-accountname', element.accountName);
      deleteBtn.setAttribute('data-accounttype', element.accountType);
      deleteBtn.innerHTML = "Delete";
      deleteBtn.className = "btn btn-outline-danger";
      deleteCell.append(deleteBtn);
    });

  },
  displayBookListError() {
    const row = accounts.accountsTable.insertRow(1);
    const errorCell = row.insertCell(0);
    errorCell.colSpan = 6;
    errorCell.className = "btn-outline-danger";
    errorCell.innerHTML = "Error loading accounts. Please try again later.";
  },
  reloadAccountList() {
    accounts.fetchAccountList(accounts.displayAccounts, accounts.displayBookListError);
  },
  fetchAccountList: async function (success, fail) {
    if (!accounts.accountsArray) {
      let dataString = window.localStorage.getItem(BANK_APP_STORAGE_KEY);
      accounts.accountsArray = JSON.parse(dataString);
    }
    if (!accounts.accountsArray) {
      try {
        const response = await fetch("data/customerData.json");
        accounts.accountsArray = await response.json();
        success(accounts.accountsArray);
      } catch (e) {
        console.error(e);
        fail();
      }
    } else {
      success(accounts.accountsArray);
    }
  },
  fetchAccount(id) {
    if (!accounts.accountsArray) {
      return null;
    }
    let result = null;
    for (let act of accounts.accountsArray) {
      if (act.accountId == id) {
        result = act;
      }
    }
    return result;
  },
  addAccount(account) {
    if (!accounts.accountsArray) {
      accounts.displayAlert({
        type: "danger",
        message: `Oops. Something went wrong. Could not add ${account.accountType} account ${account.accountId} for ${account.accountName}.`
      });
    } else {
      let isDuplicateId = accounts.accountsArray.reduce((out, act) => (out || act.accountId == account.accountId), false);
      if (isDuplicateId) {
        accounts.displayAlert({
          type: "danger",
          message: `Oops. That account number already exists. Could not add ${account.accountType} account ${account.accountId} for ${account.accountName}.`
        });
      } else {
        accounts.accountsArray.push(account);
        window.localStorage.setItem(BANK_APP_STORAGE_KEY, JSON.stringify(accounts.accountsArray));
        accounts.displayAlert({
          type: "success",
          message: `${account.accountType} account ${account.accountId} for ${account.accountName} was added.`
        });
        accounts.displayAccounts();
      }
    }
  },
  editAccount(account) {
    if (!accounts.accountsArray) {
      accounts.displayAlert({
        type: "danger",
        message: `Oops. Something went wrong. Could not edit ${account.accountType} account ${account.accountId} for ${account.accountName}.`
      });
    } else {
      accounts.accountsArray = accounts.accountsArray.map(act => {
        if (act.accountId === account.accountId) {
          return account;
        } else {
          return act;
        }
      });
      window.localStorage.setItem(BANK_APP_STORAGE_KEY, JSON.stringify(accounts.accountsArray));
      accounts.displayAccounts();
      accounts.displayAlert({
        type: "success",
        message: `${account.accountType} account ${account.accountId} for ${account.accountName} was edited.`
      });
    }

  },
  onClickDelete(account) {
    accounts.deleteAccount(
      account.accountId,
      function () {
        accounts.reloadAccountList();
        accounts.displayAlert({ type: "success", message: `${account.accountType} account ${account.accountId} for ${account.accountName} was deleted.` });
      },
      accounts.displayAlert
    );
  },
  deleteAccount(id, success, fail) {

    let done = false;
    try {
      accounts.accountsArray = accounts.accountsArray.filter(act => act.accountId != id);
      window.localStorage.setItem(BANK_APP_STORAGE_KEY, JSON.stringify(accounts.accountsArray));
      done = true;
    } catch (e) {
      console.error(e.message);
      fail({ type: "danger", message: e.message });
    }
    if (done) success();
  }
}

const addAccount = {
  content: null,
  title: "Bank | Add Account",
  form: null,
  resetBtn: null,
  addAccountBtn: null,
  getContent: function () {
    if (!addAccount.content) {

      addAccount.form = accountForm;
      let div = document.createElement('div');
      div.className = "container";

      // page header
      let h1 = document.createElement('h1');
      h1.innerHTML = "Add an Account";
      div.append(h1);

      // horizontal divider
      let hr = document.createElement('hr');
      hr.className = "my 4";
      div.append(hr);

      div.append(addAccount.form.getContent());

      // form buttons
      let btnDiv = document.createElement('div');
      btnDiv.className = "float-right";

      addAccount.resetBtn = document.createElement('button');
      addAccount.resetBtn.className = "btn btn-outline-danger";
      addAccount.resetBtn.innerHTML = "Reset";
      addAccount.resetBtn.id = "resetBtn";
      btnDiv.append(addAccount.resetBtn);

      addAccount.addAccountBtn = document.createElement('button');
      addAccount.addAccountBtn.className = "btn btn-outline-success";
      addAccount.addAccountBtn.innerHTML = "Add Account";
      addAccount.addAccountBtn.id = "addAccountBtn";
      btnDiv.append(addAccount.addAccountBtn);

      div.append(btnDiv);

      addAccount.content = div;
    }
    return addAccount.content;
  },
  load() {
    addAccount.resetBtn.addEventListener('click', addAccount.onClickResetBtn);
    addAccount.addAccountBtn.addEventListener('click', addAccount.onClickAddAccountBtn);
    addAccount.form.load('add')

  },
  /**
   * clear form of data and errors
   */
  onClickResetBtn: function () {
    // clear form
    addAccount.form.hideErrorMessage();
    addAccount.form.resetFields();
  },
  /**
  * Validate and respond to form contents. 
  *  with valid data: send POST HTTP request
  *    on success: navigate to books.html
  *    on failure: display error
  *  with NONvalid data: display error message on form
  */
  onClickAddAccountBtn: function () {
    //validate form
    let validation = addAccount.form.isDataValid();
    if (validation.isValid) {
      addAccount.form.hideErrorMessage();
      addAccount.postNewAccount(validation.account);

    } else {
      addAccount.form.displayErrorMessage(validation.errorMessage);
    }
  },
  /**
   * Send new account details to database locally.
   *
   * @param {Object} account New account to add to database list including properties 
   *  accountId, accountName, accountType
   */
  postNewAccount(account) {
    goToPage(ACCOUNTS, { addAccount: account });
  }
}

const editAccount = {
  content: null,
  title: "Bank | Add Account",
  form: null,
  accountId: null,
  cancelBtn: null,
  saveBtn: null,
  getContent() {

    editAccount.form = accountForm;
    let div = document.createElement('div');
    div.className = "container";

    // page header
    let h1 = document.createElement('h1');
    h1.innerHTML = "Edit Account";
    div.append(h1);

    // horizontal divider
    let hr = document.createElement('hr');
    hr.className = "my 4";
    div.append(hr);

    div.append(editAccount.form.getContent());

    // form buttons
    let btnDiv = document.createElement('div');
    btnDiv.className = "float-right";

    editAccount.cancelBtn = document.createElement('button');
    editAccount.cancelBtn.className = "btn btn-outline-danger";
    editAccount.cancelBtn.innerHTML = "Cancel";
    editAccount.cancelBtn.id = "cancelBtn";
    btnDiv.append(editAccount.cancelBtn);

    editAccount.saveBtn = document.createElement('button');
    editAccount.saveBtn.className = "btn btn-outline-success";
    editAccount.saveBtn.innerHTML = "Save Account";
    editAccount.saveBtn.id = "SaveBtn";
    btnDiv.append(editAccount.saveBtn);

    div.append(btnDiv);

    editAccount.content = div;
    // }
    return editAccount.content;
  },
  load(data) {
    editAccount.accountId = data.accountId;
    editAccount.title = `Bank | Edit Account ID: ${editAccount.accountId}`;

    editAccount.form.load('edit');
    editAccount.fetchAccount(
      editAccount.accountId,
      editAccount.form.displayAccountData,
      editAccount.form.displayErrorMessage);
    editAccount.cancelBtn.addEventListener('click', editAccount.onClickCancelBtn);
    editAccount.saveBtn.addEventListener('click', editAccount.onClickSaveBtn);
  },
  /**
   * clear form of data and errors
   */
  onClickCancelBtn() {
    goToPage(ACCOUNTS); // TODO: address url change / push state
  },
  /**
   * Validate and respond to form contents. 
   *  with valid data: send POST HTTP request
   *    on success: navigate to books.html
   *    on failure: display error
   *  with NONvalid data: display error message on form
   */
  onClickSaveBtn() {
    //validate form
    let validation = editAccount.form.isDataValid();
    if (validation.isValid) {
      editAccount.form.hideErrorMessage();
      validation.account.accountId = editAccount.accountId;
      editAccount.postEditAccount(
        validation.account,
        _ => {
          goToPage(ACCOUNTS, {
            alert: {
              type: 'success',
              message: `${validation.account.accountType} account #${validation.account.accountId} for ${validation.account.accountName} has been saved.`
            }
          })
        },
        editAccount.form.displayErrorMessage
      );

    } else {
      editAccount.form.displayErrorMessage(validation.errorMessage);
    }
  },
  /**
   * Send new book details to server.
   * -- On successful post call `success()`
   * -- On error call `fail()` with HTML formatted error message.
   *
   * @param {Object} account New account to add to database list including properties 
   *  accountId, accountName, accountType
   * @param {function} success zero-parameter callback function to call upon successful post
   * @param {function} fail single parameter callback function accepting HTML formatted error message
   */
  postEditAccount: async function (account, success, fail) {
    goToPage(ACCOUNTS, { editAccount: account });
  },

  fetchAccount: function (id, success, fail) {//TODO: rewrite fetch locally

    const account = accounts.fetchAccount(id);
    if (account) {
      success(account);
    }
    else {
      fail("Could not load account to edit.");
    }
  }
}

const accountForm = {
  content: null,
  errorDiv: null,
  inputs: null,
  accountTypeSelect: null,
  getContent() {
    // if (!bookForm.content) {
    let div = document.createElement('div');
    div.innerHTML = `
<form>
  <fieldset>
    <legend>*required fields</legend>
    <div id="errorMsg" class="alert-danger alert hidden"> </div>
    <div class="form-group">
      <label class="col-form-label" for="accountId">*Account Number</label>
      <input required type="text" class="form-control" placeholder="XX-XXX-XXXX" id="accountId">
    </div>
    <div class="form-group">
      <label class="col-form-label" for="accountName">*Account Holder Name</label>
      <input required type="text" class="form-control" placeholder="John Smith" id="accountName">
    </div>
    <div class="form-group">
      <label class="col-form-label" for="accountType">*Account Type</label>
      <select id="accountType" class="form-control">
        <option value="Checking">Checking</option>
        <option value="Savings">Savings</option>
        <option value="Loan">Loan</option>
      </select>
    </div>
  </fieldset>
</form>`;
    accountForm.content = div;
    // }
    return accountForm.content;

  },
  load(mode) {
    accountForm.errorDiv = accountForm.errorDiv || document.getElementById("errorMsg");
    accountForm.errorDiv.classList.add("hidden");
    accountForm.accountTypeSelect = document.getElementById("accountType");
    accountForm.inputs = document.getElementsByTagName("input");
    for (let input of accountForm.inputs) {
      if(input.id == 'accountId' && mode=="edit"){
        input.disabled = true;
      }
      input.value = "";
    }
  },
  /**
   * Display account info on form
   * 
   * @param {object} account account object including properties 
   *   accountId, accountName, accountType
   */
  displayAccountData(account) {
    // populate account form
    for (let input of accountForm.inputs) {
      input.value = account[input.id];
    }
    accountForm.accountTypeSelect.value = account.accountType;
    let options = document.getElementsByTagName("option");
    // for (let option of options) {
    //   if (option.value == account.accountType) {
    //     option.selected = true;
    //   } else{
    //     option.selected = false;
    //   }
    // }
  },
  hideErrorMessage() {
    accountForm.errorDiv.innerHTML = "";
    accountForm.errorDiv.classList.add("hidden");
  },
  /**
  * Display and populate a formatted HTML error message on the form.
  *
  * @param {string} errorMsg HTML message to be displayed on form.
  * Strong elements will be formatted according to theme.
  */
  displayErrorMessage(errorDivContents) {
    accountForm.errorDiv.innerHTML = "";
    accountForm.errorDiv.append(errorDivContents);
    accountForm.errorDiv.classList.remove("hidden");
  },
  resetFields() {
    for (const input of accountForm.inputs) {
      input.value = "";
    }
  },
  isDataValid() {
    // create validation result object
    let results = {
      isValid: false,
      errorMessage: "",
      account: {
        accountId: null,
        accountName: null,
        accountType: null,
      }
    };

    // populate account object
    for (let input of accountForm.inputs) {
      results.account[input.id] = (input.value + "").trim();
    }
    results.account.accountType = accountForm.accountTypeSelect.value;

    // create error list to show in error div
    const errorList = document.createElement('ul');
    // validate Acount id
    if (results.account.accountId.length == 0) {
      const errorItem = document.createElement('li');
      errorItem.innerHTML = "Account number is a required field.";
      errorList.append(errorItem);
    } else if (!(results.account.accountId.length == 11 && results.account.accountId.match(/^(\d\d-\d\d\d-\d\d\d\d)/g))) { // TODO: validate account format with regex
      const errorItem = document.createElement('li');
      errorItem.innerHTML = "Invalid account number format. Account number must be formatted as ##-###-####.";
      errorList.append(errorItem);
    }
    // validate Acount holder name
    if (results.account.accountName.length == 0) {
      const errorItem = document.createElement('li');
      errorItem.innerHTML = "Account holder name is a required field.";
      errorList.append(errorItem);
    }
    // validate account type
    if (results.account.accountType.length == 0) {
      const errorItem = document.createElement('li');
      errorItem.innerHTML = "Account type is a required field.";
      errorList.append(errorItem);
    } else if (!(results.account.accountType == "Savings" || results.account.accountType == "Checking" || results.account.accountType == "Loan")) {
      const errorItem = document.createElement('li');
      errorItem.innerHTML = "Account type is not recognized. Please select 'Checking', 'Savings', or 'Loan'.";
      errorList.append(errorItem);
    }


    // set valid if no errors
    if (errorList.childElementCount == 0) {
      results.isValid = true;
    } else {
      results.errorMessage = errorList;
    }

    return results;
  }
}

let pages = {
  [ACCOUNTS]: accounts,
  [ADD_ACCOUNT]: addAccount,
  [EDIT_ACCOUNT]: editAccount
};

let currentPage = null;
let outlet = null;
function onload() {
  outlet = document.getElementById("main");
  window.addEventListener("popstate", onPopState);

  let { page, data } = getPageAndDataFromURL();
  page = page || ACCOUNTS;
  goToPage(page, data);
}
function goToPage(page, data) {
  if (page && page != currentPage) {

    currentPage = page;

    // clear outlet
    outlet.innerHTML = "";

    // load cached current page content 
    outlet.append(pages[currentPage].getContent());
    pages[currentPage].load(data);
    document.title = pages[currentPage].title;
  }
  else if (!page && currentPage != ACCOUNTS) {
    goToPage(ACCOUNTS);
  }
}

function onPopState(event) {
  // determine page by URL
  const { page, data } = getPageAndDataFromURL();
  // go to page with page data
  goToPage(page, data);

}
function getPageAndDataFromURL() {
  let results = {};

  let hash = location.hash;
  // if no page specified, return null;
  if (hash == "") {
    return { page: null, data: null }
  }

  // find page before '?'
  let paramStart = hash.indexOf("?");
  let endOfHash = paramStart == -1 ? hash.length : paramStart;
  results.page = hash.substring(1, endOfHash);

  // find params after '?'
  results.data = {};
  results.data.page = results.page;

  const paramString = hash.substring(endOfHash + 1); // from '?' to end of string with key=value&key=value&...
  const params = paramString.split("&"); // split params by separator '&'
  for (const param of params) {
    let [key, value] = param.split('=');
    if (key.length > 0) {
      results.data[key] = value;
    }
  }
  return results;
}

//#endregion
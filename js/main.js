
let baseUrl = "http://localhost:3000/employee";
let addEmployeeBtn = document.getElementById("addEmployee");
let newNameInput = document.getElementById("newName");
let newEmailInput = document.getElementById("newEmail");
let newAddressInput = document.getElementById("newAddress");
let newPhoneInput = document.getElementById("newPhone");
let deleteEmployee = document.getElementById("deleteEmployee");
let updateEmployeeBtn = document.getElementById("updateEmployee");
let deleteEmployeeId = "";
let editEmployeeId = "";



let paginationData = {
    currentPage: 1,
    totalPageNo: null,
    totalPage(dataCount, dataPerPage) {
        this.totalPageNo = Math.ceil(dataCount/dataPerPage);
    },
    previousPage() {
        if(this.currentPage - 1 >= 1) {
            return this.currentPage - 1;
        }else {
            return false;
        }
    },
    nextPage(totalPage) {
        if(this.currentPage + 1 <= totalPage) {
            return this.currentPage + 1;
        }else {
            return false;
        }
    }
} 

display();


function paginationFunc(callback, pageNo) {
    if(!pageNo) {
        fetch(baseUrl)
        .then(data => data.json())
        .then(data => {
            callback(data.length);
        })
    }else {
        fetch(`${baseUrl}?_limit=5&_page=${pageNo}`)
        .then(data => data.json())
        .then(data => {
            callback(data.length);
        })
    }  
}



function display(activePage = 1) {
    fetch(`${baseUrl}?_limit=5&_page=${activePage}`)
    .then(data => data.json())
    .then(data => {
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";


        if(data.length == 0) {
            tbody.innerHTML = `<tr>
                <td class="border" colspan="6">
                    <p class="display-4 m-0 py-3">No Content Available</p>
                </td>
                </tr>`;
        }


        for(let i=0; i<data.length; i++) {
            tbody.innerHTML += `
                <tr data-id=${data[i].id}>
                    <td>${serialNo(activePage, i)}</td>
                    <td>${data[i].name}</td>
                    <td>${data[i].email}</td>
                    <td>${data[i].address}</td>
                    <td>${data[i].phone}</td>
                    <td>
                        <a href="#editEmployeeModal" class="edit" data-toggle="modal">
                            <i class="material-icons" data-toggle="tooltip" data-placement="right" title="Edit">&#xE254;</i>
                        </a>
                        <a href="#deleteEmployeeModal" class="delete" data-toggle="modal">
                            <i class="material-icons" data-toggle="tooltip" data-placement="right" title="Delete">&#xE872;</i>
                        </a>
                    </td>
            </tr> `;
        }


        function serialNo(activePage, i) {
            // data per page 5
            let firstSerialNo = activePage * 5 - 4; 
            return firstSerialNo + i;
        }


        let editButtons = document.querySelectorAll(".edit");
        let deleteButtons = document.querySelectorAll(".delete");

        editButtons.forEach(btn => {
            btn.addEventListener("click", ()=> {
                editEmployeeId = btn.parentElement.parentElement.getAttribute("data-id");
                savedData(editEmployeeId);
            })
        })

        deleteButtons.forEach(btn => {
            btn.addEventListener("click", ()=> {
                deleteEmployeeId = btn.parentElement.parentElement.getAttribute("data-id");
            })
        })


        $(function () {
            $('[data-toggle="tooltip"]').tooltip();
        })


        // Pagination Starts

        paginationFunc(function(dataLength) {
            let paginationSection = document.getElementById("paginationSection");
            let currentPage = paginationData.currentPage;
            let dataPerPage = 5;
            paginationData.totalPage(dataLength, dataPerPage);
            let totalPage = paginationData.totalPageNo;


            paginationSection.innerHTML = `<div class="hint-text">Showing 
                <b>${(currentPage * dataPerPage > dataLength) ? dataLength : currentPage * dataPerPage}</b> out of 
                <b>${dataLength}</b> entries</div>`;


            let paginationList = document.createElement("ul");
            paginationList.classList.add("pagination");

            paginationList.innerHTML = `<li class="page-item prev_page">Previous</li>`;

            for(let i=1; i<=totalPage; i++) {
                if(i == activePage) {
                    paginationList.innerHTML += `
                        <li class="page-item pagination_btn active" page-target=${i}>${i}</li>`;
                }else {
                    paginationList.innerHTML += `
                        <li class="page-item pagination_btn" page-target=${i}>${i}</li>`;
                }                
            }

            paginationList.innerHTML += `<li class="page-item next_page">Next</li>`;

            paginationSection.appendChild(paginationList);


            let next_page = document.querySelector(".next_page");
            let prev_page = document.querySelector(".prev_page");
            let pagination_btn = document.querySelectorAll(".pagination_btn");

            next_page.addEventListener("click", ()=> {
                let nextPageNo = paginationData.nextPage(totalPage);
                
                if(nextPageNo) {
                    display(nextPageNo);
                    paginationData.currentPage += 1;
                }
            })


            prev_page.addEventListener("click", ()=> {
                let prevPageNo = paginationData.previousPage();
                
                if(prevPageNo) {
                    display(prevPageNo);
                    paginationData.currentPage -= 1;
                }
            })


            pagination_btn.forEach(btn => {
                btn.addEventListener("click", ()=> {
                    let gotoPage = btn.getAttribute("page-target");
                    display(gotoPage);
                    paginationData.currentPage = Number(gotoPage);
                })
            })           
        })

        // Pagination Ends
    })

}



addEmployeeBtn.addEventListener("click", () => {
    let employeeName = document.getElementById("addEmployeeName").value;
    let employeeEmail = document.getElementById("addEmployeeEmail").value;
    let employeeAddress = document.getElementById("addEmployeeAddress").value;
    let employeePhone = document.getElementById("addEmployeePhone").value;

    if(employeeName.trim().length > 0 &&
        validateEmail(employeeEmail) &&
        employeeAddress.trim().length > 0 &&
        employeePhone.trim().length > 0
    ) {
        let newEmployee = {
            id: generateId(),
            name: employeeName,
            email: employeeEmail,
            address: employeeAddress,
            phone: employeePhone
        }

        addEmployeeInfo(newEmployee);

        document.getElementById("addEmployeeName").value = "";
        document.getElementById("addEmployeeEmail").value = "";
        document.getElementById("addEmployeeAddress").value = "";
        document.getElementById("addEmployeePhone").value = "";
        
    }else {
        snackbarFunc("You must fill in all of the fields");
    }
})



function validateEmail(employeeEmail) {
    if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(employeeEmail)) {
      return true;
    }else {
        return false;
    }
}



function generateId() {
    let id = "";
    let numbers = "0123456789";

    for(let i=0; i<6; i++) {
        let index = Math.floor(Math.random() * numbers.length);
        id += numbers[index];
    }

    return id;
}



function addEmployeeInfo(data) {
    fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(() => {
        display(paginationData.currentPage);
        snackbarFunc("Employee Added!");
    })
    .catch(err => {
        console.error("Error:", err);
        snackbarFunc("Oops, something went wrong");
    });
}



deleteEmployee.addEventListener("click", () => {
    fetch(`${baseUrl}/${deleteEmployeeId}`, {
        method: "DELETE"
    })
    .then(() => {
        paginationFunc(function(dataOnThisPage) {
            if(dataOnThisPage == 0) {
                paginationData.currentPage -= 1;
                display(paginationData.currentPage);
            }else {
                display(paginationData.currentPage);
            }

            snackbarFunc("Data Deleted!");
            deleteEmployeeId = "";

        }, paginationData.currentPage)          
    })
})



function savedData(editEmployeeId) {
    fetch(`${baseUrl}/${editEmployeeId}`)
    .then(data => data.json())
    .then(data => {
        newNameInput.value = data.name;
        newEmailInput.value = data.email;
        newAddressInput.value = data.address;
        newPhoneInput.value = data.phone;
    })
}



updateEmployeeBtn.addEventListener("click", () => {
    let newName = newNameInput.value;
    let newEmail = newEmailInput.value;
    let newAddress = newAddressInput.value;
    let newPhone = newPhoneInput.value;

    if(newName.trim().length > 0 &&
        validateEmail(newEmail) &&
        newAddress.trim().length > 0 &&
        newPhone.trim().length > 0
    ) {
        let employeeInfo = {
            id: editEmployeeId,
            name: newName,
            email: newEmail,
            address: newAddress,
            phone: newPhone
        }

        updateEmployeeInfo(employeeInfo);
    }
    
})



function updateEmployeeInfo(employeeInfo) {
    fetch(`${baseUrl}/${editEmployeeId}`, {
        method: "PUT", 
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(employeeInfo)
    })
    .then(()=> {
        display(paginationData.currentPage);
        snackbarFunc("Data Updated!");
        editEmployeeId = "";
    })
    .catch(err => {
        console.error("Error:", err);
        snackbarFunc("Oops, something went wrong");
    })
}



function snackbarFunc(message) {
    var x = document.getElementById("snackbar");  
    x.className = "show";  
    x.innerHTML = message;
    
    setTimeout(function(){ 
        x.className = x.className.replace("show", "");
    }, 3000);
}

var page_type = 0; //0 for main, 1 for restaurant data page, 2 for searching
var page_num = 0; //0 default : number of pages.
var selected_res; //number of selected restaurant (store id)
var max_listing_perpage = 5;
var max_seat_perpage = 20;
var selected_categ = 0; //0 for all, 1 for jpn, 2 for ita 
var cur_max = max_listing_perpage;
var now_category = "";
var now_name = "";

//this code has been tested 2/21/2021 3:05 result-> success.

initData();

function initData() {
    if (document.body.id == 0) {
        console.log("Open main page");
        selected_categ = 0;
        page_type = 0;
        selectnewCateg('all');
    } else if (document.body.id == 1) {
        page_type = 1;
        selected_res = localStorage.getItem("selected");
        loadStore();
    }
}


function getRestaurant(storeid, command) {
    fetch("http://158.108.182.7:3001/frontend?store_id=" + storeid, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            } else if (response.status === 404) {
                console.log("Load store data failed : Store id " + storeid + " is not found.");
                return Promise.reject('error 404')
            } else {
                return Promise.reject('some other error: ' + response.status)
            }
        })
        .then((datas) => {
            console.log(">> requested store id " + storeid)
            var data = datas["result"][0];
            if (data != undefined)
                //get data for inform the seat info.
                if (command == 0) {
                    showStoreData(data.name, data.category, data.table, data.lowest_price, data.highest_price, data.description, data.floor)
                } else {
                    updateTableData(data.table);
                }
            else {
                console.log("[no data] the store_id " + storeid + " is not found.");
            }
        }
        );
}

function searchRestaurant(storename, command) {
    fetch("http://158.108.182.7:3001/frontend?store_name=" + storename, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            } else if (response.status === 404) {
                console.log("Load store data failed : Store name " + storename + " is not found.");
                return Promise.reject('error 404')
            } else {
                return Promise.reject('some other error: ' + response.status)
            }
        })
        .then((datas) => {
            console.log(">> requested store name " + storename)
            var data = datas["result"][0];
            console.log(data);
            if (data != undefined) {
                //get data for inform the seat info.
                if (command == 0)
                    showRestaurant(data.store_id, data.name, data.category, data.table, data.floor)
                else if (command == 1)
                    updateRestaurant(data.store_id, data.table)
            }
            else {
                console.log("[no data] the store_name " + storename + " is not found.");
            }
            //clean data
            var i;
            for(i=1;i<6;i++){
                cleanFloorData(i);
            }
            cleanFloorData('b');
        }
        );
}

function getRestaurantByFilters(floor, category, command) {
    //command 0 for get store data, 1 for update data
    var filters = "";
    if (floor != -1) {
        filters = "?floor=" + floor;
    }
    if (category != "") {
        filters = filters + "&category=" + category;
    }
    fetch("http://158.108.182.7:3001/frontend" + filters, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            } else if (response.status === 404) {
                console.log("Load store data failed : Store id " + storeid + " is not found.");
                return Promise.reject('error 404')
            } else {
                return Promise.reject('some other error: ' + response.status)
            }
        })
        .then((datas) => {
            if (datas["result"][0] != null) {
                datas["result"].forEach((data) => {
                    if (data != undefined) {
                        if (command == 0)
                            showRestaurant(data.store_id, data.name, data.category, data.table, data.floor)
                        else if (command == 1)
                            updateRestaurant(data.store_id, data.table)
                        //  console.log(data);
                    }
                })
            } else {
                console.log("[no data] " + filters + " is not found.");
            }
            cleanFloorData(floor);
        }
        );
}
function updateRestaurant(id, table) {
    console.log("Restaurant id " + id + " is updated.");
    var avai_table = avaiTable(table);
    document.getElementById("seat_" + id).innerHTML = avai_table + " available tables";
    //set color by ความแออัด
    var total = totalSeat(table);
    var avai = avaiSeat(table);
    var airPunch = avai * 100 / total;

    if (airPunch < 10) {
        document.getElementById("butt_" + id).style.backgroundColor = 'Crimson';
    } else if (airPunch < 50) {
        //change color of slot # to yellow
        document.getElementById("butt_" + id).style.backgroundColor = 'orange';
    } else if (airPunch <= 100) {
        //change color of slot # to green
        document.getElementById("butt_" + id).style.backgroundColor = 'mediumseagreen';
    }
}
function updateTableData(table) {
    console.log("Table update");
    table.forEach((tab) => {
        var butt = document.getElementById("status_" + tab.table_id);
        if (tab.status == true) {
            butt.style.backgroundColor = "mediumseagreen";
            butt.innerHTML = "A V A I L A B L E";
        } else {
            butt.style.backgroundColor = "crimson";
            butt.innerHTML = " O C C U P I E D ";
        }
    })
}

function showRestaurant(id, naMe, categ, table, floor) {
    //show list element
    //set visibility of slot to true
    createStore(naMe, id, categ, floor);
    //set store id to the tab
    //show restaurant name
    //show category/florr
    //show # of available tables
    var avai_table = avaiTable(table);
    document.getElementById("seat_" + id).innerHTML = avai_table + " available tables";
    //set color by ความแออัด
    var total = totalSeat(table);
    var avai = avaiSeat(table);
    var airPunch = avai * 100 / total;

    if (airPunch < 10) {
        document.getElementById("butt_" + id).style.backgroundColor = 'Crimson';
    } else if (airPunch < 50) {
        //change color of slot # to yellow
        document.getElementById("butt_" + id).style.backgroundColor = 'orange';
    } else if (airPunch <= 100) {
        //change color of slot # to green
        document.getElementById("butt_" + id).style.backgroundColor = 'mediumseagreen';
    }
}
function selectnewCateg(code) {
    page_type = 0;
    if (code == "all") {
        now_category = "";
    } else {
        now_category = code;
    }
    console.log("Load new category : " + code);
    loadStore();
    closeNav();
}

function createTable(tableid, maxseat, status) {
    var sec2 = document.getElementById("Table");

    var card = document.createElement('div');
    card.className = "card";

    /*  var imgA = document.createElement('img');
      imgA.src = "assets/fuji.jpg";
      imgA.className = 'logo';
      card.appendChild(imgA);*/

    var h1 = document.createElement('h1');
    h1.innerHTML = maxseat + " Seats";
    card.appendChild(h1);

    var p2 = document.createElement('p');
    // para2.id = 'categ_' + id;

    var butt = document.createElement("button");
    var p3 = document.createElement('p');
    butt.className = "proceed";
    butt.id = 'status_' + tableid;

    p2.className = "title";
    p2.innerHTML = "Table no." + tableid;

    if (status == true) {
        butt.style.backgroundColor = "mediumseagreen";
        butt.innerHTML = "A V A I L A B L E";
    } else {
        butt.style.backgroundColor = "crimson";
        butt.innerHTML = " O C C U P I E D ";
    }

    card.appendChild(p2)
    p3.appendChild(butt);
    card.appendChild(p3)

    sec2.appendChild(card);
}

function findFloorformat(flr) {
    if (flr == 'b') {
        return "Basement";
    }
    if (flr == '1') {
        return "1st";
    }
    if (flr == '2') {
        return "2nd";
    }
    if (flr == '3') {
        return "3rd";
    }
    if (flr == '4') {
        return "4th";
    }
    if (flr == '5') {
        return "5th";
    }
}

function showStoreData(naMe, categ, table, low, high, des, flr) {
    // create restaurant page as store data
    //show restaurant name
    document.title = naMe + " : Tables/seats data";
    document.getElementById("rest_name").innerHTML = naMe;
    //show category
    document.getElementById("category").innerHTML = calCategory(categ) + " food";
    //show floor data
    document.getElementById("floor").innerHTML = findFloorformat(flr) + " floor";
    //show description data
    document.getElementById("description").innerHTML = des;
    //show low-high data
    var range = low + "-" + high + " baht";
    document.getElementById("price_range").innerHTML = range;
    //show table data
    var i = 0;
    console.log("=== Tables data ========");
    table.forEach((tab) => {
        //do change to seat {base_i+i}
        createTable(tab.table_id, tab.number_of_seats, tab.status);
        console.log("[id " + tab.table_id + ".max of " + tab.number_of_seats + ". IsAvailable " + tab.status + "]");
        i++;
    })
}
function totalSeat(table) { //return number of available table
    var total_seat = 0;
    table.forEach((tab) => {
        total_seat += tab.number_of_seats;
    })
    return total_seat;
}

function avaiTable(table) {
    var avai_table = 0;
    table.forEach((tab) => {
        if (tab.status == true) { //if the seat is available
            avai_table++;
        }
    })
    return avai_table;
}

function avaiSeat(table) {
    var avai_seat = 0;
    table.forEach((tab) => {
        if (tab.status == true) { //if the seat is available
            avai_seat += tab.number_of_seats;
        }
    })
    return avai_seat;
}

function listRestaurant(A) { //list out all restaurant A 0 for store, A 1 for update
    var i;
    for (i = 1; i < 6; i++) { //floor 1 to 5
        getRestaurantByFilters(i, now_category, A);
    }
    getRestaurantByFilters("b", now_category, A);
    //getRestaurantByFilters(-1,now_category);
}

function selectRestaurant(num) {  //on click -> do select restaurant index num
    console.log("Selected " + num);
    selected_res = page_num * max_listing_perpage + num;
    localStorage.setItem("selected", selected_res);
    //change html page to restaurant page
}

function createStore(storeName, id, categ, floor) {
    var FLR = document.getElementById("F_" + floor);

    var card = document.createElement('div');
    card.className = "card";

    var imgA = document.createElement('img');
    imgA.src = "assets/" + id + ".jpg";
    imgA.className = 'logo';
    card.appendChild(imgA);

    var h1 = document.createElement('h1');
    h1.innerHTML = storeName;
    card.appendChild(h1);

    var para = document.createElement("span");
    var p1 = document.createElement('p');
    p1.className = "title";
    para.innerHTML = "Loading";
    para.id = 'seat_' + id;
    p1.appendChild(para);
    card.appendChild(p1)

    var para2 = document.createElement("span");
    var p2 = document.createElement('p');
    var cat_txt = calCategory(categ);
    para2.innerHTML = cat_txt + " food";
    para2.id = 'categ_' + id;
    para2.appendChild(p2);
    card.appendChild(para2)

    var butt = document.createElement("button");
    var p3 = document.createElement('p');
    var hyperl = document.createElement('a');
    hyperl.onclick = function () { selectRestaurant(id) };
    hyperl.href = "restaurant.html";
    butt.innerHTML = 'SEE SEATS';
    butt.className = "proceed";
    butt.id = 'butt_' + id;
    butt.type = "submit";
    hyperl.appendChild(butt);
    p3.appendChild(hyperl);
    card.appendChild(p3)

    FLR.appendChild(card);
}
function calCategory(categ) {
    var cat_txt = categ;
    if (categ == 'jpn') {
        cat_txt = "Japanese";
    } else if (categ == 'ita') {
        cat_txt = "Italian";
    } else if (categ == 'tha') {
        cat_txt = "Thai";
    } else if (categ == 'kor') {
        cat_txt = "Korean";
    } else if (categ == 'fas') {
        cat_txt = "Fast";
    } else if (categ == 'chi') {
        cat_txt = "Chinese";
    } else if (categ == 'oth') {
        cat_txt = "Other";
    } else {
        cat_txt = categ;
    } return cat_txt;
}

function backToList() { //on lick -> back to main list menu
    page_num = 0;
    page_type = 0;
    cur_max = max_listing_perpage;
    reload();
    //change html page to index page
}

function clearElements() {
    console.log("Clear data");
    if (page_type == 0 || page_type == 2) {
        var f;
        var myNode = document.getElementById("F_b");
        if (myNode != null) {
            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }
        }
        for (f = 1; f < 6; f++) {
            var myNode = document.getElementById("F_" + f);
            if (myNode != null) {
                while (myNode.firstChild) {
                    myNode.removeChild(myNode.lastChild);
                }
            }
        }
    } else if (page_type == 1) {
        var myNode = document.getElementById("section2");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }
    }
}
function search() {
    //set now_name
    now_name = document.getElementById("s_name").value;
    console.log("Search :" + now_name);
    page_type = 2;
    loadStore();
}

function loadStore() {
    //reset the page element to default (turn of listing visiblity and wait for next update)
    //initial main
    console.log("RELOAD");
    if (page_type == 0) {
        //list the restaurant
        listRestaurant(0);
        clearElements();
    } else if (page_type == 1) {
        //get data for inform the seat info.
        getRestaurant(selected_res, 0);
    } else if (page_type == 2) {
        clearElements();
        searchRestaurant(now_name, 0);
    }
}
function cleanFloorData(f) {
    var myNode = document.getElementById("F_" + f);
    if (myNode != null) {
        if (!myNode.firstChild) {
            var myNodetxt = document.getElementById("F" + f + "_text");
            myNodetxt.style.display = "none";
            myNode.style.display = "none";
        } else {
            var myNodetxt = document.getElementById("F" + f + "_text");
            myNodetxt.style.display = "block";
            myNode.style.display = "block";
        }
    }
}

setInterval(() => {
    console.log("------ fetching new data -----");
    if (page_type == 0) {
        //list the restaurant
        listRestaurant(1);
    } else if (page_type == 1) {
        //get data for inform the seat info.
        getRestaurant(selected_res, 1);
    } else if (page_type == 2) {
        searchRestaurant(now_name, 1);
    }
}, 5000); //5s interval

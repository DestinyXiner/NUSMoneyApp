// (c) Anuflora Systems 
const balance = document.getElementById('balance');
//const money_plus = document.getElementById('deposit');
//const money_minus = document.getElementById('loan');
const list = document.getElementById('list');
const form = document.getElementById('form');
//const custname = document.getElementById('custname');
const reco = document.getElementById('reco');
const select = document.getElementById('customerNameSelect');

const TransactionDataAll = [
    { id: 1, customername: 'Flora', bank: 'DBS', deposit: 3000, loan: 2000 },
    { id: 2, customername: 'Flora', bank: 'OCBC', deposit: 4000, loan: 2000 },
    { id: 3, customername: 'Mikhil', bank: 'DBS', deposit: 3000, loan: 2000 },
    { id: 4, customername: 'Sashil', bank: 'UOB', deposit: 6000, loan: 1000 },
    { id: 5, customername: 'Jack', bank: 'UOB', deposit: 6000, loan: 8000 },
    { id: 6, customername: 'DestinyXin', bank: 'DBS', deposit: 8888, loan: 88 } //Teammate add one customer
];

var TransactionData = null;
var svg = null;
var width = 350;
var height = 320;
var margin = 40;
var radius = Math.min(width, height) / 2 - 40;

// Add transactions to DOM list
function addTransactionDOM(transaction) {
    const deposit_item = document.createElement('li');

    deposit_item.classList.add('plus');
    deposit_item.innerHTML = `
  ${transaction.customername}-${transaction.bank}  <span> $ ${Math.abs(
        transaction.deposit
    )}</span> 
  `;

    list.appendChild(deposit_item);

    const loan_item = document.createElement('li');

    loan_item.classList.add('minus');
    loan_item.innerHTML = `
  ${transaction.customername}-${transaction.bank} <span> -$ ${Math.abs(
        transaction.loan
    )}</span> 
  `;

    list.appendChild(loan_item);
}

// Update the balance, deposit and loan
function updateValues() {
    const deposits = TransactionData.map(transaction => transaction.deposit);
    const loans = TransactionData.map(transaction => transaction.loan);
    const total_deposit = deposits.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const total_loan = loans.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const bal = total_deposit - total_loan;
    balance.innerText = `$${bal}`;
    //money_plus.innerText = `$${total_deposit}`;
    //money_minus.innerText = `$${total_loan}`;
    reco.innerText = (bal >= 0) ? "You Have Sound Financial Health" : "Your Financial Health is Weak";

    //pie chart
    //var pieData = { loan: Math.abs(total_loan), deposit: Math.abs(total_deposit) } 
    //var pieData = { loan: total_loan, deposit: total_deposit }
    var pieData = [{ "key": "loan", "value": total_loan }, { "key": "deposit", "value": total_deposit }]
    updatePie(pieData);
}

function init() {
    list.innerHTML = '';
    reco.innerHTML = '';
    TransactionData = [...TransactionDataAll];
    TransactionData.forEach(addTransactionDOM);
    initPie();
    updateValues();
    addSelectData();
}

//drop down list
function addSelectData() {
    for (var i = 0; i < TransactionData.length; i++) {
        var name = TransactionData[i].customername;
        //�ж��Ƿ����
        if (!checkSelectItem(select, name)) {
            var varItem = new Option(name, name);
            select.options.add(varItem);
        }
    }
}

//drop down list
function checkSelectItem(objSelect, objItemValue) {
    var isExit = false;
    for (var i = 0; i < objSelect.options.length; i++) {
        if (objSelect.options[i].value == objItemValue) {
            isExit = true;
            break;
        }
    }
    return isExit;
}


function filterTransaction(e) {
    e.preventDefault();
    list.innerHTML = '';
    reco.innerHTML = '';

    //drop down list
    var select = document.getElementById('customerNameSelect');
    if (select.value == "All") {
        //drop down list
        TransactionData = [...TransactionDataAll];
    } else {
        //drop down list
        TransactionData = TransactionDataAll.filter(tran => tran.customername == select.value);
    }

    TransactionData.forEach(addTransactionDOM);
    updateValues();
}

init();
form.addEventListener('submit', filterTransaction);

//show Pie 
function initPie() {
    svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
}

//show pie chart
function updatePie(data) {
    var pie = d3.pie()
        .value(function (d) { return d.value; })
        .sort(function (a, b) { return d3.ascending(a.key, b.key); })

    var data_ready = pie(data)

    // map to data
    var pieData = svg.selectAll("path").data(data_ready)
    pieData.exit()
        .transition()
        .remove();

    var color = d3.scaleOrdinal(['#c0392b', '#2ecc71']);
    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    pieData
        .enter()
        .append('path')
        .merge(pieData)
        .transition()
        .duration(1000)
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', function (d) { return (color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1)

    //---  
    var textSvg = svg.selectAll("text").data(data_ready)
    //---
    textSvg.selectAll("tspan").remove();

    textSvg
        .enter()
        .append('text')
        .merge(textSvg)
        //.text(function (d) {
        //    return   "$" + d.data.value  
        //})
        .call(function (text) {
            text.append("tspan")
                .attr("y", "-0.7em")
                .attr("font-weight", "600")
                .text(function (d) {
                    var key = d.data.key.toUpperCase();
                    return key;
                })
        })
        .call(function (text) {
            text.filter(d => (d.endAngle - d.startAngle) > 0.25)
                .append("tspan")
                .attr("x", 0)
                .attr("y", "0.7em")
                .attr("fill-opacity", 0.7)
                .text(d => "$" + d.data.value)

        })
        .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .attr('fill', 'white')
        .style("text-anchor", "middle")
        .style("font-size", 16);

    pieData.exit().remove();
} 